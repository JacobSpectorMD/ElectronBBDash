<template>
  <v-app>
    <dashboard-core-app-bar />

    <dashboard-core-drawer />

    <dashboard-core-view />

  </v-app>
</template>

<script>
  export default {
    name: 'App',
    components: {
      DashboardCoreAppBar: () => import('./views/dashboard/components/core/AppBar'),
      DashboardCoreDrawer: () => import('./views/dashboard/components/core/Drawer'),
      // DashboardCoreSettings: () => import('./components/core/Settings'),
      DashboardCoreView: () => import('./views/dashboard/components/core/View'),
    },
  }
</script>

<style>
.v-application .primary {
  background-color: #a20c3e !important;
}

.theme--dark.v-list-item::before {
  opacity: 0 !important;
}

.v-navigation-drawer__content .v-list-item {
  opacity: 1 !important;
  outline: none !important;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-list-group__header.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.24);
}

.v-list-group__items .theme--dark.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-list-group__items .theme--dark.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-list-group__items .theme--dark.v-list-item:focus {
  background-color: rgba(255, 255, 255, 0.24);
}

/*.theme--dark.v-list-item::before:hover {*/
/*  opacity: 0.08 !important;*/
/*}*/
</style>
