import httpClient, { setToken } from "./httpClient";

/**
 * Request a nonce for a given wallet address.
 * @param {string} wallet
 * @returns {Promise<{ nonce: string }>}
 */
export const requestNonce = async wallet => {
  const response = await httpClient.post("/auth/nonce", { wallet });
  return response.data;
};

/**
 * Log in with a signed message and store the returned JWT.
 * @param {{ wallet: string, signature: string, message: string }} payload
 * @returns {Promise<{ token: string }>}
 */
export const login = async payload => {
  const response = await httpClient.post("/auth/login", payload);
  const { token, jwt } = response.data || {};
  const effectiveToken = token || jwt || null;
  if (effectiveToken) {
    setToken(effectiveToken);
  }
  return response.data;
};

export const authApi = {
  requestNonce,
  login,
};

export default authApi;
