export interface RadioData {
  frequency: number
  mode: string
  power: number
  vswr: number
  band: string
  split: boolean
  ritFrequency?: number
  transmitting: boolean
  timestamp: Date
}

export interface RadioConfig {
  type: 'flexradio' | 'yaesu' | 'icom' | 'kenwood'
  connection: {
    host?: string
    port?: number
    serialPort?: string
    baudRate?: number
  }
  model: string
}

export interface RadioDriver {
  name: string
  models: string[]
  connect(config: RadioConfig): Promise<boolean>
  disconnect(): Promise<void>
  getCurrentData(): Promise<RadioData>
  isConnected(): boolean
  on(event: string, callback: (data: any) => void): void
  off(event: string, callback: (data: any) => void): void
}

export interface FlexRadioSlice {
  id: number
  frequency: number
  mode: string
  active: boolean
  txant: string
  rxant: string
  wide: number
  locked: boolean
}

export interface FlexRadioStatus {
  radio: {
    model: string
    version: string
    serial: string
    callsign: string
  }
  slices: FlexRadioSlice[]
  transmit: {
    frequency: number
    power: number
    tune: boolean
  }
  interlock: {
    state: string
    reason: string
  }
}