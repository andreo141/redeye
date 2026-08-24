import type { SystemStatus } from "~/types/status";
import { formatDate } from "./formatDate";

export function formatStatus(status: SystemStatus) {
  const armed = status.armed;
  const override = status.override;

  if (!override && armed) {
    return "ARMED - All Clear";
  } else if (!override && !armed && status.occupancy) {
    return `DISARMED - Occupied by ${status.occupancy?.occupant_name.toUpperCase()} until ${formatDate(status.occupancy?.departure_date)}`;
  } else if (override?.state === "armed") {
    return `ARMED - Set during occupancy from ${status.occupancy?.occupant_name.toUpperCase()}`;
  } else if (override?.expires_at) {
    const overrideMinutesRemaining = Math.floor(
      (new Date(override.expires_at).getTime() - Date.now()) / 60000 + 1,
    );
    return `DISARMED - Temporary for ${overrideMinutesRemaining} minutes`;
  }
}
