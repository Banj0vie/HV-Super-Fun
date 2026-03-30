import React, { useMemo } from "react";

import { ID_MARKET_HOTSPOTS } from "../constants/app_ids";
import { MARKET_BEES, MARKET_HOTSPOTS, MARKET_STUFFS, MARKET_VIEWPORT } from "../constants/scene_market";
import BankerDialog from "../containers/Market_Banker";
import DexDialog from "../containers/Market_Dex";
import LeaderboardDialog from "../containers/Market_Leaderboard";
import MarketPlaceDialog from "../containers/Market_Marketplace";
import SageDialog from "../containers/Market_Sage";
import VendorDialog from "../containers/Market_Vendor";
import PanZoomViewport from "../layouts/PanZoomViewport";

const Market = () => {
  const { width, height } = MARKET_VIEWPORT;
  const hotspots = useMemo(() => MARKET_HOTSPOTS.map(h => (h.id === ID_MARKET_HOTSPOTS.DEX ? h : h)), []);
  const dialogs = [
    {
      id: ID_MARKET_HOTSPOTS.VENDOR,
      component: VendorDialog,
      label: "SEED SHOP",
      header: "/images/dialog/modal-header-vendor.png",
      headerOffset: 10,
    },
    {
      id: ID_MARKET_HOTSPOTS.BANKER,
      component: BankerDialog,
      label: "BANKER",
      header: "/images/dialog/modal-header-dex.png",
    },
    {
      id: ID_MARKET_HOTSPOTS.DEX,
      component: DexDialog,
      label: "DEX",
      header: "/images/dialog/modal-header-dex.png",
    },
    {
      id: ID_MARKET_HOTSPOTS.MARKET,
      component: MarketPlaceDialog,
      label: "MARKETPLACE",
      header: "/images/dialog/modal-header-vendor.png",
      headerOffset: 10,
    },
    {
      id: ID_MARKET_HOTSPOTS.LEADERBOARD,
      component: LeaderboardDialog,
      label: "LEADERBOARD",
      header: "/images/dialog/modal-header-leaderboard.png",
      headerOffset: 22,
    },
    {
      id: ID_MARKET_HOTSPOTS.SAGE,
      component: SageDialog,
      label: "QUEEN",
      header: "/images/dialog/modal-header-queen.png",
      headerOffset: 10,
    },
  ];
  const bees = MARKET_BEES;
  return (
    <PanZoomViewport
      backgroundSrc="/images/backgrounds/market.webp"
      hotspots={hotspots}
      dialogs={dialogs}
      width={width}
      height={height}
      stuffs={MARKET_STUFFS}
      bees={bees}
      defaultScale={1.6}
      defaultTxRate={0.95}
      defaultTyRate={0.95}
    />
  );
};

export default Market;
