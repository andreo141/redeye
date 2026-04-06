import { Database } from "bun:sqlite";

const db = Database.open("./redeye.db");

db.run(`
  CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor     TEXT NOT NULL,
    location   TEXT NOT NULL,
    photo_url  TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export function storeAlert(sensor, location, photoUrl = null) {
  db.run("INSERT INTO alerts (sensor, location, photo_url) VALUES (?, ?, ?)", [
    sensor,
    location,
    photoUrl,
  ]);
}

export function getAlerts(limit = 20) {
  return db
    .query("SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?")
    .all(limit);
}
