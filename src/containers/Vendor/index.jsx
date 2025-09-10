import React, { useState } from "react";
import BaseDialog from "../BaseDialog";
import "./style.css";
import VendorMenu from "./VendorMenu";
import BuySeeds from "./BuySeeds";
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

  const onRollChancesClicked = () => {};

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
    </BaseDialog>
  );
};

export default VendorDialog;
