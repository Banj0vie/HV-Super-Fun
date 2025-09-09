import React from 'react';
import PanZoomViewport from '../layouts/PanZoomViewport';
import { MARKET_VIEWPORT, MARKET_HOTSPOTS } from '../constants/market';

const Market = () => {
  const { width, height } = MARKET_VIEWPORT;
  const hotspots = MARKET_HOTSPOTS;

  return (
    <PanZoomViewport backgroundSrc="/images/backgrounds/market.gif" hotspots={hotspots} width={width} height={height} />
  );
}

export default Market;


