export function addProductsToDatabase (db, input) {
  const enteredProducts = input.replace(/\r?\n/g, ';').split(';')

  enteredProducts.forEach(function (productLine) {
    if (!productLine.trim()) { return }
    const product = { code: '', productType: '' }
    const col = productLine.split(/\s+/)
    product.code = col[0].trim()

    // Determine product type from the right side of the input
    let colRight = ''
    for (let i = 1; i < col.length; i++) { colRight += col[i] }
    colRight = colRight.toLowerCase()

    if (colRight.includes('red')) {
      product.productType = 'RED CELLS'
    } else if (colRight.includes('plate')) {
      product.productType = 'PLATELETS'
    } else if (colRight.includes('plasma')) {
      product.productType = 'PLASMA'
    } else if (colRight.includes('cryo')) {
      product.productType = 'CRYOPPT'
    } else if (colRight.includes('whole')) {
      product.productType = 'WHOLE BLOOD'
    } else if (colRight.includes('marr')) {
      product.productType = 'MARROW'
    } else if (colRight.includes('gran')) {
      product.productType = 'GRANULOCYTES'
    } else if (colRight.includes('rh')) {
      product.product_type = 'RHOGAM'
    }

    // Don't insert blank values, it messes up the graphs
    if (product.code.trim() === '' || product.productType.trim() === '') { return }
    var sql = `SELECT * FROM product WHERE code = ${product.code} COLLATE NOCASE`
    db.get(sql, function (err, row) {
      if (err) { }
      if (!row) {
        addProductToDatabase(db, product.code, product.productType)
      }
    })
  })
}

function addProductToDatabase (db, code, productType) {
  db.run(`INSERT or IGNORE INTO product (code, product_type) VALUES ("${code}", "${productType}")`)
}

//
// var products_to_remove = [];
// $(document).on('click', '#existing-products-list .list-item', function(){
//     var checkbox = $(this).find('.list-item-checkbox');
//
//     if ($(checkbox).prop("checked") == true){
//         $(checkbox).prop("checked", false);
//         var index = products_to_remove.indexOf(this);
//         if (index > -1) {products_to_remove.splice(index, 1);}
//     } else {
//         $(checkbox).prop("checked", true);
//         products_to_remove.push(this);
//     }
// })
//
// // Remove selected products from the database
// $(document).on('click', '#remove-products-button', function(){
//     products_to_remove.forEach(function(item_div){
//         var product_code = $(item_div).find('.list-item-text').text();
//         var sql = `DELETE FROM product WHERE code = '${product_code}' COLLATE NOCASE`;
//         db.run(sql, function(err){ if (err){console.log(err)}});
//         $(item_div).remove();
//     });
// })
