import "./style.css";

import React from "react";

import ItemViewSmall from "../../../components/boxes/ItemViewSmall";
import BaseButton from "../../../components/buttons/BaseButton";
import BaseDialog from "../../_BaseDialog";

const ChestRollingDialog = ({ rollingInfo, onClose, onBack, onOpenAgain }) => {
  return (
    <BaseDialog
      title="CHEST OPENING"
      onClose={onClose}
      header="/images/dialog/modal-header-chest.png"
      headerOffset={10}
    >
      <div className="chest-gacha-wrapper">
        <div className="chest-rolling-box-wrapper">
          <div className="chest-result">
            <ItemViewSmall itemId={rollingInfo.rewardId} count={1} />
          </div>
        </div>
        <div className="chest-rolling-buttons-wrapper">
          <BaseButton className="h-4rem" label="Back" onClick={onBack} isError></BaseButton>
          {/* {onOpenAgain && (
            <BaseButton
              className="h-4rem"
              label="Open Again"
              onClick={onOpenAgain}
            ></BaseButton>
          )} */}
        </div>
      </div>
    </BaseDialog>
  );
};

export default ChestRollingDialog;
