/* eslint-disable jsx-a11y/img-redundant-alt */
import "./style.css";

import React, { useEffect, useState } from "react";

const GrowStatusBox = ({ endTime, isPlanted = false }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isPlanted || !endTime) {
      setProgress(0);
      setTimeLeft(0);
      return;
    }

    const updateProgress = () => {
      const now = Math.floor(Date.now() / 1000);
      const totalGrowthTime = endTime - (endTime - 120); // Assuming growth started 2 minutes ago for demo
      const elapsed = Math.max(0, now - (endTime - totalGrowthTime));
      const remaining = Math.max(0, endTime - now);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        setProgress(4); // Fully grown
      } else {
        // Calculate progress from 1 to 4 based on elapsed time
        const progressPercent = elapsed / totalGrowthTime;
        const progressSteps = Math.min(3, Math.max(1, Math.floor(progressPercent * 4) + 1));
        setProgress(progressSteps);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [endTime, isPlanted]);

  const formatTime = seconds => {
    if (seconds <= 0) return "Ready!";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grow-status-box">
      {/* Time left display */}
      {isPlanted && (
        <div className="time-display">
          <small>{formatTime(timeLeft)}</small>
        </div>
      )}
      {/* Growth progress bar */}
      <div className="progress-bar">
        {[0, 1, 2, 3, 4].map(step => (
          <div key={step} className={`step`}>
            <img
              src={progress >= step ? "/images/input/grow-status-active.png" : "/images/input/grow-status-bg.png"}
              className="step-image"
              alt="grow status image"
            ></img>
          </div>
        ))}
      </div>
      {/* Token amounts display */}
      {/* {isReady && (lockedAmount > 0 || unlockedAmount > 0) && (
        <div className="reward-display">
          <div className="reward-item">
            <span className="reward-label">Unlocked:</span>
            <span className="reward-amount">{formatAmount(unlockedAmount)} $HNY</span>
          </div>
          <div className="reward-item">
            <span className="reward-label">Locked:</span>
            <span className="reward-amount">{formatAmount(lockedAmount)} $HNY</span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default GrowStatusBox;
