import "./style.css";

import React from "react";

import { ID_CROP_CATEGORIES } from "../../../../../constants/app_ids";
import { ALL_ITEMS } from "../../../../../constants/item_data";
import { TYPE_LABEL_COLOR } from "../../../../../constants/item_seed";
import CropCircleIcon from "../../../CropCircleIcon";

const SingleItem = ({ itemId }) => {
  const item = ALL_ITEMS[itemId];
  const textColor = TYPE_LABEL_COLOR[item.type].color;

  const subCategory = item.subCategory;
  const starCount =
    subCategory === ID_CROP_CATEGORIES.PICO_SEED
      ? 1
      : subCategory === ID_CROP_CATEGORIES.BASIC_SEED
        ? 2
        : subCategory === ID_CROP_CATEGORIES.PREMIUM_SEED
          ? 3
          : 0;

  return (
    <div className="single-combi-item-wrapper">
      <div className="crop-icon">
        <CropCircleIcon seedId={itemId} size={104} scale={0.5}></CropCircleIcon>
      </div>
      <div className="crop-label" style={{ color: textColor }}>
        {item.label}
        {starCount > 0 && (
          <span className="crop-label-stars">
            {Array.from({ length: starCount }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};

export default SingleItem;
