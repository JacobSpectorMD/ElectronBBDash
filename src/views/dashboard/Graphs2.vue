<template>
  <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <base-material-card
          class="px-5 py-3"
          color="#364d5c"
        >
          <template v-slot:heading>
            <v-tabs
              v-model="tabs"
              background-color="transparent"
              slider-color="white"
            >
              <v-tab
                class="mr-3"
                @click="setGraphMode('Products')"
              >
                <v-icon class="mr-2">
                  mdi-water
                </v-icon>
                Products
              </v-tab>
              <v-tab
                class="mr-3"
                @click="setGraphMode('Providers')"
              >
                <v-icon class="mr-2">
                  mdi-account
                </v-icon>
                Providers
              </v-tab>
            </v-tabs>
          </template>

          <v-card-text>
            <v-row
              align="center"
            >
              <v-col cols="2">
                <v-select
                  v-model="productType"
                  :items="products"
                  item-value="value"
                  item-text="label"
                  label="Product Type"
                />
              </v-col>
              <v-col cols="1">
                <v-select
                  v-model="selectedLocation"
                  :items="locations"
                  label="Location"
                  clearable
                />
              </v-col>
              <v-col cols="2">
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      ref="startDateInput"
                      v-model="startDate"
                      label="Start Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      clearable
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="startDate"
                    margin-top="0"
                    margin-bottom="0"
                    @input="menu = false"
                  />
                </v-menu>
              </v-col>
              <v-col cols="2">
                <v-menu
                  v-model="menu2"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      ref="endDateInput"
                      v-model="endDate"
                      label="End Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      clearable
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>
                  <v-date-picker
                    v-model="endDate"
                    margin-top="0"
                    margin-bottom="0"
                    @input="menu2 = false"
                  />
                </v-menu>
              </v-col>
              <v-col
                v-if="graphMode === 'Providers'"
                cols="1"
              >
                <v-checkbox
                  v-model="anonymize"
                  label="Anonymous"
                  color="secondary"
                  value="Anonymous"
                  margin="0"
                  hide-details
                />
              </v-col>
              <v-col cols="1">
                <v-btn
                  color="primary"
                  elevation="2"
                  @click="submitGraph()"
                >
                  Graph
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <base-material-card
          v-for="graph in graphs"
          :key="getGraphId(graph.id)"
          :id="'graph'+graph.id"
          color="#687A85"
        >
          <template v-slot:heading>
            <div class="text-h3 font-weight-light">
              {{ graph.productType }}
            </div>
          </template>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  // import $ from 'jquery'
  import addSwarm from '../../assets/js/graph-utils.js'
  export default {
    name: 'Graphs',

    data () {
      return {
        endDate: '',
        graphIds: [0, 1, 2],
        graphs: [],
        graphMode: 'Products',
        productGraphs: [],
        startDate: '',
        selectedLocation: '',
        locations: [],
        menu: false,
        menu2: false,
        products: [
          {
            label: 'All Products',
            value: 'ALL',
          },
          {
            label: 'Cryoprecipitate',
            value: 'CRYOPPT',
          },
          {
            label: 'Plasma',
            value: 'PLASMA',
          },
          {
            label: 'Platelets',
            value: 'PLATELETS',
          },
          {
            label: 'Red Cells',
            value: 'RED CELLS',
          },
        ],
        productType: 'ALL',
        tabs: 0,
        index: 0,
      }
    },
    mounted () {
      const cmp = this
      if (this.locations.length === 0) {
        const sql = 'SELECT * FROM location ORDER BY code ASC'
        this.$db.all(sql, function (err, rows) {
          if (err) { console.log(err) }
          rows.forEach(function (row) {
            cmp.locations.push(row.code)
          })
        })
      }
    },
    computed: {
      getGraphs () {
        return this.graphs.filter(graph => graph.draw === true)
      },
    },
    methods: {
      clearGraphs () {
        this.graphs.length = 0
      },
      complete (index) {
        this.list[index] = !this.list[index]
      },
      submitGraph () {
        this.clearGraphs()
        const cmp = this
        const productType = this.productType
        const location = this.selectedLocation
        const startDate = this.$refs.startDateInput.value
        const endDate = this.$refs.endDateInput.value

        if (productType === 'ALL') {
          let i = this.index
          cmp.products.forEach(function (product) {
            if (product.value === 'ALL') {
              return
            }
            cmp.graphs.push({
              productType: product.value,
              graphLabel: product.label,
              id: i,
            })
            i++
            cmp.index = i
          })
        } else {
          const product = cmp.products.find(product => product.value === productType)
          cmp.graphs.push({
            productType: product.value,
            graphLabel: product.label,
            id: 0,
          })
        }

        this.getTransfusionData(productType, '', location, startDate, endDate)
          .then(function (rows) { cmp.drawGraphs(rows, productType) })
      },
      drawGraphs (rows, productType) {
        const cmp = this
        cmp.graphs.forEach(function (graph) {
          const filteredRows = rows.filter(x => x.product === graph.productType)
          addSwarm(filteredRows, graph.productType, 'graph' + graph.id)
        })
      },
      setGraphMode (mode) {
        this.graphMode = mode
      },
      getTransfusionData (productType, specialty, location, startDateText, endDateText) {
        const cmp = this
        return new Promise(function (resolve, reject) {
          const parameters = []
          if (productType !== 'ALL') {
            parameters.push(`t.product="${productType}"`)
          }
          if (location !== '') {
            parameters.push(`t.location="${location}"`)
          }
          if (specialty !== '') {
            parameters.push(`p.specialty_name="${specialty}"`)
          }
          if (startDateText) {
            const split = startDateText.split('-')
            const year = split[0]
            const month = split[1]
            const day = split[2]
            const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
            parameters.push(`t.time>=${startDate.getTime()}`)
          }
          if (endDateText) {
            const split = endDateText.split('-')
            const year = parseInt(split[0])
            const month = parseInt(split[1])
            const day = parseInt(split[2])
            const endDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
            parameters.push(`t.time<=${endDate.getTime()}`)
          }
          let sql = 'SELECT *  FROM transfusion AS t INNER JOIN provider AS p ON p.id=t.provider_id'
          for (let i = 0; i < parameters.length; i++) {
            if (i === 0) {
              sql += ' WHERE ' + parameters[i]
            } else {
              sql += ' AND ' + parameters[i]
            }
          }
          const testDict = { fib: 'Fibrinogen', pro: 'PT', hgb: 'Hemoglobin', plt: 'Platelets' }
          cmp.$db.all(sql, function (err, rows) {
            if (err) {
              console.log(err)
            }
            const filteredRows = []
            rows.forEach(function (row) {
              if (row.test_result !== '-1' && row.product) {
                row.value = parseFloat(row.test_result)
                row.color = '#0094BA'
                row.test = testDict[row.test_type]
                filteredRows.push(row)
              }
            })
            resolve(filteredRows)
          })
        })
      },
    },
  }
</script>

<style>
  div.v-input--selection-controls {
    margin-top: 0px;
  }
  div.tooltip {
    position: absolute;
    text-align: center;
    padding: 16px;
    font-size: 14px;
    background: #4c6b7f;
    border: 0px;
    border-radius: 4px;
    pointer-events: none;
    color: white;
    z-index: 2;
  }

  .tip-table > tr.label {
    text-align: right;
  }
  .tip-table td.value {
    text-align: left;
  }
</style>
