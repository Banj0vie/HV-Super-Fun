import "./style.css";

import React from "react";

import ItemSmallView from "../../components/boxes/ItemViewSmall";
import BaseDialog from "../_BaseDialog";

const LootReceivedDialog = ({ onClose, items }) => {
  return (
    <BaseDialog onClose={onClose} title="LOOT RECEIVED" header="/images/dialog/modal-header-chest.png">
      <div className="loot-received-dialog">
        <div className="text-center">Items Received ({items.length})</div>
        <br />
        <div className="items-grid">
          {items.map((item, index) => (
            <ItemSmallView key={index} itemId={item.id} count={item.count}></ItemSmallView>
          ))}
        </div>
      </div>
    </BaseDialog>
  );
};

export default LootReceivedDialog;
