import "./style.css";

import React, { useEffect, useState } from "react";

import CardListView from "../../components/boxes/CardListView";
import CardTopicView from "../../components/boxes/CardTopicView";
import BaseButton from "../../components/buttons/BaseButton";
import { ID_MARKETPLACE_PAGES } from "../../constants/app_ids";
import { useMarket } from "../../hooks/useMarket";
import { useSolanaWallet } from "../../hooks/useSolanaWallet";
import BaseDialog from "../_BaseDialog";
import BatchBuyDialog from "./BatchBuyDialog";
import BuyDialog from "./BuyDialog";
import SellDialog from "./SellDialog";

const initialData = [
  { label: "Trading Fee", value: "5%" },
  { label: "Total Listings", value: "0" },
  { label: "Total Sales", value: "0" },
  { label: "Volume", value: "0" },
];
const MarketPlaceDialog = ({ onClose, label = "VENDOR", header = "", headerOffset = 0 }) => {
  const [pageIndex, setPageIndex] = useState(ID_MARKETPLACE_PAGES.MARKET_PLACE_MENU);
  const [data, setData] = useState(initialData);
  const { marketData, getAllListings } = useMarket();

  useEffect(() => {
    getAllListings();
  }, [getAllListings]);

  useEffect(() => {
    setData(prev => [
      prev[0],
      { ...prev[1], value: marketData.totalListings },
      { ...prev[2], value: marketData.totalSales },
      { ...prev[3], value: marketData.totalVolume },
    ]);
  }, [marketData]);

  const { account } = useSolanaWallet();

  switch (pageIndex) {
    case ID_MARKETPLACE_PAGES.SELL:
      return <SellDialog onClose={onClose} onBack={() => setPageIndex(ID_MARKETPLACE_PAGES.MARKET_PLACE_MENU)} />;
    case ID_MARKETPLACE_PAGES.BUY:
      return (
        <BuyDialog onClose={onClose} onBack={() => setPageIndex(ID_MARKETPLACE_PAGES.MARKET_PLACE_MENU)}></BuyDialog>
      );
    case ID_MARKETPLACE_PAGES.BATCH_BUY:
      return (
        <BatchBuyDialog
          excludeSeller={account}
          onClose={onClose}
          onBack={() => setPageIndex(ID_MARKETPLACE_PAGES.MARKET_PLACE_MENU)}
        ></BatchBuyDialog>
      );
    default:
      return (
        <BaseDialog onClose={onClose} header={header} title={label} headerOffset={headerOffset}>
          <div className="marketplace-dialog">
            <BaseButton
              className="h-3rem"
              label="Sell"
              onClick={() => setPageIndex(ID_MARKETPLACE_PAGES.SELL)}
            ></BaseButton>
            <BaseButton
              className="h-3rem"
              label="Buy"
              onClick={() => setPageIndex(ID_MARKETPLACE_PAGES.BUY)}
            ></BaseButton>
            <BaseButton
              className="h-3rem"
              label="Batch Buy"
              onClick={() => setPageIndex(ID_MARKETPLACE_PAGES.BATCH_BUY)}
            ></BaseButton>
            <CardListView data={data} className="market-stats-card">
              <CardTopicView title="Market Stats" data={data}></CardTopicView>
            </CardListView>
          </div>
        </BaseDialog>
      );
  }
};

export default MarketPlaceDialog;
