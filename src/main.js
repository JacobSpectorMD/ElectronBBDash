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
    router.replace('/graphs')
    ipcRenderer.send('getDatabase')
  },
  render: h => h(App),
}).$mount('#app')

ipcRenderer.on('getDatabase', function (e, dbPath, settingsDb) {
  Vue.prototype.$db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE)
  Vue.prototype.$settingsDb = settingsDb
})
