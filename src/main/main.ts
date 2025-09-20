import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { isDev } from './utils/dev'

// Get the correct app path for both dev and production
const getAppPath = () => {
  if (isDev()) {
    return process.cwd()
  }
  return path.dirname(app.getAppPath())
}

import { RadioService } from './services/radio-service'
import { NextlogService } from './services/nextlog-service'
import { WSJTXService } from './services/wsjtx-service'
import { SettingsService } from './services/settings-service'

let mainWindow: BrowserWindow | null = null

const settingsService = new SettingsService()
const radioService = new RadioService(settingsService)
const nextlogService = new NextlogService(undefined, settingsService)
const wsjtxService = new WSJTXService(settingsService)

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

  // Always load from built files for self-contained app
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))

  if (isDev()) {
    mainWindow.webContents.openDevTools()
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

ipcMain.handle('radio:get-last-connection', async () => {
  return radioService.getLastConnectionSettings()
})

ipcMain.handle('nextlog:send-data', async (_, data) => {
  return nextlogService.sendContactData(data)
})

ipcMain.handle('nextlog:test-connection', async () => {
  return nextlogService.testConnection()
})

ipcMain.handle('wsjtx:get-status', async () => {
  return wsjtxService.getStatus()
})

ipcMain.handle('wsjtx:simulate-contact', async () => {
  console.log('[Main] Simulating WSJT-X contact via IPC call')
  wsjtxService.simulateContactLogged()
  return { success: true }
})

// Settings IPC handlers
ipcMain.handle('settings:get-all', async () => {
  return settingsService.getAllSettings()
})

ipcMain.handle('settings:get-nextlog', async () => {
  return settingsService.getNextlogSettings()
})

ipcMain.handle('settings:update-nextlog', async (_, settings) => {
  settingsService.updateNextlogSettings(settings)
  return settingsService.getNextlogSettings()
})

ipcMain.handle('settings:get-radio', async () => {
  return settingsService.getRadioSettings()
})

ipcMain.handle('settings:update-radio', async (_, settings) => {
  settingsService.updateRadioSettings(settings)
  return settingsService.getRadioSettings()
})

ipcMain.handle('settings:get-wsjtx', async () => {
  return settingsService.getWSJTXSettings()
})

ipcMain.handle('settings:update-wsjtx', async (_, settings) => {
  settingsService.updateWSJTXSettings(settings)
  return settingsService.getWSJTXSettings()
})

ipcMain.handle('settings:reset-to-defaults', async () => {
  settingsService.resetToDefaults()
  return settingsService.getAllSettings()
})

ipcMain.handle('settings:export', async () => {
  return settingsService.exportSettings()
})

ipcMain.handle('settings:import', async (_, settings) => {
  settingsService.importSettings(settings)
  return settingsService.getAllSettings()
})

// Forward radio data updates to renderer
radioService.on('data-update', (data) => {
  if (mainWindow) {
    mainWindow.webContents.send('radio:data-update', data)
  }
})

// Forward WSJT-X contact data to renderer and send to Nextlog
wsjtxService.on('contact-logged', async (contact) => {
  console.log('[Main] Received WSJT-X contact logged event')

  if (mainWindow) {
    mainWindow.webContents.send('wsjtx:contact-logged', contact)
  }

  // Transform WSJT-X contact to Nextlog format and send
  try {
    const nextlogContact = transformWSJTXToNextlog(contact)
    console.log('[Main] Transformed contact for Nextlog:', nextlogContact)

    const result = await nextlogService.sendContactData(nextlogContact)
    console.log('[Main] Nextlog send result:', result)

    if (result.success) {
      console.log('[Main] Successfully sent contact to Nextlog')
    } else {
      console.error('[Main] Failed to send contact to Nextlog:', result.message)
    }
  } catch (error) {
    console.error('[Main] Error processing contact for Nextlog:', error)
  }
})

// Helper function to transform WSJT-X contact to Nextlog format
function transformWSJTXToNextlog(wsjtxContact: any): any {
  // Calculate band from frequency
  const frequencyMHz = wsjtxContact.txFrequency / 1000000
  let band = ''
  if (frequencyMHz >= 1.8 && frequencyMHz <= 2.0) band = '160m'
  else if (frequencyMHz >= 3.5 && frequencyMHz <= 4.0) band = '80m'
  else if (frequencyMHz >= 7.0 && frequencyMHz <= 7.3) band = '40m'
  else if (frequencyMHz >= 14.0 && frequencyMHz <= 14.35) band = '20m'
  else if (frequencyMHz >= 21.0 && frequencyMHz <= 21.45) band = '15m'
  else if (frequencyMHz >= 28.0 && frequencyMHz <= 29.7) band = '10m'
  else if (frequencyMHz >= 50.0 && frequencyMHz <= 54.0) band = '6m'
  else band = `${Math.round(frequencyMHz)}MHz`

  return {
    callsign: wsjtxContact.dxCall,
    frequency: wsjtxContact.txFrequency,
    mode: wsjtxContact.mode,
    rstSent: wsjtxContact.reportSent,
    rstReceived: wsjtxContact.reportReceived,
    datetime: wsjtxContact.dateTimeOn,
    band: band,
    power: wsjtxContact.txPower ? parseInt(wsjtxContact.txPower) : undefined,
    name: wsjtxContact.name || undefined,
    grid: wsjtxContact.dxGrid || undefined,
    comment: wsjtxContact.comments || undefined
  }
}