import React from "react";
import "./style.css";
import {
  ONE_SEED_HEIGHT,
} from "../../../constants/item_seed";
import { ALL_ITEMS } from "../../../constants/item_data";

const SellItemBox = ({ item, onSend, onSell }) => {
  const itemData = ALL_ITEMS[item.id];
  
  return (
    <div className="sell-item-box">
      {/* Item Icon */}
      <div className="item-icon-wrapper">
        <div
          className="item-icon"
          style={{ backgroundPositionY: 0 - itemData.pos * ONE_SEED_HEIGHT }}
        ></div>
      </div>

      {/* Item Name and Quantity */}
      <div className="item-details">
        {itemData.label} ({item.count})
      </div>

      {/* Action Buttons */}
      <div className="item-actions">
        <button
          className="base-button"
          onClick={() => onSend(item)}
        >
          Send
        </button>
        <button
          className="base-button"
          onClick={() => onSell(item)}
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default SellItemBox;
