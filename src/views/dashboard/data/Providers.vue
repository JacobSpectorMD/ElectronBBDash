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
              Add Providers To Database
            </div>
          </template>
          <div class="data-input-layout">
            Enter list of providers with data separated by <b>tabs</b> and providers separated by returns:<br>
            <table class="input-table">
              <tr><td>John</td><td>Example</td><td>Smith</td><td>Internal Medicine</td></tr>
            </table>
          </div>
          <v-textarea
            v-model="providerInput"
            label="Provider Data"
            fill-height
            d-flex
            filled
            @keydown.tab.exact.prevent="tabber($event)"
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
          <template
            v-slot:heading
            class="card-heading"
          >
            <div class="text-h3 font-weight-light">
              Providers In Database
            </div>
            <div class="heading-buttons">
              <v-btn
                elevation="0"
                class="heading-button"
                @click="getProviderData"
              >
                <v-icon class="mr-2">
                  mdi-refresh
                </v-icon>
              </v-btn>
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
              :items="providers"
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
  import { addProvidersToDatabase } from '@/assets/js/providerData.js'

  export default {
    data () {
      return {
        headers: [
          {
            sortable: true,
            text: 'Last Name',
            value: 'last_name',
            align: 'right',
          },
          {
            sortable: true,
            text: 'First Name',
            value: 'first_name',
            align: 'right',
          },
          {
            sortable: true,
            text: 'Middle Name',
            value: 'middle_name',
            align: 'right',
          },
          {
            sortable: true,
            text: 'Specialty',
            value: 'specialty',
            align: 'right',
          },
        ],
        providerInput: '',
        providers: [],
        search: '',
      }
    },
    methods: {
      getProviderData () {
        const cmp = this
        const database = cmp.$store.state.database
        cmp.providers = []
        const sql = 'SELECT * FROM provider ORDER BY last_name ASC'
        database.all(sql, function (err, rows) {
          if (err) { }
          rows.forEach(function (row) {
            cmp.providers.push({
              first_name: row.first_name,
              last_name: row.last_name,
              middle_name: row.middle_name,
              specialty: row.specialty_name,
            })
          })
        })
      },
      tabber (event) {
        const text = this.providerInput
        const originalSelectionStart = event.target.selectionStart
        const textStart = text.slice(0, originalSelectionStart)
        const textEnd = text.slice(originalSelectionStart)

        this.providerInput = `${textStart}\t${textEnd}`
        event.target.value = this.providerInput // required to make the cursor stay in place.
        event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1
      },
      submitInput () {
        const database = this.$store.state.database
        console.log(database, this.providerInput)
        addProvidersToDatabase(database, this.providerInput).then((result) => {
          this.getProviderData()
        })
        this.locationInput = ''
      },
    },
    activated () {
      this.getProviderData()
    },
  }
</script>

<style scoped>
/deep/ .text-start {
  display: flex;
  justify-content: space-between;
}

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

.heading-button {
  background-color: rgba(0, 0, 0, 0) !important;
}
</style>
