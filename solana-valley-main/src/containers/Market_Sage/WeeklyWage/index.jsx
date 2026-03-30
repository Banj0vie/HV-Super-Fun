import "./style.css";

import React, { useCallback, useEffect, useRef, useState } from "react";

import CardTopicView from "../../../components/boxes/CardTopicView";
import CardView from "../../../components/boxes/CardView";
import LabelValueBox from "../../../components/boxes/LabelValueBox";
import BaseButton from "../../../components/buttons/BaseButton";
import { useNotification } from "../../../contexts/NotificationContext";
import { useSage } from "../../../hooks/useContracts";
import { formatDuration } from "../../../utils/basic";
import { isTransactionRejection } from "../../../utils/errorUtils";

const WeeklyWage = ({ onBack }) => {
  const { sageData, fetchSageData, unlockWeeklyWage, getTimeUntilNextWageUnlock, loading, error } = useSage();
  const [remainedTime, setRemainedTime] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { show: showNotification } = useNotification();

  // Monitor errors and show notifications with duplicate prevention
  const lastNotificationTime = useRef(0);
  useEffect(() => {
    if (error) {
      const now = Date.now();
      // Only show notification if it's been more than 2 seconds since last notification
      if (now - lastNotificationTime.current > 2000) {
        lastNotificationTime.current = now;
        if (isTransactionRejection(error)) {
          showNotification("Transaction was rejected by user.", "error");
        }
      }
    }
  }, [error, showNotification]);
  // Fetch Sage data on component mount
  useEffect(() => {
    fetchSageData();
  }, [fetchSageData]);

  useEffect(() => {
    if (sageData.lockedAmount > 0 && !sageData.canUnlockWage) {
      setRemainedTime(getTimeUntilNextWageUnlock());
    } else {
      setRemainedTime(0);
    }
  }, [sageData.nextWageUnlockTime, sageData.canUnlockWage, sageData.lockedAmount, getTimeUntilNextWageUnlock]);

  // Update timer for next wage unlock
  useEffect(() => {
    const updateTimer = () => {
      // Only update timer if there are locked tokens and wage unlock is not ready
      if (sageData.lockedAmount > 0 && !sageData.canUnlockWage) {
        const remaining = getTimeUntilNextWageUnlock();
        setRemainedTime(remaining);

        // If timer reached zero, refresh Sage data to update canUnlockWage state
        if (remaining <= 0) {
          fetchSageData({ force: true });
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    getTimeUntilNextWageUnlock,
    fetchSageData,
    sageData.canUnlockWage,
    sageData.lockedAmount,
    sageData.nextWageUnlockTime,
  ]);

  const handleUnlock = useCallback(async () => {
    setIsUnlocking(true);
    try {
      await unlockWeeklyWage();
    } catch (err) {
      console.error("Failed to unlock:", err);
    } finally {
      setIsUnlocking(false);
    }
  }, [unlockWeeklyWage]);
  return (
    <div className="weekly-wage-wrapper">
      <CardView className="mt-1.5rem">
        <div className="weekly-wage-card">
          <LabelValueBox
            label="Unlock Amount"
            value={
              loading
                ? "Loading..."
                : `${sageData.weeklyWageAmount?.toFixed(0) || 0} (${sageData.weeklyWageAmount?.toFixed(0) || 0})`
            }
          />
          <LabelValueBox label="Bonus Per Level" value="2.5" />
          <LabelValueBox label="Maximum Rate" value="30" />
          <LabelValueBox
            label="Next Wage in"
            value={sageData.canUnlockWage ? "Ready!" : formatDuration(remainedTime)}
          />
        </div>
      </CardView>
      <CardTopicView title="Weekly Wage" />
      {sageData.lockedAmount === 0 ? (
        <CardView className="p-0">
          <div className="text-center">{loading ? "Loading ..." : "No locked tokens to unlock"}</div>
        </CardView>
      ) : !sageData.canUnlockWage ? (
        <CardView className="p-0">
          <div className="text-center">Already Claimed!</div>
        </CardView>
      ) : (
        <BaseButton
          className="h-3rem"
          label={isUnlocking ? "Unlocking..." : "Unlock Honey"}
          onClick={handleUnlock}
          disabled={isUnlocking}
          large={true}
        />
      )}
      <BaseButton className="h-3rem" label="Back" onClick={onBack} large={true} isError={true}></BaseButton>
    </div>
  );
};

export default WeeklyWage;
