import React, { useState, useRef, useCallback, useEffect } from "react";
import "./style.css";
import { fishImages, fishingPanelImages } from "../../../constants/_baseimages";
import BaseButton from "../../../components/buttons/BaseButton";
import LootReceivedDialog from "../../Global_LootReceivedDialog";
import { useFishing, useRngHub } from "../../../hooks/useContracts";
import { useItems } from "../../../hooks/useItems";
import { useNotification } from "../../../contexts/NotificationContext";
import { handleContractError } from "../../../utils/errorHandler";

const Fishing = ({ baitId, amount, requestId, onBuyAgain, onBackToMenu }) => {
  const [isFishing, setIsFishing] = useState(false);
  console.log(requestId);
  const [isLootReceivedDialog, setIsLootReceivedDialog] = useState(false);
  const [isBuyAgain, setIsBuyAgain] = useState(false);
  const [fishingResult, setFishingResult] = useState(null);
  const [hasThrownBait, setHasThrownBait] = useState(false);
  
  const { listenForFishingResults } = useFishing();
  const { fulfillRequest, rngHubData } = useRngHub();
  const { refetch } = useItems();
  const { show } = useNotification();
  
  // Use ref to track cleanup function, similar to handleReveal pattern
  const fishingCleanupRef = useRef(null);

  // Initialize state when component mounts
  useEffect(() => {
    if (requestId) {
      // Coming from pending request - bait was already thrown
      setHasThrownBait(true);
    } else if (baitId && amount) {
      // Coming from new fishing - bait was just thrown in StartFishing
      setHasThrownBait(true);
    }
  }, [requestId, baitId, amount]);

  // Phase 2: Reel in Fish - Fulfill RNG request and get results (like fulfillPendingRequest)
  const onReelInFish = useCallback(async () => {
    if (!requestId) {
      show("No pending fishing request found", "error");
      return;
    }

    // Clean up any existing fishing process
    if (fishingCleanupRef.current) {
      fishingCleanupRef.current();
      fishingCleanupRef.current = null;
    }

    setIsFishing(true);
    
      try {
        // Fulfill the RNG request to reveal fishing results
        const result = await fulfillRequest(requestId);
        
        if (result) {
          show("Reeling in fish...", "info");
          
          // Set up event listener for fishing results
          const eventCleanup = await listenForFishingResults(requestId, (fishingResults) => {
          console.log('Fishing results received:', fishingResults);
          
          // Convert the results to the format expected by LootReceivedDialog
          const lootItems = [];
          fishingResults.itemIds.forEach((itemId, index) => {
            if (fishingResults.amounts[index] > 0) {
              lootItems.push({
                id: itemId,
                count: parseInt(fishingResults.amounts[index])
              });
            }
          });
          
          setFishingResult(lootItems);
          setIsLootReceivedDialog(true);
          setIsFishing(false);
          
          // Refresh inventory to show updated item counts
          refetch();
          
          // Clean up the event listener
          if (fishingCleanupRef.current) {
            fishingCleanupRef.current();
            fishingCleanupRef.current = null;
          }
          
          show("Fishing complete! Check your loot!", "success");
        }, 'latest');
        
        if (eventCleanup) {
          fishingCleanupRef.current = eventCleanup;
        }
        
        // Clean up event listener after 30 seconds (timeout)
        setTimeout(() => {
          if (fishingCleanupRef.current) {
            fishingCleanupRef.current();
            fishingCleanupRef.current = null;
          }
          setIsFishing(false);
        }, 30000);
        
      } else {
        // If fulfillment failed, reset the loading state
        setIsFishing(false);
        show("Failed to reel in fish", "error");
      }
      
    } catch (error) {
      const { message } = handleContractError(error, 'reeling in fish');
      show(message, "error");
      setIsFishing(false);
      
      // Clean up any existing listeners
      if (fishingCleanupRef.current) {
        fishingCleanupRef.current();
        fishingCleanupRef.current = null;
      }
    }
    }, [requestId, fulfillRequest, listenForFishingResults, show, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fishingCleanupRef.current) {
        fishingCleanupRef.current();
      }
    };
  }, []);

  const onCloseLootReceiveDialog = () => {
    setIsLootReceivedDialog(false);
    if (onBackToMenu) {
      // Go back to angler menu and refresh pending requests
      onBackToMenu();
    } else {
      setIsBuyAgain(true);
    }
    // Reset fishing state for next fishing session
    setFishingResult(null);
    setHasThrownBait(false);
  };
  return (
    <div className="fishing-wrapper">
      <div className="loading">
        <img
          className="background"
          src={fishingPanelImages.background}
          alt="fishing panel"
        ></img>
        <img className="pin" src={fishImages.catfish} alt="fish"></img>
      </div>
      {isBuyAgain ? (
        <BaseButton
          className="button"
          label="Buy Again"
          onClick={onBuyAgain}
        ></BaseButton>
      ) : (
        // Show "Reel in Fish" button (bait was already thrown when user clicked Confirm)
        <BaseButton
          className="button"
          label={isFishing ? "Reeling..." : "Reel in Fish"}
          onClick={onReelInFish}
          disabled={isFishing || rngHubData.loading || !hasThrownBait}
        ></BaseButton>
      )}
      {isLootReceivedDialog && (
        <LootReceivedDialog
          onClose={onCloseLootReceiveDialog}
          items={fishingResult}
        ></LootReceivedDialog>
      )}
    </div>
  );
};

export default Fishing;
