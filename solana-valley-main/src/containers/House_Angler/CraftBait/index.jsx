import "./style.css";

import React, { useState } from "react";

import CardView from "../../../components/boxes/CardView";
import ItemCardList from "../../../components/boxes/ItemCardList";
import ItemCardView from "../../../components/boxes/ItemCardView";
import ItemCombinationBox from "../../../components/boxes/ItemCombinationBox";
import BaseButton from "../../../components/buttons/BaseButton";
import { ID_BAIT_ITEMS } from "../../../constants/app_ids";
import { ITEM_BAITS } from "../../../constants/item_bait";

const CraftBait = ({ onBack }) => {
  const [selectedBaitId, setSelectedBaitId] = useState(ID_BAIT_ITEMS.BAIT_1);
  const onItemClicked = id => {
    setSelectedBaitId(id);
  };
  return (
    <div className="craft-bait">
      <CardView className="left-panel">
        <ItemCardList>
          {ITEM_BAITS.map((baitId, index) => (
            <ItemCardView
              key={index}
              itemId={baitId}
              selectable
              selected={selectedBaitId === baitId}
              onClick={() => onItemClicked(baitId)}
            ></ItemCardView>
          ))}
        </ItemCardList>
        <BaseButton className="h-4rem" label="Back" onClick={onBack} isError small></BaseButton>
      </CardView>
      <div className="right-panel">
        <ItemCombinationBox itemId={selectedBaitId}></ItemCombinationBox>
      </div>
    </div>
  );
};

export default CraftBait;
