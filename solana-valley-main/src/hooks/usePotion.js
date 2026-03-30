import { useCallback, useState } from "react";

import { craftPotion as craftPotionApi } from "../api/potionApi";
import { ID_POTION_ITEMS } from "../constants/app_ids";
import { useSolanaWallet } from "./useSolanaWallet";

export const usePotion = () => {
  const [potionData, setPotionData] = useState({ loading: false, error: null });
  const { account } = useSolanaWallet();

  const craftGrowthElixir = useCallback(
    async (count = 1) => {
      if (!account) return null;
      if (potionData.loading) {
        setPotionData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      setPotionData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const resp = await craftPotionApi({
          wallet: account,
          potionId: ID_POTION_ITEMS.POTION_GROWTH_ELIXIR,
          amount: Number(count),
        });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to craft growth elixir");
        setPotionData(prev => ({ ...prev, loading: false }));
        return { txHash: "backend", isPending: false };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to craft growth elixir";
        setPotionData(prev => ({ ...prev, loading: false, error: message }));
        throw new Error(message);
      }
    },
    [account, potionData.loading]
  );

  const craftPesticide = useCallback(
    async (count = 1) => {
      if (!account) return null;
      if (potionData.loading) {
        setPotionData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      setPotionData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const resp = await craftPotionApi({
          wallet: account,
          potionId: ID_POTION_ITEMS.POTION_PESTICIDE,
          amount: Number(count),
        });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to craft pesticide");
        setPotionData(prev => ({ ...prev, loading: false }));
        return { txHash: "backend", isPending: false };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to craft pesticide";
        setPotionData(prev => ({ ...prev, loading: false, error: message }));
        throw new Error(message);
      }
    },
    [account, potionData.loading]
  );

  const craftFertilizer = useCallback(
    async (count = 1) => {
      if (!account) return null;
      if (potionData.loading) {
        setPotionData(prev => ({ ...prev, error: "Transaction already in progress" }));
        return null;
      }

      setPotionData(prev => ({ ...prev, loading: true, error: null }));
      try {
        const resp = await craftPotionApi({
          wallet: account,
          potionId: ID_POTION_ITEMS.POTION_FERTILIZER,
          amount: Number(count),
        });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to craft fertilizer");
        setPotionData(prev => ({ ...prev, loading: false }));
        return { txHash: "backend", isPending: false };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to craft fertilizer";
        setPotionData(prev => ({ ...prev, loading: false, error: message }));
        throw new Error(message);
      }
    },
    [account, potionData.loading]
  );

  // Batch crafting functions (alias for single functions with count parameter)
  const craftGrowthElixirBatch = useCallback(
    async (count = 1) => {
      return await craftGrowthElixir(count);
    },
    [craftGrowthElixir]
  );

  const craftPesticideBatch = useCallback(
    async (count = 1) => {
      return await craftPesticide(count);
    },
    [craftPesticide]
  );

  const craftFertilizerBatch = useCallback(
    async (count = 1) => {
      return await craftFertilizer(count);
    },
    [craftFertilizer]
  );

  return {
    potionData,
    craftGrowthElixir,
    craftPesticide,
    craftFertilizer,
    craftGrowthElixirBatch,
    craftPesticideBatch,
    craftFertilizerBatch,
  };
};
