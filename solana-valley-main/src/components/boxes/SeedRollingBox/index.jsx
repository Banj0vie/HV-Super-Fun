import "./style.css";

import React, { useEffect, useState } from "react";

import { ID_SEEDS } from "../../../constants/app_ids";
import { ALL_ITEMS } from "../../../constants/item_data";
import { ALL_SEED_IMAGE_HEIGHT, ONE_SEED_HEIGHT, TYPE_LABEL_COLOR } from "../../../constants/item_seed";
import { getRandomSeedEntry } from "../../../utils/basic";

// Convert BigInt seedId to seed data structure
const convertSeedIdToSeedData = seedId => {
  if (!seedId || seedId === 0 || seedId === "0") {
    return null;
  }

  // Convert to string if it's a BigInt
  const seedIdStr = seedId.toString();

  // Find the seed in our constants
  for (const [key, value] of Object.entries(ID_SEEDS)) {
    if (value.toString() === seedIdStr) {
      const seedData = ALL_ITEMS[value];
      if (seedData) {
        return { id: key, ...seedData };
      }
    }
  }

  // If not found in ID_SEEDS, try to find directly in ALL_ITEMS
  for (const [itemKey, itemData] of Object.entries(ALL_ITEMS)) {
    if (itemData.id && itemData.id.toString() === seedIdStr) {
      // Check if this is a seed item
      if (itemData.category === "ID_ITEM_CROP" && itemData.subCategory && itemData.subCategory.includes("SEED")) {
        return { id: itemKey, ...itemData };
      }
    }
  }

  return null;
};

const SeedRollingBox = ({ seedPackId, delay = 0 }) => {
  const [isRolling, setIsRolling] = useState(true);
  const [selectedSeed, setSelectedSeed] = useState({});

  useEffect(() => {
    console.log("SeedRollingBox received seedPackId:", seedPackId, "type:", typeof seedPackId);

    // Always start rolling whenever seedPackId changes
    setIsRolling(true);
    setSelectedSeed({});

    let finalSeed = null;

    if (!seedPackId || seedPackId === 0 || seedPackId === "0") {
      // No concrete seed from backend: use random fallback
      finalSeed = getRandomSeedEntry();
      console.log("Using random seed fallback:", finalSeed);
    } else {
      // Concrete seedId from backend: convert, but still show rolling
      const seedData = convertSeedIdToSeedData(seedPackId);
      console.log("Converted seed data:", seedData);
      if (seedData) {
        finalSeed = seedData;
      } else {
        console.log("Conversion failed, using random seed fallback");
        finalSeed = getRandomSeedEntry();
      }
    }

    const timer = setTimeout(() => {
      setIsRolling(false);
      setSelectedSeed(finalSeed || {});
    }, 1000 + delay);

    return () => clearTimeout(timer); // cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPackId]);
  return (
    <div className="seed-rolling-box">
      <div className="seed-roller">
        <img className="seed-roller-bg" src="/images/items/crop-bg.png" alt="Seed Roller Background"></img>
        <div
          className={`seed-rolling-image ${isRolling ? "rolling" : "finish"}`}
          style={
            selectedSeed.pos
              ? {
                  "--all-seed-image-height": `-${ALL_SEED_IMAGE_HEIGHT * 0.308}px`,
                  "--scaled-seed-height": `${ONE_SEED_HEIGHT * 0.308}px`,
                  backgroundPositionY: `-${selectedSeed.pos * ONE_SEED_HEIGHT * 0.308}px`,
                }
              : {
                  "--all-seed-image-height": `-${ALL_SEED_IMAGE_HEIGHT * 0.308}px`,
                  "--scaled-seed-height": `${ONE_SEED_HEIGHT * 0.308}px`,
                }
          }
        ></div>
      </div>
      <div className="seed-label">
        <p
          style={{
            color: selectedSeed.type ? TYPE_LABEL_COLOR[selectedSeed.type].color : "white",
          }}
        >
          {isRolling ? "ROLLING" : selectedSeed.type && TYPE_LABEL_COLOR[selectedSeed.type].label}
        </p>
      </div>
    </div>
  );
};

export default SeedRollingBox;
