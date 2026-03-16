import { SessionMemory, MusicalIdentityProfile, MemoryValue } from '../domain/SessionMemory'

/**
 * Music generation prompt
 */
export interface MusicGenerationPrompt {
  prompt: string
  lyrics?: string
  duration: number // seconds
  style?: string
  seed?: number
}

/**
 * Generated audio result
 */
export interface GeneratedAudioResult {
  jobId: string
  audioPath: string
  duration: number
}

/**
 * Stem types
 */
export type StemType = 'vocals' | 'drums' | 'bass' | 'other' | 'piano' | 'guitar'

/**
 * Stem separation result
 */
export interface StemSeparationResult {
  jobId: string
  stems: Record<StemType, string> // stem type -> file path
}

/**
 * Chat message
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Project context for copilot
 */
export interface ProjectContext {
  projectName: string
  bpm: number
  key: string
  timeSignature: string
  duration: number
  trackCount: number
  tracks: Array<{
    id: string
    name: string
    type: string
    muted: boolean
    solo: boolean
    clipCount: number
  }>
  selectedTrackId?: string
}

/**
 * Copilot response
 */
export interface CopilotResponse {
  message: string
  actions: CopilotAction[]
  confidence: number
}

/**
 * Copilot action types
 */
export type CopilotAction =
  | { action: 'setTransportBPM'; bpm: number }
  | { action: 'createTrack'; type: string; name: string }
  | { action: 'generateMusic'; prompt: string; duration: number; targetTrackId?: string }
  | { action: 'buildArrangement'; spec: ArrangementSpec }
  | { action: 'loadShader'; description: string }
  | { action: 'reply'; message: string }

/**
 * Arrangement specification
 */
export interface ArrangementSpec {
  description: string
  totalDuration: number
  bpm: number
  key: string
  genre?: string
}

/**
 * Arrangement skeleton
 */
export interface ArrangementSkeleton {
  sections: ArrangementSection[]
  suggestedTracks: string[]
}

/**
 * Arrangement section
 */
export interface ArrangementSection {
  name: string
  startBeat: number
  durationBeats: number
  energy: number // 0-1
  description: string
  suggestedElements: string[]
}

/**
 * Audio feature hints for shader generation
 */
export interface AudioFeatureHints {
  bassHeavy?: boolean
  rhythmic?: boolean
  ambient?: boolean
  energyLevel?: 'low' | 'medium' | 'high'
}

/**
 * GLSL shader result
 */
export interface GLSLShaderResult {
  glsl: string
  uniformHints: Record<string, string>
}

/**
 * AI provider type
 */
export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'sidecar'

/**
 * Model availability status
 */
export interface ModelAvailability {
  ollama: boolean
  openai: boolean
  anthropic: boolean
  sidecar: boolean
  models: {
    aceStep: boolean
    demucs: boolean
  }
}

/**
 * AIPort - interface for AI operations
 *
 * All AI adapters must implement this interface.
 * Implementations: OllamaAdapter, OpenAIAdapter, AnthropicAdapter, SidecarAdapter
 */
export interface AIPort {
  /**
   * Generate music from text prompt
   * @param prompt Music generation prompt
   * @returns Generated audio result
   */
  generateMusic(prompt: MusicGenerationPrompt): Promise<GeneratedAudioResult>

  /**
   * Separate audio into stems
   * @param audioPath Path to audio file
   * @param stems Stem types to separate
   * @returns Stem separation result
   */
  separateStems(audioPath: string, stems: StemType[]): Promise<StemSeparationResult>

  /**
   * Chat with AI copilot
   * @param messages Chat message history
   * @param context Current project context
   * @param memory Session memory
   * @returns Copilot response
   */
  chat(
    messages: ChatMessage[],
    context: ProjectContext,
    memory: SessionMemory[]
  ): Promise<CopilotResponse>

  /**
   * Generate GLSL shader from description
   * @param description Shader description
   * @param audioFeatures Optional audio feature hints
   * @returns GLSL shader code
   */
  generateShader(
    description: string,
    audioFeatures?: AudioFeatureHints
  ): Promise<GLSLShaderResult>

  /**
   * Build arrangement skeleton from specification
   * @param spec Arrangement specification
   * @returns Arrangement skeleton
   */
  buildArrangement(spec: ArrangementSpec): Promise<ArrangementSkeleton>

  /**
   * Save a memory
   * @param key Memory key
   * @param value Memory value
   */
  saveMemory(key: string, value: MemoryValue): Promise<void>

  /**
   * Load memories matching a query
   * @param query Query string
   * @returns Array of matching memories
   */
  loadMemory(query: string): Promise<MemoryValue[]>

  /**
   * Build musical identity profile from session history
   * @returns Musical identity profile
   */
  buildIdentityProfile(): Promise<MusicalIdentityProfile>

  /**
   * Get available AI models and providers
   * @returns Model availability status
   */
  getAvailableModels(): Promise<ModelAvailability>

  /**
   * Get the currently active AI provider
   * @returns Active provider name
   */
  getActiveProvider(): AIProvider
}
