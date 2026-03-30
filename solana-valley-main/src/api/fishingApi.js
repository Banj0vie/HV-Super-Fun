import httpClient from "./httpClient";

/**
 * Craft bait (BAIT_1/BAIT_2/BAIT_3).
 *
 * Backend schema:
 * { wallet, baitId, amount, itemIds?, amounts? }
 *
 * @param {{ wallet: string, baitId: number, amount: number, itemIds?: number[], amounts?: number[] }} payload
 * @returns {Promise<{ ok: boolean }>}
 */
export const craftBait = async payload => {
  const response = await httpClient.post("/fishing/craft-bait", payload);
  return response.data;
};

/**
 * Start fishing by burning bait and creating a request.
 *
 * @param {{ wallet: string, baitId: number, amount: number }} payload
 * @returns {Promise<{ ok: boolean, requestId: number }>}
 */
export const fish = async payload => {
  const response = await httpClient.post("/fishing/fish", payload);
  return response.data;
};

/**
 * Reveal a fishing request and mint rewards.
 *
 * @param {{ wallet: string, requestId: number }} payload
 * @returns {Promise<{ ok: boolean, items: Array<{ itemId: number, amount: number }> }>}
 */
export const revealFishing = async payload => {
  const response = await httpClient.post("/fishing/reveal_fishing", payload);
  return response.data;
};

/**
 * Fetch latest pending fishing request for a wallet.
 * Returns null if there is no pending request (404).
 *
 * @param {string} wallet
 * @returns {Promise<Object|null>}
 */
export const getPendingRequest = async wallet => {
  try {
    const response = await httpClient.get(`/read/fishing/getPendingRequest/${wallet}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
};

export const fishingApi = {
  craftBait,
  fish,
  revealFishing,
  getPendingRequest,
};

export default fishingApi;
