import React from "react";
import "./style.css";
import BaseDivider from "../../../components/dividers/BaseDivider";
import BaseButton from "../../../components/buttons/BaseButton";
import { ID_SEED_SHOP_ITEMS } from "../../../constants/id";
import ErrorLabel from "../../../components/labels/ErrorLabel";

const VendorMenu = ({ onSeedsClicked, onRollChancesClicked }) => {
  const availablePlots = 29;
  const seedButtons = [
    { id: ID_SEED_SHOP_ITEMS.FEEBLE_SEED, label: "Feeble Seeds" },
    { id: ID_SEED_SHOP_ITEMS.PICO_SEED, label: "Pico Seeds" },
    { id: ID_SEED_SHOP_ITEMS.BASIC_SEED, label: "Basic Seeds" },
    { id: ID_SEED_SHOP_ITEMS.PREMIUM_SEED, label: "Premium Seeds" },
  ];
  return (
    <div className="vendor-menu">
      <div className="available-plots">Available Plots: {availablePlots}</div>
      <BaseDivider></BaseDivider>
      {seedButtons.map((item, index) => (
        <BaseButton
          className="vendor-button"
          label={item.label}
          key={index}
          onClick={() => {
            onSeedsClicked(item.id);
          }}
        />
      ))}
      <BaseDivider></BaseDivider>
      <BaseButton
        className="vendor-button"
        label="Roll Chances"
        onClick={() => {
            onRollChancesClicked();
        }}
      ></BaseButton>
      <br/>
      <ErrorLabel text={"Caution: Please reveal within ~8 minutes!"}></ErrorLabel>
    </div>
  );
};

export default VendorMenu;
