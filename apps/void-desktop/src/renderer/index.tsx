import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

/**
 * Renderer entry point
 */
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

// Initialize React app
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Log initialization
console.log('[VOID] Renderer initialized')
console.log('[VOID] Platform:', window.voidAPI.platform)
console.log('[VOID] Version:', window.voidAPI.version)
