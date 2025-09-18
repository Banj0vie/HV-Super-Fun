import React, { useState } from "react";
import "./style.css";
import BaseDialog from "../BaseDialog";
import CardView from "../../components/boxes/CardView";
import LabelValueBox from "../../components/boxes/LabelValueBox";
import BaseButton from "../../components/buttons/BaseButton";

const GardnerDialog = ({ onClose, label = "GARDNER", header = "" }) => {
  const [level, setLevel] = useState(0);
  const onLvlUp = () => {
    setLevel((prev) => prev + 1);
  };
  return (
    <BaseDialog onClose={onClose} title={label}>
      <div className="gardner-dialog-content">
        <CardView className="p-0">
          <div className="gardner-card">
            <LabelValueBox
              label="Farm Plots"
              value={level + 15}
            ></LabelValueBox>
            <LabelValueBox
              label="Harvest Bonus"
              value={`${level * 0.25}%`}
            ></LabelValueBox>
            <LabelValueBox
              label="Fishing Rod Level"
              value={Math.floor(level / 3)}
            ></LabelValueBox>
            <div className="gardner-header">Valley Lvl. {level}</div>
          </div>
        </CardView>
        {level < 15 && (
          <CardView className="p-0">
            <div className="gardner-card">
              <LabelValueBox
                label="Farm Plots"
                value={level + 1 + 15}
              >
                <span className="font-strike opacity-7">{level + 15}<span className="blue-right-triangle"></span></span>
              </LabelValueBox>
              <LabelValueBox
                label="Harvest Bonus"
                value={`${(level + 1) * 0.25}%`}
              >
                <span className="font-strike opacity-7">{`${(level) * 0.25}%`}<span className="blue-right-triangle"></span></span>
              </LabelValueBox>
              <LabelValueBox
                label="Fishing Rod Level"
                value={Math.floor((level + 1) / 3)}
              >
                <span className="font-strike opacity-7">{Math.floor((level) / 3)}<span className="blue-right-triangle"></span></span>
              </LabelValueBox>
              <LabelValueBox
                label="cost"
                value={100 + level * 40}
              ></LabelValueBox>
              <div className="gardner-header">Valley Lvl. {level + 1}</div>
            </div>
          </CardView>
        )}
        {level === 15 ? (
          <CardView className="p-0">
            <br />
            <div className="text-center font-bold">Max level reached</div>
          </CardView>
        ) : (
          <BaseButton
            className="h-3rem upgrade-valley-button"
            label="Upgrade Valley"
            onClick={onLvlUp}
          ></BaseButton>
        )}
      </div>
    </BaseDialog>
  );
};

export default GardnerDialog;
