// Contract addresses and ABIs
// These will be updated when contracts are deployed

export const CONTRACT_ADDRESSES = {
  // Abstract Testnet (Chain ID: 11124)
  ABSTRACT_TESTNET: {
    GAME_REGISTRY: "0xD8787E8685bff34162201DE0C67F343D22665C36",
    YIELD_TOKEN: "0x5Ee447aAbe6D87dc4A4f0556b412Fae4d5bB102f",
    ITEMS_1155: "0xA4DCEA0016294c763E53F8B2e1eF0D246BEafd66",
    PLAYER_STORE: "0x98Fe697A60211f695F9dCE7436cc37d815783719",
    RNG_HUB: "0xaec2fDA3Fd8FcE5F383Ba2310484fDcFF6cd09cB",
    BANKER: "0xBE1d1dD6F660EB3EF7984d936937A83d5dceb0A4",
    FARMING: "0xd468955b72002e03AA526A7D54AE62E61caB4Eb7",
    VENDOR: "0x8c5eD824222BE3Bd00749E88054123B0DbDfD804",
    SAGE: "0xE1ebE5Ca4e3FA7bBAAEa2a2a063bb6e5C2cc5986",
    DEX: "0x4698f452Fc9Bce7eB0ebb2a541878F4B377EbAbd",
    GARDENER: "0x0bD355a66793D1817e062a9fF437F13657589526",
    FISHING: "0xc838df539939ef444A207ad2DC8C44D03AC89589",
    CHEST_OPENER: "0x85884A51AD5828a34cC8dF507b29F4D07edA7791",
    LEADERBOARD: "0xEA1d0D97E65bcd9913724Afbbf3E200E0b3cA0fc",
    POTION: "0x86AE90b0cD538511bB96D0430c8CdB8d6827dd5d",
    PRODUCE_SEEDER: "0xDD581D3269353742C8e4E316CAc5957617D5de0D",
  }
};

export const NETWORK_CONFIG = {
  ABSTRACT_TESTNET: {
    chainId: "0x2B74", // 11124 in hex (MetaMask needs hex format)
    chainName: "Abstract Testnet",
    rpcUrls: [
      "https://api.testnet.abs.xyz"
    ],
    blockExplorerUrls: ["https://sepolia.abscan.org"],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  }
};

