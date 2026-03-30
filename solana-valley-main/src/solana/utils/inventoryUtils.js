import {
  ID_BAIT_ITEMS,
  ID_CHEST_ITEMS,
  ID_FISH_ITEMS,
  ID_POTION_ITEMS,
  ID_PRODUCE_ITEMS,
  ID_SEEDS,
} from "../../constants/app_ids";
import { getParsedTokenAccountsByOwner } from "../../utils/requestQueue";
import { TOKEN_PROGRAM_ID } from "./accountUtils";
import { getItemMintPDA } from "./pdaUtils";

export async function fetchAllItemBalances(connection, ownerPublicKey) {
  const idGroups = [ID_SEEDS, ID_PRODUCE_ITEMS, ID_BAIT_ITEMS, ID_FISH_ITEMS, ID_CHEST_ITEMS, ID_POTION_ITEMS];
  const allIds = idGroups.flatMap(obj => Object.values(obj));
  const mintToItemId = new Map();
  for (const itemId of allIds) {
    try {
      const mintPda = getItemMintPDA(itemId);
      mintToItemId.set(mintPda.toString(), itemId);
    } catch {}
  }
  const ownerTokenAccounts = await getParsedTokenAccountsByOwner(connection, ownerPublicKey, {
    programId: TOKEN_PROGRAM_ID,
  });
  const balances = {};
  for (const itemId of allIds) balances[itemId] = 0;
  for (const { account } of ownerTokenAccounts.value || []) {
    const info = account?.data?.parsed?.info;
    const mintStr = info?.mint;
    const amountInfo = info?.tokenAmount;
    const itemId = mintToItemId.get(mintStr);
    if (itemId !== undefined) {
      balances[itemId] = amountInfo?.uiAmount || 0;
    }
  }
  return balances;
}
