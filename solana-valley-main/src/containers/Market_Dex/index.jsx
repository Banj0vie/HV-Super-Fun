import "./style.css";

import React, { useEffect, useRef, useState } from "react";

import CardView from "../../components/boxes/CardView";
import LabelValueBox from "../../components/boxes/LabelValueBox";
import BaseButton from "../../components/buttons/BaseButton";
import ExchangeButton from "../../components/buttons/ExchangeButton";
import DividerLink from "../../components/links/DividerLink";
import { useNotification } from "../../contexts/NotificationContext";
import { useBalanceRefresh } from "../../hooks/useBalanceRefresh";
import { useDex } from "../../hooks/useDex";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import { GAME_TOKEN_MINT, TOKEN_DECIMALS } from "../../solana/constants/programId";
import { getRaydiumSwapOutputAmount, swapRaydiumBaseIn } from "../../solana/raydium/swap";
import { useAppSelector } from "../../solana/store";
import {
  selectDexError,
  selectDexLoading,
  selectGameTokenBalance,
  selectSolBalance,
} from "../../solana/store/slices/balanceSlice";
import { selectSettings } from "../../solana/store/slices/uiSlice";
import { clampVolume, generateId } from "../../utils/basic";
import { isTransactionRejection } from "../../utils/errorUtils";
import { defaultSettings } from "../../utils/settings";
import BaseDialog from "../_BaseDialog";
import TokenInputRow from "./TokenInputRow";
const DexDialog = ({ onClose, label = "DEX", header = "" }) => {
  const { isConnected, connection, publicKey, sendTransaction } = useSolanaWallet();
  const { getTokensOut, getSolOut, error } = useDex();
  const { refreshBalancesAfterTransaction } = useBalanceRefresh();

  // Redux state
  const solBalance = useAppSelector(selectSolBalance);
  const gameTokenBalance = useAppSelector(selectGameTokenBalance);
  const dexLoading = useAppSelector(selectDexLoading);
  const dexError = useAppSelector(selectDexError);
  const settings = useAppSelector(selectSettings) || defaultSettings;

  const [isReversed, setIsReversed] = useState(false);
  const [swapInfo, setSwapInfo] = useState([]);
  const [solAmount, setSolAmount] = useState("");
  const [gameTokenAmount, setGameTokenAmount] = useState("0");
  const [isCalculating, setIsCalculating] = useState(false);
  const { show: showNotification } = useNotification();
  const swapAudioRef = useRef(null);

  // Monitor errors and show notifications with duplicate prevention
  const lastNotificationTime = useRef(0);
  useEffect(() => {
    if (error || dexError) {
      const now = Date.now();
      // Only show notification if it's been more than 2 seconds since last notification
      if (now - lastNotificationTime.current > 2000) {
        lastNotificationTime.current = now;
        const errorMessage = error || dexError;
        if (isTransactionRejection(errorMessage)) {
          showNotification("Transaction was rejected by user.", "error");
        } else {
          showNotification(`DEX operation failed: ${errorMessage}`, "error");
        }
      }
    }
  }, [error, dexError, showNotification]);

  // Calculate amounts when either input changes
  useEffect(() => {
    const calculateAmounts = async () => {
      if (!isConnected) {
        setGameTokenAmount("0");
        setSolAmount("");
        return;
      }

      try {
        setIsCalculating(true);

        if (isReversed) {
          // Game Token → SOL: Calculate SOL amount based on Game Token input
          if (!gameTokenAmount || parseFloat(gameTokenAmount) <= 0) {
            setSolAmount("");
            return;
          }
          const solOut = await getRaydiumSwapOutputAmount(parseFloat(gameTokenAmount), false);
          setSolAmount(solOut);
        } else {
          // SOL → Game Token: Calculate Game Token amount based on SOL input
          if (!solAmount || parseFloat(solAmount) <= 0) {
            setGameTokenAmount("0");
            return;
          }
          const tokensOut = await getRaydiumSwapOutputAmount(parseFloat(solAmount), true);
          setGameTokenAmount(tokensOut);
        }
      } catch (err) {
        console.error("Failed to calculate amounts:", err);
        if (isReversed) {
          setSolAmount("");
        } else {
          setGameTokenAmount("0");
        }
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculateAmounts, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [solAmount, gameTokenAmount, isReversed, isConnected, getTokensOut, getSolOut]);

  const onSwap = async () => {
    if (!isConnected) {
      showNotification("Please connect your wallet first", "warning");
      return;
    }
    if (!swapAudioRef.current) {
      swapAudioRef.current = new Audio("/sounds/DEXSwapButtonClick.wav");
      swapAudioRef.current.preload = "auto";
    }
    const audio = swapAudioRef.current;
    const volumeSetting = parseFloat(settings?.soundVolume ?? 0) / 100;
    audio.volume = clampVolume(volumeSetting);
    audio.currentTime = 0;
    audio.play().catch(() => {});

    if (isReversed) {
      // Game Token → SOL swap
      if (!gameTokenAmount || parseFloat(gameTokenAmount) <= 0) {
        showNotification("Please enter a valid Game Token amount", "warning");
        return;
      }

      try {
        const parsed = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: GAME_TOKEN_MINT });
        const balanceLamports = (parsed.value || []).reduce((sum, acc) => {
          const raw = acc?.account?.data?.parsed?.info?.tokenAmount?.amount;
          try {
            return raw ? sum + BigInt(String(raw)) : sum;
          } catch {
            return sum;
          }
        }, 0n);
        const needLamports = BigInt(Math.floor(parseFloat(gameTokenAmount) * 10 ** TOKEN_DECIMALS));
        if (balanceLamports < needLamports) {
          const haveUi = Number(balanceLamports) / 10 ** TOKEN_DECIMALS;
          showNotification(
            `Insufficient token balance. Need ${parseFloat(gameTokenAmount)} but have ~${haveUi.toFixed(3)}.`,
            "warning"
          );
          return;
        }
      } catch (e) {
        console.error("Token balance check failed:", e);
        showNotification("Could not verify your token balance. Please try again.", "error");
        return;
      }

      try {
        const result = await swapRaydiumBaseIn(
          parseFloat(gameTokenAmount),
          false,
          connection,
          publicKey,
          sendTransaction
        );

        if (result && result.success) {
          showNotification("Swap successful! Check your SOL balance.", "success");
          setSolAmount("");
          setGameTokenAmount("0");
          // Refresh balances after successful swap
          await refreshBalancesAfterTransaction(800);
          // Close dialog after successful swap
          onClose();
        }
      } catch (err) {
        console.error("Failed to swap Game Tokens for SOL:", err);
        showNotification(`Swap failed: ${err?.message || "Unknown error"}`, "error");
      }
    } else {
      // SOL → Game Token swap
      if (!solAmount || parseFloat(solAmount) <= 0) {
        showNotification("Please enter a valid SOL amount", "warning");
        return;
      }

      if (parseFloat(solAmount) > parseFloat(solBalance || 0)) {
        showNotification(
          `Insufficient SOL balance. Need ${parseFloat(solAmount)} SOL but have ~${parseFloat(solBalance || 0).toFixed(6)} SOL.`,
          "warning"
        );
        return;
      }

      try {
        const result = await swapRaydiumBaseIn(parseFloat(solAmount), true, connection, publicKey, sendTransaction);
        if (result && result.success) {
          showNotification("Swap successful! Check your Game Token balance.", "success");
          setSolAmount("");
          setGameTokenAmount("0");
          // Refresh balances after successful swap
          await refreshBalancesAfterTransaction(800);
          // Close dialog after successful swap
          onClose();
        }
      } catch (err) {
        console.error("Failed to swap SOL for Game Tokens:", err);
        showNotification(`Swap failed: ${err?.message || "Unknown error"}`, "error");
      }
    }
  };

  const handleSolBalanceClick = balance => {
    setSolAmount(balance);
  };

  const handleGameTokenBalanceClick = balance => {
    setGameTokenAmount(balance);
  };

  useEffect(() => {
    setSwapInfo([
      { label: "Slippage", value: "0.5%" },
      { label: "Price Impact", value: "0.39%" },
      {
        label: "Minimum Received",
        value: isCalculating ? "Calculating..." : isReversed ? solAmount : gameTokenAmount,
      },
    ]);
  }, [gameTokenAmount, solAmount, isCalculating, isReversed]);

  return (
    <BaseDialog className="dex-wrapper" title={label} onClose={onClose} header={header}>
      <div className="dex-dialog">
        {/* Notifications rendered at app level */}
        <div className="swap-wrapper">
          <TokenInputRow
            token={isReversed ? "HONEY" : "SOL"}
            balance={isReversed ? (isCalculating ? "Calculating..." : gameTokenBalance) : solBalance}
            value={isReversed ? gameTokenAmount : solAmount}
            onChange={isReversed ? setGameTokenAmount : setSolAmount}
            onBalanceClick={isReversed ? handleGameTokenBalanceClick : handleSolBalanceClick}
            disabled={dexLoading}
            readOnly={!isReversed}
          />
          <ExchangeButton
            onclick={() => {
              setIsReversed(!isReversed);
            }}
          ></ExchangeButton>
          <TokenInputRow
            token={isReversed ? "SOL" : "HONEY"}
            balance={isReversed ? solBalance : isCalculating ? "Calculating..." : gameTokenBalance}
            value={isReversed ? solAmount : gameTokenAmount}
            onBalanceClick={isReversed ? handleSolBalanceClick : handleGameTokenBalanceClick}
            readOnly={isReversed}
            disabled={true}
          />
        </div>
        <BaseButton
          label={dexLoading ? "Swapping..." : "Swap"}
          onClick={onSwap}
          disabled={
            dexLoading ||
            !isConnected ||
            (isReversed
              ? !gameTokenAmount || parseFloat(gameTokenAmount) <= 0
              : !solAmount || parseFloat(solAmount) <= 0)
          }
          large={true}
        ></BaseButton>
        <CardView>
          {swapInfo.map(item => (
            <LabelValueBox key={generateId()} label={item.label} value={item.value}></LabelValueBox>
          ))}
        </CardView>
        <DividerLink label="USING INSERTPARTNER HERE DEX" link="https://solana.com/"></DividerLink>
      </div>
    </BaseDialog>
  );
};

export default DexDialog;
