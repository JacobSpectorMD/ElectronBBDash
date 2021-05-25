const sqlite3 = require('sqlite3').verbose()

module.exports.createDatabase = function (dbPath) {
  const db = new sqlite3.Database(dbPath)
  db.run(`
        CREATE TABLE IF NOT EXISTS specialty(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            UNIQUE(name)
        )
    `)
  db.run(`
        CREATE TABLE IF NOT EXISTS location(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT,
            UNIQUE(code)
        )
    `)
  db.run(`
        CREATE TABLE IF NOT EXISTS product(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT,
            product_type TEXT,
            UNIQUE(code)
        )
    `)
  db.run(`
        CREATE TABLE IF NOT EXISTS provider(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            middle_name TEXT,
            last_name TEXT,
            npi INTEGER,
            specialty_id INTEGER,
            specialty_name TEXT,
            FOREIGN KEY(specialty_id) REFERENCES specialty(id),
            UNIQUE(first_name, middle_name, last_name)
        )
    `)
  db.run(`
        CREATE TABLE IF NOT EXISTS transfusion(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time INTEGER,
            date INTEGER,
            din TEXT,
            accession TEXT,
            num_units INTEGER,
            product TEXT,
            units_on_day INTEGER,
            test_type TEXT,
            test_result TEXT,
            test_accession TEXT,
            test_time INTEGER,
            indicated TEXT,
            location TEXT,
            location_id INTEGER,
            provider TEXT,
            provider_id INTEGER,
            FOREIGN KEY(location_id) REFERENCES location(id),
            FOREIGN KEY(provider_id) REFERENCES provider(id),
            UNIQUE(date, din, accession)
        )
    `)
  return db
}

module.exports.createSettingsDatabase = function (dbPath) {
  const settingsDb = new sqlite3.Database(dbPath)
  settingsDb.run(`
        CREATE TABLE IF NOT EXISTS database(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT,
            selected INTEGER,
            UNIQUE(location)
        )
    `)
  return settingsDb
}
