import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Settings, Radio, Globe, Wifi, WifiOff, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export function SettingsPanel() {
  const [nextlogSettings, setNextlogSettings] = useState({
    apiUrl: 'https://nextlog.app/api/v1',
    apiKey: '',
    autoSubmit: false,
    connectionStatus: 'unknown' as 'connected' | 'disconnected' | 'unknown' | 'testing'
  })

  const [radioSettings, setRadioSettings] = useState({
    lastConnectedType: 'flexradio',
    lastConnectedHost: '192.168.1.100',
    lastConnectedPort: '4992',
    autoReconnect: true,
    pollInterval: 500,
    connectionStatus: 'disconnected' as 'connected' | 'disconnected' | 'connecting'
  })

  const [wsjtxSettings, setWSJTXSettings] = useState({
    udpPort: 2237,
    autoLog: true,
    enabled: true,
    status: 'listening' as 'listening' | 'disabled' | 'error'
  })

  // Load settings from persistent storage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [nextlog, radio, wsjtx] = await Promise.all([
          (window as any).electronAPI.settings.getNextlog(),
          (window as any).electronAPI.settings.getRadio(),
          (window as any).electronAPI.settings.getWSJTX()
        ])

        setNextlogSettings(prev => ({
          ...prev,
          apiUrl: nextlog.apiUrl,
          apiKey: nextlog.apiKey,
          autoSubmit: nextlog.autoSubmit
        }))

        setRadioSettings(prev => ({
          ...prev,
          lastConnectedType: radio.lastConnectedType,
          lastConnectedHost: radio.lastConnectedHost,
          lastConnectedPort: radio.lastConnectedPort,
          autoReconnect: radio.autoReconnect,
          pollInterval: radio.pollInterval
        }))

        setWSJTXSettings(prev => ({
          ...prev,
          udpPort: wsjtx.udpPort,
          autoLog: wsjtx.autoLog,
          enabled: wsjtx.enabled
        }))

        console.log('[SettingsPanel] Loaded settings from storage')
      } catch (error) {
        console.error('[SettingsPanel] Failed to load settings:', error)
      }
    }

    loadSettings()
  }, [])

  // Save settings functions
  const saveNextlogSettings = async (settings: Partial<typeof nextlogSettings>) => {
    try {
      await (window as any).electronAPI.settings.updateNextlog({
        apiUrl: settings.apiUrl !== undefined ? settings.apiUrl : nextlogSettings.apiUrl,
        apiKey: settings.apiKey !== undefined ? settings.apiKey : nextlogSettings.apiKey,
        autoSubmit: settings.autoSubmit !== undefined ? settings.autoSubmit : nextlogSettings.autoSubmit
      })
      console.log('[SettingsPanel] Nextlog settings saved')
    } catch (error) {
      console.error('[SettingsPanel] Failed to save Nextlog settings:', error)
    }
  }

  const saveRadioSettings = async (settings: Partial<typeof radioSettings>) => {
    try {
      await (window as any).electronAPI.settings.updateRadio({
        lastConnectedType: settings.lastConnectedType !== undefined ? settings.lastConnectedType : radioSettings.lastConnectedType,
        lastConnectedHost: settings.lastConnectedHost !== undefined ? settings.lastConnectedHost : radioSettings.lastConnectedHost,
        lastConnectedPort: settings.lastConnectedPort !== undefined ? settings.lastConnectedPort : radioSettings.lastConnectedPort,
        autoReconnect: settings.autoReconnect !== undefined ? settings.autoReconnect : radioSettings.autoReconnect,
        pollInterval: settings.pollInterval !== undefined ? settings.pollInterval : radioSettings.pollInterval
      })
      console.log('[SettingsPanel] Radio settings saved')
    } catch (error) {
      console.error('[SettingsPanel] Failed to save Radio settings:', error)
    }
  }

  const saveWSJTXSettings = async (settings: Partial<typeof wsjtxSettings>) => {
    try {
      await (window as any).electronAPI.settings.updateWSJTX({
        udpPort: settings.udpPort !== undefined ? settings.udpPort : wsjtxSettings.udpPort,
        autoLog: settings.autoLog !== undefined ? settings.autoLog : wsjtxSettings.autoLog,
        enabled: settings.enabled !== undefined ? settings.enabled : wsjtxSettings.enabled
      })
      console.log('[SettingsPanel] WSJT-X settings saved')
    } catch (error) {
      console.error('[SettingsPanel] Failed to save WSJT-X settings:', error)
    }
  }

  const testNextlogConnection = async () => {
    setNextlogSettings(prev => ({ ...prev, connectionStatus: 'testing' }))

    try {
      console.log('[SettingsPanel] Testing Nextlog connection...')
      const result = await (window as any).electronAPI.nextlog.testConnection()

      console.log('[SettingsPanel] Connection test result:', result)

      setNextlogSettings(prev => ({
        ...prev,
        connectionStatus: result.success ? 'connected' : 'disconnected'
      }))

      if (!result.success) {
        console.error('[SettingsPanel] Connection test failed:', result.message)
        // Could show a toast notification here with result.message
      }
    } catch (error) {
      console.error('[SettingsPanel] Connection test error:', error)
      setNextlogSettings(prev => ({ ...prev, connectionStatus: 'disconnected' }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'testing':
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'listening':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'disabled':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default">Connected</Badge>
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>
      case 'connecting':
        return <Badge variant="secondary">Connecting...</Badge>
      case 'listening':
        return <Badge variant="default">Listening</Badge>
      case 'disabled':
        return <Badge variant="secondary">Disabled</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current connection status for all services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                <Label>Radio Connection</Label>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(radioSettings.connectionStatus)}
                {getStatusBadge(radioSettings.connectionStatus)}
              </div>
              <div className="text-sm text-muted-foreground">
                {radioSettings.connectionStatus === 'connected'
                  ? `${radioSettings.lastConnectedType} at ${radioSettings.lastConnectedHost}`
                  : 'No radio connected'
                }
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Label>Nextlog API</Label>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(nextlogSettings.connectionStatus)}
                {getStatusBadge(nextlogSettings.connectionStatus)}
              </div>
              <div className="text-sm text-muted-foreground">
                {nextlogSettings.apiUrl}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <Label>WSJT-X</Label>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(wsjtxSettings.status)}
                {getStatusBadge(wsjtxSettings.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                UDP Port {wsjtxSettings.udpPort}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nextlog Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nextlog Settings
          </CardTitle>
          <CardDescription>
            Configure connection to your Nextlog logging website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nextlog-url">API URL</Label>
              <Input
                id="nextlog-url"
                value={nextlogSettings.apiUrl}
                onChange={(e) => {
                  const newValue = e.target.value
                  setNextlogSettings(prev => ({ ...prev, apiUrl: newValue }))
                  saveNextlogSettings({ apiUrl: newValue })
                }}
                placeholder="https://nextlog.app/api/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={nextlogSettings.apiKey}
                onChange={(e) => {
                  const newValue = e.target.value
                  setNextlogSettings(prev => ({ ...prev, apiKey: newValue }))
                  saveNextlogSettings({ apiKey: newValue })
                }}
                placeholder="Your API key"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-submit contacts</Label>
              <div className="text-sm text-muted-foreground">
                Automatically send contacts to Nextlog when logged
              </div>
            </div>
            <Switch
              checked={nextlogSettings.autoSubmit}
              onCheckedChange={(checked) => {
                setNextlogSettings(prev => ({ ...prev, autoSubmit: checked }))
                saveNextlogSettings({ autoSubmit: checked })
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testNextlogConnection}
              disabled={nextlogSettings.connectionStatus === 'testing'}
              variant="outline"
            >
              {nextlogSettings.connectionStatus === 'testing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Radio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Radio Settings
          </CardTitle>
          <CardDescription>
            Configure radio connection preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Poll Interval (ms)</Label>
              <Input
                type="number"
                value={radioSettings.pollInterval}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value)
                  setRadioSettings(prev => ({ ...prev, pollInterval: newValue }))
                  saveRadioSettings({ pollInterval: newValue })
                }}
                min="100"
                max="5000"
                step="100"
              />
              <div className="text-sm text-muted-foreground">
                How often to update radio data
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-reconnect</Label>
              <div className="text-sm text-muted-foreground">
                Automatically reconnect when connection is lost
              </div>
            </div>
            <Switch
              checked={radioSettings.autoReconnect}
              onCheckedChange={(checked) => {
                setRadioSettings(prev => ({ ...prev, autoReconnect: checked }))
                saveRadioSettings({ autoReconnect: checked })
              }}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Last Connection</Label>
            <div className="text-sm text-muted-foreground">
              Type: {radioSettings.lastConnectedType}<br />
              Host: {radioSettings.lastConnectedHost}:{radioSettings.lastConnectedPort}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WSJT-X Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            WSJT-X Settings
          </CardTitle>
          <CardDescription>
            Configure digital mode integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>UDP Port</Label>
              <Input
                type="number"
                value={wsjtxSettings.udpPort}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value)
                  setWSJTXSettings(prev => ({ ...prev, udpPort: newValue }))
                  saveWSJTXSettings({ udpPort: newValue })
                }}
                min="1024"
                max="65535"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable WSJT-X integration</Label>
              <div className="text-sm text-muted-foreground">
                Listen for WSJT-X UDP messages
              </div>
            </div>
            <Switch
              checked={wsjtxSettings.enabled}
              onCheckedChange={(checked) => {
                setWSJTXSettings(prev => ({ ...prev, enabled: checked }))
                saveWSJTXSettings({ enabled: checked })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-log contacts</Label>
              <div className="text-sm text-muted-foreground">
                Automatically add WSJT-X contacts to log
              </div>
            </div>
            <Switch
              checked={wsjtxSettings.autoLog}
              onCheckedChange={(checked) => {
                setWSJTXSettings(prev => ({ ...prev, autoLog: checked }))
                saveWSJTXSettings({ autoLog: checked })
              }}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">WSJT-X Setup Reminder</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Enable "Accept UDP requests" in WSJT-X preferences</li>
              <li>• Set UDP Server port to {wsjtxSettings.udpPort}</li>
              <li>• Restart WSJT-X after changing settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}