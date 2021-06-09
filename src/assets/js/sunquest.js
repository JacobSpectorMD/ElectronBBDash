/* eslint-disable */
// const products_ = require('./products.js');
// const providers_ = require('./providers.js');
// const locations_ = require('./locations.js');
const fs = require('file-system');

const utilization_pattern = new RegExp('\\s*DATE\\s*TIME\\s*ACC NO.\\s*#UNITS\\s*COMPONENT');
const location_pattern = new RegExp('\\s*UNIT NO.\\s*COMPNT.\\s*Dv\\s*ACC. NO.\\s*PAT NAME/DESTINATION');

String.prototype.titleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

class Location {
    constructor(id, code) {
        this.id = id;
        this.code = code;
    }
}

class Patient {
    constructor(name, MRN){
        this.name = name;
        this.MRN = MRN;
        this.tests = [];
        this.units = [];
        this.test_codes = [];
        this.transfusions = [];
        patient_dict[MRN] = this;
    }
}

class Product {
    constructor(id, code, product_type){
        this.id = id;
        this.code = code.trim();
        this.product_type = product_type.trim();
    }
}

// Authorizing provider whose name under which blood product was ordered
class Provider {
    constructor(id, npi, last_name, first_name, middle_name, ucsf_id=''){
        this.id = id;
        this.npi = npi;
        this.last_name = last_name.trim().titleCase();
        this.first_name = first_name.trim().titleCase();
        if (!middle_name){
            this.middle_name = "";
        } else {
            this.middle_name = middle_name.trim().titleCase();;
        }
        this.ucsf_id = ucsf_id;

        if (first_name.split(' ').length > 1){
            let first_name_split = first_name.split(' ');
            this.first_name = first_name_split[0];
            let combined = '';
            for (var i = 1; i < first_name_split.length; i++){
                combined += first_name_split[i];
            }
            this.middle_name = strip(combined + middle_name);
        }
    }

    display_name(){
        let name = this.last_name+', '+this.first_name+' '+this.middle_name;
        return name.trim();
    }

    full_name(){
        return (this.first_name+this.middle_name+this.last_name).toUpperCase();
    }

    provider_string(){
        return [this.npi, this.last_name, this.first_name, this.middle, this.title, this.specialty, this.ucsf_id].join('\t');
    }
}

class Test {
    constructor(time, acc, hgb, plt, fib, hct, pro){
        this.time = time;
        this.acc = acc;
        this.hgb = hgb;
        this.plt = plt;
        this.fib = fib;
        this.hct = hct;
        this.pro = pro;
    }
}

// Blood product unit without other contextual information
class Unit {
    constructor(time, date, accession, num_units, unit_code, component, volume){
        this.time = time;
        this.date = date;
        this.acc = accession;
        this.num_units = num_units;
        this.unit_code = unit_code;
        this.component = component;
        this.volume = volume;
        this.DIN = "";
    }
}

// Used for when tests are not listed in the main summary section,
// when they are shown as (T1), (T2), etc.
class TestCode{
    constructor(code, test, value){
        this.code = code;
        this.test = test;
        this.value = value;
    }
}

// Transfusion is a blood unit with all other contextual information (lab test, etc)
class Transfusion {
    constructor(MRN, name, u_time, u_date, u_acc, DIN, num_units, u_product, threshold, t_value, t_test, t_acc, t_time, indic){
        this.MRN = MRN;
        this.name = name;
        this.u_time = u_time;
        this.u_date = u_date;
        this.u_acc = u_acc;
        this.DIN = DIN;
        this.num_units = num_units;
        this.u_product = u_product;
        this.threshold = threshold;
        this.t_value = t_value;
        this.t_test = t_test;
        this.t_acc = t_acc;
        this.t_time = t_time;
        this.indic = indic;
        this.location = "";
        this.provider = "";
        this.specialty = "";
        this.units_on_day = 0;

        this.MRN_ID = "";
        this.name_ID = "";
        this.test_ID = "";
    }
}

// Blood product information from a location report
class LocationUnit {
    constructor(date, din, accession, provider_name, location_code, provider_id=-1, location_id=-1){
        this.date = date;
        this.din = din;
        this.accession = accession;
        this.provider_name = provider_name;
        this.location_code = location_code;
        this.provider_id = provider_id;
        this.location_id = location_id;
    }
}

