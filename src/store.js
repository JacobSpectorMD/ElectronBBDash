import Vue from 'vue'
import Vuex from 'vuex'
const sqlite3 = require('sqlite3').verbose()

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    barColor: 'rgba(0, 0, 0, .6), rgba(0, 0, 0, .6)',
    barImage: require('../src/assets/blood.png'),
    database: null,
    dbPath: null,
    drawer: null,
    units: [],
  },
  mutations: {
    close_database (state, db) {
      db.close((err) => {
        if (err) { }
      })
    },
    SET_BAR_IMAGE (state, payload) {
      state.barImage = payload
    },
    SET_DRAWER (state, payload) {
      state.drawer = payload
    },
    set_database_path (state, dbPath) {
      state.dbPath = dbPath
      state.database = new sqlite3.Database(state.dbPath, sqlite3.OPEN_READWRITE)
    },
  },
})
