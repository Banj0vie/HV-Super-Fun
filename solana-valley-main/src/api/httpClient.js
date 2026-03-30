import axios from "axios";

import { BACKEND_URL } from "../solana/constants/programId";

const TOKEN_STORAGE_PREFIX = "sv:authToken:";

let currentWallet = null;
let inMemoryTokens = {};

/**
 * Get the storage key for a specific wallet.
 * @param {string|null} wallet
 * @returns {string}
 */
const getStorageKey = wallet => `${TOKEN_STORAGE_PREFIX}${wallet || "default"}`;

/**
 * Set the current wallet address for token management.
 * This should be called when the user connects/switches wallets.
 * @param {string|null} wallet
 */
export const setCurrentWallet = wallet => {
  currentWallet = wallet || null;
};

/**
 * Get the current wallet address.
 * @returns {string|null}
 */
export const getCurrentWallet = () => currentWallet;

/**
 * Get the JWT token for a specific wallet (or current wallet if not specified).
 * @param {string|null} wallet - Optional wallet address, defaults to current wallet
 * @returns {string|null}
 */
export const getToken = wallet => {
  const targetWallet = wallet || currentWallet;
  if (!targetWallet) return null;

  if (inMemoryTokens[targetWallet]) return inMemoryTokens[targetWallet];

  try {
    const stored = window.localStorage.getItem(getStorageKey(targetWallet));
    if (stored) {
      inMemoryTokens[targetWallet] = stored;
    }
    return stored || null;
  } catch {
    return inMemoryTokens[targetWallet] || null;
  }
};

/**
 * Persist the JWT token for a specific wallet (or current wallet if not specified).
 * @param {string|null} token
 * @param {string|null} wallet - Optional wallet address, defaults to current wallet
 */
export const setToken = (token, wallet) => {
  const targetWallet = wallet || currentWallet;
  if (!targetWallet) return;

  if (token) {
    inMemoryTokens[targetWallet] = token;
  } else {
    delete inMemoryTokens[targetWallet];
  }

  try {
    const key = getStorageKey(targetWallet);
    if (token) {
      window.localStorage.setItem(key, token);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage errors (e.g. disabled cookies)
  }
};

/**
 * Clear the JWT token for a specific wallet (or current wallet if not specified).
 * @param {string|null} wallet - Optional wallet address, defaults to current wallet
 */
export const clearToken = wallet => {
  setToken(null, wallet);
};

const httpClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default httpClient;
