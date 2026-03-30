import "./style.css";

import React, { useState } from "react";

import BaseButton from "../../../../components/buttons/BaseButton";
import BaseDivider from "../../../../components/dividers/BaseDivider";
import BaseInput from "../../../../components/inputs/BaseInput";
import Slider from "../../../../components/inputs/Slider";
import { useNotification } from "../../../../contexts/NotificationContext";
import { useMarket } from "../../../../hooks/useMarket";
import { handleContractError } from "../../../../utils/errorHandler";
import BaseDialog from "../../../_BaseDialog";

const SellConfirmDialog = ({ onClose, onSellSuccess, item }) => {
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  const { list } = useMarket();
  const { show } = useNotification();

  const handleConfirm = async () => {
    if (!item || !item.id || !amount || amount <= 0 || !price || price <= 0) {
      show("Please enter valid amount and price", "error");
      return;
    }

    if (amount > item.count) {
      show("Amount cannot exceed your available items", "error");
      return;
    }

    setLoading(true);
    try {
      await list(item.id, amount, price);
      show(`Items listed successfully!`, "success");
      if (onSellSuccess) {
        onSellSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      const { message } = handleContractError(error);
      show(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog onClose={onClose} title="SELL ITEMS" header="/images/dialog/modal-header-vendor.png" headerOffset={10}>
      <div className="sell-confirm-dialog">
        {item && (
          <>
            <div className="text-center">
              <h3>{item.label || item.name || "Unknown Item"}</h3>
              <p>Available: {item.count} items</p>
            </div>
            <div className="row">
              <div>Price per item (HNY)</div>
              <BaseInput
                className="input"
                type="number"
                min="1"
                value={price}
                setValue={val => setPrice(Math.max(1, parseInt(val) || 1))}
              ></BaseInput>
            </div>
            <div className="row">
              <div>Amount to sell</div>
              <div className="slider">
                <Slider min="1" max={item.count} value={amount} setValue={val => setAmount(val)}></Slider>
              </div>
            </div>
            <div className="count-label">SELL x {amount}</div>
            <div className="total-price">Total: {price * amount} HNY</div>
            <BaseDivider></BaseDivider>
            <BaseButton
              label={loading ? "Listing..." : "Confirm Sale"}
              onClick={handleConfirm}
              disabled={loading || !price || !amount}
            ></BaseButton>
          </>
        )}
      </div>
    </BaseDialog>
  );
};

export default SellConfirmDialog;
