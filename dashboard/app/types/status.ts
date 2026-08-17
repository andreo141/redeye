import type { Occupancy } from "./occupancy";
import type { Override } from "./override";

export type SystemStatus = {
  armed: boolean;
  occupancy: Occupancy | null;
  activeOverride: Override | null;
};
