import React from "react";
import "./style.css";
import {
  ONE_SEED_HEIGHT,
  ONE_SEED_WIDTH,
  TYPE_LABEL_COLOR,
} from "../../../constants/item_seed";
import { ALL_ITEMS } from "../../../constants/item_data";

const PickSeedItemBox = ({ seedId, count = 1, onClick }) => {
  const selectedSeed = ALL_ITEMS[seedId];
  return (
    <div className="pick-seed-item-box" onClick={onClick}>
      <div className="pick-seed-item-bg-container">
        <img className="pick-seed-item-bg" src="/images/items/crop-bg.png" alt="crop-bg" />
        {selectedSeed?.pos === -1 ? (
          <img src={selectedSeed.image} alt={selectedSeed.label} style={{ position: 'absolute', width: '65%', height: '65%', objectFit: 'contain', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        ) : (
          <div
            className="pick-seed-item-icon"
            style={{
              backgroundPositionY: selectedSeed?.pos
                ? `-${selectedSeed.pos * ONE_SEED_HEIGHT * 0.308}px`
                : 0,
            }}
          />
        )}
      </div>

      <div className="pick-seed-item-label">{selectedSeed.label}</div>
      <div className="pick-seed-item-badge">
        <img className="pick-seed-item-badge-icon" src="/images/items/badge-bg.png" alt="seed-badge" />
        <div className="pick-seed-item-badge-count">
          x{count}
        </div>
      </div>
    </div>
  );
};

export default PickSeedItemBox;
