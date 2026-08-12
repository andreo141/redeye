export function getToday() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Brussels",
  });
}
