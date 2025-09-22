import React from "react";
import "./style.css";
import BaseButton from "../../../components/buttons/BaseButton";

const AnglerMenu = ({ onStartFish, onCraftBait, hasPendingRequests, pendingRequests, onReelFish }) => {
  return (
    <div className="angler-dialog">
      {hasPendingRequests && pendingRequests.length > 0 ? (
        // Show pending requests instead of Start Fishing
        <>
          {pendingRequests.map((request, index) => (
            <BaseButton
              key={index}
              className=""
              label={`Reel Fish`}
              onClick={() => onReelFish(request.requestId, request.baitId, request.level, request.amount)}
            ></BaseButton>
          ))}
        </>
      ) : (
        // Show Start Fishing when no pending requests
        <BaseButton
          className=""
          label="Start Fishing"
          onClick={onStartFish}
        ></BaseButton>
      )}
      <BaseButton
        className=""
        label="Craft Bait"
        onClick={onCraftBait}
      ></BaseButton>
    </div>
  );
};

export default AnglerMenu;
