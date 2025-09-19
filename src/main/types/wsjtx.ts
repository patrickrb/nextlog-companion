export interface WSJTXStatus {
  isRunning: boolean
  mode: string
  frequency: number
  callsign: string
  grid: string
  txEnabled: boolean
  transmitting: boolean
  decoding: boolean
}

export interface WSJTXDecode {
  time: string
  snr: number
  dt: number
  frequency: number
  mode: string
  message: string
  lowConfidence: boolean
  offAir: boolean
}

export interface WSJTXQSOLogged {
  dateTimeOff: Date
  dxCall: string
  dxGrid: string
  txFrequency: number
  mode: string
  reportSent: string
  reportReceived: string
  txPower: string
  comments: string
  name: string
  dateTimeOn: Date
  operatorCall: string
  myCall: string
  myGrid: string
  exchangeSent: string
  exchangeReceived: string
  adifPropagationMode: string
}