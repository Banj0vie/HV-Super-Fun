import React from "react";
import BaseDialog from "../BaseDialog";
import "./style.css";
import VendorMenu from "./VendorMenu";
const VendorDialog = ({ onClose, label = "VENDOR", header = "" }) => {
  const onSeedsClicked = (id) => {};

  const onRollChancesClicked = () => {};

  return (
    <BaseDialog title={label} onClose={onClose} header={header}>
      <VendorMenu
        onSeedsClicked={onSeedsClicked}
        onRollChancesClicked={onRollChancesClicked}
      ></VendorMenu>
    </BaseDialog>
  );
};

export default VendorDialog;
