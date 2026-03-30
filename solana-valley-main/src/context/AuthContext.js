import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import authApi from "../api/authApi";
import {
  clearToken as clearStoredToken,
  getToken,
  setCurrentWallet,
  setToken as setStoredToken,
} from "../api/httpClient";
import profileApi from "../api/profileApi";
import { useSolanaWallet } from "../hooks/useSolanaWallet";

const AuthContext = createContext(null);

/**
 * Encode a Uint8Array or Buffer to base64 in both browser and Node-like environments.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
const bytesToBase64 = bytes => {
  if (!bytes) return "";

  // Prefer Buffer when available (Node, some bundlers)
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  // Fallback for browsers without Buffer
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa is available in browsers
  // eslint-disable-next-line no-undef
  return btoa(binary);
};

export const AuthProvider = ({ children }) => {
  const { account, isWalletReady, signMessage } = useSolanaWallet();

  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const walletAddress = account || null;

  const syncToken = useCallback(
    (nextToken, wallet) => {
      setToken(nextToken || null);
      const targetWallet = wallet || walletAddress;
      if (nextToken) {
        setStoredToken(nextToken, targetWallet);
      } else if (targetWallet) {
        clearStoredToken(targetWallet);
      }
    },
    [walletAddress]
  );

  /**
   * Perform the nonce + sign + login flow for the current wallet.
   * @param {string} wallet
   * @returns {Promise<string>} JWT token
   */
  const loginWithWallet = useCallback(
    async wallet => {
      if (!wallet) {
        throw new Error("Wallet address is required");
      }
      if (!signMessage) {
        throw new Error("Wallet does not support message signing");
      }

      const { nonce } = await authApi.requestNonce(wallet);
      const message = `Solana Valley login\nWallet: ${wallet}\nNonce: ${nonce}`;

      const signatureBytes = await signMessage(message);
      const signatureBase64 = bytesToBase64(signatureBytes);

      const loginData = await authApi.login({
        wallet,
        signature: signatureBase64,
        message,
      });
      const { token: tokenA, jwt: tokenB } = loginData || {};
      const jwt = tokenA || tokenB;

      if (!jwt) {
        throw new Error("Login did not return a token");
      }

      syncToken(jwt, wallet);

      // If backend login already includes profile-ish data (e.g. name),
      // store it so the UI can skip the create-profile step immediately.
      const loginProfile =
        loginData?.profile ||
        (loginData?.name || loginData?.userName || loginData?.username || loginData?.id
          ? {
              id: loginData?.id ?? wallet,
              name: loginData?.name ?? loginData?.userName ?? loginData?.username ?? "",
            }
          : null);
      if (loginProfile) {
        setProfile(loginProfile);
      }

      return jwt;
    },
    [signMessage, syncToken]
  );

  /**
   * Load profile for the given wallet from the backend.
   * Returns null if not found (404).
   * @param {string} wallet
   * @returns {Promise<Object|null>}
   */
  const loadProfile = useCallback(async wallet => {
    if (!wallet) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await profileApi.getProfile(wallet);
      setProfile(data);
      return data;
    } catch (err) {
      // Keep 404 behaviour inside profileApi; only surface real errors
      const message = err?.message || "Failed to load profile";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new profile via the backend for the currently connected wallet.
   * @param {{ userName: string, referralCode?: string }} params
   * @returns {Promise<Object>}
   */
  const createProfile = useCallback(
    async ({ userName, referralCode }) => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      if (!userName || !userName.trim()) {
        throw new Error("Username is required");
      }

      setLoading(true);
      setError(null);
      try {
        // Ensure we have a valid JWT before calling protected endpoints.
        // This will trigger a wallet signature if no token is present.
        if (!getToken(walletAddress)) {
          await loginWithWallet(walletAddress);
        }

        const payload = {
          userName: userName.trim(),
          wallet: walletAddress,
        };
        if (referralCode && referralCode.trim()) {
          payload.referralCode = referralCode.trim();
        }
        const created = await profileApi.createProfile(payload);
        setProfile(created);
        return created;
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Failed to create profile";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, loginWithWallet]
  );

  /**
   * Clear auth state (e.g. on disconnect).
   */
  const resetAuth = useCallback(() => {
    // Important: do not clear persisted wallet token on disconnect.
    // We only reset in-memory state so reconnecting the same wallet can
    // reuse existing JWT/profile without forcing sign/create again.
    setToken(null);
    setProfile(null);
    setError(null);
  }, []);

  // When wallet connects, attempt to reuse an existing token and load profile.
  // Do NOT trigger signMessage automatically here; that must come from a user gesture.
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      // Update the current wallet for httpClient token management
      setCurrentWallet(walletAddress);

      if (!isWalletReady || !walletAddress) {
        if (!cancelled) {
          resetAuth();
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // If there's an existing token for this wallet, reuse it and try to load the profile.
        const existingToken = getToken(walletAddress);
        if (existingToken) {
          setToken(existingToken);

          // Load profile; if it doesn't exist (404), profileApi returns null.
          const data = await profileApi.getProfile(walletAddress);
          if (!cancelled) {
            setProfile(data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || "Failed to initialize auth";
          setError(message);
          // Keep going; UI can decide how to handle missing profile/token.
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [isWalletReady, walletAddress, resetAuth]);

  const value = useMemo(
    () => ({
      walletAddress,
      token,
      profile,
      loading,
      error,
      loginWithWallet,
      loadProfile,
      createProfile,
      resetAuth,
      hasProfile: !!profile,
    }),
    [walletAddress, token, profile, loading, error, loginWithWallet, loadProfile, createProfile, resetAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
