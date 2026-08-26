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

db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    setting_key   TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS overrides (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  location        TEXT NOT NULL UNIQUE,
  state           TEXT NOT NULL,
  set_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at      DATETIME
  )
  `);

export function getSetting(key) {
  const setting = db
    .query("SELECT setting_value FROM settings WHERE setting_key = ?")
    .get(key);
  return setting?.setting_value;
}

export function setSetting(key, value) {
  db.run(
    `
    INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) 
    ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?
    `,
    [key, value, value],
  );
}

export function getOverride(location) {
  return (
    db
      .query(
        `
      SELECT * FROM overrides
      WHERE location = ?
      `,
      )
      .get(location) ?? null
  );
}

export function setOverride(location, state, expires_at) {
  db.run(
    `
    INSERT INTO overrides (location, state, expires_at) VALUES (?, ?, ?)
    ON CONFLICT(location) DO UPDATE SET
      state = ?,
      set_at = CURRENT_TIMESTAMP,
      expires_at = ?
    `,
    [location, state, expires_at, state, expires_at],
  );
}

export function clearOverride(location) {
  db.run(
    `
    DELETE FROM overrides WHERE location = ?
    `,
    [location],
  );
}

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

export function getCurrentOccupancy(location, today) {
  return (
    db
      .query(
        `
        SELECT * FROM occupancies
        WHERE location = ?
        AND ? BETWEEN arrival_date AND departure_date
        LIMIT 1
        `,
      )
      .get(location, today) ?? null
  );
}

export function deleteOccupancy(id) {
  db.run("DELETE FROM occupancies WHERE id = ?", [id]);
}
