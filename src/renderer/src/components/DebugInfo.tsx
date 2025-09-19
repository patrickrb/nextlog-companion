import { useEffect, useState } from 'react'

export function DebugInfo() {
  const [info, setInfo] = useState({
    userAgent: navigator.userAgent,
    isElectron: typeof window.electronAPI !== 'undefined',
    timestamp: new Date().toISOString()
  })

  useEffect(() => {
    console.log('DebugInfo component mounted:', info)
  }, [info])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>Electron API: {info.isElectron ? '✓' : '✗'}</div>
      <div>Time: {info.timestamp}</div>
      <div>UA: {info.userAgent.substring(0, 50)}...</div>
    </div>
  )
}