import { contextBridge, ipcRenderer } from 'electron'

const api = {
  radio: {
    getData: () => ipcRenderer.invoke('radio:get-data'),
    connect: (config: any) => ipcRenderer.invoke('radio:connect', config),
    disconnect: () => ipcRenderer.invoke('radio:disconnect'),
    onDataUpdate: (callback: (data: any) => void) => {
      const subscription = (_: any, data: any) => callback(data)
      ipcRenderer.on('radio:data-update', subscription)
      return () => ipcRenderer.removeListener('radio:data-update', subscription)
    }
  },
  nextlog: {
    sendData: (data: any) => ipcRenderer.invoke('nextlog:send-data', data)
  },
  wsjtx: {
    getStatus: () => ipcRenderer.invoke('wsjtx:get-status'),
    onContactLogged: (callback: (contact: any) => void) => {
      const subscription = (_: any, contact: any) => callback(contact)
      ipcRenderer.on('wsjtx:contact-logged', subscription)
      return () => ipcRenderer.removeListener('wsjtx:contact-logged', subscription)
    }
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api