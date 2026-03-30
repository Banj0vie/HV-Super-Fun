// Backward-compatible re-exports and mappings
export { useBanker } from "./useBanker";
export { useChest } from "./useChest";
export { useDex } from "./useDex";
export { useFarming } from "./useFarming";
export { useFishing } from "./useFishing";
export { useGardener } from "./useGardener";
export { useItems } from "./useItems";
export { useLeaderboard } from "./useLeaderboard";
export { useMarket } from "./useMarket";
export { usePotion } from "./usePotion";
export { useReferral } from "./useReferral";
export { useROIData } from "./useROIData";
export { useSage } from "./useSage";

const EMPTY_NFTS = [];
const EMPTY_AVATARS = [EMPTY_NFTS, EMPTY_NFTS];

const getOwnedBoostNFTs = () => EMPTY_NFTS;
const setAvatar = () => {};
const getContract = () => null;
const getAvatars = () => EMPTY_AVATARS; // Returns [nfts, tokenIds] tuple
const getNFTMetadata = () => null;
const getTokenBoostPpm = () => 0;

const equipmentRegistry = {
  getOwnedBoostNFTs,
  setAvatar,
  getContract,
  getAvatars,
  getNFTMetadata,
  getTokenBoostPpm,
};

export const useEquipmentRegistry = () => equipmentRegistry;
