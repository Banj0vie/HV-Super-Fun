import "./style.css";

import React from "react";

import { ITEM_COMBI } from "../../../../constants/item_combination";
import CardView from "../../CardView";

const ItemCombinationDescription = ({ itemId }) => {
  const combiInfo = ITEM_COMBI[itemId];
  return (
    <CardView className="p-0">
      <div className="item-combination-description">
        <div className="item-combination-description-top">{combiInfo.description.summary}</div>
        <div>
          {combiInfo.description.extra_bonus}
          <span className="highlight">{combiInfo.description.extra_point}</span>
        </div>
      </div>
    </CardView>
  );
};

export default ItemCombinationDescription;
