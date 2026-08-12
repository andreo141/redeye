import { getCurrentOccupancy, getOverride, clearOverride } from "../data/db.js";
import { resolveArmedState } from "./resolveArmedState.js";

export function getArmedState(location, today) {
  const occupancy = getCurrentOccupancy(location, today);
  const override = getOverride(location);

  const overrideExpired =
    override?.expires_at != null &&
    Date.now() >= new Date(override.expires_at).getTime();

  if (overrideExpired) clearOverride(location);

  const armed = resolveArmedState(
    occupancy === null,
    overrideExpired ? null : override,
  );

  return { armed, occupancy };
}
