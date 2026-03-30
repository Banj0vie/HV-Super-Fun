import { Transaction } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { getProfile } from "../api/profileApi";
import {
  confirmUnlockWeeklyHarvest as confirmUnlockWeeklyHarvestApi,
  confirmUnlockWeeklyWage as confirmUnlockWeeklyWageApi,
  unlockWeeklyHarvest as unlockWeeklyHarvestApi,
  unlockWeeklyWage as unlockWeeklyWageApi,
} from "../api/sageApi";
import { TOKEN_DECIMALS } from "../solana/constants/programId";
import { fetchUserDataSuccess } from "../solana/store/slices/userSlice";
import { SAGE_UNLOCK_COOLDOWN } from "../utils/basic";
import { useBalanceRefresh } from "./useBalanceRefresh";
import { useSolanaWallet } from "./useSolanaWallet";

// Mirror on-chain constants/logic from sage.rs
const getUnlockPercentBps = level => {
  if (level >= 15) return 1500; // 15%
  if (level >= 10) return 1000; // 10%
  return 100; // 1%
};
// 2.5 + 2.5 * level, program uses 6 decimals (1e9)
const getUnlockCost = level => {
  const unit = 2_500_000_000; // 2.5e9
  return unit + unit * (Number(level) || 0);
};

