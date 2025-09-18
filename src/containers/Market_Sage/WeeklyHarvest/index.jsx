import React, { useEffect, useState, useCallback } from "react";
import "./style.css";
import CardView from "../../../components/boxes/CardView";
import LabelValueBox from "../../../components/boxes/LabelValueBox";
import { formatDuration } from "../../../utils/basic";
import BaseButton from "../../../components/buttons/BaseButton";
import { useSage } from "../../../hooks/useContracts";

const WeeklyHarvest = ({onBack}) => {
  const {
    sageData,
    fetchSageData,
    unlockGameTokens,
    getTimeUntilNextUnlock,
    loading,
    error
  } = useSage();
  
  const [remainedTime, setRemainedTime] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Fetch Sage data on component mount
  useEffect(() => {
    fetchSageData();
  }, [fetchSageData]);

  // Update timer for next unlock
  useEffect(() => {
    const updateTimer = () => {
      // Only update timer if unlock is not ready
      if (!sageData.canUnlock) {
        const remaining = getTimeUntilNextUnlock();
        setRemainedTime(remaining);
        
        // If timer reached zero, refresh Sage data to update canUnlock state
        if (remaining <= 0) {
          fetchSageData();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilNextUnlock, fetchSageData, sageData.canUnlock]);

  const handleUnlock = useCallback(async () => {
    setIsUnlocking(true);
    try {
      await unlockGameTokens();
    } catch (err) {
      console.error('Failed to unlock:', err);
    } finally {
      setIsUnlocking(false);
    }
  }, [unlockGameTokens]);
  return (
    <div className="weekly-harvest-wrapper">
      <CardView className="p-0">
        <div className="weekly-harvest-card">
          <LabelValueBox 
            label="Unlock Rate" 
            value={loading ? "Loading..." : `${sageData.unlockRate.toFixed(2)}%`}
          />
          <LabelValueBox 
            label="Pending Locked Ready" 
            value={loading ? "Loading..." : sageData.unlockAmount.toFixed(2)}
          />
          <LabelValueBox
            label="Next Season in"
            value={sageData.canUnlock ? "Ready!" : formatDuration(remainedTime)}
          />
          <div className="weekly-harvest-header">Weekly Harvest</div>
        </div>
      </CardView>
      
      {error && (
        <CardView className="p-0">
          <div className="text-center text-red-500">Error: {error}</div>
        </CardView>
      )}
      
      {sageData.lockedAmount === 0 ? (
        <CardView className="p-0">
          <div className="text-center">No locked tokens to unlock</div>
        </CardView>
      ) : !sageData.canUnlock ? (
        <CardView className="p-0">
          <br/>
          <div className="text-center">Already Claimed!</div>
        </CardView>
      ) : (
        <BaseButton 
          className="h-3rem" 
          label={isUnlocking ? "Unlocking..." : "Unlock Ready"} 
          onClick={handleUnlock}
          disabled={isUnlocking}
        />
      )}
      
      <BaseButton className="h-3rem" label="Back" onClick={onBack} />
    </div>
  );
};

export default WeeklyHarvest;
