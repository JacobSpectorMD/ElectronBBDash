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
                  :items="getProducts"
                  item-value="value"
                  item-text="label"
                  label="Product Type"
                />
              </v-col>
              <v-col cols="2">
                <v-select
                  v-model="selectedSpecialty"
                  :items="specialties"
                  label="Specialty"
                  clearable
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
                  <template
                    v-slot:activator="{ on, attrs }"
                  >
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
                    class="ma-0"
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
                    class="ma-0"
                    @input="menu2 = false"
                  />
                </v-menu>
              </v-col>
              <transition name="grow">
                <v-col
                  v-if="graphMode === 'Providers'"
                  cols="2"
                >
                  <v-checkbox
                    v-model="anonymous"
                    label="Anonymous"
                    color="secondary"
                    value="Anonymous"
                    margin="0"
                    hide-details
                  />
                </v-col>
              </transition>
              <v-col cols="2">
                <v-btn
                  color="primary"
                  elevation="2"
                  @click="submitGraph('graphButton')"
                >
                  Graph
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
    <router-view />
    <v-row>
      <v-col v-show="!provider">
        <product-graph
          v-for="graph in graphsBeingViewed"
          :id="graph.id"
          :key="graph.productType + graph.time"
          :graph-label="graph.graphLabel"
          :mode="graphMode"
          :product-type="graph.productType"
          :transfusions="graph.transfusions"
          :anonymous="anonymous"
          :specialty="specialty"
          :graphType="graphType"
          @sentProviderInfo="showProviderInfo"
          @showSelectedUnits="showSelectedUnits"
          @specialtyComparison="specialtyComparison"
          @backToAllProviders="graphType = 'Providers'"
          color="#687A85"
        />
      </v-col>
      <v-col v-if="provider">
        <selected-units
          back-text="Back to Provider Graphs"
          :title="provider.provider_name"
          :units="provider.units"
          @back="hideProviderInfo"
        ></selected-units>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import ProductGraph from '@/views/dashboard/graphs/ProductGraph'
  import SelectedUnits from '@/views/dashboard/tables/SelectedUnits'

  export default {
    name: 'Graphs',
    components: {
      SelectedUnits,
      'product-graph': ProductGraph,
    },
    data () {
      return {
        anonymous: false,
        endDate: '',
        graphIds: [0, 1, 2],
        graphs: [],
        graphMode: 'Products',
        graphType: 'Products',
        index: 0,
        locations: [],
        menu: false,
        menu2: false,
        products: [
          {
            label: 'All Products',
            value: 'ALL',
            Providers: false,
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
        provider: null,
        selectedLocation: '',
        selectedSpecialty: '',
        selectedUnits: null,
        specialty: '',
        specialties: [],
        startDate: '',
        tabs: 0,
        transfusionData: {},
        unfilteredTransfusionData: {},
      }
    },
    computed: {
      getProducts () {
        return this.products.filter(product => product[this.graphMode] !== false)
      },
      graphsBeingViewed () {
        return this.graphs.filter(graph => graph.type === this.graphType)
      },
    },
    mounted () {
      const cmp = this
      const database = cmp.$store.state.database
      if (this.locations.length === 0 && database) {
        const sql = 'SELECT * FROM location ORDER BY code ASC'
        database.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            cmp.locations.push(row.code)
          })
        })
      }

      if (this.specialties.length === 0 && database) {
        const sql = 'SELECT * FROM specialty ORDER BY name ASC'
        database.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            cmp.specialties.push(row.name)
          })
        })
      }
    },
    methods: {
      clearGraphs () {
        // this.graphs.length = 0
        this.graphs = this.graphs.filter(graph => graph.type !== this.graphType)
        console.log(this.graphType, this.graphs)
        this.provider = null
        this.unfilteredTransfusionData.length = 0
      },
      submitGraph (submittedBy) {
        this.clearGraphs()
        const cmp = this
        const productType = this.productType
        const location = this.selectedLocation
        const startDate = this.$refs.startDateInput.value
        const endDate = this.$refs.endDateInput.value
        if (submittedBy === 'graphButton') {
          if (!cmp.selectedSpecialty) {
            cmp.specialty = ''
          } else {
            cmp.specialty = cmp.selectedSpecialty
          }
        }

        this.getTransfusionData(productType, this.specialty, location, startDate, endDate)
          .then(function (rows) { cmp.drawGraphs(rows, productType) })
      },
      drawGraphs (rows, productType) {
        const cmp = this
        if (productType === 'ALL') {
          cmp.products.forEach(function (product) {
            if (product.value === 'ALL') {
              return
            }
            cmp.graphs.push({
              id: cmp.view + '-' + product.value.replace(' ', ''),
              time: new Date().toISOString(),
              type: cmp.graphType,
              productType: product.value,
              graphLabel: product.label,
              transfusions: rows.filter(row => row.product === product.value),
            })
          })
        } else {
          const product = cmp.products.find(product => product.value === productType)
          cmp.graphs.push({
            id: cmp.view + '-' + product.value.replace(' ', ''),
            time: new Date().toISOString(),
            type: cmp.graphType,
            productType: product.value,
            graphLabel: product.label,
            transfusions: rows.filter(row => row.product === product.value),
          })
        }
      },
      setGraphMode (mode) {
        this.graphMode = mode
        this.graphType = mode
        if (mode === 'Products' && this.productType === 'CRYOPPT') {
          this.productType = 'ALL'
        } else if (mode === 'Providers' && this.productType === 'ALL') {
          this.productType = 'CRYOPPT'
        }
      },
      showProviderInfo (providerData) {
        console.log(providerData)
        for (let i = 0; i < providerData.units.length; i++) {
          providerData.units[i].id = i
        }
        this.provider = providerData
      },
      showSelectedUnits (units) {
        console.log('showSelectedUnits', units)
        this.selectedUnits = units
      },
      specialtyComparison (specialty) {
        this.specialty = specialty
        this.graphType = 'specialty'
        this.submitGraph('specialtyComparison')
      },
      hideProviderInfo () {
        this.provider = null
      },
      getProviderTransfusions (providerName) {
        const database = this.$store.state.database
        return new Promise(function (resolve, reject) {
          const sql = 'SELECT *  FROM transfusion AS t INNER JOIN provider AS p ON p.id=t.provider_id WHERE p.provider_name=' + providerName
          const testDict = { fib: 'Fibrinogen', pro: 'PT', hgb: 'Hemoglobin', plt: 'Platelets' }

          if (!database) {
            resolve([])
          }

          database.all(sql, function (err, rows) {
            if (err) {
              console.log(err)
            }
            const filteredRows = []
            rows.forEach(function (row) {
              if (row.test_result !== '-1' && row.product) {
                row.value = parseFloat(row.test_result)
                row.test = testDict[row.test_type]
                filteredRows.push(row)
              }
            })
            resolve(filteredRows)
          })
        })
      },
      getTransfusionData (productType, specialty, location, startDateText, endDateText) {
        const database = this.$store.state.database
        return new Promise(function (resolve, reject) {
          if (!database) {
            resolve([])
          }
          const parameters = []
          if (productType !== 'ALL') {
            parameters.push(`t.product="${productType}"`)
          }
          if (location !== '' && location !== null) {
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
          let sql = 'SELECT *, t.id as transfusion_id FROM transfusion AS t INNER JOIN provider AS p ON p.id=t.provider_id'
          for (let i = 0; i < parameters.length; i++) {
            if (i === 0) {
              sql += ' WHERE ' + parameters[i]
            } else {
              sql += ' AND ' + parameters[i]
            }
          }
          const testDict = { fib: 'Fibrinogen', pro: 'PT', hgb: 'Hemoglobin', plt: 'Platelets' }
          database.all(sql, function (err, rows) {
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

  .tip-table > tr.label {
    text-align: right;
  }
  .tip-table td.value {
    text-align: left;
  }
  .grow-enter-active, .grow-leave-active {
    transition: opacity 0.5s ease-out;
  }

  .grow-enter, .grow-leave-to {
    opacity: 0;
  }
</style>
