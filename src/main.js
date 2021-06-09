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

ipcRenderer.on('getDatabase', function (e, dbPath, settingsDbPath) {
  if (dbPath) {
    store.commit('set_database_path', dbPath)
  }
  Vue.prototype.$settingsDbPath = settingsDbPath
})
