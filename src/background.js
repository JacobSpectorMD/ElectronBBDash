'use strict'
import Vue from 'vue'

import { app, ipcMain, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import sqlite3 from 'sqlite3'
const isDevelopment = process.env.NODE_ENV !== 'production'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

let win

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      preload: '../src/preload.js',
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    Vue.$store.commit('close_databases')
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

const fs = require('fs')
// const sqlite3 = require('sqlite3')
const db = require('./assets/js/database.js')

ipcMain.on('getDatabase', async function (e) {
  // Open the settings database
  const settingsDbPath = path.join(app.getPath('userData'), 'settings.db')
  let settingsDb = null
  let timeoutDuration = 0
  if (!fs.existsSync(settingsDbPath)) {
    settingsDb = await db.createSettingsDatabase(settingsDbPath)
    timeoutDuration = 3000
  } else {
    settingsDb = new sqlite3.Database(settingsDbPath, sqlite3.OPEN_READWRITE)
  }

  setTimeout(function () {
    setupDatabase(settingsDbPath, settingsDb)
  }, timeoutDuration)
})

function setupDatabase (settingsDbPath, settingsDb) {
  // Get the location of the transfusion database
  db.unselectNonexistentDatabases(settingsDbPath).then(() => {
    getDbLocation(settingsDb).then(row => {
      if (row) {
        win.webContents.send('getDatabase', row.location, settingsDbPath)
      } else {
        win.webContents.send('getDatabase', null, settingsDbPath)
      }
      settingsDb.close((err) => {
        if (err) { }
      })
    })
  })
    .catch((error) => {
      win.webContents.send('getDatabase', null, settingsDbPath)
    })
}

function getDbLocation (settingsDb) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT *  FROM database WHERE selected=1'
    settingsDb.get(sql, function (err, row) {
      if (err) {
        reject(err)
      }
      resolve(row)
    })
  })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
