import { EventEmitter } from 'events'
import { AppSettings, NextlogSettings, RadioSettings, WSJTXSettings, defaultSettings } from '../types/settings'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

export class SettingsService extends EventEmitter {
  private settings: AppSettings = { ...defaultSettings }
  private settingsFile: string

  constructor() {
    super()

    // Use app user data directory for settings file
    const userDataPath = app.getPath('userData')
    this.settingsFile = path.join(userDataPath, 'nextlog-companion-settings.json')

    // Load settings from file or use defaults
    this.loadSettings()

    console.log('[Settings] Settings service initialized')
    console.log('[Settings] Settings file location:', this.settingsFile)
    console.log('[Settings] Current settings:', this.settings)
  }

  private loadSettings(): void {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const data = fs.readFileSync(this.settingsFile, 'utf-8')
        const loadedSettings = JSON.parse(data)
        // Merge with defaults to ensure all properties exist
        this.settings = { ...defaultSettings, ...loadedSettings }
        console.log('[Settings] Loaded settings from file')
      } else {
        this.settings = { ...defaultSettings }
        console.log('[Settings] Using default settings')
      }
    } catch (error) {
      console.error('[Settings] Failed to load settings, using defaults:', error)
      this.settings = { ...defaultSettings }
    }
  }

  private saveSettings(): void {
    try {
      // Ensure the directory exists
      const dir = path.dirname(this.settingsFile)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Write settings to file
      fs.writeFileSync(this.settingsFile, JSON.stringify(this.settings, null, 2))
      console.log('[Settings] Settings saved to file')
    } catch (error) {
      console.error('[Settings] Failed to save settings:', error)
    }
  }

  // Get all settings
  getAllSettings(): AppSettings {
    return { ...this.settings }
  }

  // Nextlog settings
  getNextlogSettings(): NextlogSettings {
    return { ...this.settings.nextlog }
  }

  updateNextlogSettings(settings: Partial<NextlogSettings>): void {
    const updated = { ...this.settings.nextlog, ...settings }
    this.settings.nextlog = updated
    this.saveSettings()
    console.log('[Settings] Nextlog settings updated:', updated)
    this.emit('nextlog-settings-changed', updated)
  }

  // Radio settings
  getRadioSettings(): RadioSettings {
    return { ...this.settings.radio }
  }

  updateRadioSettings(settings: Partial<RadioSettings>): void {
    const updated = { ...this.settings.radio, ...settings }
    this.settings.radio = updated
    this.saveSettings()
    console.log('[Settings] Radio settings updated:', updated)
    this.emit('radio-settings-changed', updated)
  }

  // WSJT-X settings
  getWSJTXSettings(): WSJTXSettings {
    return { ...this.settings.wsjtx }
  }

  updateWSJTXSettings(settings: Partial<WSJTXSettings>): void {
    const updated = { ...this.settings.wsjtx, ...settings }
    this.settings.wsjtx = updated
    this.saveSettings()
    console.log('[Settings] WSJT-X settings updated:', updated)
    this.emit('wsjtx-settings-changed', updated)
  }

  // Generic setting methods
  getSetting<T>(key: keyof AppSettings): T {
    return this.settings[key] as T
  }

  setSetting<T>(key: keyof AppSettings, value: T): void {
    (this.settings as any)[key] = value
    this.saveSettings()
    console.log(`[Settings] Setting ${key} updated:`, value)
    this.emit('setting-changed', { key, value })
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.settings = { ...defaultSettings }
    this.saveSettings()
    console.log('[Settings] All settings reset to defaults')
    this.emit('settings-reset', this.settings)
  }

  // Reset specific section
  resetNextlogSettings(): void {
    this.settings.nextlog = { ...defaultSettings.nextlog }
    this.saveSettings()
    console.log('[Settings] Nextlog settings reset to defaults')
    this.emit('nextlog-settings-changed', this.settings.nextlog)
  }

  resetRadioSettings(): void {
    this.settings.radio = { ...defaultSettings.radio }
    this.saveSettings()
    console.log('[Settings] Radio settings reset to defaults')
    this.emit('radio-settings-changed', this.settings.radio)
  }

  resetWSJTXSettings(): void {
    this.settings.wsjtx = { ...defaultSettings.wsjtx }
    this.saveSettings()
    console.log('[Settings] WSJT-X settings reset to defaults')
    this.emit('wsjtx-settings-changed', this.settings.wsjtx)
  }

  // Export/Import settings
  exportSettings(): AppSettings {
    const settings = this.getAllSettings()
    console.log('[Settings] Settings exported')
    return settings
  }

  importSettings(settings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...settings }
    this.saveSettings()
    console.log('[Settings] Settings imported:', this.settings)
    this.emit('settings-imported', this.settings)
  }

  // Check if settings file exists and has been initialized
  isInitialized(): boolean {
    return fs.existsSync(this.settingsFile)
  }

  // Get the settings file path for debugging
  getSettingsPath(): string {
    return this.settingsFile
  }
}