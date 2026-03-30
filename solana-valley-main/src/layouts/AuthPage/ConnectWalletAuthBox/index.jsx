import "./style.css";

import React from "react";

import CardView from "../../../components/boxes/CardView";
import BaseButton from "../../../components/buttons/BaseButton";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import { useSolanaWallet } from "../../../hooks/useSolanaWallet";

const ConnectWalletAuthBox = () => {
  const { account, isConnected, isConnecting, error, connect } = useSolanaWallet();
  const { token, loginWithWallet, loading: authLoading } = useAuth();
  const { show } = useNotification();

  const handleClick = async () => {
    // 1) If wallet not connected yet, open the wallet modal
    if (!isConnected || !account) {
      connect();
      return;
    }

    // 2) If wallet is connected but we don't have a JWT yet, trigger Phantom sign + /auth/login
    if (!token) {
      try {
        await loginWithWallet(account);
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || "Failed to authenticate with backend";
        // eslint-disable-next-line no-console
        console.error("Failed to login with wallet:", err);
        show(message, "error");
      }
      return;
    }

    // 3) Wallet connected and JWT already present.
    // Nothing more to do here; App routing/AuthContext will move user forward based on profile state.
  };

  const buttonLabel =
    isConnecting || authLoading
      ? "Connecting..."
      : !isConnected || !account
        ? "Connect Wallet"
        : !token
          ? "Sign Message"
          : "Continue";

  return (
    <div>
      <CardView className="auth-welcome-card">
        <div>Welcome to Solana Valley!</div>
        <p className="highlight text-center">
          A farming adventuring
          <br /> game on Solana.
        </p>
        {error && <div style={{ color: "red", margin: "10px 0", fontSize: "14px" }}>{error}</div>}
      </CardView>
      <BaseButton
        label={buttonLabel}
        className="h-4rem auth-wallet-connect-button"
        onClick={handleClick}
        disabled={isConnecting || authLoading}
      ></BaseButton>
    </div>
  );
};

export default ConnectWalletAuthBox;
