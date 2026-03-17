/**
 * WASM plugin manifest
 */
export interface PluginManifest {
  id: string // "plugin-name@version"
  name: string
  version: string
  author: string
  description?: string
  type: PluginType[]
  wasm: string // Relative path to .wasm file
  ui?: string // Optional UI component path
  ports: PluginPorts
  oscPrefix?: string // OSC address prefix
}

/**
 * Plugin types
 */
export type PluginType = 'audio-fx' | 'instrument' | 'midi-fx' | 'visual' | 'utility'

/**
 * Plugin port configuration
 */
export interface PluginPorts {
  audioIn?: number
  audioOut?: number
  midiIn?: boolean
  midiOut?: boolean
  params: PluginParameter[]
}

/**
 * Plugin parameter definition
 */
export interface PluginParameter {
  id: string
  name: string
  min: number
  max: number
  default: number
  unit?: string
  type?: 'continuous' | 'discrete' | 'boolean'
}

/**
 * Plugin instance state
 */
export interface PluginInstance {
  pluginId: string
  instanceId: string
  enabled: boolean
  parameters: Record<string, number>
  wasmModule?: WebAssembly.Module
  wasmInstance?: WebAssembly.Instance
}
