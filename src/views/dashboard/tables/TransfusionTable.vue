<template>
  <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <selected-units
      :units="units"
      :search="true"
      :checkboxes="true"
      :loading="true"
      :refresh="true"
      @refreshTransfusions="refreshTransfusions"
    ></selected-units>
  </v-container>
</template>

<script>
  import SelectedUnits from '@/views/dashboard/tables/SelectedUnits'

  export default {
    name: 'TransfusionTable',
    components: { SelectedUnits },
    data () {
      return {
        units: [],
      }
    },
    mounted () {
      this.populateTransfusionData()
    },
    methods: {
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
            if (err) { }
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
      populateTransfusionData () {
        const cmp = this
        this.getTransfusionData('ALL', '', '', '', '')
          .then(function (rows) { rows.forEach((row) => cmp.units.push(row)) })
      },
      refreshTransfusions () {
        this.units.length = 0
        this.populateTransfusionData()
      },
    },
  }
</script>

<style scoped>

</style>
