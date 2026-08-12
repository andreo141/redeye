export function resolveArmedState(calendarArmed, override) {
  if (!override) return calendarArmed;
  return override.state === "armed";
}
