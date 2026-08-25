import type { SystemStatus } from "~/types/status";
import { formatDate } from "./formatDate";

export function formatStatus(status: SystemStatus) {
  const override = status.override;
  const occupancy = status.occupancy;
  const hasOverride = override !== null;
  const hasOccupancy = occupancy !== null;

  if (!hasOverride && !hasOccupancy) {
    return "ARMED - All clear";
  }

  if (!hasOverride && hasOccupancy) {
    return `DISARMED - Occupied by ${occupancy.occupant_name} until ${formatDate(occupancy.departure_date)}`;
  }

  if (hasOverride && !hasOccupancy && override.expires_at) {
    const minutesRemaining =
      Math.floor(
        (new Date(override.expires_at).getTime() - Date.now()) / 60000,
      ) + 1;
    return `DISARMED - ${minutesRemaining} minutes remaining`;
  }

  if (hasOverride && hasOccupancy) {
    return `ARMED - Set during occupancy from ${occupancy.occupant_name}`;
  }

  return "Something went wrong while fetching the status of the property";
}
