import httpClient from "./httpClient";

/**
 * Unlock weekly wage tokens.
 *
 * @param {{ wallet: string }} payload
 * @returns {Promise<{ ok: boolean, unlockedAmount: string, remainingLocked: string }>}
 */
export const unlockWeeklyWage = async payload => {
  const response = await httpClient.post("/sage/unlock-weekly-wage", payload);
  return response.data;
};

/**
 * Finalize weekly wage unlock after the user confirms the payout tx.
 *
 * @param {{ wallet: string, txSignature: string }} payload
 * @returns {Promise<{ ok: boolean, unlockedAmount: string, remainingLocked: string }>}
 */
export const confirmUnlockWeeklyWage = async payload => {
  const response = await httpClient.post("/sage/unlock-weekly-wage/confirm", payload);
  return response.data;
};

/**
 * Unlock weekly harvest tokens.
 *
 * @param {{ wallet: string }} payload
 * @returns {Promise<{ ok: boolean, unlockedAmount: string, remainingLocked: string }>}
 */
export const unlockWeeklyHarvest = async payload => {
  const response = await httpClient.post("/sage/unlock-weekly-harvest", payload);
  return response.data;
};

/**
 * Finalize weekly harvest unlock after the user confirms the payout tx.
 *
 * @param {{ wallet: string, txSignature: string }} payload
 * @returns {Promise<{ ok: boolean, unlockedAmount: string, remainingLocked: string }>}
 */
export const confirmUnlockWeeklyHarvest = async payload => {
  const response = await httpClient.post("/sage/unlock-weekly-harvest/confirm", payload);
  return response.data;
};

export const sageApi = {
  unlockWeeklyWage,
  confirmUnlockWeeklyWage,
  unlockWeeklyHarvest,
  confirmUnlockWeeklyHarvest,
};

export default sageApi;
