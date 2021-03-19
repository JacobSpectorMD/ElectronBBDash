<template>
  <base-material-card
    color="#687A85"
    ref="el"
    :id="id"
  >
    <template v-slot:heading>
      <div
        class="text-h3 font-weight-light graph-heading"
      >
        {{ graphLabel }}
        <span v-if="specialty"> - {{ specialty }}</span>
        <div class="heading-buttons">
          <v-btn
            v-show="view === 'median and range'"
            @click="setView('transfusion')"
            elevation="0"
            class="heading-button"
          >
            <v-icon class="mr-2">
              mdi-dots-vertical
            </v-icon>
            Transfusion View
          </v-btn>
          <v-btn
            v-show="view === 'transfusion'"
            @click="setView('median and range')"
            elevation="0"
            class="heading-button"
          >
            <v-icon class="mr-2">
              mdi-distribute-horizontal-center
            </v-icon>
            Median and Range View
          </v-btn>
        </div>
      </div>
    </template>
  </base-material-card>
</template>

<script>
  import addSwarm from '@/assets/js/products.js'
  import createProviderGraph from '@/assets/js/providers'

  export default {
    name: 'ProductGraph',
    props: {
      anonymous: {
        type: Boolean,
        required: false,
      },
      id: {
        type: String,
        required: true,
      },
      graphLabel: {
        type: String,
        required: true,
      },
      mode: {
        type: String,
        required: true,
      },
      productType: {
        type: String,
        required: true,
      },
      specialty: {
        type: String,
        required: false,
        default: null,
      },
      transfusions: {
        type: Array,
        required: true,
      },
    },
    data () {
      return {
        view: '',
      }
    },
    methods: {
      setView (view) {
        const cmp = this
        setTimeout(function () {
          cmp.view = view
        }, 500)
      },
    },
    mounted () {
      if (this.mode === 'Products') {
        addSwarm(this.transfusions, this.productType, this.id)
      } else if (this.mode === 'Providers') {
        this.view = 'median and range'
        createProviderGraph(this.$db, this.transfusions, this.productType, this.anonymous, this.id)
      }
    },
  }
  // $(document).on('click', '#individual-view', function () {
  //     $('.median').css('display', 'none')
  //     $('.box').css('fill', '#E9E9EA')
  //     $('.transfusion').css('display', 'initial')
  // })
  //
  // $(document).on('click', '#median-and-range-view', function () {
  //     $('.median').css('display', 'initial')
  //     $('.box').css('fill', 'var(--teal)')
  //     $('.transfusion').css('display', 'none')
  // })
</script>

<style scoped>
  .graph-heading {
    display: flex;
    justify-content: space-between;
  }

  .heading-button {
    background-color: rgba(0, 0, 0, 0) !important;
  }
</style>
