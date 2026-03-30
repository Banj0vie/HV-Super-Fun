import { createTransferInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  confirmUnstake as confirmUnstakeApi,
  getPool as getPoolApi,
  getShares as getSharesApi,
  stake as stakeApi,
  unstake as unstakeApi,
} from "../api/bankerApi";
import { GAME_TOKEN_MINT, TOKEN_DECIMALS, TRESURY_WALLET } from "../solana/constants/programId";
import { updateStakedBalance, updateXTokenShare } from "../solana/store/slices/balanceSlice";
import {
  fetchBankerDataFailure,
  fetchBankerDataStart,
  fetchBankerDataSuccess,
  selectBankerError,
  selectBankerLoading,
} from "../solana/store/slices/bankerSlice";
import { useBalanceRefresh } from "./useBalanceRefresh";
import { useSolanaWallet } from "./useSolanaWallet";

const TOKEN_SCALE = 10 ** TOKEN_DECIMALS;

export const useBanker = () => {
  const { publicKey, sendTransaction, connection, account } = useSolanaWallet();
  const dispatch = useDispatch();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();

  const loading = useSelector(selectBankerLoading);
  const error = useSelector(selectBankerError);

  const getBankerData = useCallback(async () => {
    try {
      const poolData = await getPoolApi();
      const rawBalance = parseFloat(poolData?.balance ?? "0");
      const rawXBalance = parseFloat(poolData?.xBalance ?? "0");
      const gameToken = (rawBalance / TOKEN_SCALE).toString();
      const xGameToken = (rawXBalance / TOKEN_SCALE).toString();
      const result = { totalGameToken: gameToken, totalXGameToken: xGameToken };
      dispatch(fetchBankerDataSuccess(result));
      return result;
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Failed to fetch banker data";
      dispatch(fetchBankerDataFailure(message));
      return { totalGameToken: "0", totalXGameToken: "0" };
    }
  }, [dispatch]);

  const stake = useCallback(
    async amount => {
      if (!publicKey || !account) {
        dispatch(fetchBankerDataFailure("Wallet not connected"));
        return false;
      }
      if (loading) {
        dispatch(fetchBankerDataFailure("Transaction already in progress"));
        return false;
      }
      dispatch(fetchBankerDataStart());

      try {
        if (amount <= 0) throw new Error("Amount must be greater than 0");

        const amountLamports = BigInt(Math.floor(amount * TOKEN_SCALE));

        // Build SPL token transfer from user to treasury
        const fromAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);
        const toAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, TRESURY_WALLET, false);
        const transferIx = createTransferInstruction(fromAta, toAta, publicKey, amountLamports);

        const tx = new Transaction().add(transferIx);
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;

        const txSignature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(txSignature, "confirmed");

        // Call backend to complete stake
        const resp = await stakeApi({
          wallet: account,
          txSignature,
          amount: amountLamports.toString(),
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to stake");

        // Fetch updated pool data
        await getBankerData();

        // Use centralized balance refresh
        await refreshBalancesAfterTransaction(1000);

        return true;
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to stake";
        dispatch(fetchBankerDataFailure(message));
        return false;
      }
    },
    [publicKey, account, dispatch, connection, loading, refreshBalancesAfterTransaction, sendTransaction, getBankerData]
  );

  const unstake = useCallback(
    async shares => {
      if (!publicKey || !account) {
        dispatch(fetchBankerDataFailure("Wallet not connected"));
        return false;
      }
      if (loading) {
        dispatch(fetchBankerDataFailure("Transaction already in progress"));
        return false;
      }
      dispatch(fetchBankerDataStart());

      try {
        if (shares <= 0) throw new Error("Shares must be greater than 0");

        const sharesLamports = BigInt(Math.floor(shares * TOKEN_SCALE));

        // Step 1: request unstake from backend.
        const resp = await unstakeApi({
          wallet: account,
          shares: sharesLamports.toString(),
        });

        if (!resp?.ok) throw new Error(resp?.error || "Failed to unstake");

        let txSignature = null;
        const pendingConfirmation = !!resp?.pendingConfirmation;

        // Step 2: if pendingConfirmation, user must sign and submit payout tx.
        if (pendingConfirmation) {
          if (!resp?.signedTransactionBase64 || !connection || !sendTransaction) {
            throw new Error("Unstake requires wallet transaction confirmation");
          }
          try {
            const tx = Transaction.from(Buffer.from(resp.signedTransactionBase64, "base64"));
            txSignature = await sendTransaction(tx, connection);
            await connection.confirmTransaction(txSignature, "confirmed");
          } catch (err) {
            throw new Error("Unstake cancelled or failed. Nothing was unstaked.");
          }

          // Step 3: confirm with backend so DB state is finalized only after successful tx.
          const confirmResp = await confirmUnstakeApi({
            wallet: account,
            shares: sharesLamports.toString(),
            txSignature: String(txSignature),
          });
          if (!confirmResp?.ok) {
            throw new Error(confirmResp?.error || "Failed to confirm unstake");
          }
        }

        // Fetch updated pool data
        await getBankerData();

        // Use centralized balance refresh
        await refreshBalancesAfterTransaction(1000);

        return { txHash: txSignature || "backend", amount: resp.amount };
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to unstake";
        dispatch(fetchBankerDataFailure(message));
        return false;
      }
    },
    [publicKey, account, connection, sendTransaction, dispatch, loading, refreshBalancesAfterTransaction, getBankerData]
  );

  const getBankerBalance = useCallback(async () => {
    if (!account) return "0";

    try {
      // Fetch user's shares and estimated value from backend
      const sharesData = await getSharesApi(account);
      const xTokenShareUi = (parseFloat(sharesData?.xtokenShare ?? "0") / TOKEN_SCALE).toString();
      const estimatedValueUi = (parseFloat(sharesData?.estimatedValue ?? "0") / TOKEN_SCALE).toString();

      // Update balances in Redux
      dispatch(updateXTokenShare(xTokenShareUi));
      dispatch(updateStakedBalance(estimatedValueUi));

      return xTokenShareUi;
    } catch (err) {
      console.error("getBankerBalance failed:", err);
      return "0";
    }
  }, [account, dispatch]);

  return { stake, unstake, getBalance: getBankerBalance, getBankerData, loading, error };
};
