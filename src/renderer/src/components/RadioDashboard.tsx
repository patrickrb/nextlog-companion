import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { RadioIcon, PowerIcon, SignalIcon } from 'lucide-react'

interface RadioDashboardProps {
  radioData: any
  isConnected: boolean
}

export function RadioDashboard({ radioData, isConnected }: RadioDashboardProps) {
  const formatFrequency = (freq: number) => {
    if (freq >= 1000000) {
      return `${(freq / 1000000).toFixed(3)} MHz`
    }
    return `${(freq / 1000).toFixed(1)} kHz`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RadioIcon className="h-5 w-5" />
            Radio Status
          </CardTitle>
          <CardDescription>
            Current radio connection and operating parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {isConnected && radioData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Frequency
                </label>
                <div className="text-2xl font-bold">
                  {formatFrequency(radioData.frequency)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Mode
                </label>
                <div className="text-2xl font-bold">
                  {radioData.mode}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Band
                </label>
                <div className="text-2xl font-bold">
                  {radioData.band}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Power
                </label>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <PowerIcon className="h-5 w-5" />
                  {radioData.power}W
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  VSWR
                </label>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <SignalIcon className="h-5 w-5" />
                  {radioData.vswr?.toFixed(1) || 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Badge variant={radioData.transmitting ? 'destructive' : 'secondary'}>
                  {radioData.transmitting ? 'TX' : 'RX'}
                </Badge>
              </div>

              {radioData.split && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Split
                  </label>
                  <Badge variant="outline">
                    Split
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Last Update
                </label>
                <div className="text-sm text-muted-foreground">
                  {radioData.timestamp ? new Date(radioData.timestamp).toLocaleTimeString() : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isConnected ? 'Waiting for radio data...' : 'Connect to your radio to see live data'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}