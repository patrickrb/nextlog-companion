import { EventEmitter } from 'events'
import { createSocket, RemoteInfo } from 'dgram'
import { WSJTXStatus, WSJTXDecode, WSJTXQSOLogged } from '../types/wsjtx'
import { SettingsService } from './settings-service'

export class WSJTXService extends EventEmitter {
  private udpSocket: ReturnType<typeof createSocket> | null = null
  private port = 2237 // Default WSJT-X UDP port
  private settingsService?: SettingsService
  private status: WSJTXStatus = {
    isRunning: false,
    mode: '',
    frequency: 0,
    callsign: '',
    grid: '',
    txEnabled: false,
    transmitting: false,
    decoding: false
  }

  constructor(settingsService?: SettingsService) {
    super()
    this.settingsService = settingsService

    if (settingsService) {
      // Load settings from persistent storage
      const savedSettings = settingsService.getWSJTXSettings()
      this.port = savedSettings.udpPort
      console.log('[WSJT-X] Loaded settings from storage:', savedSettings)

      // Listen for settings changes
      settingsService.on('wsjtx-settings-changed', (newSettings) => {
        const oldPort = this.port
        this.port = newSettings.udpPort
        console.log('[WSJT-X] Settings updated from storage:', newSettings)

        // If the port changed and we have an active socket, restart it
        if (oldPort !== this.port && this.udpSocket) {
          console.log(`[WSJT-X] Port changed from ${oldPort} to ${this.port}, restarting UDP listener`)
          this.destroy()
          this.setupUdpListener()
        }
      })
    }
  }

  initialize(): void {
    this.setupUdpListener()
  }

  private setupUdpListener(): void {
    try {
      this.udpSocket = createSocket('udp4')

      this.udpSocket.on('message', (message, remote) => {
        this.parseWSJTXMessage(message, remote)
      })

      this.udpSocket.on('error', (error) => {
        console.error('WSJT-X UDP socket error:', error)
        this.emit('error', error)
      })

      this.udpSocket.bind(this.port, () => {
        console.log(`WSJT-X UDP listener started on port ${this.port}`)
      })

    } catch (error) {
      console.error('Failed to setup WSJT-X UDP listener:', error)
    }
  }

  private parseWSJTXMessage(message: Buffer, remote: RemoteInfo): void {
    try {
      // Log all incoming UDP messages for debugging
      console.log(`[WSJT-X] Received UDP message from ${remote.address}:${remote.port}, length: ${message.length} bytes`)
      console.log(`[WSJT-X] Raw message (hex):`, message.toString('hex'))

      // WSJT-X uses a binary protocol
      // This is a simplified parser - full implementation would handle all message types

      if (message.length < 4) {
        console.log('[WSJT-X] Message too short, ignoring')
        return
      }

      const messageType = message.readUInt32BE(0)
      console.log(`[WSJT-X] Message type: ${messageType}`)

      switch (messageType) {
        case 1: // Status
          console.log('[WSJT-X] Processing Status message')
          this.parseStatusMessage(message)
          break
        case 2: // Decode
          console.log('[WSJT-X] Processing Decode message')
          this.parseDecodeMessage(message)
          break
        case 5: // QSO Logged
          console.log('[WSJT-X] Processing QSO Logged message')
          this.parseQSOLoggedMessage(message)
          break
        case 12: // ADIF Logged
          console.log('[WSJT-X] Processing ADIF Logged message')
          this.parseADIFLoggedMessage(message)
          break
        default:
          console.log(`[WSJT-X] Unknown message type: ${messageType}`)
      }

    } catch (error) {
      console.error('[WSJT-X] Error parsing message:', error)
    }
  }

