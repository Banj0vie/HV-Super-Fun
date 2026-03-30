import httpClient from "./httpClient";

/**
 * Stake tokens in the banker pool (after token payment).
 *
 * @param {{ wallet: string, txSignature: string, amount: string }} payload
 * @returns {Promise<{ ok: boolean, shares: string, newXtokenShare: string }>}
 */
export const stake = async payload => {
  const response = await httpClient.post("/banker/stake", payload);
  return response.data;
};

/**
 * Start unstake flow. If `pendingConfirmation` is true, frontend must sign
 * `signedTransactionBase64` then call {@link confirmUnstake}.
 *
 * @param {{ wallet: string, shares: string }} payload
 * @returns {Promise<{
 *   ok: boolean,
 *   pendingConfirmation?: boolean,
 *   amount: string,
 *   shares?: string,
 *   signedTransactionBase64?: string
 * }>}
 */
export const unstake = async payload => {
  const response = await httpClient.post("/banker/unstake", payload);
  return response.data;
};

/**
 * Finalize unstake after user signs/submits payout transaction.
 *
 * @param {{ wallet: string, shares: string, txSignature: string }} payload
 * @returns {Promise<{ ok: boolean, pendingConfirmation: false, amount: string, newXtokenShare: string }>}
 */
export const confirmUnstake = async payload => {
  const response = await httpClient.post("/banker/unstake/confirm", payload);
  return response.data;
};

/**
 * Get the banker pool data.
 *
 * @returns {Promise<{ balance: string, xBalance: string }>}
 */
export const getPool = async () => {
  const response = await httpClient.get("/banker/pool");
  return response.data;
};

/**
 * Get user's shares and estimated value.
 *
 * @param {string} wallet
 * @returns {Promise<{ xtokenShare: string, estimatedValue: string }>}
 */
export const getShares = async wallet => {
  const response = await httpClient.get(`/banker/shares/${wallet}`);
  return response.data;
};

export const bankerApi = {
  stake,
  unstake,
  confirmUnstake,
  getPool,
  getShares,
};

export default bankerApi;
