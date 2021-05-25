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
          {{ providerName }}
        </div>
        <div class="text-subtitle-1 font-weight-light">
          {{ providerSpecialty }}
        </div>
      </div>
      <div>
        <v-btn
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
        item-key="id"
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
    name: 'ProviderStats',
    props: {
      provider: {
        type: Object,
        required: true,
      },
    },
    data () {
      return {
        headers: [
          {
            sortable: true,
            text: 'Product',
            value: 'product',
            align: 'right',
          },
          {
            sortable: false,
            text: 'Pretransfusion Test',
            value: 'test',
            align: 'right',
          },
          {
            sortable: true,
            text: 'Test Result',
            value: 'value',
            align: 'right',
          },
          {
            sortable: true,
            text: 'Date',
            value: 'date',
            align: 'right',
          },
          {
            sortable: true,
            text: 'MRN',
            value: 'mrn',
            align: 'right',
          },
          {
            sortable: true,
            text: 'Accession',
            value: 'accession',
            align: 'right',
          },
        ],
        items: this.provider.units.map(unit => ({
          ...unit,
          date: new Date(unit.date).toLocaleDateString('en-US'),
        })),
        providerName: this.provider.provider_name,
        providerSpecialty: this.provider.specialty,
      }
    },
    mounted () {
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
