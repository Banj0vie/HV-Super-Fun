import httpClient from "./httpClient";

const PROFILE_CACHE_TTL_MS = 15_000;
const profileCache = new Map();
const inFlightProfileRequests = new Map();

/**
 * Fetch an existing profile for a wallet.
 * Returns null if the profile does not exist (404).
 *
 * @param {string} wallet
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<Object|null>}
 */
export const getProfile = async (wallet, options = {}) => {
  const { force = false } = options || {};
  if (!wallet) return null;

  const now = Date.now();
  const cached = profileCache.get(wallet);
  if (!force && cached && now - cached.timestamp < PROFILE_CACHE_TTL_MS) {
    return cached.data;
  }

  if (!force && inFlightProfileRequests.has(wallet)) {
    return inFlightProfileRequests.get(wallet);
  }

  const requestPromise = (async () => {
    try {
      const response = await httpClient.get(`/read/profiles/${wallet}`);
      const data = response.data;
      profileCache.set(wallet, { data, timestamp: Date.now() });
      return data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        profileCache.set(wallet, { data: null, timestamp: Date.now() });
        return null;
      }
      throw err;
    } finally {
      inFlightProfileRequests.delete(wallet);
    }
  })();

  inFlightProfileRequests.set(wallet, requestPromise);
  return await requestPromise;
};

/**
 * Create a new profile for the given wallet.
 *
 * @param {{ userName: string, wallet: string, referralCode?: string }} payload
 * @returns {Promise<Object>}
 */
export const createProfile = async payload => {
  const response = await httpClient.post("/profile/createProfile", payload);
  if (payload?.wallet) {
    profileCache.set(payload.wallet, { data: response.data, timestamp: Date.now() });
  }
  return response.data;
};

export const profileApi = {
  getProfile,
  createProfile,
};

export default profileApi;
