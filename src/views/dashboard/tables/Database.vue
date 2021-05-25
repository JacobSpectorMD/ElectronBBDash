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
        >Add Transfusions To Database</div>
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
    </base-material-card>

    <base-material-card
      class="px-5 py-3"
      color="#364d5c"
    >
      <template v-slot:heading>
        <div class="text-h3 font-weight-light">
          Transfusions In Database
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

  export default {
    data () {
      return {
        filelist: [],
        transfusions: [],
      }
    },
    mounted () {
      if (this.transfusions.length === 0) {
        this.showTransfusionCalendar()
      }
    },
    methods: {
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
        this.filelist = [...this.$refs.file.files]
        for (const f of this.filelist) {
          processFile(this.$db, f)
        }
        this.filelist = []
      },
      processFiles (e) {
        console.log(e)
      },
      showDatabase () {
        this.transfusions = [
          {
            year: 2018,
            months: {
              0: 100,
              1: 200,
            },
          },
        ]
      },
      showTransfusionCalendar () {
        const component = this
        const sql = 'SELECT * FROM transfusion ORDER BY time ASC'
        this.$db.all(sql, function (err, rows) {
          const years = {}
          if (err) { }
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
            component.transfusions.push(year)
          })
        })
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
