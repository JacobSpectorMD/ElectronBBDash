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
          v-bind:key="transfusion.year"
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

    <div class="py-3" />
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        transfusions: [],
      }
    },
    methods: {
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
          if (err) { console.log(err) }
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
          console.log(Object.values(years))
          Object.values(years).forEach(function (year) {
            component.transfusions.push(year)
          })
        })
      },
    },
    mounted () {
      if (this.transfusions.length === 0) {
        this.showTransfusionCalendar()
      }
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
