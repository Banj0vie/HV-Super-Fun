import React, { useState, useRef, useCallback, useEffect } from "react";
import "./style.css";
import { fishImages } from "../../../constants/_baseimages";
import BaseButton from "../../../components/buttons/BaseButton";
import LootReceivedDialog from "../../Global_LootReceivedDialog";
import FishingMiniGame from "./FishingMiniGame";
import { useFishing } from "../../../hooks/useFishing";
import { useItems } from "../../../hooks/useItems";
import { useNotification } from "../../../contexts/NotificationContext";
import { handleContractError } from "../../../utils/errorHandler";

const Fishing = ({ baitId, amount, requestId, onBuyAgain, onBackToMenu }) => {
  const [isFishing, setIsFishing] = useState(false);
  const [isLootReceivedDialog, setIsLootReceivedDialog] = useState(false);
  const [isBuyAgain, setIsBuyAgain] = useState(false);
  const [fishingResult, setFishingResult] = useState(null);
  const [hasThrownBait, setHasThrownBait] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);

  const { revealFishing, listenForFishingResults } = useFishing();
  const { refetch } = useItems();
  const { show } = useNotification();

  const fishingCleanupRef = useRef(null);
  const reelInAudioRef = useRef(null);

  useEffect(() => {
    if (requestId) {
      setHasThrownBait(true);
      setShowMiniGame(true);
    } else if (baitId && amount) {
      setHasThrownBait(true);
      setShowMiniGame(true);
    }
  }, [requestId, baitId, amount]);

  const onReelInFish = useCallback(async () => {
    if (fishingCleanupRef.current) {
      fishingCleanupRef.current();
      fishingCleanupRef.current = null;
    }

    setIsFishing(true);
    if (!reelInAudioRef.current) {
      reelInAudioRef.current = new Audio("/sounds/FishingReelInButton.wav");
      reelInAudioRef.current.preload = "auto";
    }
    const audio = reelInAudioRef.current;
    audio.currentTime = 0;
    audio.play().catch(() => {});

    try {
      const result = await revealFishing(requestId);

      if (result && result.txHash) {
        show("Reeling in fish...", "info");

        await listenForFishingResults(result.txHash, (results) => {
          const items = results.itemIds.map(itemId => {
            const randomFactor = Math.pow(Math.random(), 2.5);
            const weight = (1.0 + randomFactor * 14.0).toFixed(2);
            return { id: itemId, count: 1, weight: weight };
          });

          setFishingResult(items);
          setShowMiniGame(false);
          setIsLootReceivedDialog(true);
          setIsFishing(false);
          refetch();
        });

        show("Fishing revealed! Check your rewards.", "success");
      } else {
        setIsFishing(false);
        show("Failed to reel in fish", "error");
      }
    } catch (error) {
      const { message } = handleContractError(error, 'reeling in fish');
      show(message, "error");
      setIsFishing(false);
      if (fishingCleanupRef.current) {
        fishingCleanupRef.current();
        fishingCleanupRef.current = null;
      }
    }
  }, [requestId, revealFishing, listenForFishingResults, show, refetch]);

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
      onBackToMenu();
    } else {
      setIsBuyAgain(true);
    }
    setFishingResult(null);
    setHasThrownBait(false);
    setShowMiniGame(false);
  };

  return (
    <div className="fishing-wrapper">
      {/* Osu fishing mini-game — shown until blockchain resolves */}
      {showMiniGame && !isLootReceivedDialog && (
        <FishingMiniGame
          fishItem={null}
          fishRarity="COMMON"
          fishWeight={(() => {
            const base = { COMMON: [0.2, 1.5], UNCOMMON: [1.0, 4.0], RARE: [3.0, 10.0], EPIC: [8.0, 25.0], LEGENDARY: [20.0, 60.0] };
            const [min, max] = base['COMMON'];
            return (min + Math.random() * (max - min)).toFixed(2);
          })()}
          onComplete={() => {
            setShowMiniGame(false);
            onReelInFish();
          }}
          onEscape={() => {
            setShowMiniGame(false);
            if (onBackToMenu) onBackToMenu();
          }}
        />
      )}

      {/* Fallback panel — only if mini-game not active and loot dialog not open */}
      {!showMiniGame && !isFishing && !isLootReceivedDialog && (
        <>
          <div className="loading">
            <img className="background" src={"/images/label/left-panel-normal.png"} alt="fishing panel" />
            <img className="pin" src={fishImages.catfish} alt="fish" />
          </div>
          {isBuyAgain ? (
            <BaseButton className="button" label="Buy Again" onClick={onBuyAgain} />
          ) : (
            <BaseButton
              className="button"
              label={isFishing ? "Reeling..." : "Reel in Fish"}
              onClick={onReelInFish}
              disabled={isFishing || !hasThrownBait}
            />
          )}
        </>
      )}

      {/* Loot dialog */}
      {isLootReceivedDialog && (
        <LootReceivedDialog onClose={onCloseLootReceiveDialog} items={fishingResult} />
      )}
    </div>
  );
};

export default Fishing;
