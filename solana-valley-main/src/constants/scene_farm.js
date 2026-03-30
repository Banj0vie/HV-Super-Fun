import { ID_FARM_HOTSPOTS } from "./app_ids";

export const FARM_VIEWPORT = {
  width: 960,
  height: 480,
};

export const FARM_HOTSPOTS = [{ id: ID_FARM_HOTSPOTS.FARMER, label: "FARMER", x: 400, y: 150, delay: 0 }];

export const FARM_BEES = [
  {
    image: "/images/bees/bee_2.png",
    x: 425,
    y: 200,
    flip: false,
    delay: 0,
  },
];
// Left plot positioning
export const FARM_LEFT_PLOT_START_X = 108;
export const FARM_LEFT_PLOT_START_Y = 116;
export const FARM_LEFT_PLOT_WIDTH = 320; // 5 columns * 64px
export const FARM_LEFT_PLOT_HEIGHT = 192; // 3 rows * 64px

// Right plot positioning
export const FARM_RIGHT_PLOT_START_X = 525; // Moved further left to reduce empty space
export const FARM_RIGHT_PLOT_START_Y = 120;
export const FARM_RIGHT_PLOT_WIDTH = 320; // 5 columns * 64px
export const FARM_RIGHT_PLOT_HEIGHT = 192; // 3 rows * 64px

// Central path
export const FARM_CENTRAL_PATH_X = 460; // Between the two plots
export const FARM_CENTRAL_PATH_Y = 116;
export const FARM_CENTRAL_PATH_WIDTH = 40;

// Individual crop dimensions
export const FARM_CROP_WIDTH = 64;
export const FARM_CROP_HEIGHT = 64;
export const FARM_GRID_COLS = 5; // 5 columns per plot
export const FARM_GRID_ROWS = 3; // 3 rows per plot

// Total plots per side
export const FARM_PLOTS_PER_SIDE = 15; // 5 * 3
export const FARM_TOTAL_PLOTS = 30; // 15 * 2

export const FARM_POSITIONS = [
  { left: 212, top: 46 },
  { left: 128, top: 46 },
  { left: 241, top: 99 },
  { left: 170, top: 99 },
  { left: 98, top: 99 },
  { left: 286, top: 150 },
  { left: 228, top: 150 },
  { left: 170, top: 150 },
  { left: 111, top: 150 },
  { left: 52, top: 150 },
  { left: 241, top: 202 },
  { left: 170, top: 202 },
  { left: 98, top: 202 },
  { left: 212, top: 255 },
  { left: 128, top: 255 },
  { left: 655, top: 46 },
  { left: 571, top: 46 },
  { left: 684, top: 99 },
  { left: 613, top: 99 },
  { left: 541, top: 99 },
  { left: 729, top: 150 },
  { left: 671, top: 150 },
  { left: 613, top: 150 },
  { left: 554, top: 150 },
  { left: 495, top: 150 },
  { left: 684, top: 202 },
  { left: 613, top: 202 },
  { left: 541, top: 202 },
  { left: 655, top: 255 },
  { left: 571, top: 255 },
];
