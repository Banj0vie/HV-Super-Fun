import React from 'react';
import PanZoomViewport from '../layouts/PanZoomViewport';
import { MARKET_VIEWPORT, MARKET_HOTSPOTS } from '../constants/market';
import { dialogFrames } from '../constants/baseimages';
import DexDialog from '../containers/Dex';
import VendorDialog from '../containers/Vendor';
import { ID_MARKET_HOTSPOTS } from '../constants/id';

const Market = () => {
  const { width, height } = MARKET_VIEWPORT;
  const hotspots = MARKET_HOTSPOTS;
  const dialogs = [
    { id: ID_MARKET_HOTSPOTS.DEX, component: DexDialog, label: 'EXCHANGE TOKENS' },
    { id: ID_MARKET_HOTSPOTS.VENDOR, component: VendorDialog, label: 'SEED SHOP', header: dialogFrames.modalHeaderSeeds },
  ];

  return (
    <PanZoomViewport backgroundSrc="/images/backgrounds/market.gif" hotspots={hotspots} dialogs={dialogs}  width={width} height={height} />
  );
}

export default Market;


