import { Transaction } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { confirmHarvestPlots, getFarmingState, harvestPlots, plantCrops } from "../api/farmingApi";
import { ID_FARM_HOTSPOTS } from "../constants/app_ids";
import { ID_POTION_ITEMS } from "../constants/app_ids";
import { FARM_BEES, FARM_HOTSPOTS, FARM_VIEWPORT } from "../constants/scene_farm";
import FarmerDialog from "../containers/Farm_Farmer";
import SelectSeedDialog from "../containers/Farm_SelectSeedDialog";
import { useNotification } from "../contexts/NotificationContext";
import { useBalanceRefresh } from "../hooks/useBalanceRefresh";
import { useFarming } from "../hooks/useContracts";
import { useItems } from "../hooks/useItems";
import { useSolanaWallet } from "../hooks/useSolanaWallet";
import FarmInterface from "../layouts/FarmInterface";
import FarmMenu from "../layouts/FarmInterface/FarmMenu";
import PanZoomViewport from "../layouts/PanZoomViewport";
import { CropItemArrayClass } from "../models/crop";
import { useAppSelector } from "../solana/store";
import { selectSettings } from "../solana/store/slices/uiSlice";
import { clampVolume, getGrowthTime } from "../utils/basic";
import { handleContractError } from "../utils/errorHandler";
import { defaultSettings } from "../utils/settings";
const Farm = ({ isFarmMenu, setIsFarmMenu }) => {
  const { width, height } = FARM_VIEWPORT;
  const hotspots = FARM_HOTSPOTS;
  const settings = useAppSelector(selectSettings) || defaultSettings;
  const { account, connection, sendTransaction } = useSolanaWallet();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();
  const { seeds: currentSeeds, refetch: refetchSeeds } = useItems();
  const { getMaxPlots, applyGrowthElixir, applyPesticide, applyFertilizer, loading: farmingLoading } = useFarming();
  const { show } = useNotification();
  const [isPlanting, setIsPlanting] = useState(true);
  const [isSelectCropDialog, setIsSelectCropDialog] = useState(false);
  const [cropArray, setCropArray] = useState(() => new CropItemArrayClass(30));
  const [previewCropArray, setPreviewCropArray] = useState(() => new CropItemArrayClass(30));
  const [currentFieldIndex, setCurrentFieldIndex] = useState(-1);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [, setGrowthTimer] = useState(null);
  const [maxPlots, setMaxPlots] = useState(0);
  const [previewUpdateKey, setPreviewUpdateKey] = useState(0);
  const [userCropsLoaded, setUserCropsLoaded] = useState(false);
  const [usedSeedsInPreview, setUsedSeedsInPreview] = useState({});
  const plantConfirmAudioRef = useRef(null);
  const harvestConfirmAudioRef = useRef(null);

  const [isUsingPotion, setIsUsingPotion] = useState(false);
  const [selectedPotion, setSelectedPotion] = useState(null);

  const { plantedCount, readyCount } = useMemo(() => {
    if (!cropArray?.arrays) {
      return { plantedCount: 0, readyCount: 0 };
    }

    let planted = 0;
    let ready = 0;

    cropArray.arrays.forEach((crop, index) => {
      if (index >= maxPlots) return;
      if (crop && crop.seedId) {
        planted += 1;
        if (crop.growStatus === 2) {
          ready += 1;
        }
      }
    });

    return { plantedCount: planted, readyCount: ready };
  }, [cropArray, maxPlots]);

  const startPotionUsage = useCallback(
    (potionId, potionName) => {
      setSelectedPotion({ id: potionId, name: potionName });
      setIsUsingPotion(true);
      setIsPlanting(false);
      setIsFarmMenu(true);
    },
    [setIsFarmMenu]
  );

  useEffect(() => {
    setPreviewUpdateKey(prev => prev + 1);
  }, [cropArray]);

  // Listen for potion usage events from inventory
  useEffect(() => {
    const handleStartPotionUsage = event => {
      const { id, name } = event.detail;
      startPotionUsage(id, name);
    };

    window.addEventListener("startPotionUsage", handleStartPotionUsage);

    return () => {
      window.removeEventListener("startPotionUsage", handleStartPotionUsage);
    };
  }, [startPotionUsage]);

  const getAvailableSeeds = useCallback(() => {
    return currentSeeds
      .map(seed => ({
        ...seed,
        count: Math.max(0, seed.count - (usedSeedsInPreview[seed.id] || 0)),
      }))
      .filter(seed => seed.count > 0);
  }, [currentSeeds, usedSeedsInPreview]);

  const playPlantConfirmSound = useCallback(() => {
    if (!plantConfirmAudioRef.current) {
      plantConfirmAudioRef.current = new Audio("/sounds/FinalPlantConfirmButton.wav");
      plantConfirmAudioRef.current.preload = "auto";
    }
    const audio = plantConfirmAudioRef.current;
    const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
    audio.volume = clampVolume(volumeSetting);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [settings?.soundVolume]);

  const playHarvestConfirmSound = useCallback(() => {
    if (!harvestConfirmAudioRef.current) {
      harvestConfirmAudioRef.current = new Audio("/sounds/FinalHarvestConfirmButton.wav");
      harvestConfirmAudioRef.current.preload = "auto";
    }
    const audio = harvestConfirmAudioRef.current;
    const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
    audio.volume = clampVolume(volumeSetting);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, [settings?.soundVolume]);

  const loadCropsFromBackend = useCallback(async () => {
    try {
      setUserCropsLoaded(false);
      if (!account) {
        const emptyArray = new CropItemArrayClass(30);
        setCropArray(emptyArray);
        setPreviewCropArray(emptyArray);
        setUserCropsLoaded(true);
        return;
      }

      const crops = await getFarmingState(account);

      const uniqueItemIds = Array.from(new Set(crops.map(c => c.itemId).filter(Boolean)));
      const growthTimeCache = new Map();
      uniqueItemIds.forEach(itemId => {
        const gt = getGrowthTime(itemId);
        growthTimeCache.set(Number(itemId), gt);
      });

      const nowSec = Math.floor(Date.now() / 1000);
      const newCropArray = new CropItemArrayClass(30);
      for (const crop of crops) {
        const itemId = Number(crop.itemId ?? 0);
        if (!itemId) continue;
        const item = newCropArray.getItem(crop.plotNumber);
        if (!item) continue;

        const growthTime = growthTimeCache.get(itemId) ?? 60;
        const endTime = Number(crop.endTime ?? 0);

        item.seedId = itemId;
        item.plantedAt = (endTime - growthTime) * 1000;
        item.growthTime = growthTime;
        item.growStatus = endTime <= nowSec ? 2 : 1;
        item.produceMultiplierX1000 = Number(crop.prodMultiplier ?? 1000);
        item.tokenMultiplierX1000 = Number(crop.tokenMultiplier ?? 1000);
        item.growthElixirApplied = !!(crop.growthElixir && Number(crop.growthElixir) !== 0);
      }

      setCropArray(newCropArray);
      setPreviewCropArray(newCropArray);
      setUserCropsLoaded(true);
      setPreviewUpdateKey(prev => prev + 1);
      setSelectedIndexes([]);
    } catch (error) {
      const { message } = handleContractError(error, "loading crops");
      console.error("Failed to load crops:", message);
      const emptyArray = new CropItemArrayClass(30);
      setCropArray(emptyArray);
      setPreviewCropArray(emptyArray);
      setUserCropsLoaded(true);
    }
  }, [account]);

  /**
   * POST /farming/harvest → if pendingConfirmation, user must sign signedTransactionBase64,
   * then POST /farming/harvest/confirm. If the user cancels signing, harvest does not complete.
   */
  const executeHarvest = useCallback(
    async plotIds => {
      if (!account) {
        show("Please connect your wallet before harvesting.", "info");
        return false;
      }

      let harvestResult;
      try {
        harvestResult = await harvestPlots({ wallet: account, plotIds });
      } catch (error) {
        console.error("Failed to call harvest API:", error);
        show("❌ Failed to harvest crops. Please try again.", "error");
        return false;
      }

      if (!harvestResult || !harvestResult.ok) {
        show("❌ Harvest failed on the server. Please try again later.", "error");
        return false;
      }

      const { pendingConfirmation, signedTransactionBase64 } = harvestResult;

      if (pendingConfirmation) {
        if (!signedTransactionBase64 || !connection || !sendTransaction) {
          show("❌ Harvest requires a wallet transaction. Please try again.", "error");
          return false;
        }

        let txSignature;
        try {
          const tx = Transaction.from(Buffer.from(signedTransactionBase64, "base64"));
          show("Sign transaction to claim your harvest rewards...", "info");
          txSignature = await sendTransaction(tx, connection);
          await connection.confirmTransaction(txSignature, "confirmed");
        } catch (err) {
          console.error("Harvest transaction failed or cancelled:", err);
          show("❌ Harvest cancelled or failed. Nothing was harvested.", "error");
          return false;
        }

        try {
          const confirmRes = await confirmHarvestPlots({
            wallet: account,
            plotIds,
            txSignature: String(txSignature),
          });
          if (!confirmRes?.ok) {
            show(confirmRes?.error || "❌ Could not finalize harvest. Please try again.", "error");
            return false;
          }
        } catch (err) {
          console.error("Harvest confirm failed:", err);
          const msg = err?.response?.data?.error || err?.message || "Failed to confirm harvest";
          show(`❌ ${msg}`, "error");
          return false;
        }
      }

      return true;
    },
    [account, connection, sendTransaction, show]
  );

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setMaxPlots(await getMaxPlots());
        await loadCropsFromBackend();
      } catch (error) {
        const { message } = handleContractError(error, "loading user data");
        console.error("Failed to load user data:", message);
      }
    };

    loadUserData();
  }, [loadCropsFromBackend, getMaxPlots]);

  // Listen for crop refresh events (after planting)
  useEffect(() => {
    const handleCropsRefresh = async event => {
      console.log("Crops refresh event received:", event.detail);
      await loadCropsFromBackend();
    };

    window.addEventListener("cropsRefreshed", handleCropsRefresh);

    return () => {
      window.removeEventListener("cropsRefreshed", handleCropsRefresh);
    };
  }, [loadCropsFromBackend]);

  // Growth timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update growth when not in farm menu to prevent flickering during harvest selection
      if (!isFarmMenu) {
        setCropArray(prevCropArray => {
          const newCropArray = new CropItemArrayClass(30);
          newCropArray.copyFrom(prevCropArray);
          newCropArray.updateGrowth();
          return newCropArray;
        });
      }

      // Always update preview array growth, but only if we're in farm menu
      if (isFarmMenu) {
        setPreviewCropArray(prevPreviewCropArray => {
          const newPreviewCropArray = new CropItemArrayClass(30);
          newPreviewCropArray.copyFrom(prevPreviewCropArray);
          newPreviewCropArray.updateGrowth();
          return newPreviewCropArray;
        });
      }
    }, 1000); // Update every second

    setGrowthTimer(interval);
    return () => clearInterval(interval);
  }, [isFarmMenu]); // Add isFarmMenu as dependency

  const startPlanting = () => {
    // Check if userCrops are loaded before allowing planting mode
    if (!userCropsLoaded) {
      show("Please wait for your farm data to load before planting seeds.", "info");
      return;
    }

    // Check if user has unlocked farming plots
    if (maxPlots <= 0) {
      show("You need to level up to unlock farming plots!", "info");
      return;
    }

    if (!isFarmMenu) {
      setPreviewCropArray(cropArray);
      // Reset used seeds tracking when starting planting
      setUsedSeedsInPreview({});
    }
    setIsFarmMenu(true);
    setIsPlanting(true);
  };

  // Batch plant function - plant best seeds in all empty slots automatically
  const plantAll = useCallback(() => {
    // Check if userCrops are loaded before allowing planting
    if (!userCropsLoaded) {
      show("Please wait for your farm data to load before planting seeds.", "info");
      return;
    }

    // Check if user has unlocked farming plots
    if (maxPlots <= 0) {
      show("You need to level up to unlock farming plots!", "info");
      return;
    }

    // Ensure farm menu is open to show preview
    if (!isFarmMenu) {
      setIsFarmMenu(true);
      setIsPlanting(true);
      // Reset used seeds tracking when opening farm menu
      setUsedSeedsInPreview({});
    }

    // Find all empty slots by checking the actual cropArray (not preview)
    const newPreviewCropArray = new CropItemArrayClass(30);
    newPreviewCropArray.copyFrom(cropArray); // Start with actual planted seeds

    // Check if there are any empty plots available
    let emptyPlots = 0;
    const occupiedPlots = [];
    const emptyPlotNumbers = [];
    for (let i = 0; i < maxPlots; i++) {
      const item = newPreviewCropArray.getItem(i);
      if (item && (item.seedId === null || item.seedId === undefined)) {
        emptyPlots++;
        emptyPlotNumbers.push(i);
      } else if (item && item.seedId) {
        occupiedPlots.push({
          plot: i,
          seedId: item.seedId,
          status: item.growStatus,
        });
      }
    }

    if (emptyPlots === 0) {
      show("All your farming plots are already planted!", "info");
      return;
    }

    // Sort seeds by quality (best first): LEGENDARY > EPIC > RARE > UNCOMMON > COMMON
    const qualityOrder = {
      ID_RARE_TYPE_LEGENDARY: 5,
      ID_RARE_TYPE_EPIC: 4,
      ID_RARE_TYPE_RARE: 3,
      ID_RARE_TYPE_UNCOMMON: 2,
      ID_RARE_TYPE_COMMON: 1,
    };

    const sortedSeeds = currentSeeds
      .filter(seed => seed.count > 0)
      .sort((a, b) => {
        const aQuality = qualityOrder[a.category] || 0;
        const bQuality = qualityOrder[b.category] || 0;
        if (aQuality !== bQuality) {
          return bQuality - aQuality; // Higher quality first
        }
        return b.yield - a.yield; // Higher yield first for same quality
      });

    if (sortedSeeds.length === 0) {
      show("You don't have any seeds to plant!", "info");
      return;
    }

    // Plant seeds starting with the best quality
    let totalPlanted = 0;
    let remainingEmptyPlots = emptyPlots;
    const newUsedSeeds = { ...usedSeedsInPreview }; // Track seeds used in this plantAll operation

    for (const seed of sortedSeeds) {
      if (remainingEmptyPlots <= 0) break;

      const seedsToPlant = Math.min(seed.count, remainingEmptyPlots);
      if (seedsToPlant <= 0) continue;

      // Get growth time for this seed type
      const growthTime = getGrowthTime(seed.id);
      const planted = newPreviewCropArray.plantAll(seed.id, seedsToPlant, growthTime);
      totalPlanted += planted;
      remainingEmptyPlots -= planted;

      // Track the seeds used in this operation
      newUsedSeeds[seed.id] = (newUsedSeeds[seed.id] || 0) + planted;
    }

    // Create a new array and copy the data
    const updatedPreviewArray = new CropItemArrayClass(30);
    updatedPreviewArray.copyFrom(newPreviewCropArray);

    // Update both state variables
    setPreviewCropArray(updatedPreviewArray);
    setUsedSeedsInPreview(newUsedSeeds); // Update used seeds tracking
    setPreviewUpdateKey(prev => {
      const newKey = prev + 1;
      return newKey;
    });

    if (totalPlanted === 0) {
      show("No seeds were planted. All plots may already be occupied.", "info");
      return;
    }
  }, [userCropsLoaded, maxPlots, isFarmMenu, cropArray, currentSeeds, usedSeedsInPreview, show, setIsFarmMenu]);

  const startHarvesting = () => {
    setPreviewCropArray(cropArray);
    setIsPlanting(false);
    setIsFarmMenu(true);
  };

  const handleHarvestAll = async () => {
    try {
      const readySlots = [];
      const currentTimeSeconds = Math.floor(Date.now() / 1000);

      for (let i = 0; i < cropArray.getLength(); i++) {
        const item = cropArray.getItem(i);
        if (item && item.seedId) {
          const endTime = Math.floor((item.plantedAt || 0) / 1000) + (item.growthTime || 0);
          const isReady = item.growStatus === 2 || currentTimeSeconds >= endTime;
          if (isReady) {
            readySlots.push(i);
          }
        }
      }

      if (readySlots.length === 0) {
        show("No crops are ready to harvest!", "info");
        return;
      }
      playHarvestConfirmSound();
      show(`Harvesting ${readySlots.length} ready crops...`, "info");

      const ok = await executeHarvest(readySlots);
      if (!ok) return;

      await loadCropsFromBackend();
      await refreshBalancesAfterTransaction(800);

      // Force a re-render by updating the preview update key
      setPreviewUpdateKey(prev => prev + 1);

      show(`✅ Successfully harvested ${readySlots.length} crops!`, "success");
      // Clear any selection state after harvest all
      setSelectedIndexes([]);
      setIsFarmMenu(false);
      setIsPlanting(true);

      // Sync main crop array with latest growth data
      setCropArray(prevCropArray => {
        const newCropArray = new CropItemArrayClass(30);
        newCropArray.copyFrom(prevCropArray);
        newCropArray.updateGrowth();
        return newCropArray;
      });
    } catch (error) {
      const { message } = handleContractError(error, "harvesting all crops");
      console.error("Failed during Harvest All:", message);
      show(`❌ ${message}`, "error");
    }
  };

  const handlePlant = async () => {
    // Check if userCrops are loaded before allowing planting
    if (!userCropsLoaded) {
      show("Please wait for your farm data to load before planting seeds.", "info");
      return;
    }
    let loadingNotification = null;
    try {
      // Find all newly planted crops in preview (growStatus === -1)
      const cropsToPlant = [];
      for (let i = 0; i < previewCropArray.getLength(); i++) {
        const item = previewCropArray.getItem(i);
        if (item && item.growStatus === -1 && item.seedId) {
          cropsToPlant.push({
            seedId: item.seedId,
            plotNumber: i,
          });
        }
      }

      if (cropsToPlant.length === 0) {
        console.log("🚀 ~ handlePlant ~ selectedSeed:", selectedSeed);
        if (!selectedSeed) {
          show("Please select a seed first!", "info");
        } else {
          show('No crops selected to plant. Please click on plots to plant seeds or use "Plant All".', "info");
        }
        setIsFarmMenu(false);
        return;
      }
      // Show loading message that persists until transaction completes
      const loadingMessage =
        cropsToPlant.length === 1 ? "Planting seed..." : `Planting ${cropsToPlant.length} seeds...`;
      playPlantConfirmSound();
      loadingNotification = show(loadingMessage, "info", 300000); // 5 minutes timeout

      if (!account) {
        loadingNotification.dismiss();
        show("Please connect your wallet before planting seeds.", "info", 3000);
        return;
      }

      const plots = cropsToPlant.map(crop => ({
        plotNumber: crop.plotNumber,
        itemId: Number(crop.seedId),
      }));

      try {
        await plantCrops({ wallet: account, plots });
        loadingNotification.dismiss();
        show(
          `✅ Successfully planted ${cropsToPlant.length} seeds!`,
          "success",
          3000 // 3 seconds timeout
        );
      } catch (error) {
        loadingNotification.dismiss();
        console.error("Failed to plant crops via backend:", error);
        show("❌ Failed to plant seeds. Please try again.", "error", 3000);
        return;
      }

      // Update the main crop array immediately with planted crops before closing menu
      setCropArray(prevCropArray => {
        const newCropArray = new CropItemArrayClass(30);
        newCropArray.copyFrom(prevCropArray);

        // Copy newly planted crops from preview to main array
        for (let i = 0; i < cropsToPlant.length; i++) {
          const cropToPlant = cropsToPlant[i];
          const previewItem = previewCropArray.getItem(cropToPlant.plotNumber);
          if (previewItem && previewItem.seedId) {
            const mainItem = newCropArray.getItem(cropToPlant.plotNumber);
            if (mainItem) {
              mainItem.seedId = previewItem.seedId;
              mainItem.plantedAt = previewItem.plantedAt;
              mainItem.growthTime = previewItem.growthTime;
              mainItem.growStatus = 1; // Mark as growing
            }
          }
        }

        return newCropArray;
      });

      // Reset any selection state after successful planting
      setSelectedIndexes([]);

      // Reload crops and seeds concurrently to reduce total wait time
      await Promise.all([
        loadCropsFromBackend(),
        (async () => {
          try {
            if (typeof refetchSeeds === "function") {
              await refetchSeeds();
            }
          } catch (e) {
            // Failed to refetch seeds after planting
          }
        })(),
      ]);

      // Force a re-render by updating the preview update key
      setPreviewUpdateKey(prev => prev + 1);

      // Confirm planting in preview array (transition -1 to 1)
      setPreviewCropArray(prevPreviewCropArray => {
        const newPreviewCropArray = new CropItemArrayClass(30);
        newPreviewCropArray.copyFrom(prevPreviewCropArray);
        newPreviewCropArray.confirmPlanting();
        return newPreviewCropArray;
      });

      // Reset used seeds tracking after successful planting
      setUsedSeedsInPreview({});

      // Reset planting state and close farm menu
      setIsPlanting(true); // Keep in planting mode for next time
      setIsFarmMenu(false); // Close the farm menu to show planted items
    } catch (error) {
      const { message } = handleContractError(error, "planting crops");
      loadingNotification.dismiss();
      console.error("Failed to plant crops:", message);
      show(`❌ ${message}`, "error");
    }
  };

  const handleHarvest = async () => {
    if (!selectedIndexes || selectedIndexes.length === 0) {
      show("Please select crops to harvest first!", "info");
      return;
    }
    try {
      // Check which crops are actually ready to harvest
      const readyCrops = [];
      const currentTime = Math.floor(Date.now());

      for (const idx of selectedIndexes) {
        if (idx >= 0 && idx < cropArray.getLength()) {
          const item = cropArray.getItem(idx);
          const endTime = item?.plantedAt + item?.growthTime;
          const isActuallyReady = currentTime >= endTime;

          if (item && item.seedId && item.growStatus === 2 && isActuallyReady) {
            readyCrops.push(idx);
          }
        }
      }

      if (readyCrops.length === 0) {
        show("No selected crops are ready to harvest! Make sure crops are fully grown.", "info");
        return;
      }
      playHarvestConfirmSound();
      show(`Harvesting ${readyCrops.length} ready crops...`, "info");

      const ok = await executeHarvest(readyCrops);
      if (!ok) return;

      await loadCropsFromBackend();
      await refreshBalancesAfterTransaction(800);

      // Force a re-render by updating the preview update key
      setPreviewUpdateKey(prev => prev + 1);

      show(`✅ Successfully harvested ${readyCrops.length} crops!`, "success");
      // Clear selection state after successful harvest
      setSelectedIndexes([]);
      setIsFarmMenu(false);
      setIsPlanting(true);

      // Sync main crop array with latest growth data
      setCropArray(prevCropArray => {
        const newCropArray = new CropItemArrayClass(30);
        newCropArray.copyFrom(prevCropArray);
        newCropArray.updateGrowth();
        return newCropArray;
      });
    } catch (error) {
      const { message } = handleContractError(error, "harvesting crops");
      console.error("Failed to harvest crops:", message);
      show(`❌ ${message}`, "error");
    }
  };

  const handleCancel = () => {
    setSelectedIndexes([]);
    setIsFarmMenu(false);
    setIsPlanting(true);
    setIsUsingPotion(false);
    setSelectedPotion(null);
    // Reset used seeds tracking when canceling
    setUsedSeedsInPreview({});

    // Sync main crop array with latest growth data from preview
    setCropArray(prevCropArray => {
      const newCropArray = new CropItemArrayClass(30);
      newCropArray.copyFrom(prevCropArray);
      newCropArray.updateGrowth();
      return newCropArray;
    });
  };

  const handlePotionUse = async () => {
    if (!selectedPotion) {
      show("No potion selected!", "error");
      return;
    }

    if (!selectedIndexes || selectedIndexes.length !== 1) {
      show("Please select exactly one crop to apply the potion!", "info");
      return;
    }

    try {
      let potionFunction = null;

      // Determine which potion function to use based on the BigInt ID
      const potionId = selectedPotion.id;
      if (
        potionId === ID_POTION_ITEMS.POTION_GROWTH_ELIXIR ||
        potionId === ID_POTION_ITEMS.POTION_GROWTH_ELIXIR_II ||
        potionId === ID_POTION_ITEMS.POTION_GROWTH_ELIXIR_III
      ) {
        potionFunction = applyGrowthElixir;
      } else if (
        potionId === ID_POTION_ITEMS.POTION_PESTICIDE ||
        potionId === ID_POTION_ITEMS.POTION_PESTICIDE_II ||
        potionId === ID_POTION_ITEMS.POTION_PESTICIDE_III
      ) {
        potionFunction = applyPesticide;
      } else if (
        potionId === ID_POTION_ITEMS.POTION_FERTILIZER ||
        potionId === ID_POTION_ITEMS.POTION_FERTILIZER_II ||
        potionId === ID_POTION_ITEMS.POTION_FERTILIZER_III
      ) {
        potionFunction = applyFertilizer;
      }
      if (!potionFunction) {
        show("Invalid potion type!", "error");
        return;
      }

      const targetIndex = selectedIndexes[0];
      show(`Applying ${selectedPotion.name} to crop #${targetIndex + 1}...`, "info");

      const result = await potionFunction(targetIndex);

      if (result) {
        show(`✅ Successfully applied ${selectedPotion.name} to 1 crop!`, "success");

        // Reload crops from contract to show updated potion effects
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadCropsFromBackend();

        // Force a re-render by updating the preview update key
        setPreviewUpdateKey(prev => prev + 1);

        // Clear any selection state after successful potion application
        setSelectedIndexes([]);
        setIsUsingPotion(false);
        setSelectedPotion(null);
        setIsFarmMenu(false);
        setIsPlanting(true);
      } else {
        show("❌ Failed to apply potion. Please try again.", "error");
      }
    } catch (error) {
      const { message } = handleContractError(error, "applying potion");
      show(`❌ ${message}`, "error");
    }
  };

  const onClickCrop = (isShift, index) => {
    // Check if userCrops are loaded before allowing any plot interaction
    if (!userCropsLoaded) {
      show("Please wait for your farm data to load before interacting with plots.", "info");
      return;
    }

    // Check if user has unlocked farming plots
    if (maxPlots <= 0) {
      show("You need to level up to unlock farming plots!", "info");
      return;
    }

    if (isUsingPotion) {
      // Potion usage mode - allow selection of exactly one growing crop
      const plotData = cropArray.getItem(index);
      if (!plotData || !plotData.seedId) {
        show("This plot is empty. Potions can only be used on growing crops.", "info");
        return;
      }

      // Check if the crop is still growing (growStatus === 1) or ready to harvest (growStatus === 2)
      if (plotData.growStatus === 2) {
        show("This crop is ready to harvest. Potions can only be used on growing crops.", "info");
        return;
      }

      if (plotData.growStatus !== 1) {
        show("This crop is not growing. Potions can only be used on actively growing crops.", "info");
        return;
      }

      // Single-select behavior: selecting a new crop replaces previous selection
      setSelectedIndexes(prev => (prev.length === 1 && prev[0] === index ? [] : [index]));
      return;
    }

    if (isPlanting) {
      // Check if plot is empty (no seedId)
      const plotData = cropArray.getItem(index);
      if (plotData && plotData.seedId) {
        return;
      }

      // Require Shift for quick-plant; otherwise open the seed dialog
      if (selectedSeed && isShift) {
        // Use preview-adjusted availability
        const availableSeeds = getAvailableSeeds();
        const selectedAvailable = availableSeeds.find(s => s.id === selectedSeed);
        if (!selectedAvailable || selectedAvailable.count <= 0) {
          setSelectedSeed(null);
          setCurrentFieldIndex(index);
          setIsSelectCropDialog(true);
          return;
        }
        if (!isFarmMenu) {
          setPreviewCropArray(cropArray);
          setIsFarmMenu(true);
        }

        // Plant the selected seed directly
        setCurrentFieldIndex(index);
        handleClickSeedFromDialog(selectedSeed, index);
        return;
      }

      // Open selection dialog when Shift not held or no seed selected
      setCurrentFieldIndex(index);
      setIsSelectCropDialog(true);
      if (!isFarmMenu) {
        setPreviewCropArray(cropArray);
        setIsFarmMenu(true);
      }
    } else {
      // Harvesting mode - only allow selecting ready crops
      const item = cropArray.getItem(index);
      if (!item || !item.seedId) {
        return;
      }
      const nowSec = Math.floor(Date.now() / 1000);
      const endTime = Math.floor((item.plantedAt || 0) / 1000) + (item.growthTime || 0);
      const isReady = item.growStatus === 2 || nowSec >= endTime;
      if (!isReady) {
        return;
      }

      setSelectedIndexes(prev => {
        const exists = prev.includes(index);
        if (exists) return prev.filter(i => i !== index);
        return [...prev, index];
      });
    }
  };

  const handleClickSeedFromDialog = (id, fieldIndex) => {
    // Remember the selected seed so Shift+click can reuse it across plots
    setSelectedSeed(id);
    setIsSelectCropDialog(false);
    const idx = typeof fieldIndex === "number" ? fieldIndex : currentFieldIndex;
    if (idx < 0) {
      return;
    }

    // Ensure plot is empty before proceeding (UI guard)
    const existing = cropArray.getItem(idx);
    if (existing && existing.seedId && existing.seedId !== 0n) {
      show(`Plot ${idx} is already occupied.`, "error");
      return;
    }

    // Check if seed is available considering used seeds in preview
    const availableSeeds = getAvailableSeeds();
    const seed = availableSeeds.find(s => s.id === id);
    if (!seed || seed.count <= 0) {
      show("You don't have any more seeds of this type available!", "info");
      return;
    }

    // Just update the preview - don't call contract yet
    const newPreviewCropArray = new CropItemArrayClass(30);
    newPreviewCropArray.copyFrom(previewCropArray);

    // Get growth time for this seed type from contract
    const growthTime = getGrowthTime(id);

    newPreviewCropArray.plantCropAt(idx, id, growthTime);

    // Update used seeds tracking
    setUsedSeedsInPreview(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    setPreviewCropArray(newPreviewCropArray);
  };

  const dialogs = [
    {
      id: ID_FARM_HOTSPOTS.DEX,
      component: FarmerDialog,
      label: "FARMER",
      header: "/images/dialog/modal-header-gardner.png",
      actions: {
        plant: startPlanting,
        plantAll: plantAll,
        harvest: startHarvesting,
        harvestAll: handleHarvestAll,
        usePotion: startPotionUsage,
      },
    },
  ];

  const bees = FARM_BEES;
  return (
    <div>
      <PanZoomViewport
        backgroundSrc="/images/backgrounds/farm.webp"
        hotspots={hotspots}
        width={width}
        height={height}
        dialogs={dialogs}
        hideMenu={isFarmMenu}
        bees={bees}
        defaultScale={1.54}
        defaultTyRate={1.05}
      >
        <FarmInterface
          key={isFarmMenu ? `preview-${previewUpdateKey}` : "main"}
          cropArray={isFarmMenu ? previewCropArray : cropArray}
          onClickCrop={onClickCrop}
          isFarmMenu={isFarmMenu}
          isPlanting={isPlanting}
          isUsingPotion={isUsingPotion}
          maxPlots={maxPlots}
          totalPlots={30}
          selectedIndexes={selectedIndexes}
          crops={cropArray}
        />
      </PanZoomViewport>
      {plantedCount > 0 && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "2rem",
            zIndex: 90,
            pointerEvents: "none",
          }}
        >
          <p className="ghost-text">
            ○ Total <span className="highlight">{plantedCount}</span> Crops Planted
            <br />○ <span className="highlight">{readyCount}</span> Crops Ready
          </p>
        </div>
      )}
      {isFarmMenu && (
        <FarmMenu
          isPlant={isPlanting}
          isUsingPotion={isUsingPotion}
          onCancel={handleCancel}
          onPlant={handlePlant}
          onHarvest={handleHarvest}
          onPlantAll={plantAll}
          onPotionUse={handlePotionUse}
          selectedSeed={selectedSeed}
          selectedPotion={selectedPotion}
          loading={farmingLoading}
        />
      )}
      {isSelectCropDialog && (
        <SelectSeedDialog
          onClose={() => setIsSelectCropDialog(false)}
          onClickSeed={handleClickSeedFromDialog}
          availableSeeds={getAvailableSeeds()}
        />
      )}
    </div>
  );
};

export default Farm;
