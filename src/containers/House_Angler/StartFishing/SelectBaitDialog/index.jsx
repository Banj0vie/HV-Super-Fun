import React from "react";
import "./style.css";
import BaseDialog from "../../../_BaseDialog";
import { ID_BAIT_ITEMS } from "../../../../constants/app_ids";
import CardView from "../../../../components/boxes/CardView";
import ItemViewUsable from "../../../../components/boxes/ItemViewUsable";

const SelectBaitDialog = ({ onClose, onSelect }) => {
  const TEST_BAITS = [
    ID_BAIT_ITEMS.BAIT_1,
    ID_BAIT_ITEMS.BAIT_2,
    ID_BAIT_ITEMS.BAIT_3,
  ];

  const onSelectBait = (baitId) => {};

  return (
    <BaseDialog onClose={onClose} title="SELECT BAIT">
      <div className="select-bait-dialog">
        <CardView className="p-0">
          <div className="bait-list">
            {TEST_BAITS.map((baitId, index) => (
              <ItemViewUsable
                itemId={baitId}
                key={index}
                count={1}
                onUse={onSelectBait}
              ></ItemViewUsable>
            ))}
          </div>
        </CardView>
      </div>
    </BaseDialog>
  );
};

export default SelectBaitDialog;
