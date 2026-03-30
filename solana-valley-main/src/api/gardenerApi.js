import httpClient from "./httpClient";

/**
 * Level up the user's valley after payment.
 *
 * @param {{ wallet: string, newLevel: number, txSignature: string }} payload
 * @returns {Promise<{ok: boolean}>}
 */
export const levelUp = async payload => {
  const response = await httpClient.post("/progress/level-up", payload);
  return response.data;
};

export const gardenerApi = {
  levelUp,
};

export default gardenerApi;
