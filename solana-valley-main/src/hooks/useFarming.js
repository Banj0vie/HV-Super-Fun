import { useCallback, useState } from "react";

import { getAvailablePlots, getFarmingState } from "../api/farmingApi";
import {
  applyFertilizer as applyFertilizerApi,
  applyGrowthElixir as applyGrowthElixirApi,
  applyPesticide as applyPesticideApi,
} from "../api/potionApi";
import { getProfile } from "../api/profileApi";
import { SEED_PACK_PRICE } from "../constants/item_seed";
import { TOKEN_DECIMALS } from "../solana/constants/programId";
import { getMultiplier, getSubtype } from "../utils/basic";
import { useSolanaWallet } from "./useSolanaWallet";

// Mirrors on-chain farming.rs logic (LOCKED_RATIO ~= 166bps in code; previous frontend used 100/1000).
const LOCKED_BPS = 100n;
const TOKEN_SCALE_BI = 10n ** BigInt(TOKEN_DECIMALS);

export const useFarming = () => {
  const { account } = useSolanaWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMaxPlots = useCallback(async () => {
    if (!account) return 15;
    try {
      const resp = await getAvailablePlots(account);
      return Number(resp?.maxPlots ?? 15);
    } catch {
      return 15;
    }
  }, [account]);

  const previewHarvestForSeed = useCallback(
    async seedId => {
      if (!account) return { lockedGameToken: "0", unlockedGameToken: "0" };

      try {
        setError(null);

        const numericSeedId = Number(seedId);
        const seedCategory = (numericSeedId >> 8) & 0xff;
        const localId = numericSeedId & 0xff;

        // Backend user profile contains the farming level used in multiplier rules.
        const profile = await getProfile(account);
        const ud = profile?.userData || profile;
        const level = Number(ud?.level ?? 0);

        // Backend farming state contains per-plot token multipliers.
        const farmingState = await getFarmingState(account);

        // Default token multiplier is 1.0x (1000).
        let tokenMulX1000 = 1000;

        // Match any crop in state for this seed (try both encodings seen in the old contract code).
        for (const crop of farmingState || []) {
          const rawId = Number(crop.itemId ?? crop.id ?? 0);
          const cropLocal = rawId & 0xff;
          const cat16 = (rawId >> 16) & 0xff;
          const cat8 = (rawId >> 8) & 0xff;

          if (cropLocal === localId && (cat16 === seedCategory || cat8 === seedCategory)) {
            tokenMulX1000 = Number(crop.tokenMultiplier ?? crop.token_multiplier ?? 1000);
            break;
          }
        }

        const basePriceLamports = BigInt(SEED_PACK_PRICE[seedCategory] ?? 0) * TOKEN_SCALE_BI;
        const subType = getSubtype(numericSeedId);
        const mult = getMultiplier(subType, level); // x1000 or higher

        const tokenMulBI = BigInt(Math.floor(tokenMulX1000));
        const multBI = BigInt(Math.floor(mult));

        let totalTokens;
        if (tokenMulX1000 > 1000) {
          // Old logic: basePrice * mult * tokenMul / 1_000_000
          totalTokens = (basePriceLamports * multBI * tokenMulBI) / 1_000_000n;
        } else {
          // Old logic: basePrice * mult / 1000
          totalTokens = (basePriceLamports * multBI) / 1000n;
        }

        const locked = (totalTokens * LOCKED_BPS) / 1000n;
        const unlocked = totalTokens - locked;

        return {
          lockedGameToken: locked.toString(),
          unlockedGameToken: unlocked.toString(),
        };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to preview harvest";
        setError(message);
        return { lockedGameToken: "0", unlockedGameToken: "0" };
      }
    },
    [account]
  );

  const applyGrowthElixir = useCallback(
    async plotNumber => {
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
        const resp = await applyGrowthElixirApi({ wallet: account, plotNumber: Number(plotNumber) });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to apply growth elixir");
        return { txHash: "backend", newEndTime: resp.newEndTime };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to apply growth elixir";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [account, loading]
  );

  const applyPesticide = useCallback(
    async plotNumber => {
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
        const resp = await applyPesticideApi({ wallet: account, plotNumber: Number(plotNumber) });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to apply pesticide");
        return { txHash: "backend", newProdMultiplier: resp.newProdMultiplier };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to apply pesticide";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [account, loading]
  );

  const applyFertilizer = useCallback(
    async plotNumber => {
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
        const resp = await applyFertilizerApi({ wallet: account, plotNumber: Number(plotNumber) });
        if (!resp?.ok) throw new Error(resp?.error || "Failed to apply fertilizer");
        return { txHash: "backend", newTokenMultiplier: resp.newTokenMultiplier };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to apply fertilizer";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [account, loading]
  );

  return {
    getMaxPlots,
    applyGrowthElixir,
    applyPesticide,
    applyFertilizer,
    previewHarvestForSeed,
    loading,
    error,
  };
};
