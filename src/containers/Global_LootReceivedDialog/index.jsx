import React from "react";
import "./style.css";
import BaseDialog from "../_BaseDialog";
import BaseDivider from "../../components/dividers/BaseDivider";
import ItemSmallView from "../../components/boxes/ItemViewSmall";
import { CAT_FISH } from "../../constants/app_ids";

const LootReceivedDialog = ({ onClose, items }) => {
  return (
    <BaseDialog onClose={onClose} title="LOOT RECEIVED" header="/images/dialog/modal-header-chest.png">
      <div className="loot-received-dialog">
        <div className="text-center">Items Received ({items.length})</div>
        <br/>
        <div className="items-grid">
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <ItemSmallView
                itemId={item.id}
                count={item.count}
              ></ItemSmallView>
              {item.weight && (item.id >> 8) === CAT_FISH && (
                <span style={{ fontSize: '11px', color: '#a0d8ef', marginTop: '2px' }}>
                  {item.weight} kg
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseDialog>
  );
};

export default LootReceivedDialog;