export const useSage = () => {
  const { account, connection, sendTransaction } = useSolanaWallet();
  const dispatch = useDispatch();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();
  const [sageData, setSageData] = useState({
    lockedAmount: 0,
    lastUnlockTime: 0,
    lastUnlockTimeHarvest: 0,
    unlockRate: 0,
    unlockAmount: 0,
    canUnlockWage: false,
    canUnlockHarvest: false,
    nextUnlockTime: 0,
    nextWageUnlockTime: 0,
    nextHarvestUnlockTime: 0,
    harvestUnlockPercent: 0,
    harvestUnlockAmount: 0,
    weeklyWageAmount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateUnlockRate = useCallback(level => getUnlockPercentBps(level), []);

  const fetchSageData = useCallback(
    async (options = {}) => {
      const { force = false } = options;
      if (!account) return;
      setLoading(true);
      setError(null);
      try {
        const profile = await getProfile(account, { force });
        if (!profile) {
          setError("Profile not found");
          return;
        }

        // Normalize and dispatch latest userData to Redux (snake_case expected by userSlice)
        const ud = profile.userData || profile;
        const serializePubkey = pk => (pk && typeof pk.toString === "function" ? pk.toString() : pk);
        const mapCropToSnake = c => {
          if (!c) return { id: 0, end_time: 0, prod_multiplier: 1000, token_multiplier: 1000, growth_elixir: 0 };
          return {
            id: Number(c.id ?? 0),
            end_time: Number(c.end_time ?? c.endTime ?? 0),
            prod_multiplier: Number(c.prod_multiplier ?? c.produceMultiplier ?? c.prodMultiplier ?? 1000),
            token_multiplier: Number(c.token_multiplier ?? c.tokenMultiplier ?? 1000),
            growth_elixir: Number(c.growth_elixir ?? c.growthElixir ?? 0),
          };
        };
        const userDataSnake = {
          name: ud.name ?? "",
          referral_code: Array.isArray(ud.referral_code ?? ud.referralCode)
            ? [...(ud.referral_code ?? ud.referralCode)]
            : new Array(32).fill(0),
          sponsor: serializePubkey(ud.sponsor ?? ud.sponsorWallet),
          level: Number(ud.level ?? 0),
          xp: Number(ud.xp ?? 0),
          epoch_xp: Number(ud.epoch_xp ?? ud.epochXp ?? 0),
          last_epoch_counted: Number(ud.last_epoch_counted ?? ud.lastEpochCounted ?? 0),
          avatars: Array.isArray(ud.avatars) ? ud.avatars.map(serializePubkey) : [null, null],
          locked_tokens: (ud.locked_tokens ?? ud.lockedTokens ?? 0).toString(),
          xtoken_share: (ud.xtoken_share ?? ud.xtokenShare ?? 0).toString(),
          chest_open_time: Number(ud.chest_open_time ?? ud.chestOpenTime ?? 0),
          last_wage_time: Number(ud.last_wage_time ?? ud.lastWageTime ?? 0),
          last_harvest_time: Number(ud.last_harvest_time ?? ud.lastHarvestTime ?? 0),
          active_plot_ids: Array.isArray(ud.active_plot_ids ?? ud.activePlotIds)
            ? [...(ud.active_plot_ids ?? ud.activePlotIds)]
            : [],
          user_crops: Array.isArray(ud.user_crops ?? ud.userCrops)
            ? (ud.user_crops ?? ud.userCrops).map(mapCropToSnake)
            : new Array(30).fill(null).map(() => mapCropToSnake(null)),
        };
        dispatch(fetchUserDataSuccess(userDataSnake));

        // Handle camelCase or snake_case from backend
        const level = Number(ud.level || 0);
        const lastWageTime = Number(ud.last_wage_time ?? ud.lastWageTime ?? 0);
        const lastHarvestTime = Number(ud.last_harvest_time ?? ud.lastHarvestTime ?? 0);

        const percentBps = calculateUnlockRate(level); // in bps
        const lockedTokensBI = BigInt((ud.locked_tokens ?? ud.lockedTokens ?? 0).toString());
        const harvestUnlockAmountBI = (lockedTokensBI * BigInt(percentBps)) / 10_000n;
        const weeklyWageAmountBI = BigInt(getUnlockCost(level));

        const now = Date.now();
        const nextWageUnlockTime = lastWageTime + SAGE_UNLOCK_COOLDOWN;
        const nextHarvestUnlockTime = lastHarvestTime + SAGE_UNLOCK_COOLDOWN;
        const canUnlockWage = lastWageTime === 0 || now >= nextWageUnlockTime * 1000;
        const canUnlockHarvest = lastHarvestTime === 0 || now >= nextHarvestUnlockTime * 1000;

        // Convert to UI units
        const scale = 10 ** TOKEN_DECIMALS;
        const toUi = bn => parseFloat(bn.toString()) / scale;

        setSageData({
          lockedAmount: toUi(lockedTokensBI),
          lastUnlockTime: lastWageTime,
          lastUnlockTimeHarvest: lastHarvestTime,
          harvestUnlockPercent: percentBps / 100, // percent
          harvestUnlockAmount: toUi(harvestUnlockAmountBI),
          weeklyWageAmount: toUi(weeklyWageAmountBI),
          canUnlockWage,
          canUnlockHarvest,
          nextWageUnlockTime,
          nextHarvestUnlockTime,
          unlockRate: percentBps / 100,
          unlockAmount: toUi(harvestUnlockAmountBI),
          nextUnlockTime: nextHarvestUnlockTime,
        });
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to fetch sage data";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [account, calculateUnlockRate, dispatch]
  );

  const unlockWeeklyHarvest = useCallback(async () => {
    if (!account) {
      setError("Wallet not connected");
      return null;
    }
    if (loading) {
      setError("Transaction already in progress");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await unlockWeeklyHarvestApi({ wallet: account });
      if (!resp?.ok) throw new Error(resp?.error || "Failed to unlock weekly harvest");

      const { pendingConfirmation, signedTransactionBase64 } = resp;

      let txHash = "backend";
      let finalized = resp;

      if (pendingConfirmation) {
        if (!signedTransactionBase64 || !connection || !sendTransaction) {
          throw new Error("Weekly harvest requires wallet transaction confirmation");
        }

        let txSignature;
        try {
          const tx = Transaction.from(Buffer.from(signedTransactionBase64, "base64"));
          txSignature = await sendTransaction(tx, connection);
          await connection.confirmTransaction(txSignature, "confirmed");
        } catch (err) {
          throw new Error("Weekly harvest cancelled or failed. Nothing was unlocked.");
        }

        txHash = String(txSignature);
        const confirmResp = await confirmUnlockWeeklyHarvestApi({
          wallet: account,
          txSignature: String(txSignature),
        });
        if (!confirmResp?.ok) {
          throw new Error(confirmResp?.error || "Failed to confirm weekly harvest");
        }
        finalized = confirmResp;
      }

      await fetchSageData({ force: true });
      await refreshBalancesAfterTransaction(1000);

      return {
        txHash,
        unlockedAmount: finalized.unlockedAmount,
        remainingLocked: finalized.remainingLocked,
      };
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to unlock weekly harvest";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [account, connection, fetchSageData, refreshBalancesAfterTransaction, loading, sendTransaction]);

  const unlockWeeklyWage = useCallback(async () => {
    if (!account) {
      setError("Wallet not connected");
      return null;
    }
    if (loading) {
      setError("Transaction already in progress");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await unlockWeeklyWageApi({ wallet: account });
      if (!resp?.ok) throw new Error(resp?.error || "Failed to unlock weekly wage");

      const { pendingConfirmation, signedTransactionBase64 } = resp;

      let txHash = "backend";
      let finalized = resp;

      if (pendingConfirmation) {
        if (!signedTransactionBase64 || !connection || !sendTransaction) {
          throw new Error("Weekly wage requires wallet transaction confirmation");
        }

        let txSignature;
        try {
          const tx = Transaction.from(Buffer.from(signedTransactionBase64, "base64"));
          txSignature = await sendTransaction(tx, connection);
          await connection.confirmTransaction(txSignature, "confirmed");
        } catch (err) {
          throw new Error("Weekly wage cancelled or failed. Nothing was unlocked.");
        }

        txHash = String(txSignature);
        const confirmResp = await confirmUnlockWeeklyWageApi({
          wallet: account,
          txSignature: String(txSignature),
        });
        if (!confirmResp?.ok) {
          throw new Error(confirmResp?.error || "Failed to confirm weekly wage");
        }
        finalized = confirmResp;
      }

      await fetchSageData({ force: true });
      await refreshBalancesAfterTransaction(1000);

      return {
        txHash,
        unlockedAmount: finalized.unlockedAmount,
        remainingLocked: finalized.remainingLocked,
      };
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to unlock weekly wage";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [account, connection, fetchSageData, refreshBalancesAfterTransaction, loading, sendTransaction]);

  const getTimeUntilNextWageUnlock = useCallback(() => {
    const now = Date.now();
    const remaining = sageData.nextWageUnlockTime * 1000 - now;
    return Math.max(0, remaining);
  }, [sageData.nextWageUnlockTime]);

  const getTimeUntilNextHarvestUnlock = useCallback(() => {
    const now = Date.now();
    const remaining = sageData.nextHarvestUnlockTime * 1000 - now;
    return Math.max(0, remaining);
  }, [sageData.nextHarvestUnlockTime]);

  return {
    sageData,
    fetchSageData,
    unlockWeeklyHarvest,
    unlockWeeklyWage,
    getTimeUntilNextWageUnlock,
    getTimeUntilNextHarvestUnlock,
    loading,
    error,
  };
};