// Contract ABIs (simplified versions for key functions)
export const CONTRACT_ABIS = {
  GAME_REGISTRY: [
    "function gameItems() view returns (address)",
    "function gameToken() view returns (address)",
    "function playerStore() view returns (address)",
    "function xGameTokenVault() view returns (address)",
    "function rngHub() view returns (address)",
    "function setGameItems(address)",
    "function setGameToken(address)",
    "function setPlayerStore(address)",
    "function setXGameTokenVault(address)",
    "function setRngHub(address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  VENDOR: [
    "function buySeedPack(uint8 tier, uint256 count) returns (uint256)",
    "function packPrice(uint8) view returns (uint256)",
    "function feeBpsToVault() view returns (uint16)",
    "function hasPendingRequests(address player) view returns (bool)",
    "function getAllPendingRequests(address player) view returns (uint256[] requestIds, uint8[] tiers, uint256[] counts)",
    "function getPendingRequest(address player) view returns (uint256 requestId, uint8 tier, uint256 count)",
    "function setPackPrice(uint8 tier, uint256 price)",
    "function setFeeBpsToVault(uint16 bps)",
    "function setVrngSystem(address vrngSystem)",
    "function randomNumberCallback(uint256 requestId, uint256 randomNumber)",
    "function _requestRandomNumber() returns (uint256)",
    "function _onRandomNumberFulfilled(uint256 requestId, uint256 randomNumber)",
    "function R() view returns (address)",
    "function ITEMS() view returns (address)",
    "function Y() view returns (address)",
    "function X_VAULT() view returns (address)",
    "function rarityPpm(uint256) view returns (uint32)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "event SeedPack(address indexed player, uint8 tier, uint256 requestId)",
    "event SeedsRevealed(address indexed player, uint256 requestId, uint256[] seedIds, uint8 tier, uint256 count)"
  ],

  FARMING: [
    "function plant(uint256 seedId, uint8 plotNumber)",
    "function plantBatch(uint256[] calldata seedIds, uint8[] calldata plotNumbers)",
    "function harvest(uint8 slot)",
    "function harvestAll()",
    "function harvestMany(uint8[] calldata slots)",
    "function getMaxPlots(address user) view returns (uint8)",
    "function getUserCrops(address user) view returns ((uint256,uint64)[])",
    "function crops(address, uint8) view returns (uint256,uint64)",
    "function count(address) view returns (uint8)",
    "function getGrowthTime(uint256 seedId) view returns (uint32)",
    "function setSage(address sageAddr)",
    "function tCommon() view returns (uint32)",
    "function tUncommon() view returns (uint32)",
    "function tRare() view returns (uint32)",
    "function tEpic() view returns (uint32)",
    "function tLegendary() view returns (uint32)",
    "function R() view returns (address)",
    "function ITEMS() view returns (address)",
    "function GAME_TOKEN() view returns (address)",
    "function sage() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  BANKER: [
    "function stake(uint256 amount) returns (uint256 shares)",
    "function unstake(uint256 shares) returns (uint256 amount)",
    "function balanceOf(address) view returns (uint256)",
    "function totalSupply() view returns (uint256)",
    "function totalGameToken() view returns (uint256)",
    "function depositGameToken(uint256 amount)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function R() view returns (address)",
    "function Y() view returns (address)",
    "function tokenBalance() view returns (uint256)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "event FeeDeposited(address indexed depositor, uint256 amount)"
  ],

  SAGE: [
    "function lockGameToken(address user, uint256 amount)",
    "function unlockWeeklyWage()",
    "function unlockWeeklyHarvest()",
    "function lockedGameToken(address) view returns (uint256)",
    "function lastUnlockTime(address) view returns (uint64)",
    "function lastUnlockTimeHarvest(address) view returns (uint64)",
    "function getUnlockCost(uint16 level) pure returns (uint256)",
    "function R() view returns (address)",
    "function Y() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  DEX: [
    "function depositNativeForGameToken(uint256 amount)",
    "function RATE_PER_ETH() view returns (uint256)",
    "function GAME_TOKEN() view returns (address)"
  ],

  PLAYER_STORE: [
    "function createProfile(string calldata name, bytes32 referralCode)",
    "function profileOf(address) view returns (bool exists, uint16 level, uint64 nextChestAt, uint64 nextFishAt)",
    "function xpOf(address) view returns (uint256)",
    "function addXp(address, uint256)",
    "function usernameOf(address) view returns (string)",
    "function top5(uint256) view returns (address)",
    "function top5Xp(uint256) view returns (uint256)",
    "function epochStart() view returns (uint64)",
    "function setLevel(address user, uint16 newLevel)",
    "function setChestTime(address user, uint64 whenTs)",
    "function setFishTime(address user, uint64 whenTs)",
    "function setLeaderboardHook(address hook)",
    "function getXpRequiredForLevel(uint16 level) pure returns (uint256)",
    "function getXpRequiredForNextLevel(address user) view returns (uint256)",
    "function getEpochTop5(uint64 epoch) view returns (address[5] memory top5Players, uint256[5] memory top5XpAmounts, uint64 epochNumber, uint64 timestamp)",
    "function getEpochTop5Player(uint64 epoch, uint256 position) view returns (address, uint256)",
    "function advanceEpochIfNeeded()",
    "function gameEpoch() view returns (uint64)",
    "function registerMyReferralCode(bytes32 myCode)",
    "function getMyReferralCode(address user) view returns (bytes32)",
    "function getSponsor(address user) view returns (address)",
    "function referralBpsByLevel(uint16) view returns (uint16)",
    "function setGameToken(address token)",
    "function setReferralBpsForLevel(uint16 level, uint16 bps)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "function leaderboardHook() view returns (address)",
    "function Y() view returns (address)"
  ],

  ITEMS_1155: [
    "function balanceOf(address, uint256) view returns (uint256)",
    "function balanceOfBatch(address[], uint256[]) view returns (uint256[])",
    "function setApprovalForAll(address, bool)",
    "function isApprovedForAll(address, address) view returns (bool)",
    "function safeTransferFrom(address, address, uint256, uint256, bytes)",
    "function safeBatchTransferFrom(address, address, uint256[], uint256[], bytes)",
    "function mint(address to, uint256 id, uint256 amount)",
    "function burn(address from, uint256 id, uint256 amount)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function uri(uint256) view returns (string)"
  ],

  YIELD_TOKEN: [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "function transferFrom(address, address, uint256) returns (bool)",
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)",
    "function mint(address, uint256)",
    "function burn(address, uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ],

  RNG_HUB: [
    "function fulfillRequest(uint256 requestId, uint256 randomNumber)",
    "function requestRandomNumberWithTraceId(uint256 traceId) returns (uint256)",
    "function setNextRequestId(uint256 requestId)",
    "function nextRequestId() view returns (uint256)",
    "function requests(uint256) view returns (uint256 traceId, uint256 randomNumber, address callback, bool isFulfilled)"
  ],

  FISHING: [
    "function craftBait1(uint256 baitCount)",
    "function craftBait2(uint256[] memory itemIds, uint256[] memory amounts)",
    "function craftBait3(uint256[] memory itemIds, uint256[] memory amounts)",
    "function fish(uint256 baitId, uint16 amount) returns (uint256)",
    "function setVrngSystem(address vrngSystem)",
    "function randomNumberCallback(uint256 requestId, uint256 randomNumber)",
    "function _requestRandomNumber() returns (uint256)",
    "function _onRandomNumberFulfilled(uint256 requestId, uint256 randomNumber)",
    "function R() view returns (address)",
    "function ITEMS() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
    "function hasPendingRequests(address player) view returns (bool)",
    "function getAllPendingRequests(address player) view returns (uint256[] requestIds, uint256[] baitIds, uint16[] levels, uint256[] amounts)",
    "function getPendingRequest(address player) view returns (uint256 requestId, uint256 baitId, uint16 level, uint256 amount)",
    "event FishingStarted(address indexed player, uint256 requestId, uint256 baitId, uint16 amount)",
    "event FishingResults(address indexed player, uint256 requestId, uint256[] itemIds, uint256[] amounts, uint256 baitId, uint16 totalAmount)"
  ],

  GARDENER: [
    "function levelUp(uint16 targetLevel)",
    "function priceForLevel(uint16) view returns (uint256)",
    "function maxLevel() view returns (uint16)",
    "function setPrice(uint16 level, uint256 price)",
    "function setMaxLevel(uint16 m)",
    "function R() view returns (address)",
    "function Y() view returns (address)",
    "function YE() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  CHEST_OPENER: [
    "function claimDailyChest()",
    "function openChest(uint256 chestId)",
    "function setVrngSystem(address vrngSystem)",
    "function randomNumberCallback(uint256 requestId, uint256 randomNumber)",
    "function _requestRandomNumber() returns (uint256)",
    "function _onRandomNumberFulfilled(uint256 requestId, uint256 randomNumber)",
    "function R() view returns (address)",
    "function ITEMS() view returns (address)",
    "function loot(uint256, uint256) view returns (uint256)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  POTION: [
    "function craftGrowthElixir()",
    "function craftPesticide()",
    "function craftFertilizer()",
    "function R() view returns (address)",
    "function ITEMS() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  LEADERBOARD: [
    "function maybeReward()",
    "function lastRewardTs() view returns (uint64)",
    "function R() view returns (address)",
    "function ITEMS() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ],

  PRODUCE_SEEDER: [
    "function seedAllProduce(uint256 amountEach)",
    "function ITEMS() view returns (address)",
    "function MODULE_ROLE() view returns (bytes32)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function grantRole(bytes32 role, address account)",
    "function revokeRole(bytes32 role, address account)",
    "function DEFAULT_ADMIN_ROLE() view returns (bytes32)"
  ]
};

// Seed pack tiers and prices (matching smart contract constants)
export const SEED_PACK_TIERS = {
  1: { name: "Feeble", price: "1000000000000000000", priceLabel: "1 HNY" }, // 1e18
  2: { name: "Pico", price: "20000000000000000000", priceLabel: "20 HNY" }, // 20e18
  3: { name: "Basic", price: "100000000000000000000", priceLabel: "100 HNY" }, // 100e18
  4: { name: "Premium", price: "250000000000000000000", priceLabel: "250 HNY" } // 250e18
};

// Sage unlock rate constants (matching smart contract)
export const SAGE_UNLOCK_RATES = {
  DEFAULT: 100,    // 1% (level < 10)
  LEVEL_10: 1000,  // 10% (level >= 10)
  LEVEL_15: 1500   // 15% (level >= 15)
};

// =================TIME GLITCH=================
// export const SAGE_UNLOCK_COOLDOWN = 7 * 24 * 60 * 60 * 1000;
export const SAGE_UNLOCK_COOLDOWN = 7 * 60 * 1000;