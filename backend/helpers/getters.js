import { getSetting } from "../data/db";

export function getLocation() {
  return getSetting("location_name") ?? "Unknown location";
}

export function getToday() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Brussels",
  });
}
