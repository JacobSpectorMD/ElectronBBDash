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
      <div id="action-buttons">
        <v-text-field
          v-if="search"
          v-model="searchTerm"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-btn
          v-if="refresh"
          elevation="0"
          class="heading-button"
          @click="refreshTransfusions"
        >
          <v-icon class="mr-2">
            mdi-refresh
          </v-icon>
          Refresh
        </v-btn>
        <v-btn
          v-if="!search"
          elevation="0"
          class="heading-button"
          @click="back"
        >
          <v-icon class="mr-2">
            mdi-arrow-left-circle
          </v-icon>
          {{ backText }}
        </v-btn>
      </div>
    </template>
    <v-card-text>
      <v-data-table
        id="units-table"
        v-model="checked"
        @item-selected="handleCheck"
        :headers="headers"
        :items="items"
        item-key="transfusion_id"
        :search="searchTerm"
        :show-select="checkboxes"
        :loading="units.length === 0"
        loading-text="Loading..."
        single-select
      >
        <template v-slot:item.data-table-select="{ item }">
          <v-checkbox
            :value="item.checked === 1"
            :input-value="item.checked === 1"
            color="secondary"
            @click="handleSelect(item)"
          ></v-checkbox>
        </template>
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
      backText: {
        type: String,
        default: 'Back',
      },
      checkboxes: {
        type: Boolean,
        default: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      refresh: {
        type: Boolean,
        required: false,
        default: false,
      },
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
        checked: [],
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
      computedHeaders: function () {
        const compHeaders = [...this.headers]
        if (this.checkboxes) {
          compHeaders.unshift({
            text: 'Checked',
            sortable: true,
          })
        }
        return compHeaders
      },
      items: function () {
        const cmp = this
        return this.units.map(unit => ({
          ...unit,
          date: cmp.convertDate(unit),
        }))
      },
    },
    mounted () {
    },
    methods: {
      convertDate (unit) {
        return new Date(unit.time).toLocaleDateString('en-US', {
          hourCycle: 'h23',
          day: 'numeric',
          year: 'numeric',
          month: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          timeZone: 'UTC',
        })
      },
      handleCheck (e) {
      },
      handleSelect (item) {
        const database = this.$store.state.database

        if (item.checked === 0 || item.checked === null) {
          item.checked = 1
        } else {
          item.checked = 0
        }

        database.run(`
          UPDATE transfusion SET checked=${item.checked} WHERE id=${item.transfusion_id}
        `)
      },
      getProductName (unit) {
        const productNameDict = {
          CRYOPPT: 'Cryoprecipitate',
          PLASMA: 'Plasma',
          PLATELETS: 'Platelets',
          'RED CELLS': 'Red Blood Cells',
        }
        return productNameDict[unit.product]
      },
      back () {
        this.$emit('back')
      },
      refreshTransfusions () {
        this.$emit('refreshTransfusions')
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

/deep/ #units-table .v-messages {
  display: none;
}

#action-buttons {
  display: inline-flex;
  align-items: flex-end;
}
</style>
