import httpClient from "./httpClient";

/**
 * List an item on the market.
 *
 * @param {{ wallet: string, itemId: number, amount: number, pricePer: string }} payload
 * @returns {Promise<{ ok: boolean, listingId: string }>}
 */
export const listItem = async payload => {
  const response = await httpClient.post("/market/list", payload);
  return response.data;
};

/**
 * Purchase an item from the market (after token payment).
 *
 * @param {{ wallet: string, txSignature: string, listingId: string, amount: number }} payload
 * @returns {Promise<{ ok: boolean, purchased: number }>}
 */
export const purchaseItem = async payload => {
  const response = await httpClient.post("/market/purchase", payload);
  return response.data;
};

/**
 * Cancel a listing.
 *
 * @param {{ wallet: string, listingId: string }} payload
 * @returns {Promise<{ ok: boolean, refundedAmount: number }>}
 */
export const cancelListing = async payload => {
  const response = await httpClient.post("/market/cancel", payload);
  return response.data;
};

/**
 * Send items to another wallet.
 *
 * @param {{ wallet: string, recipientWallet: string, itemId: number, amount: number }} payload
 * @returns {Promise<{ ok: boolean, sent: number }>}
 */
export const sendItem = async payload => {
  const response = await httpClient.post("/market/send", payload);
  return response.data;
};

/**
 * Batch buy items from market (after token payment).
 *
 * @param {{ wallet: string, txSignature: string, itemId: number, maxPricePer: string, totalBudget: string }} payload
 * @returns {Promise<{ ok: boolean, totalPurchased: number, totalSpent: string }>}
 */
export const batchBuyItems = async payload => {
  const response = await httpClient.post("/market/batch-buy", payload);
  return response.data;
};

/**
 * Fetch all active listings.
 *
 * @returns {Promise<Array<{ listingId: string, sellerWallet: string, itemId: number, amount: number, pricePer: string, active: boolean }>>}
 */
export const getListings = async () => {
  const response = await httpClient.get("/read/market/listings");
  return response.data || [];
};

/**
 * Fetch a single listing by ID.
 *
 * @param {string} listingId
 * @returns {Promise<Object|null>}
 */
export const getListing = async listingId => {
  try {
    const response = await httpClient.get(`/read/market/listings/${listingId}`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
};

export const marketApi = {
  listItem,
  purchaseItem,
  cancelListing,
  sendItem,
  batchBuyItems,
  getListings,
  getListing,
};

export default marketApi;
