import httpClient from "./httpClient";

/**
 * Craft a potion.
 *
 * @param {{ wallet: string, potionId: number, amount: number }} payload
 * @returns {Promise<{ ok: boolean, potionId: number, crafted: number }>}
 */
export const craftPotion = async payload => {
  const response = await httpClient.post("/potions/craft", payload);
  return response.data;
};

/**
 * Apply growth elixir to a crop plot.
 *
 * @param {{ wallet: string, plotNumber: number }} payload
 * @returns {Promise<{ ok: boolean, newEndTime: number }>}
 */
export const applyGrowthElixir = async payload => {
  const response = await httpClient.post("/potions/apply-growth-elixir", payload);
  return response.data;
};

/**
 * Apply pesticide to a crop plot.
 *
 * @param {{ wallet: string, plotNumber: number }} payload
 * @returns {Promise<{ ok: boolean, newProdMultiplier: number }>}
 */
export const applyPesticide = async payload => {
  const response = await httpClient.post("/potions/apply-pesticide", payload);
  return response.data;
};

/**
 * Apply fertilizer to a crop plot.
 *
 * @param {{ wallet: string, plotNumber: number }} payload
 * @returns {Promise<{ ok: boolean, newTokenMultiplier: number }>}
 */
export const applyFertilizer = async payload => {
  const response = await httpClient.post("/potions/apply-fertilizer", payload);
  return response.data;
};

export const potionApi = {
  craftPotion,
  applyGrowthElixir,
  applyPesticide,
  applyFertilizer,
};

export default potionApi;
