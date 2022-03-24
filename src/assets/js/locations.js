export function addLocationsToDatabase (db, input) {
  const enteredLocations = input.replace(/\r?\n/g, ';').split(';')

  enteredLocations.forEach(function (location) {
      location = location.trim()
      if (location === '') { return }
      var sql = `SELECT * FROM location WHERE code = ${location} COLLATE NOCASE`
      db.get(sql, function (err, row) {
        if (err) { }
        if (!row) {
          addLocationToDatabase(db, location)
        }
      })
    })
}

export function removeLocationFromDatabase (db, location) {

}

function addLocationToDatabase (db, location) {
  db.run(`INSERT or IGNORE INTO location (code) VALUES ("${location}")`)
}
