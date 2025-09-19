import { EventEmitter } from 'events'
import { Socket } from 'net'
import { createSocket } from 'dgram'
import { RadioDriver, RadioConfig, RadioData, FlexRadioStatus } from '../types/radio'

export class FlexRadio6400Driver extends EventEmitter implements RadioDriver {
  name = 'FlexRadio 6400'
  models = ['6400', '6400M', '6500', '6600', '6600M', '6700']

  private tcpClient: Socket | null = null
  private vitaSocket: ReturnType<typeof createSocket> | null = null
  private connected = false
  private config: RadioConfig | null = null
  private radioStatus: FlexRadioStatus | null = null
  private dataTimer: NodeJS.Timeout | null = null

  async connect(config: RadioConfig): Promise<boolean> {
    try {
      this.config = config
      const host = config.connection.host || '192.168.1.100'
      const port = config.connection.port || 4992

      // Establish TCP connection for command/control
      this.tcpClient = new Socket()

      return new Promise((resolve, reject) => {
        if (!this.tcpClient) {
          reject(new Error('TCP client not initialized'))
          return
        }

        this.tcpClient.connect(port, host, () => {
          console.log(`Connected to FlexRadio at ${host}:${port}`)
          this.setupTcpHandlers()
          this.connected = true
          this.startDataPolling()
          resolve(true)
        })

        this.tcpClient.on('error', (error) => {
          console.error('FlexRadio TCP connection error:', error)
          this.connected = false
          reject(error)
        })

        // Set connection timeout
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Connection timeout'))
          }
        }, 10000)
      })
    } catch (error) {
      console.error('FlexRadio connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false

    if (this.dataTimer) {
      clearInterval(this.dataTimer)
      this.dataTimer = null
    }

    if (this.tcpClient) {
      this.tcpClient.destroy()
      this.tcpClient = null
    }

    if (this.vitaSocket) {
      this.vitaSocket.close()
      this.vitaSocket = null
    }

    console.log('Disconnected from FlexRadio')
  }

  async getCurrentData(): Promise<RadioData> {
    if (!this.connected || !this.radioStatus) {
      throw new Error('Not connected to radio')
    }

    const activeSlice = this.radioStatus.slices.find(s => s.active) || this.radioStatus.slices[0]

    if (!activeSlice) {
      throw new Error('No active slice found')
    }

    return {
      frequency: activeSlice.frequency,
      mode: activeSlice.mode,
      power: this.radioStatus.transmit.power,
      vswr: 1.0, // Would need to parse from VITA data
      band: this.frequencyToBand(activeSlice.frequency),
      split: false, // Would need to determine from slice configuration
      transmitting: this.radioStatus.transmit.tune,
      timestamp: new Date()
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  private setupTcpHandlers(): void {
    if (!this.tcpClient) return

    this.tcpClient.on('data', (data) => {
      this.parseFlexRadioResponse(data.toString())
    })

    this.tcpClient.on('close', () => {
      console.log('FlexRadio TCP connection closed')
      this.connected = false
      this.emit('disconnected')
    })

    this.tcpClient.on('error', (error) => {
      console.error('FlexRadio TCP error:', error)
      this.emit('error', error)
    })

    // Send initial commands to get radio status
    this.sendCommand('version')
    this.sendCommand('info')
    this.sendCommand('slice list')
  }

  private sendCommand(command: string): void {
    if (this.tcpClient && this.connected) {
      this.tcpClient.write(command + '\\n')
    }
  }

  private parseFlexRadioResponse(response: string): void {
    const lines = response.split('\\n').filter(line => line.trim())

    for (const line of lines) {
      this.parseStatusLine(line.trim())
    }
  }

  private parseStatusLine(line: string): void {
    // Parse FlexRadio CAT responses
    // This is a simplified parser - full implementation would handle all status messages

    if (line.startsWith('S')) {
      // Status message
      const parts = line.split('|')
      if (parts.length >= 2) {
        const statusType = parts[0]
        const data = parts[1]

        if (statusType.includes('slice')) {
          this.parseSliceStatus(data)
        } else if (statusType.includes('transmit')) {
          this.parseTransmitStatus(data)
        }
      }
    } else if (line.startsWith('R')) {
      // Response to command
      console.log('FlexRadio response:', line)
    }
  }

  private parseSliceStatus(data: string): void {
    // Parse slice status and update radioStatus
    // Implementation would parse frequency, mode, etc.
    console.log('Slice status:', data)
  }

  private parseTransmitStatus(data: string): void {
    // Parse transmit status
    console.log('Transmit status:', data)
  }

  private startDataPolling(): void {
    // Poll for radio data every 500ms
    this.dataTimer = setInterval(async () => {
      try {
        const data = await this.getCurrentData()
        this.emit('data-update', data)
      } catch (error) {
        console.error('Error getting radio data:', error)
      }
    }, 500)
  }

  private frequencyToBand(frequency: number): string {
    // Convert frequency to ham band
    const freqMHz = frequency / 1000000

    if (freqMHz >= 1.8 && freqMHz <= 2.0) return '160m'
    if (freqMHz >= 3.5 && freqMHz <= 4.0) return '80m'
    if (freqMHz >= 5.3 && freqMHz <= 5.4) return '60m'
    if (freqMHz >= 7.0 && freqMHz <= 7.3) return '40m'
    if (freqMHz >= 10.1 && freqMHz <= 10.15) return '30m'
    if (freqMHz >= 14.0 && freqMHz <= 14.35) return '20m'
    if (freqMHz >= 18.068 && freqMHz <= 18.168) return '17m'
    if (freqMHz >= 21.0 && freqMHz <= 21.45) return '15m'
    if (freqMHz >= 24.89 && freqMHz <= 24.99) return '12m'
    if (freqMHz >= 28.0 && freqMHz <= 29.7) return '10m'
    if (freqMHz >= 50.0 && freqMHz <= 54.0) return '6m'
    if (freqMHz >= 144.0 && freqMHz <= 148.0) return '2m'
    if (freqMHz >= 420.0 && freqMHz <= 450.0) return '70cm'

    return 'Unknown'
  }
}