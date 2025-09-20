export interface NextlogSettings {
  apiUrl: string
  apiKey: string
  autoSubmit: boolean
}

export interface RadioSettings {
  lastConnectedType: string
  lastConnectedHost: string
  lastConnectedPort: string
  autoReconnect: boolean
  pollInterval: number
}

export interface WSJTXSettings {
  udpPort: number
  autoLog: boolean
  enabled: boolean
}

export interface AppSettings {
  nextlog: NextlogSettings
  radio: RadioSettings
  wsjtx: WSJTXSettings
}

// Default settings
export const defaultSettings: AppSettings = {
  nextlog: {
    apiUrl: 'https://nextlog.app/api/v1',
    apiKey: '',
    autoSubmit: false
  },
  radio: {
    lastConnectedType: 'flexradio',
    lastConnectedHost: '192.168.1.100',
    lastConnectedPort: '4992',
    autoReconnect: true,
    pollInterval: 500
  },
  wsjtx: {
    udpPort: 2237,
    autoLog: true,
    enabled: true
  }
}