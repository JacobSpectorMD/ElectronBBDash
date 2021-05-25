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
              Add Locations To Database
            </div>
          </template>
          <div class="data-input-layout">
            Enter list of locations separated by ; or returns:<br>
            10F<br>
            11LONG
          </div>
          <v-textarea
            v-model="locationInput"
            label="Location Data"
            fill-height
            d-flex
            filled
          />
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
              Locations In Database
            </div>
          </template>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="locations"
              item-key="id"
              :search="search"
            />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { addLocationsToDatabase } from '@/assets/js/locations.js'

  export default {
    data () {
      return {
        headers: [
          {
            sortable: true,
            text: 'Location',
            value: 'code',
            align: 'left',
          },
        ],
        locationInput: '',
        locations: [],
        search: '',
        transfusions: [],
      }
    },
    methods: {
      getLocationData () {
        const cmp = this
        cmp.locations.length = 0
        const sql = 'SELECT * FROM location ORDER BY code ASC'
        this.$db.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            cmp.locations.push({ code: row.code })
          })
        })
      },
      submitInput () {
        const cmp = this
        addLocationsToDatabase(cmp.$db, cmp.locationInput)
        cmp.locationInput = ''
        cmp.getLocationData()
      },
    },
    mounted () {
      this.getLocationData()
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
