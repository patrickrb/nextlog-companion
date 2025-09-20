import { NextlogContact, NextlogConfig, NextlogResponse } from '../types/nextlog'
import { SettingsService } from './settings-service'

export class NextlogService {
  private config: NextlogConfig = {
    apiUrl: 'https://nextlog.app/api/v1',
    autoSubmit: false
  }
  private settingsService?: SettingsService

  constructor(config?: Partial<NextlogConfig>, settingsService?: SettingsService) {
    this.settingsService = settingsService

    if (settingsService) {
      // Load settings from persistent storage
      const savedSettings = settingsService.getNextlogSettings()
      this.config = {
        apiUrl: savedSettings.apiUrl,
        apiKey: savedSettings.apiKey,
        autoSubmit: savedSettings.autoSubmit
      }
      console.log('[Nextlog] Loaded settings from storage:', this.config)

      // Listen for settings changes
      settingsService.on('nextlog-settings-changed', (newSettings) => {
        this.config = {
          apiUrl: newSettings.apiUrl,
          apiKey: newSettings.apiKey,
          autoSubmit: newSettings.autoSubmit
        }
        console.log('[Nextlog] Settings updated from storage:', this.config)
      })
    } else if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  updateConfig(config: Partial<NextlogConfig>): void {
    this.config = { ...this.config, ...config }
  }

  async sendContactData(contact: NextlogContact): Promise<NextlogResponse> {
    try {
      console.log('[Nextlog] Starting to send contact data...')
      console.log('[Nextlog] Input contact:', contact)

      if (!this.config.apiUrl) {
        console.error('[Nextlog] API URL not configured')
        throw new Error('Nextlog API URL not configured')
      }

      // Transform contact data to Nextlog format
      const payload = this.transformContactData(contact)
      console.log('[Nextlog] Transformed payload:', payload)

      // For now, return a mock response since we don't have the actual API endpoint
      // In a real implementation, you would make an HTTP request to the Nextlog API
      console.log('[Nextlog] Sending contact to Nextlog API (mock):', payload)

      // Mock successful response
      const response = {
        success: true,
        message: 'Contact logged successfully',
        contactId: this.generateContactId()
      }

      console.log('[Nextlog] Mock response:', response)
      return response

      // Real implementation would look like:
      // const response = await fetch(`${this.config.apiUrl}/contacts`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.config.apiKey}`,
      //   },
      //   body: JSON.stringify(payload)
      // })
      //
      // return await response.json()

    } catch (error) {
      console.error('[Nextlog] Failed to send contact to Nextlog:', error)
      const response = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
      console.log('[Nextlog] Error response:', response)
      return response
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('[Nextlog] Testing connection...')

      if (!this.config.apiUrl) {
        return {
          success: false,
          message: 'API URL not configured'
        }
      }

      if (!this.config.apiKey) {
        return {
          success: false,
          message: 'API Key not configured'
        }
      }

      // Test the connection to Nextlog API using the ping endpoint
      const testUrl = `${this.config.apiUrl}/ping`
      console.log(`[Nextlog] Testing connection to: ${testUrl}`)

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Nextlog-Companion/1.0.0'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log(`[Nextlog] Response status: ${response.status}`)

      if (response.ok) {
        const data = await response.text()
        console.log(`[Nextlog] Ping response: ${data}`)

        // Try to parse JSON response from ping endpoint
        try {
          const jsonData = JSON.parse(data)
          return {
            success: true,
            message: `Connection successful${jsonData.user ? ` (User: ${jsonData.user})` : ''}`,
            details: { status: response.status, data: jsonData, endpoint: testUrl }
          }
        } catch {
          return {
            success: true,
            message: 'Connection successful',
            details: { status: response.status, data, endpoint: testUrl }
          }
        }
      } else if (response.status === 401) {
        const errorText = await response.text()
        return {
          success: false,
          message: 'API key is invalid or expired',
          details: { status: response.status, error: errorText, endpoint: testUrl }
        }
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'Ping endpoint not found - check your API URL',
          details: { status: response.status, endpoint: testUrl }
        }
      } else {
        const errorText = await response.text()
        console.log(`[Nextlog] Error response: ${errorText}`)
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: { status: response.status, error: errorText, endpoint: testUrl }
        }
      }

    } catch (error) {
      console.error('[Nextlog] Connection test failed:', error)

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: 'Connection timeout - check your internet connection',
          details: 'Request timed out after 10 seconds'
        }
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Network error - check your internet connection',
          details: error.message
        }
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }
    }
  }

  private transformContactData(contact: NextlogContact): any {
    return {
      call: contact.callsign,
      freq: contact.frequency,
      mode: contact.mode,
      rst_sent: contact.rstSent,
      rst_rcvd: contact.rstReceived,
      qso_date: contact.datetime.toISOString().split('T')[0],
      time_on: contact.datetime.toTimeString().split(' ')[0],
      band: contact.band,
      tx_pwr: contact.power,
      name: contact.name,
      qth: contact.qth,
      gridsquare: contact.grid,
      country: contact.country,
      state: contact.state,
      cnty: contact.county,
      iota: contact.iota,
      sota_ref: contact.sota,
      wwff_ref: contact.wwff,
      pota_ref: contact.pota,
      comment: contact.comment
    }
  }

  private generateContactId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getConfig(): NextlogConfig {
    return { ...this.config }
  }
}