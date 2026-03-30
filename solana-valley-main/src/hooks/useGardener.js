import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

import { levelUp as levelUpApi } from "../api/gardenerApi";
import { getProfile } from "../api/profileApi";
import { GAME_TOKEN_MINT, TOKEN_DECIMALS, TRESURY_WALLET } from "../solana/constants/programId";
import { useBalanceRefresh } from "./useBalanceRefresh";
import { useSolanaWallet } from "./useSolanaWallet";

const priceForLevel = level => 20 + 50 * level * level;
const TOKEN_SCALE_BI = 10n ** BigInt(TOKEN_DECIMALS);

export const useGardener = () => {
  const { publicKey, sendTransaction, connection, account } = useSolanaWallet();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();
  const [gardenerData, setGardenerData] = useState({
    currentLevel: 0,
    maxLevel: 15,
    levelUpCost: 0,
    canLevelUp: false,
    loading: false,
    error: null,
  });

  const fetchGardenerData = useCallback(
    async (options = {}) => {
      const { force = false } = options;
      if (!publicKey || !account) return;
      setGardenerData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // Use force after mutations (e.g. level-up) so profile TTL cache does not show stale level.
        const profile = await getProfile(account, { force });
        const currentLevel = Number(profile?.level ?? profile?.userData?.level ?? 0);
        const maxLevel = 15;
        const levelUpCost = currentLevel < maxLevel ? priceForLevel(currentLevel + 1) : 0;
        // Fetch user's HONEY balance via associated token account
        const userGameAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);
        let gameTokenBalanceUi = 0;
        try {
          const info = await connection.getParsedAccountInfo(userGameAta);
          const parsed = info?.value?.data?.parsed?.info?.tokenAmount?.uiAmount;
          gameTokenBalanceUi = Number(parsed || 0);
        } catch {}
        const canLevelUp = currentLevel < maxLevel && gameTokenBalanceUi >= levelUpCost;
        setGardenerData({ currentLevel, maxLevel, levelUpCost, canLevelUp, loading: false, error: null });
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to fetch gardener data";
        setGardenerData(prev => ({ ...prev, loading: false, error: message }));
      }
    },
    [publicKey, connection, account]
  );

  const levelUp = useCallback(
    async targetLevel => {
      if (!publicKey || !account) {
        setGardenerData(p => ({ ...p, error: "Wallet not connected" }));
        return null;
      }
      setGardenerData(p => ({ ...p, loading: true, error: null }));
      try {
        const amountTokens = BigInt(priceForLevel(targetLevel));
        const amountLamports = amountTokens * TOKEN_SCALE_BI;

        const fromAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);
        const toAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, TRESURY_WALLET, false);
        const transferIx = createTransferInstruction(fromAta, toAta, publicKey, amountLamports);

        const tx = new Transaction().add(transferIx);
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;

        const txSignature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(txSignature, "confirmed");

        await levelUpApi({
          wallet: account,
          newLevel: targetLevel,
          txSignature,
        });
        await fetchGardenerData({ force: true });
        await refreshBalancesAfterTransaction(800);
        return txSignature;
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Level up failed";
        setGardenerData(p => ({ ...p, loading: false, error: message }));
        throw new Error(message);
      }
    },
    [publicKey, connection, sendTransaction, fetchGardenerData, account, refreshBalancesAfterTransaction]
  );

  useEffect(() => {
    fetchGardenerData();
  }, [fetchGardenerData]);

  return { ...gardenerData, levelUp, fetchGardenerData };
};
