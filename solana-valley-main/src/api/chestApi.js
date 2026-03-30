import httpClient from "./httpClient";

/**
 * Claim the daily chest (backend enforces cooldown + tier).
 *
 * @param {string} wallet
 * @returns {Promise<{ok: boolean, chestItemId: number}>}
 */
export const claimDailyChest = async wallet => {
  const response = await httpClient.post("/chests/claim", { wallet });
  return response.data;
};

/**
 * Open a chest item from inventory.
 *
 * @param {{ wallet: string, chestItemId: number }} payload
 * @returns {Promise<{ok: boolean, rewardItemId: number}>}
 */
export const openChest = async payload => {
  const response = await httpClient.post("/chests/open", payload);
  return response.data;
};

export const chestApi = {
  claimDailyChest,
  openChest,
};

export default chestApi;
