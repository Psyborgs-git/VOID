import {
  MIDIDeviceInfo,
  NoteOnEvent,
  NoteOffEvent,
  CCEvent,
} from '../events/eventTypes'
import { SidecarError } from '../events/errorTypes'
import { OSCArg } from '../ports/OSCPort'

/**
 * Sidecar status
 */
export interface SidecarStatus {
  running: boolean
  healthy: boolean
  port: number
  modelsLoaded: string[]
  gpuAvailable: boolean
}

/**
 * IPC channels - typed communication between main and renderer processes
 */
export type IPCChannels = {
  // Sidecar
  'sidecar:status': SidecarStatus
  'sidecar:error': SidecarError
  'sidecar:restart': void

  // MIDI (bridged from main to renderer)
  'midi:noteOn': NoteOnEvent
  'midi:noteOff': NoteOffEvent
  'midi:cc': CCEvent
  'midi:deviceList': MIDIDeviceInfo[]
  'midi:deviceConnected': MIDIDeviceInfo
  'midi:deviceDisconnected': string

  // OSC (bridged from main to renderer)
  'osc:message': { address: string; args: OSCArg[] }
  'osc:send': { address: string; args: OSCArg[] }
  'osc:serverStatus': { running: boolean; port: number }

  // Project
  'project:openDialog': void
  'project:saveDialog': void
  'project:fileSelected': string
  'project:save': string
  'project:load': string

  // Window
  'window:minimize': void
  'window:maximize': void
  'window:close': void
  'window:openStageView': number // display ID
  'window:closeStageView': void

  // App
  'app:quit': void
  'app:version': string
  'app:platform': string
}

/**
 * IPC invoke channels (request-response)
 */
export type IPCInvokeChannels = {
  'sidecar:getStatus': () => Promise<SidecarStatus>
  'midi:getDevices': () => Promise<MIDIDeviceInfo[]>
  'project:open': () => Promise<string | null>
  'project:save': (projectData: string) => Promise<void>
  'app:getVersion': () => Promise<string>
}
