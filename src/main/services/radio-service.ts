import { EventEmitter } from 'events'
import { RadioDriver, RadioConfig, RadioData } from '../../types/radio'
import { FlexRadio6400Driver } from '../drivers/flexradio-6400'

export class RadioService extends EventEmitter {
  private driver: RadioDriver | null = null
  private currentConfig: RadioConfig | null = null

  initialize() {
    // Initialize any global radio service settings
  }

  async connect(config: RadioConfig): Promise<boolean> {
    try {
      if (this.driver) {
        await this.disconnect()
      }

      this.driver = this.createDriver(config)

      if (!this.driver) {
        throw new Error(`Unsupported radio type: ${config.type}`)
      }

      // Set up event forwarding
      this.driver.on('data-update', (data: RadioData) => {
        this.emit('data-update', data)
      })

      this.driver.on('error', (error: Error) => {
        this.emit('error', error)
      })

      const connected = await this.driver.connect(config)

      if (connected) {
        this.currentConfig = config
      }

      return connected
    } catch (error) {
      console.error('Radio connection failed:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.disconnect()
      this.driver = null
      this.currentConfig = null
    }
  }

  async getCurrentData(): Promise<RadioData | null> {
    if (!this.driver || !this.driver.isConnected()) {
      return null
    }

    try {
      return await this.driver.getCurrentData()
    } catch (error) {
      console.error('Failed to get radio data:', error)
      return null
    }
  }

  isConnected(): boolean {
    return this.driver?.isConnected() ?? false
  }

  getCurrentConfig(): RadioConfig | null {
    return this.currentConfig
  }

  private createDriver(config: RadioConfig): RadioDriver | null {
    switch (config.type) {
      case 'flexradio':
        return new FlexRadio6400Driver()
      // Add other radio drivers here as needed
      // case 'yaesu':
      //   return new YaesuDriver()
      // case 'icom':
      //   return new IcomDriver()
      // case 'kenwood':
      //   return new KenwoodDriver()
      default:
        return null
    }
  }
}