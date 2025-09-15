import React, { useState } from "react";
import "./style.css";
import BaseDialog from "../BaseDialog";
import BankerMenu from "./BankerMenu";
import { ID_BANKER_PAGES } from "../../constants/app_ids";
import StakeYield from "./StakeYield";
import StakeLP from "./StakeLP";

const BankerDialog = ({ onClose, label = "VENDOR", header = "" }) => {
  const [bankerPage, setBankerPage] = useState(ID_BANKER_PAGES.BANKER_MENU);
  return (
    <BaseDialog onClose={onClose} title={label} header={header}>
      {bankerPage === ID_BANKER_PAGES.BANKER_MENU && (
        <BankerMenu
          onStakeYieldClick={() => setBankerPage(ID_BANKER_PAGES.STAKE_YIELD)}
          onStakeLPClick={() => setBankerPage(ID_BANKER_PAGES.STAKE_LP)}
        ></BankerMenu>
      )}
      {bankerPage === ID_BANKER_PAGES.STAKE_YIELD && <StakeYield />}
      {bankerPage === ID_BANKER_PAGES.STAKE_LP && <StakeLP />}
    </BaseDialog>
  );
};

export default BankerDialog;
