import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { ExternalLink, Send, Globe } from 'lucide-react'

interface NextlogPanelProps {
  radioData: any
}

export function NextlogPanel({ radioData }: NextlogPanelProps) {
  const [callsign, setCallsign] = useState('')
  const [rstSent, setRstSent] = useState('59')
  const [rstReceived, setRstReceived] = useState('59')
  const [name, setName] = useState('')
  const [qth, setQth] = useState('')
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState<any>(null)

  const handleSendToNextlog = async () => {
    if (!callsign.trim()) {
      alert('Please enter a callsign')
      return
    }

    setSending(true)
    try {
      const contactData = {
        callsign: callsign.toUpperCase(),
        frequency: radioData?.frequency || 14074000,
        mode: radioData?.mode || 'FT8',
        rstSent,
        rstReceived,
        datetime: new Date(),
        band: radioData?.band || '20m',
        power: radioData?.power || 100,
        name,
        qth,
        comment
      }

      const response = await window.electronAPI.nextlog.sendData(contactData)

      if (response.success) {
        setLastSent({ ...contactData, timestamp: new Date() })
        // Clear form
        setCallsign('')
        setName('')
        setQth('')
        setComment('')
        alert('Contact sent to Nextlog successfully!')
      } else {
        alert(`Failed to send contact: ${response.message}`)
      }
    } catch (error) {
      console.error('Error sending to Nextlog:', error)
      alert('Error sending contact to Nextlog')
    } finally {
      setSending(false)
    }
  }

  const openNextlog = () => {
    // This would open the Nextlog website in the default browser
    // For now, we'll just log it
    console.log('Opening Nextlog website...')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nextlog Integration
          </CardTitle>
          <CardDescription>
            Send contact data to your Nextlog logging website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="callsign">Callsign *</Label>
              <Input
                id="callsign"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                placeholder="W1AW"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rst-sent">RST Sent</Label>
              <Input
                id="rst-sent"
                value={rstSent}
                onChange={(e) => setRstSent(e.target.value)}
                placeholder="59"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rst-received">RST Received</Label>
              <Input
                id="rst-received"
                value={rstReceived}
                onChange={(e) => setRstReceived(e.target.value)}
                placeholder="59"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="qth">QTH</Label>
              <Input
                id="qth"
                value={qth}
                onChange={(e) => setQth(e.target.value)}
                placeholder="Location"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="comment">Comment</Label>
              <Input
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
          </div>

          {radioData && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Radio Data</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Frequency:</span>
                  <div className="font-mono">{(radioData.frequency / 1000000).toFixed(3)} MHz</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Mode:</span>
                  <div>{radioData.mode}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Band:</span>
                  <div>{radioData.band}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Power:</span>
                  <div>{radioData.power}W</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSendToNextlog} disabled={sending || !callsign.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send to Nextlog'}
            </Button>

            <Button variant="outline" onClick={openNextlog}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Nextlog
            </Button>
          </div>

          {lastSent && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">Last Sent</Badge>
                <span className="text-sm text-muted-foreground">
                  {lastSent.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm">
                <strong>{lastSent.callsign}</strong> on {lastSent.band} ({lastSent.mode})
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}