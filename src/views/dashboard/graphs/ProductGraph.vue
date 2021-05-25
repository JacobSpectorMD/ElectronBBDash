<template>
  <base-material-card
    :id="id"
    ref="el"
    @click.prevent="graphClicked()"
    color="#687A85"
  >
    <template
      v-slot:heading
      class="graph-heading"
    >
      <div>
        <div class="text-h3 font-weight-light graph-heading"> {{ graphLabel }} </div>
        <div
          v-if="specialty"
          class="text-subtitle-1 font-weight-light"
        >{{ specialty }}</div>
      </div>
      <div class="heading-buttons">
        <v-btn
          v-show="view === 'median'"
          elevation="0"
          class="heading-button"
          @click="setView('transfusion')"
        >
          <v-icon class="mr-2">
            mdi-dots-vertical
          </v-icon>
          Transfusion View
        </v-btn>
        <v-btn
          v-show="view === 'transfusion'"
          elevation="0"
          class="heading-button"
          @click="setView('median')"
        >
          <v-icon class="mr-2">
            mdi-distribute-horizontal-center
          </v-icon>
          Median and Range View
        </v-btn>
      </div>
    </template>
    <div
      class='svg-div'
      @scroll="hideTooltip"
    >
      <div
        class="toolTip"
      >
        <div class="stats"></div>
        <div class="button-div">
          <v-btn
            elevation="0"
            class="specialty-comparison-button secondary--text"
            @click="specialtyComparison"
            color="white"
          >
            Specialty Comparison
          </v-btn>
          <v-btn
            elevation="0"
            class="show-provider-button"
            @click="emitProviderInfo"
            color="white"
          >
            View Provider's Transfusions
          </v-btn>
        </div>
      </div>
      <svg
        @click="setProvider"
        :class="'providersSvg ' + view"
      ></svg>
    </div>
  </base-material-card>
</template>

<script>
  import $ from 'jquery'
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
        providerData: {},
        view: '',
      }
    },
    mounted () {
      if (this.mode === 'Products') {
        addSwarm(this.transfusions, this.productType, this.id)
      } else if (this.mode === 'Providers') {
        if (this.view === '') { this.view = 'median' }
        createProviderGraph(this.$db, this.transfusions, this.productType, this.anonymous, this.id)
      }
    },
    methods: {
      hideTooltip () {
        $('#' + this.id + ' .toolTip').css('opacity', '0').css('pointer-events', 'none')
      },
      setView (view) {
        const cmp = this
        setTimeout(function () {
          cmp.view = view
        }, 350)
      },
      setProvider (e) {
        this.providerData = e.target.__data__
      },
      specialtyComparison () {
        this.$emit('specialtyComparison', this.providerData[1].specialty)
      },
      emitProviderInfo (e) {
        this.$emit('sentProviderInfo', this.providerData[1])
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
  .svg-div {
    overflow-x: auto;
  }
  .toolTip {
    opacity: 0;
    position: absolute;
    background-color: #4c6b7f;
    color: white;
    border-radius: 4px;
    padding: 8px;
    z-index: 2;
  }

  /deep/ svg.median .transfusion {
    opacity: 0;
  }

  /deep/ svg.transfusion .median {
    opacity: 0;
  }

  /deep/ svg.transfusion .transfusion {
    opacity: 1;
  }

  /deep/ svg.transfusion .box {
    fill: #C4CFD5;
  }
</style>
