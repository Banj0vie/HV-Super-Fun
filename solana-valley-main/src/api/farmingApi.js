import httpClient from "./httpClient";

/**
 * Fetch available plots info for a given wallet.
 *
 * @param {string} wallet
 * @returns {Promise<{
 *   wallet: string,
 *   level: number,
 *   maxPlots: number,
 *   activePlots: number,
 *   availablePlots: number
 * }>}
 */
export const getAvailablePlots = async wallet => {
  const response = await httpClient.get(`/read/farming/available-plots/${wallet}`);
  return response.data;
};

/**
 * Plant seeds on specific plots for a wallet.
 *
 * @param {{ wallet: string, plots: { plotNumber: number, itemId: number }[] }} payload
 * @returns {Promise<{ ok: boolean }>}
 */
export const plantCrops = async payload => {
  const response = await httpClient.post("/farming/plant", payload);
  return response.data;
};

/**
 * Fetch farming state (planted crops) for a wallet.
 *
 * @param {string} wallet
 * @returns {Promise<Array<{
 *   id: number,
 *   userId: string,
 *   plotNumber: number,
 *   itemId: number,
 *   endTime: number,
 *   prodMultiplier: number,
 *   tokenMultiplier: number,
 *   growthElixir: number
 * }>>}
 */
export const getFarmingState = async wallet => {
  const response = await httpClient.get(`/read/farming/state/${wallet}`);
  return response.data || [];
};

/**
 * Harvest crops on specific plots for a wallet.
 * When `pendingConfirmation` is true, sign and submit `signedTransactionBase64`, then call {@link confirmHarvestPlots}.
 *
 * @param {{ wallet: string, plotIds: number[] }} payload
 * @returns {Promise<{
 *   ok: boolean,
 *   pendingConfirmation?: boolean,
 *   harvested?: Array<{ plotId: number, locked: string, unlocked: string, produceItemId?: number }>,
 *   totalLocked?: string,
 *   totalUnlocked?: string,
 *   signedTransactionBase64?: string,
 *   error?: string
 * }>}
 */
export const harvestPlots = async payload => {
  const response = await httpClient.post("/farming/harvest", payload);
  return response.data;
};

/**
 * Finalize harvest after the user signs the payout transaction from {@link harvestPlots}.
 *
 * @param {{ wallet: string, plotIds: number[], txSignature: string }} payload
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export const confirmHarvestPlots = async payload => {
  const response = await httpClient.post("/farming/harvest/confirm", payload);
  return response.data;
};

export const farmingApi = {
  getAvailablePlots,
  plantCrops,
  getFarmingState,
  harvestPlots,
  confirmHarvestPlots,
};

export default farmingApi;
