import "./style.css";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { ID_ANGLER_PAGES } from "../../constants/app_ids";
import { useFishing } from "../../hooks/useFishing";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { useAppSelector } from "../../solana/store";
import { selectSettings } from "../../solana/store/slices/uiSlice";
import { clampVolume } from "../../utils/basic";
import { defaultSettings } from "../../utils/settings";
import BaseDialog from "../_BaseDialog";
import AnglerMenu from "./AnglerMenu";
import CraftBait from "./CraftBait";
import Fishing from "./Fishing";
import StartFishing from "./StartFishing";
const AnglerDialog = ({
  onClose,
  label = "QUIET POND",
  header = "/images/dialog/modal-header-angler.png",
  headerOffset = 0,
  headerWidth = 210,
}) => {
  const [pageIndex, setPageIndex] = useState(ID_ANGLER_PAGES.ANGLER_MENU);
  const [selectedBaitId, setSelectedBaitId] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const fishingButtonAudioRef = useRef(null);
  const settings = useAppSelector(selectSettings) || defaultSettings;

  const { isConnected, account } = useSolanaWallet();
  const { checkPendingRequests, getAllPendingRequests } = useFishing();

  // Load pending requests when dialog opens
  const loadPendingRequests = useCallback(async () => {
    if (!isConnected || !account || !checkPendingRequests || !getAllPendingRequests) return;

    try {
      const hasPending = await checkPendingRequests();
      setHasPendingRequests(hasPending);

      if (hasPending) {
        const allPendingReqs = await getAllPendingRequests();
        setPendingRequests(allPendingReqs);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error("Failed to load fishing pending requests:", err);
    }
  }, [isConnected, account, checkPendingRequests, getAllPendingRequests]);

  // Load pending requests when component mounts or when user connects
  useEffect(() => {
    if (isConnected && account) {
      loadPendingRequests();
    }
  }, [isConnected, account, loadPendingRequests]);

  const onStartFishing = useCallback((baitId, amount, requestId) => {
    setSelectedBaitId(baitId);
    setSelectedAmount(amount);
    setSelectedRequestId(requestId ?? null);

    // Navigate to fishing page immediately - the request ID will be handled by the Fishing component
    setPageIndex(ID_ANGLER_PAGES.FISHING);
  }, []);

  const onReelFish = (requestId, baitId, level, amount) => {
    // Navigate to fishing page with pending request info
    setSelectedBaitId(parseInt(baitId)); // Use the real baitId from pending request
    setSelectedAmount(parseInt(amount));
    setSelectedRequestId(requestId); // Set the real request ID
    setPageIndex(ID_ANGLER_PAGES.FISHING);
  };

  return (
    <BaseDialog
      onClose={onClose}
      title={label}
      header={header}
      headerOffset={headerOffset}
      headerWidth={headerWidth}
      className="custom-modal-background"
    >
      {pageIndex === ID_ANGLER_PAGES.ANGLER_MENU && (
        <AnglerMenu
          onStartFish={() => {
            if (!fishingButtonAudioRef.current) {
              fishingButtonAudioRef.current = new Audio("/sounds/FishingButton.wav");
              fishingButtonAudioRef.current.preload = "auto";
            }
            const audio = fishingButtonAudioRef.current;
            audio.currentTime = 0;
            const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
            audio.volume = clampVolume(volumeSetting);
            audio.play().catch(() => {});
            setPageIndex(ID_ANGLER_PAGES.START_FISHING);
          }}
          onCraftBait={() => setPageIndex(ID_ANGLER_PAGES.CRAFT_BAIT)}
          hasPendingRequests={hasPendingRequests}
          pendingRequests={pendingRequests}
          onReelFish={onReelFish}
        ></AnglerMenu>
      )}
      {pageIndex === ID_ANGLER_PAGES.CRAFT_BAIT && (
        <CraftBait onBack={() => setPageIndex(ID_ANGLER_PAGES.ANGLER_MENU)}></CraftBait>
      )}
      {pageIndex === ID_ANGLER_PAGES.START_FISHING && (
        <StartFishing onBack={() => setPageIndex(ID_ANGLER_PAGES.ANGLER_MENU)} onStart={onStartFishing}></StartFishing>
      )}
      {pageIndex === ID_ANGLER_PAGES.FISHING && (
        <Fishing
          baitId={selectedBaitId}
          amount={selectedAmount}
          requestId={selectedRequestId}
          onBuyAgain={() => setPageIndex(ID_ANGLER_PAGES.START_FISHING)}
          onBackToMenu={() => {
            setPageIndex(ID_ANGLER_PAGES.ANGLER_MENU);
            loadPendingRequests(); // Refresh pending requests
          }}
        ></Fishing>
      )}
    </BaseDialog>
  );
};

export default AnglerDialog;
