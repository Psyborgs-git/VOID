import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { eventBus } from '@void/core'

/**
 * Main window reference
 */
let mainWindow: BrowserWindow | null = null

/**
 * Create the main browser window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'hiddenInset', // macOS native titlebar
    frame: process.platform !== 'darwin',
    show: false, // Show when ready
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    console.log('[VOID] Window ready')
  })

  // Load the renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    // Development mode
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    // Production mode
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Window close handling
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Emit window created event
  console.log('[VOID] Main window created')
}

/**
 * App lifecycle
 */

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('[VOID] App ready, creating window...')

  // Initialize event bus
  console.log('[VOID] Event bus initialized')
  eventBus.emit({ type: 'project:new' })

  // Create window
  createWindow()

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Security: Prevent navigation to untrusted URLs
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)

    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        return
      }
    }

    // Block all other navigation
    event.preventDefault()
    console.warn('[VOID] Blocked navigation to:', navigationUrl)
  })
})

/**
 * Export mainWindow for IPC handlers
 */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
