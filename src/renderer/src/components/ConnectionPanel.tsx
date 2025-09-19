import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { RadioIcon, WifiIcon, WifiOffIcon } from 'lucide-react'

interface ConnectionPanelProps {
  onConnectionChange: (connected: boolean) => void
  isConnected: boolean
}

export function ConnectionPanel({ onConnectionChange, isConnected }: ConnectionPanelProps) {
  const [radioType, setRadioType] = useState('flexradio')
  const [host, setHost] = useState('192.168.1.100')
  const [port, setPort] = useState('4992')
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    if (isConnected) {
      await handleDisconnect()
      return
    }

    setConnecting(true)
    try {
      const config = {
        type: radioType,
        connection: {
          host,
          port: parseInt(port)
        },
        model: radioType === 'flexradio' ? '6400' : 'unknown'
      }

      const success = await window.electronAPI.radio.connect(config)
      if (success) {
        onConnectionChange(true)
      } else {
        console.error('Failed to connect to radio')
      }
    } catch (error) {
      console.error('Connection error:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await window.electronAPI.radio.disconnect()
      onConnectionChange(false)
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RadioIcon className="h-5 w-5" />
          Radio Connection
        </CardTitle>
        <CardDescription>
          Configure and manage your radio connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="radio-type">Radio Type</Label>
            <Select value={radioType} onValueChange={setRadioType} disabled={isConnected}>
              <SelectTrigger>
                <SelectValue placeholder="Select radio type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexradio">FlexRadio 6000 Series</SelectItem>
                <SelectItem value="yaesu" disabled>Yaesu (Coming Soon)</SelectItem>
                <SelectItem value="icom" disabled>Icom (Coming Soon)</SelectItem>
                <SelectItem value="kenwood" disabled>Kenwood (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="host">IP Address</Label>
            <Input
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="192.168.1.100"
              disabled={isConnected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="4992"
              disabled={isConnected}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <WifiIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Connected to {radioType} at {host}:{port}
                </span>
              </>
            ) : (
              <>
                <WifiOffIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Not connected
                </span>
              </>
            )}
          </div>

          <Button
            onClick={handleConnect}
            disabled={connecting}
            variant={isConnected ? 'destructive' : 'default'}
          >
            {connecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        {radioType === 'flexradio' && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">FlexRadio Setup</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure SmartSDR is running on your FlexRadio</li>
              <li>• Default port is 4992 for CAT control</li>
              <li>• Make sure your computer is on the same network</li>
              <li>• Check firewall settings if connection fails</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}