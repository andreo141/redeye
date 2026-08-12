export function formatRemaining(expiresAt: string, now: number) {
  const minutes = Math.ceil((new Date(expiresAt).getTime() - now) / 60_000);

  if (minutes <= 0) return "expiring";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
