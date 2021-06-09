<template>
  <base-material-card
    color="#687A85"
  >
    <template
      v-slot:heading
      class="stats-heading"
    >
      <div>
        <div class="text-h3 font-weight-light graph-heading">
          {{ title }}
        </div>
        <div class="text-subtitle-1 font-weight-light">
          {{ subtitle }}
        </div>
      </div>
      <div>
        <v-text-field
          v-if="search"
          v-model="searchTerm"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-btn
          v-else
          elevation="0"
          class="heading-button"
          @click="hideProviderStats"
        >
          <v-icon class="mr-2">
            mdi-arrow-left-circle
          </v-icon>
          Back To Providers Graph
        </v-btn>
      </div>
    </template>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="items"
        item-key="transfusion_id"
        :search="searchTerm"
      >
        <template v-slot:item.product="{ item }">
            {{ getProductName(item) }}
        </template>
      </v-data-table>
    </v-card-text>
  </base-material-card>
</template>

<script>
  export default {
    name: 'SelectedUnits',
    props: {
      title: {
        type: String,
        required: false,
        default: 'Selected Units',
      },
      search: {
        type: Boolean,
        default: false,
      },
      subtitle: {
        type: String,
        required: false,
        default: '',
      },
      units: {
        type: Array,
        required: true,
      },
    },
    data () {
      return {
        headers: [
          {
            text: 'Provider',
            sortable: true,
            value: 'provider',
            align: 'right',
          },
          {
            text: 'Product',
            sortable: true,
            value: 'product',
            align: 'right',
          },
          {
            text: 'Pretransfusion Test',
            sortable: false,
            value: 'test',
            align: 'right',
          },
          {
            text: 'Test Result',
            sortable: true,
            value: 'value',
            align: 'right',
          },
          {
            text: 'Date',
            sortable: true,
            value: 'date',
            align: 'right',
          },
          {
            text: 'MRN',
            sortable: true,
            value: 'mrn',
            align: 'right',
          },
          {
            text: 'Accession',
            sortable: true,
            value: 'accession',
            align: 'right',
          },
        ],
        // items: this.units.map(unit => ({
        //   ...unit,
        //   date: new Date(unit.date).toLocaleDateString('en-US'),
        // })),
        searchTerm: '',
      }
    },
    computed: {
      items: function () {
        return this.units.map(unit => ({
          ...unit,
          date: new Date(unit.date).toLocaleDateString('en-US'),
        }))
      },
    },
    mounted () {
      console.log(this.units)
    },
    methods: {
      getProductName (unit) {
        const productNameDict = {
          CRYOPPT: 'Cryoprecipitate',
          PLASMA: 'Plasma',
          PLATELETS: 'Platelets',
          'RED CELLS': 'Red Blood Cells',
        }
        return productNameDict[unit.product]
      },
      hideProviderStats () {
        this.$emit('hide-provider-stats')
      },
    },
  }

</script>

<style scoped>
/deep/ .text-start {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.heading-button {
  background-color: rgba(0, 0, 0, 0) !important;
}
</style>
