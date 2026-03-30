import { useCallback, useEffect, useMemo, useState } from "react";

import { getInventory } from "../api/inventoryApi";
import {
  ID_BAIT_ITEMS,
  ID_CHEST_ITEMS,
  ID_CROP_CATEGORIES,
  ID_ITEM_CATEGORIES,
  ID_LOOT_CATEGORIES,
  ID_POTION_CATEGORIES,
  ID_POTION_ITEMS,
  ID_PRODUCE_ITEMS,
  ID_RARE_TYPE,
} from "../constants/app_ids";
import { ALL_ITEMS, IMAGE_URL_CROP } from "../constants/item_data";
import { useSolanaWallet } from "./useSolanaWallet";

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { account } = useSolanaWallet();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!account) {
        setItems([]);
        return;
      }

      const backendItems = await getInventory(account);

      const userItems = [];
      backendItems.forEach(row => {
        const itemId = Number(row.itemId ?? row.itemID ?? row.id);
        const amount = Number(row.amount ?? 0);

        const itemData = ALL_ITEMS[itemId];
        if (itemData) {
          const item = {
            id: itemId,
            count: amount,
            ...itemData,
          };
          userItems.push(item);
        } else {
          let category;
          let subCategory;

          if (Object.values(ID_CHEST_ITEMS).includes(itemId)) {
            category = ID_ITEM_CATEGORIES.LOOT;
            subCategory = ID_LOOT_CATEGORIES.CHEST;
          } else if (Object.values(ID_BAIT_ITEMS).includes(itemId)) {
            category = ID_ITEM_CATEGORIES.LOOT;
            subCategory = ID_LOOT_CATEGORIES.BAIT;
          } else if (Object.values(ID_POTION_ITEMS).includes(itemId)) {
            category = ID_ITEM_CATEGORIES.POTION;
            if (itemId === ID_POTION_ITEMS.POTION_FERTILIZER) {
              subCategory = ID_POTION_CATEGORIES.FERTILIZER;
            } else if (itemId === ID_POTION_ITEMS.POTION_GROWTH_ELIXIR) {
              subCategory = ID_POTION_CATEGORIES.GROWTH_ELIXIR;
            } else if (itemId === ID_POTION_ITEMS.POTION_PESTICIDE) {
              subCategory = ID_POTION_CATEGORIES.PESTICIDE;
            }
          }

          let label = itemId.toString();
          if (Object.values(ID_CHEST_ITEMS).includes(itemId)) {
            const chestEntry = Object.entries(ID_CHEST_ITEMS).find(([, value]) => value === itemId);
            if (chestEntry) {
              label = chestEntry[0];
            }
          } else if (Object.values(ID_BAIT_ITEMS).includes(itemId)) {
            const baitEntry = Object.entries(ID_BAIT_ITEMS).find(([, value]) => value === itemId);
            if (baitEntry) {
              label = baitEntry[0];
            }
          } else if (Object.values(ID_POTION_ITEMS).includes(itemId)) {
            const potionEntry = Object.entries(ID_POTION_ITEMS).find(([, value]) => value === itemId);
            if (potionEntry) {
              label = potionEntry[0];
            }
          }

          userItems.push({
            id: itemId,
            count: amount,
            category,
            subCategory,
            label,
            type: ID_RARE_TYPE.COMMON,
            image: IMAGE_URL_CROP,
            pos: 0,
          });
        }
      });

      setItems(userItems);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Organize items into tree structure like ALL_ITEM_TREE but exclude seeds
  const itemsTree = useMemo(() => {
    const createTreeWithItems = (treeStructure, userItems) => {
      return treeStructure.map(node => {
        if (node.children) {
          // This is a category node - recursively process children
          const processedChildren = createTreeWithItems(node.children, userItems);

          // Add items property to category nodes (exclude seeds, include all items even with 0 count for crafting)
          const categoryItems = userItems.filter(item => {
            if (node.id === ID_ITEM_CATEGORIES.PRODUCE) {
              // Only include produce items, exclude seeds
              return item.category === ID_ITEM_CATEGORIES.PRODUCE;
            }

            // Handle potion items
            if (node.id === ID_ITEM_CATEGORIES.POTION) {
              return item.category === ID_ITEM_CATEGORIES.POTION;
            }

            // Handle loot items (including chests with undefined category)
            if (node.id === ID_ITEM_CATEGORIES.LOOT) {
              // Include items with loot category or undefined category (like chests)
              return (
                item.category === ID_ITEM_CATEGORIES.LOOT ||
                item.category === undefined ||
                item.label?.includes("CHEST")
              );
            }

            // Handle crop subcategories (for crops that are organized by seed tier)
            if (
              node.id === ID_CROP_CATEGORIES.PREMIUM_SEED ||
              node.id === ID_CROP_CATEGORIES.BASIC_SEED ||
              node.id === ID_CROP_CATEGORIES.PICO_SEED ||
              node.id === ID_CROP_CATEGORIES.FEEBLE_SEED
            ) {
              // For crop subcategories, we need to match produce items that belong to this seed tier
              // This is a bit tricky since produce items don't have subcategory, so we'll match by ID ranges
              const tierItems = node.children?.map(child => child.id) || [];
              return tierItems.includes(item.id);
            }

            // Handle potion subcategories
            if (
              node.id === ID_POTION_CATEGORIES.GROWTH_ELIXIR ||
              node.id === ID_POTION_CATEGORIES.FERTILIZER ||
              node.id === ID_POTION_CATEGORIES.PESTICIDE
            ) {
              return item.subCategory === node.id;
            }

            // Handle loot subcategories
            if (node.id === ID_LOOT_CATEGORIES.CHEST || node.id === ID_LOOT_CATEGORIES.BAIT) {
              return item.subCategory === node.id;
            }

            return item.category === node.id;
          });

          return {
            ...node,
            children: processedChildren,
            items: categoryItems.length > 0 ? categoryItems : undefined,
          };
        } else {
          // This is a leaf node (individual item) - find by ID or label match
          const userItem = userItems.find(item => {
            // First try exact ID match
            if (item.id === node.id) return true;

            // If no ID match, try label match for items with undefined IDs
            if (item.label && node.label && item.label === node.label) return true;

            return false;
          });

          return {
            ...node,
            ...userItem,
            count: userItem?.count || 0,
          };
        }
      });
    };

    // Base tree structure (exact same as ALL_ITEM_TREE but without seeds)
    const baseTree = [
      {
        id: "ALL",
        label: "All",
        children: [
          {
            id: ID_ITEM_CATEGORIES.PRODUCE,
            label: "Crops",
            children: [
              {
                id: ID_CROP_CATEGORIES.PICO_SEED,
                label: "Pico Crops",
                children: [
                  { id: ID_PRODUCE_ITEMS.POTATO, label: "Potato" },
                  { id: ID_PRODUCE_ITEMS.LETTUCE, label: "Lettuce" },
                  { id: ID_PRODUCE_ITEMS.CABBAGE, label: "Cabbage" },
                  { id: ID_PRODUCE_ITEMS.ONION, label: "Onion" },
                  { id: ID_PRODUCE_ITEMS.RADISH, label: "Radish" },
                ],
              },
              {
                id: ID_CROP_CATEGORIES.BASIC_SEED,
                label: "Basic Crops",
                children: [
                  { id: ID_PRODUCE_ITEMS.WHEAT, label: "Wheat" },
                  { id: ID_PRODUCE_ITEMS.TOMATO, label: "Tomato" },
                  { id: ID_PRODUCE_ITEMS.CARROT, label: "Carrot" },
                  { id: ID_PRODUCE_ITEMS.CORN, label: "Corn" },
                  { id: ID_PRODUCE_ITEMS.PUMPKIN, label: "Pumpkin" },
                  { id: ID_PRODUCE_ITEMS.CHILI, label: "Chili" },
                  { id: ID_PRODUCE_ITEMS.PARSNAP, label: "Parsnip" },
                  { id: ID_PRODUCE_ITEMS.CELERY, label: "Celery" },
                  { id: ID_PRODUCE_ITEMS.BROCCOLI, label: "Broccoli" },
                  { id: ID_PRODUCE_ITEMS.CAULIFLOWER, label: "Cauliflower" },
                  { id: ID_PRODUCE_ITEMS.BERRY, label: "Berry" },
                  { id: ID_PRODUCE_ITEMS.GRAPES, label: "Grapes" },
                ],
              },
              {
                id: ID_CROP_CATEGORIES.PREMIUM_SEED,
                label: "Premium Crops",
                children: [
                  { id: ID_PRODUCE_ITEMS.BANANA, label: "Banana" },
                  { id: ID_PRODUCE_ITEMS.MANGO, label: "Mango" },
                  { id: ID_PRODUCE_ITEMS.AVOCADO, label: "Avocado" },
                  { id: ID_PRODUCE_ITEMS.PINEAPPLE, label: "Pineapple" },
                  { id: ID_PRODUCE_ITEMS.BLUEBERRY, label: "Blueberry" },
                  { id: ID_PRODUCE_ITEMS.ARTICHOKE, label: "Artichoke" },
                  { id: ID_PRODUCE_ITEMS.PAPAYA, label: "Papaya" },
                  { id: ID_PRODUCE_ITEMS.FIG, label: "Fig" },
                  { id: ID_PRODUCE_ITEMS.LYCHEE, label: "Lychee" },
                  { id: ID_PRODUCE_ITEMS.LAVENDER, label: "Lavender" },
                  { id: ID_PRODUCE_ITEMS.DRAGONFRUIT, label: "Dragon Fruit" },
                ],
              },
            ],
          },
          {
            id: ID_ITEM_CATEGORIES.POTION,
            label: "Potions",
            children: [
              {
                id: ID_POTION_CATEGORIES.GROWTH_ELIXIR,
                label: "Growth Elixirs",
                children: [
                  { id: ID_POTION_ITEMS.POTION_GROWTH_ELIXIR, label: "Growth Elixir I" },
                  { id: ID_POTION_ITEMS.POTION_GROWTH_ELIXIR_II, label: "Growth Elixir II" },
                  { id: ID_POTION_ITEMS.POTION_GROWTH_ELIXIR_III, label: "Growth Elixir III" },
                ],
              },
              {
                id: ID_POTION_CATEGORIES.FERTILIZER,
                label: "Fertilizers",
                children: [
                  { id: ID_POTION_ITEMS.POTION_FERTILIZER, label: "Fertilizer" },
                  { id: ID_POTION_ITEMS.POTION_FERTILIZER_II, label: "Fertilizer II" },
                  { id: ID_POTION_ITEMS.POTION_FERTILIZER_III, label: "Fertilizer III" },
                ],
              },
              {
                id: ID_POTION_CATEGORIES.PESTICIDE,
                label: "Pesticides",
                children: [
                  { id: ID_POTION_ITEMS.POTION_PESTICIDE, label: "Pesticide" },
                  { id: ID_POTION_ITEMS.POTION_PESTICIDE_II, label: "Pesticide II" },
                  { id: ID_POTION_ITEMS.POTION_PESTICIDE_III, label: "Pesticide III" },
                ],
              },
            ],
          },
          {
            id: ID_ITEM_CATEGORIES.LOOT,
            label: "Loot",
            children: [
              {
                id: ID_LOOT_CATEGORIES.CHEST,
                label: "Chests",
                children: [
                  { id: ID_CHEST_ITEMS.CHEST_WOOD, label: "Wooden Chest" },
                  { id: ID_CHEST_ITEMS.CHEST_BRONZE, label: "Bronze Chest" },
                  { id: ID_CHEST_ITEMS.CHEST_SILVER, label: "Silver Chest" },
                  { id: ID_CHEST_ITEMS.CHEST_GOLD, label: "Golden Chest" },
                ],
              },
              {
                id: ID_LOOT_CATEGORIES.BAIT,
                label: "Baits",
                children: [
                  { id: ID_BAIT_ITEMS.BAIT_1, label: "Bait I" },
                  { id: ID_BAIT_ITEMS.BAIT_2, label: "Bait II" },
                  { id: ID_BAIT_ITEMS.BAIT_3, label: "Bait III" },
                ],
              },
            ],
          },
        ],
      },
    ];

    return createTreeWithItems(baseTree, items);
  }, [items]);

  // Legacy flat structure for backward compatibility
  const itemsByCategory = {
    seeds: items.filter(item => item.category === ID_ITEM_CATEGORIES.SEED),
    productions: items.filter(item => item.category === ID_ITEM_CATEGORIES.PRODUCE),
    baits: items.filter(item => item.category === ID_ITEM_CATEGORIES.BAIT),
    fish: items.filter(item => item.category === ID_ITEM_CATEGORIES.FISH),
    chests: items.filter(item => item.category === ID_ITEM_CATEGORIES.CHEST),
    potions: items.filter(item => item.category === ID_ITEM_CATEGORIES.POTION),
  };

  return {
    // Tree structure (same as ALL_ITEM_TREE format)
    items: itemsTree,
    seeds: itemsByCategory.seeds,
    // Legacy flat structure
    ...itemsByCategory,
    all: items,
    loading,
    error,
    refetch: fetchItems,
  };
};
