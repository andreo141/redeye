import { getCurrentOccupancy, getOverride } from "../data/db.js";

export function getArmedState(location, today) {
  const occupancy = getCurrentOccupancy(location, today);
  const override = getOverride(location);

  return {
    armed: occupancy === null,
    occupancy: occupancy,
    activeOverride: override,
  };
}
