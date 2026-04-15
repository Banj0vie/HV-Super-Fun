import React from "react";
import "./style.css";
import { ALL_ITEMS } from "../../../constants/item_data";
import { ONE_SEED_HEIGHT, ONE_SEED_WIDTH } from "../../../constants/item_seed";

const CropCircleIcon = ({ seedId, size, scale = 1 }) => {
  const itemData = ALL_ITEMS[seedId];
  const useDirectImage = itemData && itemData.pos === -1 && itemData.image;
  return (
    <div
      className="crop-circle-icon-bg"
      style={{ height: size, width: size, scale: scale }}
    >
      {useDirectImage ? (
        <img src={itemData.image} alt={itemData.label} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
      ) : (
        <div
          className="crop-icon"
          style={{
            backgroundPositionY: itemData?.pos
              ? `-${itemData.pos * ONE_SEED_HEIGHT * 0.308}px`
              : 0,
          }}
        ></div>
      )}
    </div>
  );
};

export default CropCircleIcon;