  private parseStatusMessage(message: Buffer): void {
    // Parse WSJT-X status message
    // This is a placeholder implementation

    try {
      // In a real implementation, you would decode the binary format
      // For now, we'll update with mock data to show the structure

      this.status = {
        isRunning: true,
        mode: 'FT8', // Would be parsed from message
        frequency: 14074000, // Would be parsed from message
        callsign: 'N0CALL', // Would be parsed from message
        grid: 'EM00', // Would be parsed from message
        txEnabled: true,
        transmitting: false, // Would be parsed from message
        decoding: true // Would be parsed from message
      }

      this.emit('status-update', this.status)
      console.log('[WSJT-X] Status updated:', this.status)

    } catch (error) {
      console.error('Error parsing WSJT-X status:', error)
    }
  }

  private parseDecodeMessage(message: Buffer): void {
    // Parse WSJT-X decode message
    try {
      // Mock decode data - real implementation would parse binary format
      const decode: WSJTXDecode = {
        time: new Date().toISOString().substr(11, 8),
        snr: -10,
        dt: 0.5,
        frequency: 1234,
        mode: 'FT8',
        message: 'CQ DX N0CALL EM00',
        lowConfidence: false,
        offAir: false
      }

      this.emit('decode', decode)
      console.log('[WSJT-X] Decode received:', decode)

    } catch (error) {
      console.error('Error parsing WSJT-X decode:', error)
    }
  }

  private parseQSOLoggedMessage(message: Buffer): void {
    // Parse WSJT-X QSO logged message
    try {
      // Mock QSO data - real implementation would parse binary format
      const qso: WSJTXQSOLogged = {
        dateTimeOff: new Date(),
        dxCall: 'DL1ABC',
        dxGrid: 'JO62',
        txFrequency: 14074000,
        mode: 'FT8',
        reportSent: '-08',
        reportReceived: '-12',
        txPower: '100',
        comments: '',
        name: '',
        dateTimeOn: new Date(Date.now() - 120000), // 2 minutes ago
        operatorCall: 'N0CALL',
        myCall: 'N0CALL',
        myGrid: 'EM00',
        exchangeSent: '',
        exchangeReceived: '',
        adifPropagationMode: ''
      }

      this.emit('contact-logged', qso)
      console.log('[WSJT-X] QSO logged - emitting event:', qso)

    } catch (error) {
      console.error('Error parsing WSJT-X QSO logged:', error)
    }
  }

  private parseADIFLoggedMessage(message: Buffer): void {
    // Parse WSJT-X ADIF logged message
    try {
      // This would parse the ADIF format contact data
      console.log('[WSJT-X] ADIF logged message received')
    } catch (error) {
      console.error('Error parsing WSJT-X ADIF logged:', error)
    }
  }

  getStatus(): WSJTXStatus {
    return { ...this.status }
  }

  async sendHeartbeat(): Promise<void> {
    // Send heartbeat to WSJT-X to maintain connection
    // Implementation would send a heartbeat UDP packet
    console.log('Sending WSJT-X heartbeat')
  }

  async enableTx(enable: boolean): Promise<void> {
    // Enable/disable transmission in WSJT-X
    // Implementation would send enable/disable TX command
    console.log(`${enable ? 'Enabling' : 'Disabling'} WSJT-X transmission`)
  }

  destroy(): void {
    if (this.udpSocket) {
      this.udpSocket.close()
      this.udpSocket = null
    }
  }

  // Test function to simulate a contact being logged
  simulateContactLogged(): void {
    console.log('[WSJT-X] Simulating a contact logged event for testing...')

    const testContact: WSJTXQSOLogged = {
      dateTimeOff: new Date(),
      dxCall: 'W1ABC',
      dxGrid: 'FN42',
      txFrequency: 14074000,
      mode: 'FT8',
      reportSent: '-08',
      reportReceived: '-12',
      txPower: '100',
      comments: 'Test QSO via simulator',
      name: 'John',
      dateTimeOn: new Date(Date.now() - 120000), // 2 minutes ago
      operatorCall: 'N0CALL',
      myCall: 'N0CALL',
      myGrid: 'EM00',
      exchangeSent: '',
      exchangeReceived: '',
      adifPropagationMode: ''
    }

    this.emit('contact-logged', testContact)
    console.log('[WSJT-X] Test contact logged - emitting event:', testContact)
  }
}