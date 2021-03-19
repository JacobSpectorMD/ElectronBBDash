<template>
  <v-content>
    <keep-alive>
      <router-view />
    </keep-alive>
  </v-content>
</template>

<script>
  export default {
    name: 'DashboardCoreView',

    components: {
      // DashboardCoreFooter: () => import('./Footer'),
    },
  }
</script>
