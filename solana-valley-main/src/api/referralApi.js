import httpClient from "./httpClient";

/**
 * Register a referral code for the given wallet (protected endpoint).
 *
 * @param {{ wallet: string, code: string }} payload
 * @returns {Promise<{ok: boolean, code: string}>}
 */
export const addReferral = async payload => {
  const response = await httpClient.post("/profile/addReferral", payload);
  return response.data;
};

export const referralApi = {
  addReferral,
};

export default referralApi;
