import React from "react";
import "./style.css";
import BaseButton from "../../buttons/BaseButton";

const BuySeedBox = ({ item, onBuy, isBuying = false, isDisabled = false }) => {
  return (
    <div className="buy-seed-box">
      <div className="buy-seed-box-wrapper">
        <div className="buy-seed-info">
          <img src={item.icon} className="buy-seed-icon" alt={item.label}></img>
          <div>
            <p className="buy-seed-label">{item.label}</p>
            <p className="buy-seed-price highlight">{item.priceLabel}</p>
          </div>
        </div>
        <div className="buy-seed-button-wrapper">
          <BaseButton
            className="h-full"
            label={isBuying ? "Buying..." : "Buy"}
            onClick={onBuy}
            disabled={isDisabled || isBuying}
          ></BaseButton>
        </div>
      </div>
    </div>
  );
};

export default BuySeedBox;
