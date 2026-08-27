import { clearOverride, getCurrentOccupancy, getOverride } from "../data/db.js";

export function getArmedState(location, today) {
  const occupancy = getCurrentOccupancy(location, today);
  const override = getOverride(location);

  const overrideExpired =
    override?.expires_at != null &&
    new Date(override.expires_at).getTime() - Date.now() <= 0;

  if (overrideExpired) clearOverride(location); // FIXME: consider refactoring this. Delete action inside read function

  const activeOverride = overrideExpired ? null : override;
  const isPropertyUnoccupied = occupancy === null;

  const armed = !activeOverride
    ? isPropertyUnoccupied
    : activeOverride.state === "armed";

  return {
    armed: armed,
    occupancy: occupancy,
    override: activeOverride,
  };
}
