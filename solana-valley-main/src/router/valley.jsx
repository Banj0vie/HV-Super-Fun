import React from "react";

import { VALLEY_HOTSPOTS, VALLEY_VIEWPORT } from "../constants/scene_valley";
import PanZoomViewport from "../layouts/PanZoomViewport";
const Valley = () => {
  const { width, height } = VALLEY_VIEWPORT;
  const hotspots = VALLEY_HOTSPOTS;

  return (
    <PanZoomViewport
      backgroundSrc="/images/backgrounds/valley.webp"
      hotspots={hotspots}
      dialogs={[]}
      width={width}
      height={height}
      isBig
      defaultScale={0.5}
      defaultTxRate={1.01}
    />
  );
};

export default Valley;
