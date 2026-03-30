import "./style.css";

import React from "react";

import { ALL_ITEMS } from "../../../constants/item_data";
import CardView from "../CardView";

const ItemCardView = ({ itemId, selectable = false, selected = false, onClick }) => {
  const itemData = ALL_ITEMS[itemId];
  return (
    <CardView
      className={`p-0 item-card-view-wrapper ${selectable ? "selectable" : ""}`}
      secondary={!selected}
      onClick={selectable ? onClick : () => {}}
    >
      <img
        className="left-panel-bg"
        src={selected ? "/images/label/left-panel-selected.png" : "/images/label/left-panel-normal.png"}
        alt="item-image"
        width="24"
      ></img>
      <div className="icon">
        {itemData.pos === -1 ? <img src={itemData.image} alt="item-image" width="24"></img> : <div></div>}
      </div>
      <div className="">{itemData.label}</div>
    </CardView>
  );
};

export default ItemCardView;
