import { contextBridge, ipcRenderer } from 'electron'

const api = {
  radio: {
    getData: () => ipcRenderer.invoke('radio:get-data'),
    connect: (config: any) => ipcRenderer.invoke('radio:connect', config),
    disconnect: () => ipcRenderer.invoke('radio:disconnect'),
    getLastConnection: () => ipcRenderer.invoke('radio:get-last-connection'),
    onDataUpdate: (callback: (data: any) => void) => {
      const subscription = (_: any, data: any) => callback(data)
      ipcRenderer.on('radio:data-update', subscription)
      return () => ipcRenderer.removeListener('radio:data-update', subscription)
    }
  },
  nextlog: {
    sendData: (data: any) => ipcRenderer.invoke('nextlog:send-data', data),
    testConnection: () => ipcRenderer.invoke('nextlog:test-connection')
  },
  wsjtx: {
    getStatus: () => ipcRenderer.invoke('wsjtx:get-status'),
    simulateContact: () => ipcRenderer.invoke('wsjtx:simulate-contact'),
    onContactLogged: (callback: (contact: any) => void) => {
      const subscription = (_: any, contact: any) => callback(contact)
      ipcRenderer.on('wsjtx:contact-logged', subscription)
      return () => ipcRenderer.removeListener('wsjtx:contact-logged', subscription)
    }
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:get-all'),
    getNextlog: () => ipcRenderer.invoke('settings:get-nextlog'),
    updateNextlog: (settings: any) => ipcRenderer.invoke('settings:update-nextlog', settings),
    getRadio: () => ipcRenderer.invoke('settings:get-radio'),
    updateRadio: (settings: any) => ipcRenderer.invoke('settings:update-radio', settings),
    getWSJTX: () => ipcRenderer.invoke('settings:get-wsjtx'),
    updateWSJTX: (settings: any) => ipcRenderer.invoke('settings:update-wsjtx', settings),
    resetToDefaults: () => ipcRenderer.invoke('settings:reset-to-defaults'),
    export: () => ipcRenderer.invoke('settings:export'),
    import: (settings: any) => ipcRenderer.invoke('settings:import', settings)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api