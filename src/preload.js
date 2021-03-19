// src/preload.js

import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

alert('it worked')
