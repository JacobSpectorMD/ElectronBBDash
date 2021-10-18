import { addSpecialtiesToDatabase } from './specialties.js'

export function addProvidersToDatabase (db, providerInput) {
  var enteredProviders = providerInput.replace(/\r?\n/g, ';').split(';')

  const specialtyList = {}
  for (let i = 0; i < enteredProviders.length; i++) {
    const col = enteredProviders[i].trim().split('\t')
    const specialtyName = col[3]
    if (specialtyName === undefined) { continue }
    if (specialtyList[specialtyName] === undefined) { specialtyList[specialtyName] = null }
  }

  addSpecialtiesToDatabase(db, specialtyList).then((specialtyDict) => {
    // Create a list of provider objects
    const providerList = []
    for (let i = 0; i < enteredProviders.length; i++) {
      const col = enteredProviders[i].trim().split('\t')
      if (col.length < 4) { continue }

      const p = {} // Provider
      p.firstName = col[0].trim() || null
      p.middleName = col[1].trim()
      p.lastName = col[2].trim() || null
      if (!p.firstName || !p.lastName) { continue }
      if (!col[3]) {
        p.specialtyName = null
        p.specialtyId = 'NULL'
      } else {
        p.specialtyName = col[3]
        p.specialtyId = specialtyDict[p.specialtyName]
      }
      providerList.push(p)
    }
    sqlProvidersToDatabase(db, providerList)
  })
}

function sqlProvidersToDatabase (db, providerList) {
  let values = ''
  for (let i = 0; i < providerList.length; i++) {
    const provider = providerList[i]
    let middleName
    let specialtyName
    if (!provider.middleName) {
      middleName = 'NULL'
    } else {
      middleName = `"${provider.middleName}"`
    }

    if (!provider.specialtyName) {
      specialtyName = 'NULL'
    } else {
      specialtyName = `"${provider.specialtyName}"`
    }

    const providerVal = `("${provider.firstName}", ${middleName}, "${provider.lastName}", ${specialtyName}, ${provider.specialtyId}), `
    values += providerVal
  }

  if (values !== '') {
    values = values.replace(/.{2}$/, ' ')
    const sql = `INSERT INTO provider (first_name, middle_name, last_name, specialty_name, specialty_id) VALUES ${values} ON CONFLICT (first_name, middle_name, last_name) DO UPDATE SET specialty_name=coalesce(excluded.specialty_name, specialty_name), specialty_id=coalesce(excluded.specialty_id, specialty_id);`

    db.run(sql, function (err) {
      if (err) { }
    })
  }
}