function strip(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

var location_dict, patient_list, patient_dict, provider_dict, product_dict;

module.exports.process = async function process(db, file) {
  try {
    location_dict = {}, patient_list = [], patient_dict = {}, provider_dict = {}, product_dict = {};
    const result = await read_data_dict(db)
    let values = determine_file_type(file);
    var file_type = values[0],
        lines = values[1];
    if (file_type == "utilization"){
      read_utilization_report(lines);
      replace_test_codes();
      find_most_recent_tests();
      add_units_per_day();
      utilization_data_to_db(db);
      return true
    } else if (file_type == "location") {
      const locationReportData = await read_location_report(db, file)
      await add_providers_to_db(db, result.providers);
      await add_locations_to_db(db, result.locations);
      await add_products_to_db(db, result.products);
      const units = locationReportData.units;
      const data = await read_data_dict(db)
      let providers = data.providers
      let locations = data.locations
      units.forEach(function(unit){
        unit.provider_id = providers[unit.provider_name].id;
        if (unit.location_code){unit.location_id = locations[unit.location_code].id;}
      })
      await add_units_to_db(db, units);
      return true
    }
  } catch (error) {
    return false
  }
}

// module.exports.process = async function process(db, file){
//     location_dict = {}, patient_list = [], patient_dict = {}, provider_dict = {}, product_dict = {};
//     read_data_dict(db)
//         .then((result) => {
//             let values = determine_file_type(file);
//             var file_type = values[0],
//                 lines = values[1];
//             if (file_type == "utilization"){
//                 read_utilization_report(lines);
//                 replace_test_codes();
//                 find_most_recent_tests();
//                 add_units_per_day();
//                 utilization_data_to_db(db);
//             } else if (file_type == "location"){
//                 let units;
//                 read_location_report(db, file)
//                     .then(function(result){
//                         add_providers_to_db(db, result.providers);
//                         add_locations_to_db(db, result.locations);
//                         add_products_to_db(db, result.products);
//                         units = result.units;
//                     })
//                     .then(() => {
//                         read_data_dict(db).then((data) => {
//                             let providers = data.providers;
//                             let locations = data.locations;
//
//                             units.forEach(function(unit){
//                                 unit.provider_id = providers[unit.provider_name].id;
//                                 if (unit.location_code){unit.location_id = locations[unit.location_code].id;}
//                             })
//                             add_units_to_db(db, units);
//                         })
//                     })
//             }
//             location_dict = {}, patient_list = [], patient_dict = {}, provider_dict = {}, product_dict = {};
//         });
// }

function determine_file_type(file){
    let lines = fs.readFileSync(file.path, "utf8");
    lines = lines.split('\n');
    for (var i = 0; i < 500; i++){
        let line = lines[i];
        if (utilization_pattern.exec(line)){return ['utilization', lines];}
        else if (location_pattern.exec(line)){return ['location', lines];}
    }
    return [null, lines];
}

function utilization_data_to_db(db){
    let sql = `INSERT INTO transfusion (time, date, mrn, din, accession, num_units, product, units_on_day, test_type, test_result, test_accession, test_time, indicated) VALUES `;
    for (var MRN in patient_dict){
        let patient = patient_dict[MRN];
        patient.transfusions.forEach(function(trfn){
            let unit_mrn = patient.MRN;
            let time = trfn.u_time.getTime();
            let date = trfn.u_date.getTime();
            let test_time = (trfn.t_time == "no recent test") ? -1 : trfn.t_time.getTime();
            if (trfn.t_value == undefined || trfn.t_value == "none"){trfn.t_value=-1};
            let values = `(${time}, ${date}, ${unit_mrn}, "${trfn.DIN}", "${trfn.u_acc}", ${trfn.num_units}, "${trfn.u_product}", ${trfn.units_on_day}, "${trfn.t_test}", ${trfn.t_value}, "${trfn.t_acc}", ${test_time}, "${trfn.indic}"), `;
            sql += values;
        })
    }
    sql = sql.replace(/.{2}$/, "");
    sql += ` ON CONFLICT(date, din, accession) DO UPDATE SET time=excluded.time,  mrn=excluded.mrn, num_units=excluded.num_units, product=excluded.product, units_on_day=excluded.units_on_day, test_type=excluded.test_type, test_result=excluded.test_result, test_accession=excluded.test_accession, test_time=excluded.test_time, indicated=excluded.indicated;`;
    db.run(sql, function(err){if(err){console.log(err)}});
}

var mrn_pattern = new RegExp('\\d{8}');
// Determine what type of section the current line is in
function what_section(line){
    line_array = line.split(/\s+/);
    let words = [];
    line_array.forEach(function(element){
        if (element != "" && !line.includes("===") && !line.includes("- - -")){
            words.push(element);
        }
    })

    if (words[0].includes("continued")){return "determine";}
    if (mrn_pattern.exec(words[0])){return "pt-info";}
    if (words[0].includes("/")){return "summary";}
    if (words[0].includes("(T")){return "labs";}
    if (words[0].includes("UNIT") || words[0].includes("(F")){return "units";}
}

function lab_value_to_num(lab){
    if(!lab.includes("credit")){
       let x = "";
       for (var i = 0; i < lab.length; i++) {
           let char = lab.charAt(i);
           if (char == "."){
               x+=char;
           } else if (!isNaN(parseInt(char))){
               x+=char;
           }
       }
       return x;
   }
}

function make_transfusion(patient, unit){
    let prod_test = {'CRYOPPT': 'fib', 'PLATELETS': 'plt', 'RED CELLS': 'hgb', 'PLASMA': 'pro', 'WHOLE BLOOD': 'hgb'};
    let thresholds = {'CRYOPPT': '<100', 'PLATELETS': '<10', 'RED CELLS': '<7', 'PLASMA': '>19', 'WHOLE BLOOD': '<7'};

    var product = unit.product_type;
    if (product.includes("unknown")){
        return new Transfusion(patient.MRN, patient.name, unit.time, unit.acc, unit.DIN, unit.num_units, product,
                           "N/A", "none", "N/A", "none", "N/A", "N/A");
    }

    var threshold = parseFloat(thresholds[product].slice(1, thresholds[product].length+1));
    var test_type = prod_test[product];

    var transfusion = new Transfusion(patient.MRN, patient.name, unit.time, unit.date, unit.acc, unit.DIN, unit.num_units, product,
                                  threshold, "none", test_type, "none", "no recent test", "N/A");

    var most_recent_test = null;

    for (var i=0; i < patient.tests.length; i++){
        var test = patient.tests[i];
        if ((test.time < unit.time) && !['', 'credit'].includes(test[test_type])){
            most_recent_test = test;
        } else if (test.time > unit.time){
            break;
        }
    }

    if (most_recent_test){
        var indicated = "no";
        test_result = most_recent_test[test_type];
        if (eval(test_result+thresholds[product])){
            indicated = "yes";
        }
        transfusion.t_value = test_result;
        transfusion.t_acc = most_recent_test.acc;
        transfusion.t_time = most_recent_test.time;
    } else {
        indicated = "N/A";
    }

    transfusion.indic = indicated;
    return transfusion;
}

function location_line_type(col){
    try {
        if (parseInt(col[0]) > 0 && col[1].includes(",")){
            return ["provider", ''];
        }
    } catch (e){}

    try {
        if (col[0][0] == "W" && !isNaN(parseInt(col[0].slice(1, 4)))){
            return ["unit", ''];
        }
    } catch (e){}

    var blood_product_types = ['CRYOPPT', 'PLASMA', 'PLATELETS', 'RED CELLS', 'BONE MARROW', 'RH', 'GRANULOCYTES',
                               'WHOLE BLOOD'];
    try {
        if (col[0] && blood_product_types.includes(col[0].trim().toUpperCase())){
            return ["product_type", col[0].trim().toUpperCase()];
        }
        var combined = col[0].trim().toUpperCase()+' '+col[1].trim().toUpperCase();
        if (col[0] && blood_product_types.includes(combined)){
            return ["product_type", combined];
        }
    } catch (e){}

    return ['', ''];
}

function product_data(db){
    return new Promise(function(resolve, reject){
        // Add product codes to dict
        sql = `SELECT * from product`;
        db.all(sql, function(err, rows){
            rows.forEach(function (row) {
                product_dict[row.code] = new Product(row.id, row.code, row.product_type);
            })
            resolve('Finished');
        })
    })
}

function location_data(db){
    return new Promise(function(resolve, reject){
        // Add product codes to dict
        sql = `SELECT * from location`;
        db.all(sql, function(err, rows){
            rows.forEach(function (row) {
                location_dict[row.code] = new Location(row.id, row.code);
            })
            resolve('Finished');
        })
    })
}

function provider_data(db){
    return new Promise(function(resolve, reject){
        // Add product codes to dict
        sql = `SELECT * from provider`;
        db.all(sql, function(err, rows){
            rows.forEach(function (row) {
                let provider = new Provider(row.id, row.npi, row.last_name, row.first_name, row.middle_name);
                provider_dict[provider.display_name()] = provider;
            })
            resolve('Finished');
        })
    })
}

function read_data_dict(db){
    return new Promise(function(resolve, reject){
        product_data(db)
            .then(() => location_data(db))
            .then(() => provider_data(db))
            .then(() => {resolve({'providers': provider_dict, 'products': product_dict, 'locations': location_dict})});
    })
}

function last_name(provider_key){
    return provider_key.split('-')[1];
}

function read_utilization_report(lines){
    let section = "start";
    let MRN_added = false;
    var MRN, name;
    var month, day, year, hour, minute;
    lines.forEach(function(line){
        if (line.includes("====")){section = "new-pt"; MRN_added = false; return;}
        if (line.includes("- - -")){section = "determine"; return;}
        if (line.trim() == ""){section = "new-page"; return;}

        let col = line.trim().split(/\s+/);
        let words = [];
        col.forEach(function(element){
            if (element != ""){words.push(element)}
        })

        if (words[0].includes("(F")){section = "units"}
        if (section == "determine" && words.length > 0){
            section = what_section(line);
            if (section == "determine"){return;}
        }
        if (section == "pt-info" && MRN_added == false){
            MRN = words[0];
            name = words[1];
            MRN_added = true;
        }

        // Pulls data from the summary section
        if (section == "summary" && line.includes("continued") && line.trim() != ""){
            if (strip(line.slice(0, 9)) != ""){
                month = parseInt(line.slice(0, 2));
                day = parseInt(line.slice(3, 5));
                year = parseInt(line.slice(6, 10));
            }
        } else if (section == "summary" && !line.includes("continued") && line.trim() != ""){
            if (line.length < 108){
                while (line.length < 108){line += " "}
            }
            if (strip(line.slice(0, 9)) != ""){
                month = parseInt(line.slice(0, 2));
                day = parseInt(line.slice(3, 5));
                year = parseInt(line.slice(6, 10));
            }
            if (strip(line.slice(12, 16)) != ""){
                hour = parseInt(line.slice(12, 14));
                minute = parseInt(line.slice(14, 16));
            }
            let time = new Date(Date.UTC(year, month-1, day, hour, minute));
            let date = new Date(Date.UTC(year, month-1, day, 0, 0, 0, 0));
            let accession = strip(line.slice(20, 26));

            if (line.slice(30, 32).trim() != ""){var num_units = parseInt(line.slice(30, 32).trim());}
            if (line.slice(33, 39).trim() != ""){var unit_code = line.slice(33, 39).trim();}
            if (line.slice(40, 45).trim() != ""){var component = line.slice(40, 46).trim();}
            if (line.slice(51, 54).trim() != ""){var volume = parseInt(line.slice(51, 54).trim());}

            var hgb = strip(line.slice(60, 68));
            var plt = strip(line.slice(70, 78));
            var fib = strip(line.slice(81, 88));
            var hct = strip(line.slice(90, 98));
            var pro = strip(line.slice(100, 108));

            // If patient exists, append test and transfusion
            // Else if new patient, create a new patient and append test and transfusion
            let found = false;
            if (patient_dict[MRN] != undefined){
                if (strip(line.slice(31, 36)) == ""){
                    patient_dict[MRN].tests.push(new Test(time, accession, hgb, plt, fib, hct, pro));
                } else if (strip(line.slice(31, 36)) != ""){
                    patient_dict[MRN].units.push(new Unit(time, date, accession, num_units, unit_code, component, volume));
                }
            } else {
                let patient = new Patient(name, MRN);
                if (strip(line.slice(31, 36)) == ""){
                    patient.tests.push(new Test(time, accession, hgb, plt, fib, hct, pro));
                } else if (strip(line.slice(31, 36)) != ""){
                    patient.units.push(new Unit(time, date, accession, num_units, unit_code, component, volume));
                }
            }
        }

        // Handles the labs section for each patient
        if (section == "labs"){
            let code = strip(col[0]);
            let test = col[1].slice(0, col[1].length - 1).trim();
            let value = strip(col[2]);
            patient_dict[MRN].test_codes.push(new TestCode(code, test, value));
        }

        if (section == "units" && line.includes("(F")){
            let unit_code = col[0];
            let DIN = col[1] + col[2] + col[3];
            patient_dict[MRN].units.forEach(function(unit){
                if (unit.unit_code == unit_code){unit.DIN = DIN;}
            })
        }
    })
}

// Replaces the test code, e.g. (T1), with it's corresponding test value e.g. 23.0
function replace_test_codes(){
    console.log("Replacing test codes [e.g. (T1)] with their values.");

    for (let MRN in patient_dict){
        let patient = patient_dict[MRN];
        patient.tests.forEach(function(test){
            patient.test_codes.forEach(function(code){
                if (test.hgb.includes('T') && code.code.includes(test.hgb)){test.hgb = code.value;}
                else if(test.plt.includes('T') && code.code.includes(test.plt)){test.plt = code.value;}
                else if(test.fib.includes('T') && code.code.includes(test.fib)){test.fib = code.value;}
                else if(test.hct.includes('T') && code.code.includes(test.hct)){test.hct = code.value;}
                else if(test.pro.includes('T') && code.code.includes(test.pro)){test.pro = code.value;}
            })
        })

        patient.tests.forEach(function(test){
            test.hgb = lab_value_to_num(test.hgb);
            test.plt = lab_value_to_num(test.plt);
            test.fib = lab_value_to_num(test.fib);
            test.hct = lab_value_to_num(test.hct);
            test.pro = lab_value_to_num(test.pro);
        })

        patient.tests.sort(function(a, b){return a.time - b.time;})
    }
}

function find_most_recent_tests(){
    console.log("Determining the relevant lab for each transfusion.");
    for (var MRN in patient_dict){
        let patient = patient_dict[MRN];
        patient.units.forEach(function(unit){
            if (product_dict[unit.component] != undefined){
                unit.product_type = product_dict[unit.component].product_type;
            } else {
                console.log("The component type " + unit.component + " needs to be added to 'Data Dictionary.text'");
                unit.product_type = "unknown code - " + unit.component
            }
            transfusion = make_transfusion(patient, unit);
            patient.transfusions.push(transfusion);
        })
    }
}

// Find the longest sub string in location_str that matches a known location.  This is done because other
// information will sometimes overlap the location, causing extra characters to be added to the location.
function get_location(location_str){
    let location = {'code': null, 'id': null};
    for (var i = location_str.length-1; i >= 0; i--){
        let new_location_text = location_str.slice(i, location_str.length).trim();
        if (location_dict[new_location_text] != undefined){
            location = location_dict[new_location_text];
        }
    }
    return location;
}

function add_provider(col){
    let ucsf_id = col[0];
    let last_name = col[1].split(',')[0];
    let first_name = col[1].split(',')[1];

    let temp_name = '';
    for (i = 1; i < col.length; i++){
        temp_name += col[i];
    }
    middle = temp_name.split(',')[1].replace(first_name, '').replace('.', '');
    let display_name = last_name+', '+first_name+' '+middle;
    display_name = display_name.trim().titleCase();

    let provider;
    if  (provider_dict[display_name] == undefined){
        provider = new Provider(-1, '', last_name, first_name, middle, ucsf_id=ucsf_id);
        provider_dict[provider.display_name()] = provider;
        return provider;
    } else {
        provider = provider_dict[display_name];
        return provider;
    }
}

function add_location(location_str){
    if (location_str.slice(0, 1).includes(' ')){
        location_str = location_str.trim();
        if (location_dict[location_str] == undefined){
            location_dict[location_str] = new Location(-1, location_str);
        }
    }
}

function add_unit(provider, location, date, col, line, blood_product_type){
    let DIN = (col[0] + col[1] + col[2]).replace(/\s+/, '');
    let accession = line.slice(55, 62).trim();
    let new_code = line.slice(38, 46).trim();
    // Add product code to database
    if (new_code != '' && product_dict[new_code] == undefined){
        product_dict[new_code] = new Product(-1, new_code, blood_product_type);
    }
    return new LocationUnit(date, DIN, accession, provider.display_name(), location.code);
}

function add_products_to_db(db, products){
    return new Promise(function(resolve, reject){
        let values = '';
        for (var code in products){
            let product = products[code];
            if (product.id == -1){
                let product_val = `("${product.code}", "${product.product_type}"),`;
                values += product_val;
            }
        }

        if (values != ''){
            values = values.replace(/.$/,";");
            let sql = `INSERT or IGNORE INTO product (code, product_type) VALUES ${values}`;
            db.run(sql, function(err){
                if (err){console.log(err)};
                resolve();
            });
        } else {
            resolve();
        }
    })
}

function add_providers_to_db(db, providers){
    return new Promise(function(resolve, reject){
        let values = '';
        for (var name in providers){
            let provider = providers[name];

            if (!provider.middle_name){var middle_name = `NULL`}
            else {var middle_name = `"${provider.middle_name}"`}
            if (provider.id == -1){
                let provider_val = `("${provider.first_name}", ${middle_name}, "${provider.last_name}"),`;
                values += provider_val;
            }
        }

        if (values != ''){
            values = values.replace(/.$/,";");
            let sql = `INSERT or IGNORE INTO provider (first_name, middle_name, last_name) VALUES ${values}`;
            db.run(sql, function(err){
                if (err){console.log(err)};
                resolve();
            });
        } else {
            resolve();
        }
    })
}

function add_locations_to_db(db, locations){
    return new Promise(function(resolve, reject){
        let values = '';
        for (var code in locations){
            let location = locations[code];
            if (location.id == -1){
                let location_val = `("${location.code}"),`;
                values += location_val;
            }
        }
        if (values != ''){
            values = values.replace(/.$/,";");
            let sql = `INSERT or IGNORE INTO location (code) VALUES ${values}`;
            db.run(sql, function(err){
                if (err){console.log(err)};
                resolve();
            });
        } else {
            resolve();
        }
    })
}

function add_units_to_db(db, units){
  let sql = `INSERT INTO transfusion (date, accession, din, provider, provider_id, location, location_id) VALUES `;
  units.forEach(function(u){
      let values = `(${u.date.getTime()}, "${u.accession}", "${u.din}", "${u.provider_name}", ${u.provider_id}, "${u.location_code}", ${u.location_id}), `
      sql += values;
  })
  sql = sql.replace(/.{2}$/, "");
  sql += ` ON CONFLICT(date, din, accession) DO UPDATE SET provider=excluded.provider, provider_id=excluded.provider_id, location=excluded.location, location_id=excluded.location_id; `
  db.run(sql, function(err) {
    if (err) {
      console.log(err)
    }
  })
}

// Adds data from the location report
function read_location_report(db, location_report){
    return new Promise(function(resolve, reject){
        console.log('Reading location report');
        let lines = fs.readFileSync(location_report.path, "utf8");
        lines = lines.split('\n');

        let blood_product_type = '';
        let date;
        let provider;
        let unit_list = [];
        for (var i = 0; i < lines.length; i++){
            let line = lines[i];
            let col = line.trim().split(/\s+/);
            let line_type = location_line_type(col);
            let location_str = line.slice(89, 99);

            if (line.includes('/')){
                try {
                    split = line.split('/');
                    let month = parseInt(split[0].trim()),
                        day = parseInt(split[1].trim()),
                        year = parseInt(split[2].trim());
                    date = new Date(Date.UTC(year, month-1, day, 0, 0, 0, 0));
                } catch {}
            } else if (line_type[0] == "product_type"){
                blood_product_type = line_type[1];
            } else if (line_type[0] == "provider"){
                provider = add_provider(col);
            } else if (line_type[0] == "unit"){
                add_location(location_str);
                let location = get_location(location_str);
                let unit = add_unit(provider, location, date, col, line, blood_product_type);
                unit_list.push(unit);
            } else if (line.includes("SUMMARY TOTALS")){
                console.log("Reached summary section of the location report.");
                break;
            }
        }
        let providers = provider_dict;
        let locations = location_dict;
        let products = product_dict;
        resolve({'providers': providers, 'locations': locations, 'products': products, 'units': unit_list});
    })
}

function just_date(time){
    return time.getFullYear()+'-'+time.getMonth()+'-'+time.getDate();
}

function add_units_per_day(){
    console.log("Adding the number of units per day and provider specialty.");
    let test_dict = {};
    let test_number = 0;

    class DITest {
        constructor(acc, ID){
            this.acc = acc;
            this.ID = ID;
            test_dict[acc] = this;
        }
    }

    let count = 0;
    for (var MRN in patient_dict){
        let patient = patient_dict[MRN];

        //Determine the number of transfusions on the same day
        patient.transfusions.forEach(function(transfusion){
            let units_on_day = 0;
            let date = just_date(transfusion.u_time);
            for (var i = 0; i < patient.transfusions.length; i++){
                let other_transfusion_date = just_date(patient.transfusions[i].u_time);
                if (date == other_transfusion_date){
                    units_on_day += patient.transfusions[i].num_units;
                }
            }
            transfusion.units_on_day = units_on_day;
        })
    }
}
