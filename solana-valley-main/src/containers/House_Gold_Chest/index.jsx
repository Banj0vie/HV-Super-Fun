import "./style.css";

import React, { useEffect, useState } from "react";

import CardView from "../../components/boxes/CardView";
import LabelValueBox from "../../components/boxes/LabelValueBox";
import BaseButton from "../../components/buttons/BaseButton";
import { useNotification } from "../../contexts/NotificationContext";
import { useChest } from "../../hooks/useChest";
import { formatDuration } from "../../utils/basic";
import { handleContractError } from "../../utils/errorHandler";
import BaseDialog from "../_BaseDialog";

const GoldChestDialog = ({ onClose, label = "DAILY CHEST", header = "" }) => {
  const { canClaim, chestType, currentLevel, claimDailyChest, getTimeUntilNextChest, loading } = useChest();

  const { show } = useNotification();
  const [remainedTime, setRemainedTime] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);

  // Monitor chest errors and show notifications with duplicate prevention

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = getTimeUntilNextChest();
      setRemainedTime(timeLeft);
    }, 1000);

    // Set initial time
    setRemainedTime(getTimeUntilNextChest());

    return () => clearInterval(interval);
  }, [getTimeUntilNextChest]);

  const handleClaim = async () => {
    if (!canClaim || isClaiming) {
      show("Cannot claim chest at this time", "warning");
      return;
    }

    setIsClaiming(true);
    try {
      show("Claiming daily chest...", "info");
      const tx = await claimDailyChest();

      if (tx) {
        show(`Successfully claimed ${chestType} chest!`, "success");
        if (typeof tx.nextChestTime === "number") {
          const nowSec = Math.floor(Date.now() / 1000);
          setRemainedTime(Math.max(0, tx.nextChestTime - nowSec) * 1000);
        } else {
          setRemainedTime(getTimeUntilNextChest());
        }
      } else {
        show("Failed to claim chest", "error");
      }
    } catch (err) {
      const { message } = handleContractError(err, "claiming daily chest");
      show(message, "error");
    } finally {
      setIsClaiming(false);
    }
  };
  return (
    <BaseDialog onClose={onClose} title={label} header={header}>
      <div className="gold-chest">
        <CardView className="p-0">
          <div className="gold-chest-card">
            <LabelValueBox label="Chest Type" value={`${chestType} Chest`}></LabelValueBox>
            <LabelValueBox label="Player Level" value={currentLevel}></LabelValueBox>
            <LabelValueBox label="Chest Status" value={canClaim ? "Available" : "On Cooldown"}></LabelValueBox>
            <LabelValueBox label="Next Chest In" value={formatDuration(remainedTime)}></LabelValueBox>
          </div>
        </CardView>

        {!canClaim ? (
          <CardView className="p-0 text-center">
            <div className="font-bold">Already Claimed!</div>
          </CardView>
        ) : (
          <BaseButton
            className="h-3rem"
            label={isClaiming || loading ? "Claiming..." : "Claim Chest"}
            onClick={handleClaim}
            disabled={isClaiming || loading}
            large
          ></BaseButton>
        )}

        {/* Error Display */}
        {/* {error && (
          <div className="error-message" style={{ 
            color: '#ff3b30', 
            marginTop: '10px', 
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )} */}
      </div>
    </BaseDialog>
  );
};

export default GoldChestDialog;
