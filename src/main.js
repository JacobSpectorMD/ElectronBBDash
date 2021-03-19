// =========================================================
// * Vuetify Material Dashboard - v2.1.0
// =========================================================
//
// * Product Page: https://www.creative-tim.com/product/vuetify-material-dashboard
// * Copyright 2019 Creative Tim (https://www.creative-tim.com)
//
// * Coded by Creative Tim
//
// =========================================================
//
// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/base'
import './plugins/chartist'
import './plugins/vee-validate'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import { ipcRenderer } from 'electron'
import sqlite3 from 'sqlite3'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  mounted: () => {
    ipcRenderer.send('getDatabase')
  },
  render: h => h(App),
}).$mount('#app')

ipcRenderer.on('getDatabase', function (e, dbPath) {
  Vue.prototype.$db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE)
})
