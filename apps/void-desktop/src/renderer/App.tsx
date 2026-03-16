import { useEffect } from 'react'
import { eventBus } from '@void/core'

/**
 * Main App component
 */
export default function App() {
  useEffect(() => {
    console.log('[VOID] App component mounted')

    // Subscribe to event bus
    const unsubscribe = eventBus.on('project:new', (event) => {
      console.log('[VOID] New project event:', event)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">VOID</div>
        <div className="app-subtitle">Local-first creative production environment</div>
      </header>
      <main className="app-main">
        <div className="app-content">
          <div className="sidebar">
            <div className="sidebar-section">
              <h3>Tracks</h3>
              <p>No tracks yet</p>
            </div>
          </div>
          <div className="workspace">
            <div className="welcome">
              <h1>Welcome to VOID</h1>
              <p>The app is running. Phase 1 foundation complete.</p>
              <div className="system-info">
                <div>Platform: {window.voidAPI.platform}</div>
                <div>Version: {window.voidAPI.version}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
