import React from "react";
import "./style.css";
import BaseButton from "../../../components/buttons/BaseButton";

const BankerMenu = ({ onStakeYieldClick, onStakeLPClick }) => {
  return (
    <div className="banker-dialog">
      <BaseButton label="Stake YIELD" onClick={onStakeYieldClick}></BaseButton>
      <BaseButton label="Stake LP" onClick={onStakeLPClick}></BaseButton>
    </div>
  );
};

export default BankerMenu;
