import type { SystemStatus } from "~/types/status";
import { formatDate } from "./formatDate";

export function formatStatus(status: SystemStatus) {
  if (status.armed) return "ARMED - All clear";
  if (!status.occupancy) return "DISARMED";

  return `DISARMED - ${status.occupancy.occupant_name} until ${formatDate(status.occupancy.departure_date)}`;
}
