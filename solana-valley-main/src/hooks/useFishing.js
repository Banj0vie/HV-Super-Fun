import { useCallback, useState } from "react";

import {
  craftBait as craftBaitApi,
  fish as fishApi,
  getPendingRequest as getPendingRequestApi,
  revealFishing as revealFishingApi,
} from "../api/fishingApi";
import { ID_BAIT_ITEMS } from "../constants/app_ids";
import { useSolanaWallet } from "./useSolanaWallet";

export const useFishing = () => {
  const { account } = useSolanaWallet();

  const [fishingData, setFishingData] = useState({
    loading: false,
    error: null,
    pendingRequests: [],
  });

  const ensureNoUnrevealedPending = useCallback(async () => {
    if (!account) return true;
    try {
      const pending = await getPendingRequestApi(account);
      return !pending;
    } catch {
      return true;
    }
  }, [account]);

  const craftBait1 = useCallback(
    async baitCount => {
      if (!account) return null;
      if (fishingData.loading) {
        setFishingData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      try {
        setFishingData(prev => ({ ...prev, loading: true, error: null }));
        const resp = await craftBaitApi({
          wallet: account,
          baitId: ID_BAIT_ITEMS.BAIT_1,
          amount: Number(baitCount),
        });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to craft bait");
        setFishingData(prev => ({ ...prev, loading: false }));
        return { txHash: "backend", isPending: false };
      } catch (err) {
        const msg = err?.message || "Failed to craft bait";
        setFishingData(prev => ({ ...prev, loading: false, error: msg }));
        return null;
      }
    },
    [account, fishingData.loading]
  );

  const craftBait2 = useCallback(
    async (craftCount, itemIds, amounts) => {
      if (!account) return null;
      if (fishingData.loading) {
        setFishingData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      try {
        setFishingData(prev => ({ ...prev, loading: true, error: null }));
        const resp = await craftBaitApi({
          wallet: account,
          baitId: ID_BAIT_ITEMS.BAIT_2,
          amount: Number(craftCount),
          itemIds: Array.isArray(itemIds) ? itemIds.map(Number) : [],
          amounts: Array.isArray(amounts) ? amounts.map(Number) : [],
        });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to craft bait");
        setFishingData(prev => ({ ...prev, loading: false }));
        return { txHash: "backend", isPending: false };
      } catch (err) {
        const msg = err?.message || "Failed to craft bait";
        setFishingData(prev => ({ ...prev, loading: false, error: msg }));
        throw new Error(msg);
      }
    },
    [account, fishingData.loading]
  );

  const craftBait3 = useCallback(
    async (craftCount, itemIds, amounts) => {
      if (!account) return null;
      if (fishingData.loading) {
        setFishingData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      try {
        setFishingData(prev => ({ ...prev, loading: true, error: null }));
        const resp = await craftBaitApi({
          wallet: account,
          baitId: ID_BAIT_ITEMS.BAIT_3,
          amount: Number(craftCount),
          itemIds: Array.isArray(itemIds) ? itemIds.map(Number) : [],
          amounts: Array.isArray(amounts) ? amounts.map(Number) : [],
        });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to craft bait");
        setFishingData(prev => ({ ...prev, loading: false }));
        return { txHash: "backend", isPending: false };
      } catch (err) {
        const msg = err?.message || "Failed to craft bait";
        setFishingData(prev => ({ ...prev, loading: false, error: msg }));
        throw new Error(msg);
      }
    },
    [account, fishingData.loading]
  );

  const fish = useCallback(
    async (baitId, amount = 1) => {
      if (!account) return null;
      if (fishingData.loading) {
        setFishingData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      try {
        setFishingData(prev => ({ ...prev, loading: true, error: null }));

        const allowed = await ensureNoUnrevealedPending();
        if (!allowed) {
          setFishingData(prev => ({ ...prev, loading: false, error: "Pending fishing request not revealed yet" }));
          return null;
        }

        const resp = await fishApi({ wallet: account, baitId: Number(baitId), amount: Number(amount) });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to fish");

        setFishingData(prev => ({
          ...prev,
          loading: false,
          pendingRequests: [
            {
              requestId: resp.requestId,
              baitId: Number(baitId),
              amount: Number(amount),
              level: 0,
            },
          ],
        }));

        return { txHash: "backend", isPending: true, requestId: resp.requestId };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to fish";
        setFishingData(prev => ({ ...prev, loading: false, error: message }));
        return null;
      }
    },
    [account, ensureNoUnrevealedPending, fishingData.loading]
  );

  const getAllPendingRequests = useCallback(async () => {
    if (!account) return [];
    const pending = await getPendingRequestApi(account);
    if (!pending) return [];
    return [
      {
        requestId: pending.id,
        baitId: Number(pending.baitId ?? pending.bait_id ?? 0),
        amount: Number(pending.amount ?? 0),
        level: Number(pending.level ?? 0),
      },
    ];
  }, [account]);

  const checkPendingRequests = useCallback(async () => {
    const list = await getAllPendingRequests();
    return list.length > 0;
  }, [getAllPendingRequests]);

  const revealFishing = useCallback(
    async requestIdArg => {
      if (!account) return null;
      if (fishingData.loading) {
        setFishingData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      let requestId = requestIdArg;
      if (!requestId) {
        try {
          const pending = await getPendingRequestApi(account);
          requestId = pending?.id ?? null;
        } catch {
          requestId = null;
        }
      }

      if (!requestId) {
        setFishingData(prev => ({ ...prev, error: "No pending fishing request" }));
        return null;
      }

      try {
        setFishingData(prev => ({ ...prev, loading: true, error: null }));

        const resp = await revealFishingApi({ wallet: account, requestId: Number(requestId) });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to reveal fishing");

        setFishingData(prev => ({ ...prev, loading: false, pendingRequests: [] }));

        return { txHash: "backend", isPending: false, items: resp.items || [] };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to reveal fishing";
        setFishingData(prev => ({ ...prev, loading: false, error: message }));
        return null;
      }
    },
    [account, fishingData.loading]
  );

  return {
    fishingData,
    craftBait1,
    craftBait2,
    craftBait3,
    fish,
    revealFishing,
    getAllPendingRequests,
    checkPendingRequests,
  };
};
