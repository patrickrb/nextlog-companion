import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { isDev } from './utils/dev'
import { RadioService } from './services/radio-service'
import { NextlogService } from './services/nextlog-service'
import { WSJTXService } from './services/wsjtx-service'

let mainWindow: BrowserWindow | null = null

const radioService = new RadioService()
const nextlogService = new NextlogService()
const wsjtxService = new WSJTXService()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:3003')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // Initialize services
  radioService.initialize()
  wsjtxService.initialize()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('radio:get-data', async () => {
  return radioService.getCurrentData()
})

ipcMain.handle('radio:connect', async (_, config) => {
  return radioService.connect(config)
})

ipcMain.handle('radio:disconnect', async () => {
  return radioService.disconnect()
})

ipcMain.handle('nextlog:send-data', async (_, data) => {
  return nextlogService.sendContactData(data)
})

ipcMain.handle('wsjtx:get-status', async () => {
  return wsjtxService.getStatus()
})

// Forward radio data updates to renderer
radioService.on('data-update', (data) => {
  if (mainWindow) {
    mainWindow.webContents.send('radio:data-update', data)
  }
})

// Forward WSJT-X contact data to renderer
wsjtxService.on('contact-logged', (contact) => {
  if (mainWindow) {
    mainWindow.webContents.send('wsjtx:contact-logged', contact)
  }
})