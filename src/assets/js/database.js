const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')

module.exports.createDatabase = function (dbPath) {
  if (fs.existsSync(dbPath)) {
    return new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE)
  }

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
            mrn INTEGER,
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
  console.log('creating')
  const settingsDb = new sqlite3.Database(dbPath)
  console.log('created')
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

module.exports.addDatabasePath = async function (settingsDbPath, dbPath) {
  return new Promise((resolve, reject) => {
    const settingsDb = new sqlite3.Database(settingsDbPath, sqlite3.OPEN_READWRITE)

    settingsDb.run(`
        UPDATE database SET selected=0 WHERE selected=1;
    `)

    settingsDb.run(`
      INSERT INTO database (location, selected) VALUES ("${dbPath}", 1) ON CONFLICT (location) DO UPDATE SET selected=1;
    `)

    const sql = `SELECT * FROM database WHERE location="${dbPath}"`
    settingsDb.get(sql, function (err, row) {
      if (err) { console.log(err) }
      closeDatabase(settingsDb)
      resolve(row)
    })
  })
}

module.exports.setActiveDatabase = function (component, settingsDbPath, database) {
  const settingsDb = new sqlite3.Database(settingsDbPath, sqlite3.OPEN_READWRITE)

  settingsDb.run(`
    UPDATE database SET selected=0 WHERE selected=1;
  `)

  settingsDb.run(`
    UPDATE database SET selected=1 WHERE id=${database.id};
  `)
  component.$store.commit('set_database_path', database.location)
}

module.exports.getExistingDatabases = function (settingsDbPath) {
  return new Promise((resolve, reject) => {
    const settingsDb = new sqlite3.Database(settingsDbPath, sqlite3.OPEN_READWRITE)
    const sql = 'SELECT * FROM database'
    const databases = []
    settingsDb.all(sql, function (err, rows) {
      if (err) { }
      rows.forEach(function (row) {
        databases.push({
          id: row.id,
          location: row.location,
          selected: row.selected,
        })
      })
      resolve(databases)
    })
    closeDatabase(settingsDb)
  })
}

function closeDatabase (database) {
  database.close((err) => {
    if (err) { console.log(err) }
  })
}

// Removes the database file from the settings database, but does not delete the file
function removeDatabase (settingsDbPath, databaseId) {
  return new Promise((resolve, reject) => {
    const settingsDb = new sqlite3.Database(settingsDbPath, sqlite3.OPEN_READWRITE)
    const sql = `DELETE FROM database WHERE id=${databaseId}`
    settingsDb.run(sql, function (err, row) {
      closeDatabase(settingsDb)
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

// Removes the database file from the settings database, but does not delete the file
module.exports.deleteDatabase = function (settingsDbPath, databaseLocation) {
  try {
    fs.unlinkSync(databaseLocation)
  } catch (err) {
    console.log(err)
  }
}

function removeNonexistentDatabases (settingsDbPath) {
  return new Promise((resolve, reject) => {
    const settingsDb = new sqlite3.Database(settingsDbPath, sqlite3.OPEN_READWRITE)
    const sql = 'SELECT * FROM database'
    settingsDb.all(sql, function (err, rows) {
      if (err) { reject(err) }

      rows.forEach(function (row) {
        if (!fs.existsSync(row.location)) {
          removeDatabase(settingsDbPath, row.id)
        }
      })
      resolve(true)
    })
  })
}

module.exports.closeDatabase = closeDatabase
module.exports.removeDatabase = removeDatabase
module.exports.removeNonexistentDatabases = removeNonexistentDatabases
