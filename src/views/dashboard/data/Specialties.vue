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
              Add Specialties To Database
            </div>
          </template>
          <div class="data-input-layout">
            Enter list of specialties with data separated by ; or returns:<br>
            Hematology/Oncology
            Pediatrics
          </div>
          <v-textarea
            v-model="specialtyInput"
            label="Specialty Data"
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
              Specialties In Database
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
              :items="specialties"
              :search="search"
              item-key="id"
            />
          </v-card-text>
        </base-material-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { addSpecialtiesToDatabase } from '@/assets/js/specialties.js'

  export default {
    data () {
      return {
        headers: [
          {
            sortable: true,
            text: 'Specialty',
            value: 'specialtyName',
            align: 'left',
          },
        ],
        search: '',
        specialtyInput: '',
        specialties: [],
      }
    },
    methods: {
      getSpecialtyData () {
        const cmp = this
        cmp.specialties.length = 0
        const sql = 'SELECT * FROM specialty ORDER BY name ASC'
        this.$db.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            cmp.specialties.push({
              specialtyName: row.name,
            })
          })
        })
      },
      submitInput () {
        const cmp = this

        var enteredSpecialties = cmp.specialtyInput.replace(/\r?\n/g, ';').split(';')

        const specialtyList = {}
        for (let i = 0; i < enteredSpecialties.length; i++) {
          const specialtyName = enteredSpecialties[i].trim()
          if (specialtyName === '') { continue }
          if (specialtyList[specialtyName] === undefined) { specialtyList[specialtyName] = null }
        }

        addSpecialtiesToDatabase(cmp.$db, specialtyList)
        cmp.specialtyInput = ''
        cmp.getSpecialtyData()
      },
    },
    mounted () {
      this.getSpecialtyData()
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

/deep/ .input-table td {
  padding-right: 10px;
}

/deep/ .button-div button {
  margin-right: 0px !important;
  margin-top: 16px;
}

/deep/ .button-div button {
  margin-right: 0px !important;
  margin-top: 16px;
}
</style>
