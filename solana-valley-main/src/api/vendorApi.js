import httpClient from "./httpClient";

/**
 * Create a seed pack buy request after payment.
 *
 * @param {{ wallet: string, tier: number, count: number, txSignature: string }} payload
 * @returns {Promise<Object>}
 */
export const buySeedPack = async payload => {
  const response = await httpClient.post("/seed-packs/buy", payload);
  return response.data;
};

/**
 * Fetch latest pending seed pack request for a wallet.
 * Returns null if there is no pending request (404).
 *
 * @param {string} wallet
 * @returns {Promise<Object|null>}
 */
export const getPendingRequest = async wallet => {
  try {
    const response = await httpClient.get(`/read/seed/getPendingRequest/${wallet}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
};

/**
 * Reveal a pending seed pack request and receive items.
 *
 * @param {{ wallet: string, requestId: number }} payload
 * @returns {Promise<{ items: { itemId: number, amount: number }[] }>}
 */
export const revealSeedPack = async payload => {
  const response = await httpClient.post("/seed-packs/reveal", payload);
  return response.data;
};

export const vendorApi = {
  buySeedPack,
  getPendingRequest,
  revealSeedPack,
};

export default vendorApi;
