import type { SystemStatus } from "~/types/status";
import { formatDate } from "./formatDate";

export function formatStatus(status: SystemStatus) {
  console.log(status);
  const activeOverride = status.activeOverride;

  if (activeOverride?.state === "armed" || status.armed) {
    return "ARMED - All clear";
  }

  if (activeOverride?.state === "disarmed" || !status.armed) {
    let msg = "DISARMED";
    if (!activeOverride && status.occupancy) {
      msg += `- ${status.occupancy.occupant_name} until ${formatDate(status.occupancy.departure_date)}`;
    }
    return msg;
  }
}
