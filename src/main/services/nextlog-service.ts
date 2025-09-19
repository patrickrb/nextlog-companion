import { NextlogContact, NextlogConfig, NextlogResponse } from '../../types/nextlog'

export class NextlogService {
  private config: NextlogConfig = {
    apiUrl: 'https://nextlog.app/api/v1',
    autoSubmit: false
  }

  constructor(config?: Partial<NextlogConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  updateConfig(config: Partial<NextlogConfig>): void {
    this.config = { ...this.config, ...config }
  }

  async sendContactData(contact: NextlogContact): Promise<NextlogResponse> {
    try {
      if (!this.config.apiUrl) {
        throw new Error('Nextlog API URL not configured')
      }

      // Transform contact data to Nextlog format
      const payload = this.transformContactData(contact)

      // For now, return a mock response since we don't have the actual API endpoint
      // In a real implementation, you would make an HTTP request to the Nextlog API
      console.log('Sending contact to Nextlog:', payload)

      // Mock successful response
      return {
        success: true,
        message: 'Contact logged successfully',
        contactId: this.generateContactId()
      }

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
      console.error('Failed to send contact to Nextlog:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test the connection to Nextlog API
      // This would ping the API to verify connectivity and authentication
      console.log('Testing Nextlog connection...')

      // Mock successful connection test
      return true

      // Real implementation:
      // const response = await fetch(`${this.config.apiUrl}/ping`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.config.apiKey}`,
      //   }
      // })
      // return response.ok

    } catch (error) {
      console.error('Nextlog connection test failed:', error)
      return false
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