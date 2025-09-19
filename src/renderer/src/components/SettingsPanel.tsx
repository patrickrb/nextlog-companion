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

  const testNextlogConnection = async () => {
    setNextlogSettings(prev => ({ ...prev, connectionStatus: 'testing' }))

    try {
      // In a real implementation, this would test the actual API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

      // Mock result - in real app this would be the actual test result
      const success = Math.random() > 0.3 // 70% success rate for demo

      setNextlogSettings(prev => ({
        ...prev,
        connectionStatus: success ? 'connected' : 'disconnected'
      }))
    } catch (error) {
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
                onChange={(e) => setNextlogSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                placeholder="https://nextlog.app/api/v1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={nextlogSettings.apiKey}
                onChange={(e) => setNextlogSettings(prev => ({ ...prev, apiKey: e.target.value }))}
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
              onCheckedChange={(checked) => setNextlogSettings(prev => ({ ...prev, autoSubmit: checked }))}
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
                onChange={(e) => setRadioSettings(prev => ({ ...prev, pollInterval: parseInt(e.target.value) }))}
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
              onCheckedChange={(checked) => setRadioSettings(prev => ({ ...prev, autoReconnect: checked }))}
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
                onChange={(e) => setWSJTXSettings(prev => ({ ...prev, udpPort: parseInt(e.target.value) }))}
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
              onCheckedChange={(checked) => setWSJTXSettings(prev => ({ ...prev, enabled: checked }))}
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
              onCheckedChange={(checked) => setWSJTXSettings(prev => ({ ...prev, autoLog: checked }))}
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