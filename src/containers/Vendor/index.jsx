import React, { useState } from "react";
import BaseDialog from "../BaseDialog";
import "./style.css";
import VendorMenu from "./VendorMenu";
import BuySeeds from "./BuySeeds";
import RollChances from "./RollChances";
import CustomSeedsDialog from "../CustomSeedsDialog";
const VendorDialog = ({ onClose, label = "VENDOR", header = "" }) => {
  const [pageIndex, setMenuIndex] = useState(0);
  // 0: Vendor Menu
  // 1: Buy Seeds
  // 2: Roll Chances
  const [selectedSeed, setSelectedSeed] = useState(0);
  const [selectedSeedPack, setSelectedSeedPack] = useState({});
  const [isCustomDlg, setIsCustomDlg] = useState(false);

  const onSeedsClicked = (id) => {
    setSelectedSeed(id);
    setMenuIndex(1);
  };

  const onRollChancesClicked = () => {
    setMenuIndex(2);
  };

  const onBuy = (item) => {
    setSelectedSeedPack(item);
    if (item.count === 0) {
      setIsCustomDlg(true);
    } else {
      handleBuy(item);
    }
  };

  const onConfirm = (count) => {
    handleBuy({
      ...selectedSeedPack,
      count,
    });
    setIsCustomDlg(false);
  };

  const handleBuy = (item) => {
    console.log("handleBuy", item, selectedSeed);
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
          onBuy={onBuy}
        ></BuySeeds>
      )}
      {pageIndex === 2 && (
        <RollChances
          onBack={() => {
            setMenuIndex(0);
          }}
        ></RollChances>
      )}
      {isCustomDlg && (
        <CustomSeedsDialog
          price={selectedSeedPack.price}
          onConfirm={onConfirm}
          onClose={() => {
            setIsCustomDlg(false);
          }}
        ></CustomSeedsDialog>
      )}
    </BaseDialog>
  );
};

export default VendorDialog;
