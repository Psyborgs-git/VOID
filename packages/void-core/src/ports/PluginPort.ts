import { PluginManifest, PluginInstance } from '../domain/PluginManifest'

/**
 * WASM plugin host API - functions available to WASM modules
 */
export interface VoidPluginHostAPI {
  void_log(msgPtr: number, len: number): void
  void_emit_event(typePtr: number, dataPtr: number): void
  void_get_param(idPtr: number): number
  void_set_param(idPtr: number, value: number): void
  void_get_sample_rate(): number
  void_get_bpm(): number
  void_get_beat(): number
}

/**
 * WASM plugin exports - required functions from WASM module
 */
export interface VoidPluginExports {
  init(): void
  process(inputPtr: number, outputPtr: number, numSamples: number): void
  destroy(): void
  memory: WebAssembly.Memory
}

/**
 * PluginPort - interface for plugin system operations
 *
 * All plugin system adapters must implement this interface.
 * Implementation: WASMSandbox + PluginLoader
 */
export interface PluginPort {
  /**
   * Register a plugin from manifest
   * @param manifest Plugin manifest
   * @param wasmPath Path to WASM file
   */
  registerPlugin(manifest: PluginManifest, wasmPath: string): Promise<void>

  /**
   * Instantiate a plugin
   * @param pluginId Plugin ID
   * @param instanceId Instance ID
   * @returns Plugin instance
   */
  instantiatePlugin(pluginId: string, instanceId: string): Promise<PluginInstance>

  /**
   * Remove a plugin instance
   * @param instanceId Instance ID
   */
  removeInstance(instanceId: string): void

  /**
   * Enable a plugin instance
   * @param instanceId Instance ID
   */
  enableInstance(instanceId: string): void

  /**
   * Disable a plugin instance
   * @param instanceId Instance ID
   */
  disableInstance(instanceId: string): void

  /**
   * Set plugin parameter
   * @param instanceId Instance ID
   * @param paramId Parameter ID
   * @param value Parameter value
   */
  setParameter(instanceId: string, paramId: string, value: number): void

  /**
   * Get plugin parameter
   * @param instanceId Instance ID
   * @param paramId Parameter ID
   * @returns Parameter value
   */
  getParameter(instanceId: string, paramId: string): number

  /**
   * Process audio through plugin
   * @param instanceId Instance ID
   * @param input Input audio buffer
   * @param output Output audio buffer
   */
  processAudio(instanceId: string, input: Float32Array, output: Float32Array): void

  /**
   * Hot-reload a plugin
   * @param pluginId Plugin ID
   * @param wasmPath New WASM file path
   */
  hotReload(pluginId: string, wasmPath: string): Promise<void>

  /**
   * Get all registered plugins
   * @returns Array of plugin manifests
   */
  getRegisteredPlugins(): PluginManifest[]

  /**
   * Get all plugin instances
   * @returns Array of plugin instances
   */
  getInstances(): PluginInstance[]

  /**
   * Unregister a plugin
   * @param pluginId Plugin ID
   */
  unregisterPlugin(pluginId: string): void
}
