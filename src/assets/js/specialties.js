export function addSpecialtiesToDatabase (db, specialtyDict) {
  return new Promise(function (resolve, reject) {
    let values = ''
    for (var name in specialtyDict) {
        values += `("${name}"),`
    }
    if (values.length === 0) { return }

    let sql = `INSERT or IGNORE INTO specialty (name) VALUES ${values}`
    sql = sql.replace(/.$/, ';')
    db.run(sql, function (err) {
      if (err) { }
      const specialtyQuery = 'SELECT * FROM specialty'
      db.all(specialtyQuery, function (err, rows) {
        if (err) { }
        const updatedSpecialtyDict = {}
        rows.forEach(function (row) {
            updatedSpecialtyDict[row.name] = row.id
        })
        resolve(updatedSpecialtyDict)
      })
    })
  })
}
