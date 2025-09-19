import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import {
  Activity,
  Wifi,
  Radio,
  Globe,
  Server,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface ConnectionStats {
  connected: boolean
  uptime: number
  lastUpdate: Date | null
  dataReceived: number
  errors: number
}

export function StatusPanel() {
  const [radioStats, setRadioStats] = useState<ConnectionStats>({
    connected: false,
    uptime: 0,
    lastUpdate: null,
    dataReceived: 0,
    errors: 0
  })

  const [nextlogStats, setNextlogStats] = useState({
    connected: false,
    contactsSent: 0,
    lastSubmission: null as Date | null,
    apiErrors: 0
  })

  const [wsjtxStats, setWSJTXStats] = useState({
    listening: true,
    contactsReceived: 0,
    lastContact: null as Date | null,
    udpPackets: 0
  })

  const [systemStats, setSystemStats] = useState({
    appUptime: 0,
    memoryUsage: 45, // Mock percentage
    cpuUsage: 12 // Mock percentage
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        appUptime: prev.appUptime + 1,
        memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.max(5, Math.min(50, prev.cpuUsage + (Math.random() - 0.5) * 8))
      }))

      if (radioStats.connected) {
        setRadioStats(prev => ({
          ...prev,
          uptime: prev.uptime + 1,
          lastUpdate: new Date(),
          dataReceived: prev.dataReceived + Math.floor(Math.random() * 3)
        }))
      }

      if (wsjtxStats.listening) {
        setWSJTXStats(prev => ({
          ...prev,
          udpPackets: prev.udpPackets + Math.floor(Math.random() * 2)
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [radioStats.connected, wsjtxStats.listening])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (date: Date | null) => {
    return date ? date.toLocaleTimeString() : 'Never'
  }

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-500'
    if (value <= thresholds.warning) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Real-time application and connection monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label className="text-sm font-medium">App Uptime</Label>
              </div>
              <div className="text-lg font-mono">
                {formatUptime(systemStats.appUptime)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <Label className="text-sm font-medium">Memory</Label>
              </div>
              <div className="space-y-1">
                <div className={`text-lg font-mono ${getHealthColor(systemStats.memoryUsage, { good: 50, warning: 70 })}`}>
                  {systemStats.memoryUsage.toFixed(1)}%
                </div>
                <Progress value={systemStats.memoryUsage} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <Label className="text-sm font-medium">CPU</Label>
              </div>
              <div className="space-y-1">
                <div className={`text-lg font-mono ${getHealthColor(systemStats.cpuUsage, { good: 20, warning: 40 })}`}>
                  {systemStats.cpuUsage.toFixed(1)}%
                </div>
                <Progress value={systemStats.cpuUsage} className="h-2" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Label className="text-sm font-medium">Health</Label>
              </div>
              <Badge variant="default" className="bg-green-500">
                Healthy
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radio Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Radio Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {radioStats.connected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={radioStats.connected ? 'default' : 'destructive'}>
                {radioStats.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime:</span>
                <span className="font-mono">{formatUptime(radioStats.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Update:</span>
                <span>{formatTime(radioStats.lastUpdate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Received:</span>
                <span>{radioStats.dataReceived} packets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Errors:</span>
                <span className={radioStats.errors > 0 ? 'text-red-500' : 'text-green-500'}>
                  {radioStats.errors}
                </span>
              </div>
            </div>

            {!radioStats.connected && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setRadioStats(prev => ({ ...prev, connected: true, uptime: 0 }))}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Nextlog Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Nextlog API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {nextlogStats.connected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <Badge variant={nextlogStats.connected ? 'default' : 'secondary'}>
                {nextlogStats.connected ? 'Ready' : 'Not Configured'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contacts Sent:</span>
                <span>{nextlogStats.contactsSent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Submit:</span>
                <span>{formatTime(nextlogStats.lastSubmission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Errors:</span>
                <span className={nextlogStats.apiErrors > 0 ? 'text-red-500' : 'text-green-500'}>
                  {nextlogStats.apiErrors}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setNextlogStats(prev => ({ ...prev, contactsSent: prev.contactsSent + 1, lastSubmission: new Date() }))}
            >
              Test Submit
            </Button>
          </CardContent>
        </Card>

        {/* WSJT-X Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              WSJT-X Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {wsjtxStats.listening ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={wsjtxStats.listening ? 'default' : 'destructive'}>
                {wsjtxStats.listening ? 'Listening' : 'Stopped'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contacts Received:</span>
                <span>{wsjtxStats.contactsReceived}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Contact:</span>
                <span>{formatTime(wsjtxStats.lastContact)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UDP Packets:</span>
                <span>{wsjtxStats.udpPackets}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setWSJTXStats(prev => ({
                ...prev,
                contactsReceived: prev.contactsReceived + 1,
                lastContact: new Date()
              }))}
            >
              Simulate Contact
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Last 10 system events and status changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: '15:02:34', type: 'info', message: 'WSJT-X UDP listener started on port 2237' },
              { time: '15:02:12', type: 'success', message: 'Application started successfully' },
              { time: '15:01:45', type: 'warning', message: 'Radio connection attempt timed out' },
              { time: '15:01:23', type: 'info', message: 'Attempting to connect to radio at 192.168.1.100:4992' },
              { time: '15:01:01', type: 'info', message: 'Nextlog companion initialized' },
            ].map((event, index) => (
              <div key={index} className="flex items-center gap-3 text-sm p-2 rounded border">
                <span className="font-mono text-muted-foreground min-w-[60px]">
                  {event.time}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`} />
                <span>{event.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return <span className={className} {...props}>{children}</span>
}