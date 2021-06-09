<template>
  <base-material-card
    class="px-5 py-3"
    color="#364d5c"
  >
    <template v-slot:heading>
      Search Transfusions
    </template>

    <v-card-text>
      <v-row
        align="center"
      >
        <v-col cols="2">
          <v-select
            item-value="value"
            item-text="label"
            label="Product Type"
          />
        </v-col>
        <v-col cols="2">
          <v-select
            label="Specialty"
            clearable
          />
        </v-col>
        <v-col cols="1">
          <v-select
            label="Location"
            clearable
          />
        </v-col>
        <v-col cols="2">
          <v-menu
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template
              v-slot:activator="{ on, attrs }"
            >
              <v-text-field
                ref="startDateInput"
                label="Start Date"
                prepend-icon="mdi-calendar"
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              class="ma-0"
            />
          </v-menu>
        </v-col>
        <v-col cols="2">
          <v-menu
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="endDateInput"
                v-model="endDate"
                label="End Date"
                prepend-icon="mdi-calendar"
                readonly
                clearable
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="endDate"
              class="ma-0"
              @input="menu2 = false"
            />
          </v-menu>
        </v-col>
        <transition name="grow">
          <v-col
            v-if="graphMode === 'Providers'"
            cols="2"
          >
            <v-checkbox
              v-model="anonymous"
              label="Anonymous"
              color="secondary"
              value="Anonymous"
              margin="0"
              hide-details
            />
          </v-col>
        </transition>
        <v-col cols="2">
          <v-btn
            color="primary"
            elevation="2"
          >
            Submit
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </base-material-card>
</template>

<script>
  export default {
    name: 'Filters',
  }
</script>

<style scoped>

</style>
