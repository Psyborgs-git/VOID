import { Unsubscribe } from './MIDIPort'

/**
 * Shader reference
 */
export interface ShaderRef {
  id: string
  glsl: string
  compiled: boolean
  error?: string
}

/**
 * Surface configuration
 */
export interface SurfaceConfig {
  id: string
  name: string
  width: number
  height: number
  x: number
  y: number
}

/**
 * Projection surface reference
 */
export interface ProjectionSurfaceRef {
  id: string
  corners: Quad
  shaderId?: string
}

/**
 * Quad - four corners for projection warping
 */
export interface Quad {
  topLeft: Point2D
  topRight: Point2D
  bottomRight: Point2D
  bottomLeft: Point2D
}

/**
 * 2D Point
 */
export interface Point2D {
  x: number
  y: number
}

/**
 * Audio analyser reference
 */
export interface AudioAnalyserRef {
  getByteFrequencyData(): Uint8Array
  getByteTimeDomainData(): Uint8Array
  fftSize: number
}

/**
 * Audio features for reactive visuals
 */
export type AudioFeature = 'bass' | 'mid' | 'high' | 'kick' | 'rms' | 'peak'

/**
 * Display information
 */
export interface DisplayInfo {
  id: number
  bounds: { x: number; y: number; width: number; height: number }
  primary: boolean
}

/**
 * Live code execution result
 */
export interface LiveCodeResult {
  success: boolean
  error?: string
  output?: string
}

/**
 * VisualPort - interface for visual engine operations
 *
 * All visual engine adapters must implement this interface.
 * Implementation: ThreeJSAdapter (Three.js + R3F)
 */
export interface VisualPort {
  // Shader management
  /**
   * Load a shader
   * @param glsl GLSL shader code
   * @param id Shader ID
   * @returns Shader reference
   */
  loadShader(glsl: string, id: string): ShaderRef

  /**
   * Update shader (hot-reload)
   * @param id Shader ID
   * @param glsl New GLSL code
   */
  updateShader(id: string, glsl: string): void

  /**
   * Remove a shader
   * @param id Shader ID
   */
  removeShader(id: string): void

  /**
   * Get shader by ID
   * @param id Shader ID
   * @returns Shader reference or undefined
   */
  getShader(id: string): ShaderRef | undefined

  // Surface management (projection mapping)
  /**
   * Create a projection surface
   * @param config Surface configuration
   * @returns Surface reference
   */
  createSurface(config: SurfaceConfig): ProjectionSurfaceRef

  /**
   * Warp a surface using 4-corner control
   * @param id Surface ID
   * @param corners Quad corners
   */
  warpSurface(id: string, corners: Quad): void

  /**
   * Assign a shader to a surface
   * @param shaderId Shader ID
   * @param surfaceId Surface ID
   */
  assignShaderToSurface(shaderId: string, surfaceId: string): void

  /**
   * Remove a surface
   * @param id Surface ID
   */
  removeSurface(id: string): void

  // Audio reactivity
  /**
   * Bind audio analyser to visual engine
   * @param analyser Analyser reference
   */
  bindAnalyser(analyser: AudioAnalyserRef): void

  /**
   * Set audio binding for shader parameter
   * @param shaderId Shader ID
   * @param paramName Shader uniform name
   * @param audioFeature Audio feature to bind
   */
  setAudioBinding(shaderId: string, paramName: string, audioFeature: AudioFeature): void

  // Output management
  /**
   * Set output window for stage view
   * @param windowId Electron BrowserWindow ID
   * @param display Display information
   */
  setOutputWindow(windowId: number, display: DisplayInfo): void

  /**
   * Enter fullscreen on output
   * @param outputIndex Output index
   */
  enterFullscreen(outputIndex: number): void

  /**
   * Exit fullscreen
   */
  exitFullscreen(): void

  /**
   * Enable/disable preview in main window panel
   * @param enabled Preview enabled
   */
  previewInPanel(enabled: boolean): void

  // Live coding
  /**
   * Execute live code
   * @param code JavaScript/GLSL code
   * @returns Execution result
   */
  executeLiveCode(code: string): LiveCodeResult

  /**
   * Get last live code error
   * @returns Error message or null
   */
  getLiveCodeError(): string | null

  // Uniform control
  /**
   * Set shader uniform value
   * @param shaderId Shader ID
   * @param uniformName Uniform name
   * @param value Uniform value
   */
  setUniform(shaderId: string, uniformName: string, value: number | number[]): void
}
