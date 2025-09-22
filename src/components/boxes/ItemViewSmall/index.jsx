import React from "react";
import "./style.css";
import CardView from "../CardView";
import { ALL_ITEMS } from "../../../constants/item_data";
import { TYPE_LABEL_COLOR } from "../../../constants/item_seed";

const ItemSmallView = ({ itemId, count }) => {
  const item = ALL_ITEMS[itemId];
  
  // Render item icon
  const renderIcon = () => {
    // For all items, use the image path directly
    return <img src={item.image} alt="icon"></img>;
  };

  return (
    <div className="item-small-view">
      <CardView className="icon">
        {renderIcon()}
      </CardView>
      <div
        className="label"
        style={{ color: TYPE_LABEL_COLOR[item.type].color }}
      >
        {item.label}
      </div>
      <div className="count">x{count}</div>
    </div>
  );
};

export default ItemSmallView;
