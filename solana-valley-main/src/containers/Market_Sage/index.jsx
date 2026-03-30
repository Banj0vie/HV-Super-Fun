import "./style.css";

import React, { useState } from "react";

import { ID_SAGE_PAGES } from "../../constants/app_ids";
import BaseDialog from "../_BaseDialog";
import SageMenu from "./SageMenu";
import WeeklyHarvest from "./WeeklyHarvest";
import WeeklyWage from "./WeeklyWage";

const SageDialog = ({ onClose, label = "VENDOR", header = "", headerOffset = 0 }) => {
  const [pageIndex, setPageIndex] = useState(ID_SAGE_PAGES.SAGE_MENU);
  return (
    <BaseDialog onClose={onClose} title={label} header={header} headerOffset={headerOffset}>
      {pageIndex === ID_SAGE_PAGES.SAGE_MENU && (
        <SageMenu
          onWeeklyWage={() => setPageIndex(ID_SAGE_PAGES.WEEKLY_WAGE)}
          onWeeklyHarvest={() => setPageIndex(ID_SAGE_PAGES.WEEKLY_HARVEST)}
        ></SageMenu>
      )}
      {pageIndex === ID_SAGE_PAGES.WEEKLY_WAGE && (
        <WeeklyWage onBack={() => setPageIndex(ID_SAGE_PAGES.SAGE_MENU)}></WeeklyWage>
      )}
      {pageIndex === ID_SAGE_PAGES.WEEKLY_HARVEST && (
        <WeeklyHarvest onBack={() => setPageIndex(ID_SAGE_PAGES.SAGE_MENU)}></WeeklyHarvest>
      )}
    </BaseDialog>
  );
};

export default SageDialog;
