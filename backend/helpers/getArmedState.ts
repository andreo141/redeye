import { getCurrentOccupancy, getOverride, clearOverride } from "../data/db.js";
import { resolveArmedState } from "./resolveArmedState.js";

export function getArmedState(location: string, today: string) {
  const occupancy = getCurrentOccupancy(location, today);
  const override = getOverride(location);

  console.log(override);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

  return { armed: occupancy === null };
}
