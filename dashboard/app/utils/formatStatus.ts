import type { SystemStatus } from "~/types/status";
import { formatDate } from "./formatDate";
import { formatRemaining } from "./formatRemaining";

export function formatStatus(status: SystemStatus, now: number) {
  const { armed, occupancy, override } = status;

  if (!armed && override?.state === "disarmed" && override.expires_at) {
    return `DISARMED - ${formatRemaining(override.expires_at, now)} remaining`;
  }

  if (armed) return "ARMED - All clear";
  if (!occupancy) return "DISARMED";

  return `DISARMED - ${occupancy.occupant_name} until ${formatDate(occupancy.departure_date)}`;
}
