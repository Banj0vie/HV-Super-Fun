import React, { useState } from "react";
import BaseDialog from "../BaseDialog";
import "./style.css";
import VendorMenu from "./VendorMenu";
import BuySeeds from "./BuySeeds";
import RollChances from "./RollChances";
const VendorDialog = ({ onClose, label = "VENDOR", header = "" }) => {
  const [pageIndex, setMenuIndex] = useState(0);
  // 0: Vendor Menu
  // 1: Buy Seeds
  // 2: Roll Chances
  const [selectedSeed, setSelectedSeed] = useState(0);

  const onSeedsClicked = (id) => {
    setSelectedSeed(id);
    setMenuIndex(1);
  };

  const onRollChancesClicked = () => {
    setMenuIndex(2);
  };

  return (
    <BaseDialog title={label} onClose={onClose} header={header}>
      {pageIndex === 0 && (
        <VendorMenu
          onSeedsClicked={onSeedsClicked}
          onRollChancesClicked={onRollChancesClicked}
        ></VendorMenu>
      )}
      {pageIndex === 1 && (
        <BuySeeds
          menuId={selectedSeed}
          onBack={() => {
            setMenuIndex(0);
          }}
        ></BuySeeds>
      )}
      {pageIndex === 2 && (
        <RollChances
          onBack={() => {
            setMenuIndex(0);
          }}
        ></RollChances>
      )}
    </BaseDialog>
  );
};

export default VendorDialog;
