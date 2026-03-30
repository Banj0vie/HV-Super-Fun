import "./style.css";

import React, { useState } from "react";

import BaseButton from "../../../components/buttons/BaseButton";
import BaseDivider from "../../../components/dividers/BaseDivider";
import Slider from "../../../components/inputs/Slider";
import BaseDialog from "../../_BaseDialog";

const CustomSeedsDialog = ({ price = 1, onConfirm, onClose }) => {
  const [seedCount, setSeedCount] = useState("1");
  return (
    <BaseDialog title={"AMOUNT"} onClose={onClose} header="/images/dialog/modal-header-vendor.png" headerOffset={10}>
      <div className="custom-seed-wrapper">
        <Slider min="1" max="9" value={seedCount} setValue={val => setSeedCount(val)}></Slider>
        <div className="custom-seed-text">
          Buy {seedCount} seeds for {seedCount * price} HNY
        </div>
        <BaseDivider></BaseDivider>
        <BaseButton className="h-3rem" label="Confirm" onClick={() => onConfirm(parseInt(seedCount))}></BaseButton>
      </div>
    </BaseDialog>
  );
};

export default CustomSeedsDialog;
