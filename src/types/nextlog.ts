export interface NextlogContact {
  callsign: string
  frequency: number
  mode: string
  rstSent: string
  rstReceived: string
  datetime: Date
  band: string
  power?: number
  name?: string
  qth?: string
  grid?: string
  country?: string
  state?: string
  county?: string
  iota?: string
  sota?: string
  wwff?: string
  pota?: string
  comment?: string
}

export interface NextlogConfig {
  apiUrl: string
  apiKey?: string
  userId?: string
  autoSubmit: boolean
}

export interface NextlogResponse {
  success: boolean
  message: string
  contactId?: string
}