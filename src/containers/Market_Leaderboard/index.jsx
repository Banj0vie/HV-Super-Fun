/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import "./style.css";
import BaseDialog from "../_BaseDialog";
import BaseDivider from "../../components/dividers/BaseDivider";
import CardView from "../../components/boxes/CardView";
import { EPOCH_PERIOD, formatDuration } from "../../utils/basic";
import { buttonFrames } from "../../constants/_baseimages";
import BaseButton from "../../components/buttons/BaseButton";
import RewardsDialog from "./RewardsDialog";
import { useLeaderboard } from "../../hooks/useLeaderboard";

const LeaderboardDialog = ({ onClose, label = "LEADERBOARD", header = "", headerOffset = 0 }) => {
  const {
    leaderboardData,
    userScore,
    epochStart,
    currentEpoch,
    selectedEpoch,
    fetchLeaderboardData,
    setSelectedEpoch,
    loading } = useLeaderboard();
  const [remainedTime, setRemainedTime] = useState(0);
  const [isRewardDlg, setIsRewardDlg] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Handle epoch navigation
  const handleEpochChange = useCallback((newEpoch) => {
    if (isNavigating) {
      return;
    }

    if (newEpoch >= 0 && newEpoch <= currentEpoch) {
      setIsNavigating(true);
      setSelectedEpoch(newEpoch);
      fetchLeaderboardData(newEpoch).finally(() => {
        setIsNavigating(false);
      });
    }
  }, [currentEpoch, fetchLeaderboardData, isNavigating, setSelectedEpoch]);

  // Update timer based on epochStart
  useEffect(() => {
    if (epochStart > 0) {
      const updateTimer = () => {
        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const epochEndTime = epochStart + EPOCH_PERIOD;
        const remaining = Math.max(0, (epochEndTime - now) * 1000); // Convert to milliseconds
        setRemainedTime(remaining);
      };

      // Update immediately
      updateTimer();

      // Update every second
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [epochStart]);

  const leaderboardBg = [
    "/images/label/golden-bg.png",
    "/images/label/silver-bg.png",
    "/images/label/bronze-bg.png",
    "/images/label/choco-bg.png",
    "/images/label/choco-bg.png",
    "/images/label/choco-bg.png",
    "/images/label/choco-bg.png",
    "/images/label/choco-bg.png",
    "/images/label/choco-bg.png",
  ]

  return (
    <BaseDialog onClose={onClose} title={label} header={header} headerOffset={headerOffset}>
      <div className="leaderboard-content">
        {leaderboardData.map((item, index) => (
          <div key={index} className="leaderboard-card">
            <img src={leaderboardBg[index]} alt="leaderboard-bg" className="leaderboard-item-bg" />
            <div className="leaderboard-spliter" id={`leaderboard-item-${index}`}>
              <div className="split">
                {item.rank}. {item.name}
              </div>
              <div className={`split ${index >= 3 ? "highlight" : ""}`}>{item.score.toFixed(2)}</div>
            </div>
          </div>
        ))}
        <CardView className="text-center min-h-0">
          <div>Your score: <span className="highlight">{loading ? "Loading..." : userScore.toFixed(2)}</span></div>
        </CardView>
        <div className="text-center">
          {(selectedEpoch ?? currentEpoch) === currentEpoch ? (
            remainedTime <= 0 ? (
              <div>
                <div>Epoch Ended!</div>
                {/* <BaseButton
                  label="Advance Epoch"
                  onClick={advanceEpoch}
                  className="h-3rem mt-1rem"
                  disabled={loading}
                /> */}
              </div>
            ) : (
              <>
                Ends in:{" "}
                <span className="highlight">{formatDuration(remainedTime)}</span>
              </>
            )
          ) : (
            <>
              Historical Epoch: <span className="highlight">{selectedEpoch ?? currentEpoch}</span>
            </>
          )}
        </div>
        <CardView className="min-h-0">
          <div className="epoch-selector">
            <img
              src={buttonFrames.leftTriangleButton}
              alt="left"
              className="triangle-button"
              onClick={() => {
                if (isNavigating) return;
                const currentDisplayEpoch = selectedEpoch ?? currentEpoch;
                const newEpoch = Math.max(0, currentDisplayEpoch - 1);
                handleEpochChange(newEpoch);
              }}
              style={{
                opacity: (selectedEpoch ?? currentEpoch) <= 0 || isNavigating ? 0.5 : 1,
                cursor: (selectedEpoch ?? currentEpoch) <= 0 || isNavigating ? 'not-allowed' : 'pointer'
              }}
            ></img>
            <div>
              Epoch <span className="highlight">{selectedEpoch ?? currentEpoch}</span>
            </div>
            <img
              src={buttonFrames.rightTriangleButton}
              alt="right"
              className="triangle-button"
              onClick={() => {
                if (isNavigating) return;
                const newEpoch = (selectedEpoch ?? currentEpoch) + 1;
                handleEpochChange(newEpoch);
              }}
              style={{
                opacity: (selectedEpoch ?? currentEpoch) >= currentEpoch || isNavigating ? 0.5 : 1,
                cursor: (selectedEpoch ?? currentEpoch) >= currentEpoch || isNavigating ? 'not-allowed' : 'pointer'
              }}
            ></img>
          </div>
        </CardView>
        <div className="button-row">
          <BaseButton
            label="Refresh"
            onClick={() => fetchLeaderboardData(selectedEpoch ?? currentEpoch)}
            className="h-4rem mt-1rem"
            disabled={loading}
            small
          />
          <BaseButton
            label="See Rewards"
            onClick={() => setIsRewardDlg(true)}
            className="h-4rem mt-1rem"
            small
          />
        </div>
        {isRewardDlg && (
          <RewardsDialog onClose={() => setIsRewardDlg(false)}></RewardsDialog>
        )}
      </div>
    </BaseDialog>
  );
};

export default LeaderboardDialog;
