import React, { useState } from "react";
import "./style.css";
import ItemBigView from "../../../components/boxes/ItemViewBig";
import { ID_FISHING_RODS } from "../../../constants/app_ids";
import LabelValueBox from "../../../components/boxes/LabelValueBox";
import BaseButton from "../../../components/buttons/BaseButton";
import SelectBaitDialog from "./SelectBaitDialog";
import { useFishing } from "../../../hooks/useFishing";
import { useNotification } from "../../../contexts/NotificationContext";
import { handleContractError } from "../../../utils/errorHandler";

const BAIT_MAX_USES = 5;
const LAST_BAIT_KEY = 'sandbox_last_equipped_bait';
const BAIT_USES_KEY = 'sandbox_bait_uses';

export const getBaitUses = () => {
  try { return JSON.parse(localStorage.getItem(BAIT_USES_KEY) || '{}'); } catch { return {}; }
};

export const consumeBait = (baitId) => {
  const uses = getBaitUses();
  const current = uses[baitId] ?? BAIT_MAX_USES;
  const next = current - 1;
  if (next <= 0) {
    delete uses[baitId];
    // Also remove from loot
    try {
      const loot = JSON.parse(localStorage.getItem('sandbox_loot') || '{}');
      if (loot[baitId] > 0) loot[baitId] = Math.max(0, (loot[baitId] || 1) - 1);
      localStorage.setItem('sandbox_loot', JSON.stringify(loot));
    } catch {}
  } else {
    uses[baitId] = next;
  }
  localStorage.setItem(BAIT_USES_KEY, JSON.stringify(uses));
  return next > 0 ? next : 0;
};

const StartFishing = ({ onBack, onStart }) => {
  const currentFishingRodId = ID_FISHING_RODS.LVL5;
  const [selectedBaitId, setSelectedBaitId] = useState(() => {
    return parseInt(localStorage.getItem(LAST_BAIT_KEY) || '0', 10) || null;
  });
  const [isBaitSelectDialog, setIsBaitSelectDialog] = useState(false);
  const [isThrowingBait, setIsThrowingBait] = useState(false);

  const { fish } = useFishing();
  const { show } = useNotification();

  const onSelectBait = (baitId) => {
    setSelectedBaitId(baitId);
    localStorage.setItem(LAST_BAIT_KEY, String(baitId));
    setIsBaitSelectDialog(false);
  };

  const onConfirmBaitAmount = async (amount) => {
    setIsThrowingBait(true);
    try {
      const result = await fish(selectedBaitId, amount);

      if (result && result.txHash) {
        // Consume one use of this bait
        const usesLeft = consumeBait(selectedBaitId);
        if (usesLeft === 0) {
          show("Bait thrown! (Last use — bait used up)", "success");
        } else {
          show(`Bait thrown! (${usesLeft} uses left)`, "success");
        }
        onStart(selectedBaitId, amount);
      } else {
        show("Failed to throw bait", "error");
      }
    } catch (error) {
      const { message } = handleContractError(error, 'throwing bait');
      show(message, "error");
    } finally {
      setIsThrowingBait(false);
    }
  };

  const baitUses = getBaitUses();
  const usesLeft = selectedBaitId ? (baitUses[selectedBaitId] ?? BAIT_MAX_USES) : null;

  return (
    <div className="start-fishing">
      <div className="tool-bar">
        <ItemBigView
          itemId={currentFishingRodId}
          onClick={() => { }}
        ></ItemBigView>
        <img className="vs" src="/images/items/left-right.png" alt="vs" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ItemBigView
            itemId={selectedBaitId}
            onClick={() => setIsBaitSelectDialog(true)}
          ></ItemBigView>
          {selectedBaitId && (
            <span style={{ fontSize: '12px', color: '#f5d87a', fontWeight: 'bold' }}>
              {usesLeft}/{BAIT_MAX_USES} uses
            </span>
          )}
        </div>
      </div>
      <div className="description">
        <LabelValueBox label="Fishing Power" value="5"></LabelValueBox>
        <LabelValueBox label="Failure Chance" value="12.5%"></LabelValueBox>
        <LabelValueBox label="Exp Reward" value="250"></LabelValueBox>
        <LabelValueBox label="Life Bud Chance" value="0.01%"></LabelValueBox>
      </div>
      <br />
      <div className="button-wrapper">
        <BaseButton label="Back" onClick={onBack} isError small className="w-50"></BaseButton>
        {selectedBaitId ? (
          <BaseButton
            label={isThrowingBait ? "Throwing..." : "Throw Bait"}
            onClick={() => onConfirmBaitAmount(1)}
            disabled={isThrowingBait}
          ></BaseButton>
        ) : (
          <BaseButton
            label="Select Bait"
            onClick={() => setIsBaitSelectDialog(true)}
          ></BaseButton>
        )}
      </div>
      {isBaitSelectDialog && (
        <SelectBaitDialog
          onClose={() => setIsBaitSelectDialog(false)}
          onSelect={onSelectBait}
        ></SelectBaitDialog>
      )}
    </div>
  );
};

export default StartFishing;
