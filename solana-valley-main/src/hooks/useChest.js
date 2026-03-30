import { useCallback, useEffect, useState } from "react";

import { claimDailyChest as claimDailyChestApi, openChest as openChestApi } from "../api/chestApi";
import { getProfile } from "../api/profileApi";
import { useSolanaWallet } from "./useSolanaWallet";

export const useChest = () => {
  const { account } = useSolanaWallet();
  const [chestData, setChestData] = useState({
    nextChestTime: 0,
    canClaim: false,
    currentLevel: 0,
    chestType: "WOOD",
    loading: false,
    error: null,
  });

  const fetchChestData = useCallback(
    async (options = {}) => {
      const { force = false } = options;
      if (!account) return;
      setChestData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const profile = await getProfile(account, { force });
        const currentLevel = Number(profile?.level ?? profile?.userData?.level ?? 0);

        // Backend stores `chestOpenTime` as the next time the chest is available (unix seconds).
        const nextChestTime = Number(profile?.chestOpenTime ?? profile?.userData?.chestOpenTime ?? 0);

        let chestType = "WOOD";
        if (currentLevel >= 15) chestType = "GOLD";
        else if (currentLevel >= 10) chestType = "SILVER";
        else if (currentLevel >= 5) chestType = "BRONZE";
        const nowSec = Math.floor(Date.now() / 1000);
        const canClaim = nowSec >= nextChestTime;
        const snapshot = { nextChestTime, canClaim, currentLevel, chestType, loading: false, error: null };
        setChestData(snapshot);
        return { nextChestTime, canClaim, currentLevel, chestType };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to fetch chest data";
        setChestData(prev => ({ ...prev, loading: false, error: message }));
        return null;
      }
    },
    [account]
  );

  const claimDailyChest = useCallback(async () => {
    if (!account) {
      setChestData(p => ({ ...p, error: "Wallet not connected" }));
      return null;
    }
    setChestData(p => ({ ...p, loading: true, error: null }));
    try {
      const result = await claimDailyChestApi(account);
      const snap = await fetchChestData({ force: true });
      // fetchChestData already sets full chest state (loading: false); do not merge — that can clobber fresh fields.
      return snap ? { ...result, ...snap } : result;
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to claim daily chest";
      setChestData(p => ({ ...p, loading: false, error: message }));
      throw new Error(message);
    }
  }, [account, fetchChestData]);

  const openChest = useCallback(
    async chestItemId => {
      if (!account) {
        setChestData(p => ({ ...p, error: "Wallet not connected" }));
        return { success: false, results: [] };
      }
      setChestData(p => ({ ...p, loading: true, error: null }));
      try {
        const resp = await openChestApi({ wallet: account, chestItemId });

        if (!resp?.ok) {
          const message = resp?.error || "Failed to open chest";
          setChestData(p => ({ ...p, loading: false, error: message }));
          return { success: false, results: [] };
        }

        const rewardId = Number(resp.rewardItemId);
        setChestData(p => ({ ...p, loading: false, error: null }));
        return {
          success: true,
          results: Number.isFinite(rewardId) ? [rewardId] : [],
        };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to open chest";
        setChestData(p => ({ ...p, loading: false, error: message }));
        throw new Error(message);
      }
    },
    [account]
  );

  useEffect(() => {
    fetchChestData();
  }, [fetchChestData]);

  const getTimeUntilNextChest = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = Math.max(0, chestData.nextChestTime - now);
    return timeLeft * 1000;
  }, [chestData.nextChestTime]);

  return { ...chestData, claimDailyChest, openChest, getTimeUntilNextChest, fetchChestData };
};
