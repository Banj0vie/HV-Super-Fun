import "./style.css";

import React from "react";

import { PRIZES } from "../../../constants/scene_market";
import BaseDialog from "../../_BaseDialog";

const RewardsDialog = ({ onClose }) => {
  return (
    <BaseDialog onClose={onClose} title="PRIZES" header="/images/dialog/modal-header-leaderboard.png" headerOffset={22}>
      <div className="rewards-dialog-content">
        {PRIZES.map((group, index) => (
          <div key={index} className="rewards-item-card">
            <img src="/images/label/choco-bg.png" alt="rewards-bg" className="rewards-item-bg" />
            <div className="rewards-item-wrapper">
              <span className="font-bold">{index + 1}.&nbsp;</span>
              <span>
                {group.map((prize, i) => (
                  <span key={i}>
                    {prize.count} x <span className={prize.highlighted ? "highlight" : ""}>{prize.label}</span>
                    {i < group.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </BaseDialog>
  );
};

export default RewardsDialog;
