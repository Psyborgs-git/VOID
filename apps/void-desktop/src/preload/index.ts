import { contextBridge, ipcRenderer } from 'electron'
import type { IPCChannels, IPCInvokeChannels } from '@void/core'

/**
 * VOID API exposed to renderer process
 *
 * This is the bridge between main and renderer processes.
 * All Node.js/Electron APIs are accessed through this typed interface.
 */
const voidAPI = {
  /**
   * Send IPC message to main process
   */
  send: <K extends keyof IPCChannels>(channel: K, data: IPCChannels[K]) => {
    ipcRenderer.send(channel, data)
  },

  /**
   * Listen for IPC messages from main process
   */
  on: <K extends keyof IPCChannels>(
    channel: K,
    callback: (data: IPCChannels[K]) => void
  ): (() => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, data: IPCChannels[K]) => {
      callback(data)
    }
    ipcRenderer.on(channel, subscription)

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },

  /**
   * Invoke IPC handler (request-response pattern)
   */
  invoke: async <K extends keyof IPCInvokeChannels>(
    channel: K,
    ...args: Parameters<IPCInvokeChannels[K]>
  ): Promise<ReturnType<IPCInvokeChannels[K]>> => {
    return ipcRenderer.invoke(channel, ...args)
  },

  /**
   * Platform information
   */
  platform: process.platform,

  /**
   * App version
   */
  version: process.env.npm_package_version || '0.1.0',
}

/**
 * Expose VOID API to renderer via contextBridge
 */
contextBridge.exposeInMainWorld('voidAPI', voidAPI)

/**
 * Type declaration for TypeScript
 */
export type VoidAPI = typeof voidAPI

// Extend Window interface
declare global {
  interface Window {
    voidAPI: VoidAPI
  }
}
