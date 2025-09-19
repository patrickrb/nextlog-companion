import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { RadioIcon, Mic, MicOff, Activity } from 'lucide-react'

export function WSJTXPanel() {
  const [wsjtxStatus, setWsjtxStatus] = useState<any>(null)
  const [recentContacts, setRecentContacts] = useState<any[]>([])

  useEffect(() => {
    if (window.electronAPI) {
      // Get initial status
      window.electronAPI.wsjtx.getStatus().then(setWsjtxStatus)

      // Listen for contact updates
      const unsubscribe = window.electronAPI.wsjtx.onContactLogged((contact) => {
        setRecentContacts(prev => [contact, ...prev.slice(0, 9)]) // Keep last 10
      })

      return unsubscribe
    }
  }, [])

  const formatFrequency = (freq: number) => {
    return `${(freq / 1000000).toFixed(3)} MHz`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RadioIcon className="h-5 w-5" />
            WSJT-X Integration
          </CardTitle>
          <CardDescription>
            Monitor WSJT-X for automatic contact logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={wsjtxStatus?.isRunning ? 'default' : 'destructive'}>
              {wsjtxStatus?.isRunning ? 'Connected' : 'Not Connected'}
            </Badge>
            {wsjtxStatus?.isRunning && (
              <Badge variant="secondary">
                {wsjtxStatus.mode}
              </Badge>
            )}
          </div>

          {wsjtxStatus?.isRunning ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Mode
                </label>
                <div className="text-lg font-semibold">
                  {wsjtxStatus.mode}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Frequency
                </label>
                <div className="text-lg font-semibold">
                  {formatFrequency(wsjtxStatus.frequency)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Callsign
                </label>
                <div className="text-lg font-semibold font-mono">
                  {wsjtxStatus.callsign || 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Grid
                </label>
                <div className="text-lg font-semibold font-mono">
                  {wsjtxStatus.grid || 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  TX Status
                </label>
                <div className="flex items-center gap-2">
                  {wsjtxStatus.transmitting ? (
                    <Mic className="h-4 w-4 text-red-500" />
                  ) : (
                    <MicOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Badge variant={wsjtxStatus.transmitting ? 'destructive' : 'secondary'}>
                    {wsjtxStatus.transmitting ? 'TX' : 'RX'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Decoding
                </label>
                <div className="flex items-center gap-2">
                  {wsjtxStatus.decoding && (
                    <Activity className="h-4 w-4 text-green-500 animate-pulse" />
                  )}
                  <Badge variant={wsjtxStatus.decoding ? 'default' : 'secondary'}>
                    {wsjtxStatus.decoding ? 'Active' : 'Idle'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  TX Enabled
                </label>
                <Badge variant={wsjtxStatus.txEnabled ? 'default' : 'secondary'}>
                  {wsjtxStatus.txEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>WSJT-X not detected</p>
              <p className="text-sm mt-2">
                Start WSJT-X with UDP messaging enabled to see data here
              </p>
            </div>
          )}

          <div className="pt-4">
            <h4 className="font-medium mb-3">Setup Instructions</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. Open WSJT-X preferences</p>
              <p>2. Go to the "Reporting" tab</p>
              <p>3. Enable "Accept UDP requests"</p>
              <p>4. Set UDP Server port to 2237</p>
              <p>5. Restart WSJT-X</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {recentContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>
              Automatically logged from WSJT-X
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-4">
                    <div className="font-mono font-semibold">
                      {contact.dxCall}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contact.mode}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatFrequency(contact.txFrequency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contact.reportSent}/{contact.reportReceived}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(contact.dateTimeOff).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}