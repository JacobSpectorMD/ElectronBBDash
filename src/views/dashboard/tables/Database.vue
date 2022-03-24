<template>
  <v-container
    id="regular-tables"
    fluid
    tag="section"
  >
    <base-material-card
      class="px-5 py-3"
      color="#364d5c"
    >
      <template v-slot:heading>
        <div
          class="text-h3 font-weight-light"
        >Add Transfusions To Database
        </div>
      </template>
      <div
        id="file-drop"
        class="d-flex justify-center align-center"
        @dragover="dragover"
        @dragleave="dragleave"
        @drop="drop"
      >
        <input
          id="assetsFieldHandle"
          ref="file"
          type="file"
          accept=".txt"
          multiple
          class="w-px h-px d-none overflow-hidden absolute"
          @change="onChange"
        >
        <label
          for="assetsFieldHandle"
          class="block cursor-pointer"
        >
          <div class="text-h3">
            Drop Files Here
          </div>
        </label>
      </div>

      <v-simple-table
        v-show="processingFiles.length > 0"
        fixed-header
        height="200px"
      >
        <thead>
          <tr>
            <th class="primary--text">
              Status
            </th>
            <th class="primary--text">
              File
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(file, index) in processingFiles"
            :key="index"
            class="file-row"
          >
            <td v-if="file.processed == 'failed'">
              <v-icon color="primary">mdi-image-broken</v-icon>
              Failed
            </td>
            <td v-else-if="file.processed">
              <v-icon color="secondary">mdi-check-bold</v-icon>
              Complete
            </td>
            <td v-else>
              <v-icon color="secondary">mdi-timer-sand</v-icon>
              Processing
            </td>
            <td>{{ file.path }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </base-material-card>

    <base-material-card
      class="px-5 py-3"
      color="#364d5c"
    >
      <template
        v-slot:heading
        class="card-heading"
      >
        <div class="text-h3 font-weight-light">
          Transfusions In Database
        </div>
        <div class="heading-buttons">
          <v-btn
            elevation="0"
            class="heading-button"
            @click="downloadTransfusions"
          >
            Download
            <v-icon class="mr-2">
              mdi-download
            </v-icon>
          </v-btn>
        </div>
      </template>
      <v-simple-table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Jan</th>
            <th>Feb</th>
            <th>Mar</th>
            <th>Apr</th>
            <th>May</th>
            <th>June</th>
            <th>July</th>
            <th>Aug</th>
            <th>Sept</th>
            <th>Oct</th>
            <th>Nov</th>
            <th>Dec</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="transfusion in transfusions"
            :key="transfusion.year"
          >
            <td>{{ transfusion.year }}</td>
            <td>{{ transfusion.months[0] }}</td>
            <td>{{ transfusion.months[1] }}</td>
            <td>{{ transfusion.months[2] }}</td>
            <td>{{ transfusion.months[3] }}</td>
            <td>{{ transfusion.months[4] }}</td>
            <td>{{ transfusion.months[5] }}</td>
            <td>{{ transfusion.months[6] }}</td>
            <td>{{ transfusion.months[7] }}</td>
            <td>{{ transfusion.months[8] }}</td>
            <td>{{ transfusion.months[9] }}</td>
            <td>{{ transfusion.months[10] }}</td>
            <td>{{ transfusion.months[11] }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </base-material-card>
  </v-container>
</template>

<script>
  import processFile from '@/assets/js/utilities.js'

  const { saveAs } = require('@/assets/js/FileSaver.js')

  export default {
    data () {
      return {
        database: null,
        filelist: [],
        processingFiles: [],
        transfusions: [],
      }
    },
    activated () {
      if (this.database !== this.$store.state.database) {
        this.processingFiles.splice(0)
        this.database = this.$store.state.database
        this.showTransfusionCalendar()
      }
    },
    methods: {
      downloadTransfusions () {
        const cmp = this
        const database = this.$store.state.database
        let selectedTransfusions = 'Units On Day\tUnit Date\tUnit Accession\tDIN\tNumber Of Units\tProduct\tTest Result\tTest Type\tTest Accession\tTest Date\tLocation\tProvider\tSpecialty\r\n'
        const testDict = { fib: 'Fibrinogen', pro: 'PT', hgb: 'Hemoglobin', plt: 'Platelets' }

        const sql = 'SELECT *  FROM transfusion AS t INNER JOIN provider AS p ON p.id=t.provider_id;'
        database.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            if (row.test_result !== '-1' && row.product) {
              row.value = parseFloat(row.test_result)
              row.test = testDict[row.test_type]
              selectedTransfusions += cmp.transfusionTextLine(row)
            }
          })
          const blob = new Blob([selectedTransfusions], { type: 'text/plain;charset=utf-8' })
          saveAs(blob, 'Selected Transfusions.txt', true)
        })
      },
      dragover (event) {
        event.preventDefault()
      },
      dragleave (event) {
      },
      drop (event) {
        event.preventDefault()
        this.$refs.file.files = event.dataTransfer.files
        this.onChange() // Trigger the onChange event manually
      },
      onChange () {
        const database = this.$store.state.database
        this.filelist = [...this.$refs.file.files]
        this.filelist.forEach((file) => {
          this.processingFiles.push({ path: file.path, processed: false })
        })
        for (const f of this.filelist) {
          processFile(database, f).then(result => {
            if (result) {
              this.processingFiles.forEach(file => {
                if (file.path === f.path) {
                  file.processed = true
                }
              })
            } else {
              this.processingFiles.forEach(file => {
                if (file.path === f.path) {
                  file.processed = 'failed'
                }
              })
            }
          })
        }
        this.filelist = []
      },
      processFiles (e) {
      },
      showTransfusionCalendar () {
        this.transfusions.splice(0)
        const cmp = this
        const database = cmp.$store.state.database
        const sql = 'SELECT * FROM transfusion ORDER BY time ASC'
        database.all(sql, function (err, rows) {
          const years = {}
          if (err) {
          }
          rows.forEach(function (row) {
            const date = new Date(row.time)
            const month = date.getMonth()
            const year = date.getFullYear()

            if (year === 1969) {
              return
            }
            if (years[year] === undefined) {
              years[year] = new Year(year)
            }
            years[year].months[month] += 1
          })
          Object.values(years).forEach(function (year) {
            cmp.transfusions.push(year)
          })
        })
      },
      transfusionTextLine (t) {
        const unitDate = new Date(t.time).toISOString().replace(/T/, ' ').replace(/\..+/, '')
        const testDate = new Date(t.test_time).toISOString().replace(/T/, ' ').replace(/\..+/, '')
        const elements = [t.units_on_day, unitDate, t.accession, t.din, t.num_units, t.product, t.test_result, t.test_type, t.test_accession, testDate, t.location, t.provider, t.specialty_name]
        return elements.join('\t') + '\r\n'
      },
    },
  }

  class Year {
    constructor (year) {
      this.year = year
      this.months = {}
      for (let i = 0; i <= 11; i++) {
        this.months[i] = 0
      }
    }
  }
</script>

<style scoped>
  /deep/ .text-start {
    display: flex;
    justify-content: space-between;
  }

  .heading-button {
    background-color: rgba(0, 0, 0, 0) !important;
  }

  /deep/ #file-drop {
    height: 200px;
    border: medium dashed #4c6b7f;
    border-radius: 4px;
    margin-top: 16px;
    margin-bottom: 16px;
    background: #fafafa;
  }

  /deep/ .bg-green-300 {
    background-color: red;
  }
</style>
