import type { Occupancy } from "./occupancy";

export type SystemStatus = {
  armed: boolean;
  occupancy: Occupancy | null;
};
