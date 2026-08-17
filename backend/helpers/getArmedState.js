import { getCurrentOccupancy, getOverride, clearOverride } from "../data/db.js";
import { resolveArmedState } from "./resolveArmedState.js";

export function getArmedState(location, today) {
  const occupancy = getCurrentOccupancy(location, today);
  const override = getOverride(location);

  return {
    armed: occupancy === null,
    occupancy: occupancy,
    activeOverride: override,
  };
}
