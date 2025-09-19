import { useState, useEffect } from 'react'
import { RadioDashboard } from './components/RadioDashboard'
import { ConnectionPanel } from './components/ConnectionPanel'
import { NextlogPanel } from './components/NextlogPanel'
import { WSJTXPanel } from './components/WSJTXPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { StatusPanel } from './components/StatusPanel'
import { DebugInfo } from './components/DebugInfo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

function App() {
  const [radioData, setRadioData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.radio.onDataUpdate((data) => {
        setRadioData(data)
      })

      return unsubscribe
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <DebugInfo />
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Nextlog Companion</h1>
          <p className="text-muted-foreground">Ham Radio Logging Assistant</p>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="nextlog">Nextlog</TabsTrigger>
            <TabsTrigger value="wsjtx">WSJT-X</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <RadioDashboard radioData={radioData} isConnected={isConnected} />
          </TabsContent>

          <TabsContent value="connection" className="space-y-4">
            <ConnectionPanel
              onConnectionChange={setIsConnected}
              isConnected={isConnected}
            />
          </TabsContent>

          <TabsContent value="nextlog" className="space-y-4">
            <NextlogPanel radioData={radioData} />
          </TabsContent>

          <TabsContent value="wsjtx" className="space-y-4">
            <WSJTXPanel />
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <StatusPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App