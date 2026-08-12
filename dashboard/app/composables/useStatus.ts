import type { SystemStatus } from "~/types/status";

export function useStatus() {
  const status = useState<SystemStatus | null>("system-status", () => null);

  async function refresh() {
    status.value = await $fetch<SystemStatus>("/api/status");
  }

  return { status, refresh };
}
