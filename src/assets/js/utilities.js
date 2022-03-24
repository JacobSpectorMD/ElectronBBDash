/* eslint-disable */

const sunquest_ = require('./sunquest.js')

export default async function processFile (db, file) {
  const result = await sunquest_.process(db, file)
  console.log(result)
  return result
}

function parseTabbedTransfusion(line){
  var data = {};
  var col = line.split('\t');
  data.mrn = col[0];
  data.name = col[1];
  data.transfusions_on_day = col[2];
  data.date = col[3];
  data.time = col[4];
  data.din = col[5];
  data.num_products = col[6]
  data.product = col[7];
  data.test_result = col[9];
  data.test_type = col[10];
  data.test_accession = col[11];
  return data;
}


function addTransfusionToDatabase(data){

  var values = "("+din+", "+product+")"

  db.run(`INSERT INTO transfusion (din, product) VALUES ("${din}", "${product}");`)
}
