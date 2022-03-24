<template>
  <v-container
    fluid
    tag="section"
  >
    <v-row justify="space-around">
      <v-col
        cols="6"
        class="justify-center"
      >
        <base-material-card
          class="px-5 py-3"
          color="#364d5c"
          fill-height
        >
          <template v-slot:heading>
            <div class="text-h3 font-weight-light">
              Add Products To Database
            </div>
          </template>
          <div class="data-input-layout">
            Enter list of products with code on left and product type on right.
            Separate by ";" or returns:<br>
            ARL red cells<br>
            PLAS5 plasma<br>
            APRL platelets<br>
            TCRY5 cryoppt<br>
            COHA whole blood<br>
          </div>
          <v-textarea
            v-model="productInput"
            label="Product Data"
            @keydown.tab.exact.prevent="tabber($event)"
            fill-height
            d-flex
            filled
          ></v-textarea>
          <div class="button-div d-flex justify-end">
            <v-btn
              @click="submitInput"
              color="secondary"
            >Submit</v-btn>
          </div>
        </base-material-card>
      </v-col>
      <v-col
        cols="6"
        class="justify-center"
      >
        <base-material-card
          class="px-5 py-3"
          color="#364d5c"
        >
          <template v-slot:heading>
            <div class="text-h3 font-weight-light">
              Products In Database
            </div>
          </template>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="products"
              item-key="id"
            />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { addProductsToDatabase } from '@/assets/js/productdata.js'

  export default {
    data () {
      return {
        headers: [
          {
            sortable: true,
            text: 'Product Code',
            value: 'code',
            align: 'right',
          },
          {
            sortable: true,
            text: 'Product',
            value: 'product_type',
            align: 'right',
          },
        ],
        products: [],
        productInput: '',
      }
    },
    methods: {
      getProductData () {
        this.products = []
        const cmp = this
        const database = cmp.$store.state.database
        const sql = 'SELECT * FROM product ORDER BY code ASC'
        database.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            cmp.products.push({ code: row.code, product_type: row.product_type })
          })
        })
      },
      submitInput () {
        const cmp = this
        const database = cmp.$store.state.database
        addProductsToDatabase(database, cmp.productInput)
        cmp.productInput = ''
        cmp.getProductData()
      },
      tabber (event) {
        const text = this.productInput
        const originalSelectionStart = event.target.selectionStart
        const textStart = text.slice(0, originalSelectionStart)
        const textEnd = text.slice(originalSelectionStart)

        this.productInput = `${textStart}\t${textEnd}`
        event.target.value = this.productInput // required to make the cursor stay in place.
        event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1
      },
    },
    activated () {
      this.getProductData()
    },
    mounted () {
      this.getProductData()
    },
  }
</script>

<style scoped>
  /deep/ .v-textarea {
    margin-top: 24px;
  }

  /deep/ .v-text-field__details {
    display: none;
  }

  /deep/ .data-input-layout {
    margin-top: 16px;
    padding: 16px;
    background-color: #D8DFE3;
    border-radius: 4px;
  }

  /deep/ .button-div button {
    margin-right: 0px !important;
    margin-top: 16px;
  }
</style>
