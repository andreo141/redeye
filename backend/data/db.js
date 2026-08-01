import { Database } from "bun:sqlite";

const db = Database.open("./data/redeye.db");

db.run(`
  CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor     TEXT NOT NULL,
    location   TEXT NOT NULL,
    photo_url  TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS occupancies (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    location        TEXT NOT NULL,
    occupant_name   TEXT NOT NULL,
    arrival_date    TEXT NOT NULL,
    departure_date  TEXT NOT NULL
  )`);

export function getAlerts(limit = 20) {
  return db
    .query("SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?")
    .all(limit);
}

export function getOccupancies(limit = 20) {
  return db
    .query("SELECT * FROM occupancies ORDER BY arrival_date DESC LIMIT ?")
    .all(limit);
}

export function storeAlert(sensor, location, photoUrl = null) {
  db.run("INSERT INTO alerts (sensor, location, photo_url) VALUES (?, ?, ?)", [
    sensor,
    location,
    photoUrl,
  ]);
}

export function storeOccupancy(
  location,
  occupantName,
  arrivalDate,
  departureDate,
) {
  db.run(
    "INSERT INTO occupancies (location, occupant_name, arrival_date, departure_date) VALUES (?, ?, ?, ?)",
    [location, occupantName, arrivalDate, departureDate],
  );
}

export function isLocationOccupied(location, today) {
  const result = db
    .query(
      `
      SELECT * FROM occupancies 
      WHERE location = ?
      AND ? BETWEEN arrival_date AND departure_date
      LIMIT 1
      `,
    )
    .all(location, today);

  return result.length > 0;
}

export function deleteOccupancy(id) {
  db.run("DELETE FROM occupancies WHERE id = ?", [id]);
}
