import httpClient from "./httpClient";

/**
 * Fetch inventory items for a wallet.
 *
 * @param {string} wallet
 * @returns {Promise<Array<{ id: number, userId: string, itemId: number, amount: number }>>}
 */
export const getInventory = async wallet => {
  const response = await httpClient.get(`/read/inventory/${wallet}`);
  return response.data || [];
};

export const inventoryApi = {
  getInventory,
};

export default inventoryApi;
