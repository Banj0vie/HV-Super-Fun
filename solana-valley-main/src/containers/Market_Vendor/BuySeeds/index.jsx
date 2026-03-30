import "./style.css";

import React, { useEffect, useState } from "react";

import BuySeedBox from "../../../components/boxes/BuySeedBox";
import BaseButton from "../../../components/buttons/BaseButton";
import { SEED_PACKS } from "../../../constants/item_seed";

const BuySeeds = ({ menuId, onBack, onBuy, buyingItem, isAnyBuying }) => {
  const [seedPack, setSeedPack] = useState({});

  useEffect(() => {
    setSeedPack(SEED_PACKS.find(sp => sp.id === menuId));
  }, [menuId]);

  return (
    <div className="buy-seeds-wrapper">
      {seedPack &&
        seedPack.id &&
        seedPack.items &&
        seedPack.items.map((item, index) => (
          <BuySeedBox
            key={index}
            item={item}
            onBuy={() => {
              onBuy(item);
            }}
            isBuying={buyingItem && buyingItem.packId === menuId && buyingItem.label === item.label}
            isDisabled={isAnyBuying}
          ></BuySeedBox>
        ))}
      {seedPack && seedPack.tip && <div className="buy-seed-tip">{seedPack.tip}</div>}
      <BaseButton className="h-4rem" label="Back" onClick={onBack} disabled={isAnyBuying} isError></BaseButton>
    </div>
  );
};

export default BuySeeds;
