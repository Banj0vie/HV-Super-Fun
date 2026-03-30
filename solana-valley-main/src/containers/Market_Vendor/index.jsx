import "./style.css";

import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { getAvailablePlots } from "../../api/farmingApi";
import { buySeedPack as buySeedPackApi, getPendingRequest, revealSeedPack } from "../../api/vendorApi";
import { ID_CROP_CATEGORIES, ID_RARE_TYPE, ID_SEED_SHOP_PAGES } from "../../constants/app_ids";
import { SEED_PACK_PRICE, SEED_PACK_STATUS } from "../../constants/item_seed";
import { useNotification } from "../../contexts/NotificationContext";
import { useBalanceRefresh } from "../../hooks/useBalanceRefresh";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { GAME_TOKEN_MINT, TOKEN_DECIMALS, TRESURY_WALLET } from "../../solana/constants/programId";
import BaseDialog from "../_BaseDialog";
import BuySeeds from "./BuySeeds";
import CustomSeedsDialog from "./CustomSeedsDialog";
import RollChances from "./RollChances";
import SeedRollingDialog from "./SeedRollingDialog";
import VendorMenu from "./VendorMenu";

const TOKEN_SCALE_BI = 10n ** BigInt(TOKEN_DECIMALS);

const VendorDialog = ({ onClose, label = "VENDOR", header = "", headerOffset = 0 }) => {
  const { isConnected, account, publicKey, connection, sendTransaction } = useSolanaWallet();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();
  const { show } = useNotification();

  const [pageIndex, setPageIndex] = useState(ID_SEED_SHOP_PAGES.SEED_PACK_LIST);
  const [availablePlots, setAvailablePlots] = useState(0);
  const [selectedSeed, setSelectedSeed] = useState(0);
  const [selectedSeedPack, setSelectedSeedPack] = useState({});
  const [isCustomDlg, setIsCustomDlg] = useState(false);
  const [isRollingDlg, setIsRollingDlg] = useState(false);
  const [rollingInfo, setRollingInfo] = useState({});
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealCleanup, setRevealCleanup] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [buyingItem, setBuyingItem] = useState(null);

  // Memoized initial seed status to prevent unnecessary re-renders
  const initialSeedStatus = useMemo(
    () => ({
      [ID_CROP_CATEGORIES.FEEBLE_SEED]: {
        label: "Feeble Seeds",
        type: ID_RARE_TYPE.COMMON,
        status: SEED_PACK_STATUS.NORMAL,
        count: 0,
      },
      [ID_CROP_CATEGORIES.PICO_SEED]: {
        label: "Pico Seeds",
        type: ID_RARE_TYPE.UNCOMMON,
        status: SEED_PACK_STATUS.NORMAL,
        count: 0,
      },
      [ID_CROP_CATEGORIES.BASIC_SEED]: {
        label: "Basic Seeds",
        type: ID_RARE_TYPE.RARE,
        status: SEED_PACK_STATUS.NORMAL,
        count: 0,
      },
      [ID_CROP_CATEGORIES.PREMIUM_SEED]: {
        label: "Premium Seeds",
        type: ID_RARE_TYPE.EPIC,
        status: SEED_PACK_STATUS.NORMAL,
        count: 0,
      },
    }),
    []
  );

  const [seedStatus, setSeedStatus] = useState(initialSeedStatus);

  // Memoized tier mapping to prevent recreation on every render
  const tierMap = useMemo(
    () => ({
      [ID_CROP_CATEGORIES.FEEBLE_SEED]: 1,
      [ID_CROP_CATEGORIES.PICO_SEED]: 2,
      [ID_CROP_CATEGORIES.BASIC_SEED]: 3,
      [ID_CROP_CATEGORIES.PREMIUM_SEED]: 4,
    }),
    []
  );

  const tierToCategory = useMemo(
    () => ({
      1: ID_CROP_CATEGORIES.FEEBLE_SEED,
      2: ID_CROP_CATEGORIES.PICO_SEED,
      3: ID_CROP_CATEGORIES.BASIC_SEED,
      4: ID_CROP_CATEGORIES.PREMIUM_SEED,
    }),
    []
  );

  // Load available plots from backend - only when needed
  const loadAvailablePlots = useCallback(async () => {
    if (!isConnected || !account) return;

    try {
      const data = await getAvailablePlots(account);
      const { availablePlots: available } = data || {};
      setAvailablePlots(Math.max(0, Number(available || 0)));
    } catch (err) {
      console.error("Failed to load available plots:", err);
    }
  }, [isConnected, account]);

  // Load pending requests from backend - only when needed
  const loadPendingRequests = useCallback(async () => {
    if (!isConnected || !account) return;

    try {
      const pending = await getPendingRequest(account);
      console.log("🚀 ~ VendorDialog ~ pending:", pending);
      if (pending) {
        const request = {
          requestId: pending.id ?? 0,
          tier: Number(pending.tier ?? 0),
          count: Number(pending.count ?? 0),
        };
        setHasPendingRequests(true);
        setPendingRequests([request]);
      } else {
        setHasPendingRequests(false);
        setPendingRequests([]);
      }
    } catch (err) {
      console.error("Failed to load pending requests:", err);
    }
  }, [isConnected, account]);

  // Main data loading effect - only runs when dialog opens or account changes
  useEffect(() => {
    if (!isConnected || !account || dataLoaded) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        // Load essential data in parallel
        await Promise.all([
          loadAvailablePlots(),
          loadPendingRequests(),
          // Don't load pack prices immediately - load them when needed
        ]);
        setDataLoaded(true);
      } catch (err) {
        console.error("Failed to load vendor data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isConnected, account, dataLoaded, loadAvailablePlots, loadPendingRequests]);

  // NOTE: avoid unconditional post-load refresh here; it duplicates API calls
  // right after initial load. Data is refreshed on specific actions instead.

  const onSeedsClicked = useCallback(
    id => {
      setSelectedSeed(id);
      if (seedStatus[id].status === SEED_PACK_STATUS.COMMITED) {
        setSeedStatus(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: SEED_PACK_STATUS.NORMAL,
          },
        }));
        setRollingInfo({
          revealedSeeds: Array(seedStatus[id].count).fill(0),
          count: seedStatus[id].count,
        });
        setIsRollingDlg(true);
      } else {
        setPageIndex(ID_SEED_SHOP_PAGES.SEED_PACK_DETAIL);
      }
    },
    [seedStatus]
  );

  const onRollChancesClicked = useCallback(() => {
    setPageIndex(ID_SEED_SHOP_PAGES.ROLL_CHANCES);
  }, []);

  const handleReveal = useCallback(
    async (requestId, tier, count) => {
      if (!requestId || !account) return;

      // Clean up any existing reveal process
      if (revealCleanup) {
        revealCleanup();
        setRevealCleanup(null);
      }

      setIsRevealing(true);
      try {
        const result = await revealSeedPack({ wallet: account, requestId });
        const items = result?.items || [];
        const revealedSeeds = items.flatMap(entry =>
          Array(Number(entry.amount ?? 0))
            .fill(0)
            .map(() => Number(entry.itemId))
        );

        const rolling = {
          id: tier,
          count: parseInt(count, 10),
          isReveal: true,
          isComplete: true,
          isFallback: false,
          revealedSeeds,
        };
        setRollingInfo(rolling);
        setIsRollingDlg(true);

        // Reset seed status to NORMAL after successful reveal (tier 1-4 -> category id)
        const categoryId = tierToCategory[tier];
        if (categoryId) {
          setSeedStatus(prev => ({
            ...prev,
            [categoryId]: {
              ...prev[categoryId],
              status: SEED_PACK_STATUS.NORMAL,
              count: 0,
            },
          }));
        }

        setHasPendingRequests(false);
        setPendingRequests([]);
        await loadPendingRequests();
      } catch (err) {
        console.error("Failed to reveal:", err);
      } finally {
        setIsRevealing(false);
        setRevealCleanup(null);
      }
    },
    [account, revealCleanup, tierToCategory, loadPendingRequests]
  );

  // Cancel reveal process
  const cancelReveal = useCallback(async () => {
    if (revealCleanup) {
      revealCleanup();
      setRevealCleanup(null);
    }
    setIsRevealing(false);
    setIsRollingDlg(false);

    // Reset all seed statuses to NORMAL when dialog is closed
    setSeedStatus(prev => {
      const newStatus = { ...prev };
      Object.keys(newStatus).forEach(key => {
        if (newStatus[key].status === SEED_PACK_STATUS.COMMITED) {
          newStatus[key] = {
            ...newStatus[key],
            status: SEED_PACK_STATUS.NORMAL,
            count: 0,
          };
        }
      });
      return newStatus;
    });

    // Refresh pending requests when dialog is closed
    await loadPendingRequests();
  }, [revealCleanup, loadPendingRequests]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (revealCleanup) {
        revealCleanup();
      }
    };
  }, [revealCleanup]);

  const handleBuy = useCallback(
    async item => {
      if (!isConnected || !publicKey || !connection || !sendTransaction) {
        show("Please connect your wallet first", "warning");
        return;
      }

      const tier = tierMap[selectedSeed];
      const pricePerPack = Number(SEED_PACK_PRICE[tier] ?? 0);
      const count = Number(item?.count ?? 0);
      if (!Number.isFinite(pricePerPack) || pricePerPack <= 0 || !Number.isFinite(count) || count <= 0) {
        show("Invalid seed pack selection.", "warning");
        return;
      }

      const amountTokens = BigInt(Math.floor(pricePerPack)) * BigInt(count);
      const amountLamports = amountTokens * TOKEN_SCALE_BI;

      try {
        const parsed = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: GAME_TOKEN_MINT,
        });
        const accounts = parsed.value || [];
        const balanceLamports = accounts.reduce((sum, acc) => {
          const raw = acc?.account?.data?.parsed?.info?.tokenAmount?.amount;
          if (raw == null || raw === "") return sum;
          try {
            return sum + BigInt(String(raw));
          } catch {
            return sum;
          }
        }, 0n);

        if (balanceLamports < amountLamports) {
          const needUi = Number(amountTokens);
          const haveUi = Number(balanceLamports) / 10 ** TOKEN_DECIMALS;
          show(
            `Not enough HNY. You need ${needUi.toLocaleString()} HNY but only have ~${haveUi.toFixed(3)} HNY.`,
            "warning"
          );
          return;
        }
      } catch (e) {
        console.error("HNY balance check failed:", e);
        show("Could not verify your HNY balance. Please try again.", "error");
        return;
      }

      // Set buying state for this specific item
      setBuyingItem({
        ...item,
        packId: selectedSeed,
      });
      setIsRollingDlg(false);
      setSeedStatus(prev => ({
        ...prev,
        [selectedSeed]: {
          ...prev[selectedSeed],
          status: SEED_PACK_STATUS.COMMITING,
          count: item.count,
        },
      }));

      try {
        // Build SPL token transfer from user to treasury (amountLamports matches pre-check above)
        const fromAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);
        const toAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, TRESURY_WALLET, false);
        const transferIx = createTransferInstruction(fromAta, toAta, publicKey, amountLamports);

        const tx = new Transaction().add(transferIx);
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;

        const txSignature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(txSignature, "confirmed");

        // Call backend to register the buy
        await buySeedPackApi({
          wallet: account,
          tier,
          count,
          txSignature,
        });

        setSeedStatus(prev => ({
          ...prev,
          [selectedSeed]: {
            ...prev[selectedSeed],
            status: SEED_PACK_STATUS.COMMITED,
          },
        }));

        const successMessage =
          count === 1 ? "✅ Successfully bought seed pack!" : `✅ Successfully bought ${count} seed packs!`;
        show(successMessage, "success");

        // Refresh pending requests after successful purchase
        await loadPendingRequests();
        await refreshBalancesAfterTransaction(800);
      } catch (err) {
        console.error("Failed to buy seed pack:", err);
        // Show error message (loading notification will auto-dismiss after 5 minutes)
        setSeedStatus(prev => ({
          ...prev,
          [selectedSeed]: {
            ...prev[selectedSeed],
            status: SEED_PACK_STATUS.NORMAL,
          },
        }));
      } finally {
        // Reset buying state
        setBuyingItem(null);
      }

      setPageIndex(ID_SEED_SHOP_PAGES.SEED_PACK_LIST);
    },
    [
      isConnected,
      publicKey,
      connection,
      sendTransaction,
      account,
      selectedSeed,
      tierMap,
      loadPendingRequests,
      show,
      refreshBalancesAfterTransaction,
    ]
  );

  const onBuy = useCallback(
    item => {
      setSelectedSeedPack(item);
      if (item.count === 0) {
        // Don't set buyingItem for custom - wait until confirmation
        setIsCustomDlg(true);
      } else {
        handleBuy(item);
      }
    },
    [handleBuy]
  );

  const onConfirm = useCallback(
    count => {
      const customItem = {
        ...selectedSeedPack,
        count,
        isCustom: true, // Add unique identifier for custom items
      };
      handleBuy(customItem);
      setIsCustomDlg(false);
    },
    [selectedSeedPack, handleBuy]
  );

  return !isRollingDlg ? (
    <BaseDialog
      title={label}
      onClose={onClose}
      header={header}
      headerOffset={headerOffset}
      className="custom-modal-background"
    >
      {pageIndex === ID_SEED_SHOP_PAGES.SEED_PACK_LIST && (
        <VendorMenu
          seedStatus={seedStatus}
          onSeedsClicked={onSeedsClicked}
          onRollChancesClicked={onRollChancesClicked}
          availablePlots={availablePlots}
          hasPendingRequests={hasPendingRequests}
          pendingRequests={pendingRequests}
          onRevealClicked={handleReveal}
          isRevealing={isRevealing}
          isLoading={isLoadingData}
          buyingItem={buyingItem}
        ></VendorMenu>
      )}
      {pageIndex === ID_SEED_SHOP_PAGES.SEED_PACK_DETAIL && (
        <BuySeeds
          menuId={selectedSeed}
          onBack={() => {
            setPageIndex(ID_SEED_SHOP_PAGES.SEED_PACK_LIST);
          }}
          onBuy={onBuy}
          buyingItem={buyingItem}
          isAnyBuying={buyingItem !== null}
        ></BuySeeds>
      )}
      {pageIndex === ID_SEED_SHOP_PAGES.ROLL_CHANCES && (
        <RollChances
          onBack={() => {
            setPageIndex(ID_SEED_SHOP_PAGES.SEED_PACK_LIST);
          }}
        ></RollChances>
      )}
      {isCustomDlg && (
        <CustomSeedsDialog
          price={selectedSeedPack.price}
          onConfirm={onConfirm}
          onClose={() => {
            setIsCustomDlg(false);
            // Clear any buying state if dialog is closed without confirming
            setBuyingItem(null);
          }}
        ></CustomSeedsDialog>
      )}
    </BaseDialog>
  ) : (
    <SeedRollingDialog
      rollingInfo={rollingInfo}
      onClose={cancelReveal}
      onBack={cancelReveal}
      onBuyAgain={() => {
        cancelReveal();
        handleBuy(rollingInfo);
      }}
    ></SeedRollingDialog>
  );
};

export default VendorDialog;
