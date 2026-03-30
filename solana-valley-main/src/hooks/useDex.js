import { BN } from "@coral-xyz/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { GAME_TOKEN_MINT, SOLANA_VALLEY_DEX_PROGRAM_ID } from "../solana/constants/programId";
import { getRaydiumSwapOutputAmount, swapRaydiumBaseIn } from "../solana/raydium/swap";
import {
  buyTokensFailure,
  buyTokensStart,
  buyTokensSuccess,
  selectBalanceError,
  selectBalanceLoading,
  selectGameTokenBalance,
  selectSolBalance,
  sellTokensFailure,
  sellTokensStart,
  sellTokensSuccess,
  updateGameTokenBalance,
  updateSolBalance,
} from "../solana/store/slices/balanceSlice";
import { selectSettings } from "../solana/store/slices/uiSlice";
import { getBalance } from "../utils/requestQueue";
import { defaultSettings } from "../utils/settings";
import { sendTransactionForPhantom } from "../utils/transactionHelper";
import { useBalanceRefresh } from "./useBalanceRefresh";
import { useProgram } from "./useProgram";

export const useDex = () => {
  const { publicKey, connection, sendTransaction, program } = useProgram(true);
  const dispatch = useDispatch();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();

  // Redux state
  const loading = useSelector(selectBalanceLoading);
  const error = useSelector(selectBalanceError);
  const solBalance = useSelector(selectSolBalance);
  const gameTokenBalance = useSelector(selectGameTokenBalance);
  const settings = useSelector(selectSettings) || defaultSettings;

  // Calculate PDAs
  const getDexPoolPda = useCallback(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dex_pool"), GAME_TOKEN_MINT.toBuffer()],
      SOLANA_VALLEY_DEX_PROGRAM_ID
    );
    return pda;
  }, []);

  const getSolVaultPda = useCallback(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault"), GAME_TOKEN_MINT.toBuffer()],
      SOLANA_VALLEY_DEX_PROGRAM_ID
    );
    return pda;
  }, []);

  // Fetch user balances
  const fetchBalances = useCallback(async () => {
    if (!publicKey) return;

    try {
      if (!connection) return;

      // Get SOL balance
      const solBal = await getBalance(connection, publicKey);
      const solBalanceFormatted = (solBal / LAMPORTS_PER_SOL).toFixed(6);
      console.log("solBalanceFormatted", solBalanceFormatted);
      // Update Redux state (SOL from RPC, gameToken from Redux slice)
      dispatch(updateSolBalance(solBalanceFormatted));
      dispatch(updateGameTokenBalance(gameTokenBalance));
    } catch (err) {
      console.error("Failed to fetch balances:", err);
    }
  }, [publicKey, connection, dispatch, gameTokenBalance]);

  // Buy tokens with SOL
  const buyTokens = useCallback(
    async solAmount => {
      if (!publicKey) {
        dispatch(buyTokensFailure("Wallet not connected"));
        return false;
      }
      // Check if already loading
      if (loading) {
        dispatch(buyTokensFailure("Transaction already in progress"));
        return false;
      }

      dispatch(buyTokensStart());
      if (SOLANA_VALLEY_DEX_PROGRAM_ID) {
        try {
          const solAmountLamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
          if (solAmountLamports <= 0) {
            throw new Error("Invalid SOL amount");
          }
          const solBalanceNum = parseFloat(solBalance || 0);
          if (solBalanceNum < solAmount) {
            dispatch(
              buyTokensFailure(`Insufficient SOL balance: Need ${solAmount} SOL but you have ${solBalanceNum} SOL`)
            );
            return false;
          }

          const dexPoolPda = getDexPoolPda();
          const solVaultPda = getSolVaultPda();
          const userGameTokenAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);

          // Get vault ATA (authority = dex_pool PDA)
          const vaultAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, dexPoolPda, true);

          const method = program.methods.buyTokens(new BN(solAmountLamports)).accounts({
            user: publicKey,
            dexPool: dexPoolPda,
            vault: vaultAta,
            userAta: userGameTokenAta,
            solVault: solVaultPda,
            tokenMint: GAME_TOKEN_MINT,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          });

          const tx = await sendTransactionForPhantom(method, connection, sendTransaction, publicKey);

          dispatch(buyTokensSuccess());

          // Refresh balances after successful transaction
          await fetchBalances();
          await refreshBalancesAfterTransaction(1000);

          return { txHash: tx, success: true };
        } catch (err) {
          console.error("Buy tokens error:", err);

          // Handle specific transaction errors
          let errorMessage = err.message;
          if (
            err.message.includes("already been processed") ||
            err.message.includes("Transaction simulation failed: This transaction has already been processed")
          ) {
            errorMessage = "Transaction already submitted. Please wait and try again.";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for this transaction.";
          } else if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was cancelled by user.";
          } else if (err.message.includes("encoding overruns Uint8Array")) {
            errorMessage = "Transaction too large. Please try with a smaller amount.";
          }

          dispatch(buyTokensFailure(errorMessage));
          return false;
        }
      } else {
        try {
          const solBalanceNum = parseFloat(solBalance || 0);
          if (solBalanceNum < solAmount) {
            dispatch(
              buyTokensFailure(`Insufficient SOL balance: Need ${solAmount} SOL but you have ${solBalanceNum} SOL`)
            );
            return false;
          }
          const tx = await swapRaydiumBaseIn(
            solAmount,
            true,
            connection,
            publicKey,
            sendTransaction,
            settings.dexSlippage
          );
          dispatch(buyTokensSuccess());

          // Refresh balances after successful transaction
          await fetchBalances();
          await refreshBalancesAfterTransaction(1000);

          return { txHash: tx, success: true };
        } catch (err) {
          console.error("Buy tokens error:", err);

          // Handle specific transaction errors
          let errorMessage = err.message;
          if (
            err.message.includes("already been processed") ||
            err.message.includes("Transaction simulation failed: This transaction has already been processed")
          ) {
            errorMessage = "Transaction already submitted. Please wait and try again.";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for this transaction.";
          } else if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was cancelled by user.";
          } else if (err.message.includes("encoding overruns Uint8Array")) {
            errorMessage = "Transaction too large. Please try with a smaller amount.";
          }

          dispatch(buyTokensFailure(errorMessage));
          return false;
        }
      }
    },
    [
      publicKey,
      dispatch,
      loading,
      program,
      connection,
      solBalance,
      settings.dexSlippage,
      getDexPoolPda,
      getSolVaultPda,
      fetchBalances,
      sendTransaction,
      refreshBalancesAfterTransaction,
    ]
  );

  // Sell tokens for SOL
  const sellTokens = useCallback(
    async tokenAmount => {
      if (!publicKey) {
        dispatch(sellTokensFailure("Wallet not connected"));
        return false;
      }

      // Check if already loading
      if (loading) {
        dispatch(sellTokensFailure("Transaction already in progress"));
        return false;
      }

      dispatch(sellTokensStart());
      if (SOLANA_VALLEY_DEX_PROGRAM_ID) {
        try {
          const tokenAmountBaseUnits = Math.floor(tokenAmount * 1e9); // Assuming 6 decimals
          if (tokenAmountBaseUnits <= 0) {
            throw new Error("Invalid token amount");
          }
          const gameTokenBalanceNum = parseFloat(gameTokenBalance || 0);
          if (gameTokenBalanceNum < tokenAmount) {
            dispatch(
              sellTokensFailure(`Insufficient token balance: Need ${tokenAmount} but you have ${gameTokenBalanceNum}`)
            );
            return false;
          }

          const dexPoolPda = getDexPoolPda();
          const solVaultPda = getSolVaultPda();
          const userGameTokenAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, publicKey, false);

          // Get vault ATA (authority = dex_pool PDA)
          const vaultAta = await getAssociatedTokenAddress(GAME_TOKEN_MINT, dexPoolPda, true);

          const method = program.methods.sellTokens(new BN(tokenAmountBaseUnits)).accounts({
            user: publicKey,
            dexPool: dexPoolPda,
            vault: vaultAta,
            userAta: userGameTokenAta,
            solVault: solVaultPda,
            tokenMint: GAME_TOKEN_MINT,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          });

          const tx = await sendTransactionForPhantom(method, connection, sendTransaction, publicKey);

          dispatch(sellTokensSuccess());

          // Refresh balances after successful transaction
          await fetchBalances();
          await refreshBalancesAfterTransaction(1000);

          return { txHash: tx, success: true };
        } catch (err) {
          console.error("Sell tokens error:", err);

          // Handle specific transaction errors
          let errorMessage = err.message;
          if (
            err.message.includes("already been processed") ||
            err.message.includes("Transaction simulation failed: This transaction has already been processed")
          ) {
            errorMessage = "Transaction already submitted. Please wait and try again.";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for this transaction.";
          } else if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was cancelled by user.";
          } else if (err.message.includes("encoding overruns Uint8Array")) {
            errorMessage = "Transaction too large. Please try with a smaller amount.";
          }

          dispatch(sellTokensFailure(errorMessage));
          return false;
        }
      } else {
        try {
          const gameTokenBalanceNum = parseFloat(gameTokenBalance || 0);
          if (gameTokenBalanceNum < tokenAmount) {
            dispatch(
              sellTokensFailure(`Insufficient token balance: Need ${tokenAmount} but you have ${gameTokenBalanceNum}`)
            );
            return false;
          }
          const tx = await swapRaydiumBaseIn(
            tokenAmount,
            false,
            connection,
            publicKey,
            sendTransaction,
            settings.dexSlippage
          );
          dispatch(sellTokensSuccess());

          // Refresh balances after successful transaction
          await fetchBalances();
          await refreshBalancesAfterTransaction(1000);

          return { txHash: tx, success: true };
        } catch (err) {
          console.error("Sell tokens error:", err);

          // Handle specific transaction errors
          let errorMessage = err.message;
          if (
            err.message.includes("already been processed") ||
            err.message.includes("Transaction simulation failed: This transaction has already been processed")
          ) {
            errorMessage = "Transaction already submitted. Please wait and try again.";
          } else if (err.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for this transaction.";
          } else if (err.message.includes("User rejected")) {
            errorMessage = "Transaction was cancelled by user.";
          } else if (err.message.includes("encoding overruns Uint8Array")) {
            errorMessage = "Transaction too large. Please try with a smaller amount.";
          }

          dispatch(sellTokensFailure(errorMessage));
          return false;
        }
      }
    },
    [
      publicKey,
      dispatch,
      loading,
      program,
      connection,
      gameTokenBalance,
      settings.dexSlippage,
      getDexPoolPda,
      getSolVaultPda,
      fetchBalances,
      sendTransaction,
      refreshBalancesAfterTransaction,
    ]
  );

  // Fetch current pool state
  const fetchDexPool = useCallback(async () => {
    if (!publicKey) return null;

    try {
      const dexPoolPda = getDexPoolPda();
      const poolData = await program.account.dexPool.fetch(dexPoolPda);

      return {
        virtualSolReserves: poolData.virtualSolReserves.toString(),
        virtualTokenReserves: poolData.virtualTokenReserves.toString(),
        realSolReserves: poolData.realSolReserves.toString(),
        realTokenReserves: poolData.realTokenReserves.toString(),
        totalTokensSold: poolData.totalTokensSold.toString(),
        tokenMint: poolData.tokenMint.toString(),
        authority: poolData.authority.toString(),
      };
    } catch (err) {
      console.error("Failed to fetch DEX pool:", err);
      return null;
    }
  }, [publicKey, program, getDexPoolPda]);

  // Calculate tokens out for given SOL amount (preview)
  const getTokensOut = useCallback(
    async solAmount => {
      if (SOLANA_VALLEY_DEX_PROGRAM_ID) {
        const poolData = await fetchDexPool();
        if (!poolData) return "0";
        try {
          const solIn = Math.floor(solAmount * LAMPORTS_PER_SOL);
          const s0 = BigInt(poolData.virtualSolReserves) + BigInt(poolData.realSolReserves);
          const t0 = BigInt(poolData.virtualTokenReserves) + BigInt(poolData.realTokenReserves);

          if (s0 === 0n || t0 === 0n) return "0";

          // token_out = sol_in * t0 / s0
          const tokensOut = (BigInt(solIn) * t0) / s0;
          return (Number(tokensOut) / 1e9).toFixed(6); // Convert back to UI units
        } catch (err) {
          console.error("Failed to calculate tokens out:", err);
          return "0";
        }
      } else {
        return await getRaydiumSwapOutputAmount(solAmount, true);
      }
    },
    [fetchDexPool]
  );

  // Calculate SOL out for given token amount (preview)
  const getSolOut = useCallback(
    async tokenAmount => {
      if (SOLANA_VALLEY_DEX_PROGRAM_ID) {
        const poolData = await fetchDexPool();
        if (!poolData) return "0";

        try {
          const tokenIn = Math.floor(tokenAmount * 1e9);
          const s0 = BigInt(poolData.virtualSolReserves) + BigInt(poolData.realSolReserves);
          const t0 = BigInt(poolData.virtualTokenReserves) + BigInt(poolData.realTokenReserves);

          if (s0 === 0n || t0 === 0n) return "0";

          // sol_out = token_in * s0 / t0
          const solOut = (BigInt(tokenIn) * s0) / t0;
          return (Number(solOut) / LAMPORTS_PER_SOL).toFixed(6);
        } catch (err) {
          console.error("Failed to calculate SOL out:", err);
          return "0";
        }
      } else {
        return await getRaydiumSwapOutputAmount(tokenAmount, false);
      }
    },
    [fetchDexPool]
  );

  return {
    buyTokens,
    sellTokens,
    fetchDexPool,
    fetchBalances,
    getTokensOut,
    getSolOut,
    loading,
    error,
  };
};
