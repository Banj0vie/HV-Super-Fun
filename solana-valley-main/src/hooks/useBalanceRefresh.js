import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getProfile } from "../api/profileApi";
import { GAME_TOKEN_MINT, TOKEN_DECIMALS } from "../solana/constants/programId";
import {
  completeBalanceRefresh,
  fetchBalancesSuccess,
  selectBalanceRefreshing,
  startBalanceRefresh,
} from "../solana/store/slices/balanceSlice";
import { updateLockedTokens, updateXTokenShare } from "../solana/store/slices/userSlice";
import { useSolanaWallet } from "./useSolanaWallet";

const TOKEN_SCALE = 10 ** TOKEN_DECIMALS;

export const useBalanceRefresh = () => {
  const { publicKey, connection } = useSolanaWallet();
  const dispatch = useDispatch();

  const isRefreshing = useSelector(selectBalanceRefreshing);

  const scheduledRefreshRef = useRef(false);
  const secondRefreshTimeoutRef = useRef(null);
  const lastBalanceRef = useRef(null);

  const refreshBalances = useCallback(
    async (retryCount = 0, maxRetries = 3) => {
      if (!publicKey || !connection) {
        console.warn("Cannot refresh balances: missing publicKey/connection");
        return;
      }

      // Don't start a new refresh if one is already in progress
      if (isRefreshing && retryCount === 0) return;

      try {
        if (retryCount === 0) {
          dispatch(startBalanceRefresh());
        }

        // Backend source of truth for locked/xTokenShare (bypass short TTL cache after txs)
        const profile = await getProfile(publicKey.toString(), { force: true });
        const ud = profile?.userData || profile || {};

        const lockedTokensStr = ud?.locked_tokens ?? ud?.lockedTokens ?? "0";
        const xtokenShareStr = ud?.xtoken_share ?? ud?.xtokenShare ?? "0";

        const lockedTokensUi = parseFloat(String(lockedTokensStr)) / TOKEN_SCALE;
        const xTokenShareUi = parseFloat(String(xtokenShareStr)) / TOKEN_SCALE;

        // Fresh RPC read (requestQueue caches token-account reads — stale right after transfers)
        const parsed = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: GAME_TOKEN_MINT });
        const tokenAccounts = parsed.value || [];
        const gameTokenAmountUi = tokenAccounts.reduce((sum, acc) => {
          const uiAmount = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
          return sum + Number(uiAmount || 0);
        }, 0);

        const lamports = await connection.getBalance(publicKey);
        const solUi = lamports / TOKEN_SCALE;

        dispatch(
          fetchBalancesSuccess({
            gameToken: (gameTokenAmountUi ?? 0).toString(),
            stakedBalance: (Number.isFinite(lockedTokensUi) ? lockedTokensUi : 0).toString(),
            xTokenShare: (Number.isFinite(xTokenShareUi) ? xTokenShareUi : 0).toString(),
            solBalance: (solUi ?? 0).toString(),
          })
        );

        // Keep userSlice synced (stored in base units upstream)
        dispatch(updateLockedTokens(Math.floor((Number.isFinite(lockedTokensUi) ? lockedTokensUi : 0) * TOKEN_SCALE)));
        dispatch(updateXTokenShare(Math.floor((Number.isFinite(xTokenShareUi) ? xTokenShareUi : 0) * TOKEN_SCALE)));

        dispatch(completeBalanceRefresh());

        // Cancel any scheduled follow-up refresh if values changed during the retry window
        if (retryCount === 0 && secondRefreshTimeoutRef.current) {
          const currentBalance = `${gameTokenAmountUi}-${lockedTokensUi}-${xTokenShareUi}`;
          const lastBalance = lastBalanceRef.current;

          if (lastBalance && currentBalance !== lastBalance) {
            clearTimeout(secondRefreshTimeoutRef.current);
            secondRefreshTimeoutRef.current = null;
            scheduledRefreshRef.current = false;
          }

          lastBalanceRef.current = currentBalance;
        }
      } catch (err) {
        console.error("Balance refresh failed:", err);

        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            refreshBalances(retryCount + 1, maxRetries);
          }, delay);
        } else {
          dispatch(completeBalanceRefresh());
        }
      }
    },
    [publicKey, connection, dispatch, isRefreshing]
  );

  const refreshBalancesAfterTransaction = useCallback(
    (delay = 2000) => {
      if (scheduledRefreshRef.current) return;

      scheduledRefreshRef.current = true;

      return new Promise(resolve => {
        setTimeout(async () => {
          try {
            await refreshBalances();

            // One additional refresh after 3 seconds to catch any lag
            secondRefreshTimeoutRef.current = setTimeout(async () => {
              if (scheduledRefreshRef.current) {
                await refreshBalances();
              }
              scheduledRefreshRef.current = false;
              secondRefreshTimeoutRef.current = null;
            }, 3000);

            resolve();
          } catch (error) {
            console.error("Balance refresh failed:", error);
            scheduledRefreshRef.current = false;
            resolve();
          }
        }, delay);
      });
    },
    [refreshBalances]
  );

  const testBalanceRefresh = useCallback(async () => {
    await refreshBalances();
  }, [refreshBalances]);

  if (typeof window !== "undefined") {
    window.testBalanceRefresh = testBalanceRefresh;
  }

  const cleanup = useCallback(() => {
    if (secondRefreshTimeoutRef.current) {
      clearTimeout(secondRefreshTimeoutRef.current);
      secondRefreshTimeoutRef.current = null;
    }
    scheduledRefreshRef.current = false;
  }, []);

  return {
    refreshBalances,
    refreshBalancesAfterTransaction,
    testBalanceRefresh,
    cleanup,
    isRefreshing,
  };
};
