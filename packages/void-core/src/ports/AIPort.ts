// AIPort.ts
import type { ProjectContext } from '../domain/Project';

export interface MusicGenerationPrompt {
  prompt: string;
  duration?: number;
  style?: string;
}

export interface GeneratedAudioResult {
  jobId: string;
  audioPath: string;
}

export type StemType = 'vocals' | 'drums' | 'bass' | 'other';

export interface StemSeparationResult {
  jobId: string;
  stemPaths: Record<StemType, string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SessionMemory {
  preferredBpmRange?: [number, number];
  keySignatures?: string[];
  genreDescriptors?: string[];
}

export interface CopilotResponse {
  message: string;
  actions?: Record<string, any>[];
}

export interface AudioFeatureHints {
  rms: number;
  spectralCentroid: number;
}

export interface GLSLShaderResult {
  glsl: string;
}

export interface ArrangementSpec {
  description: string;
}

export interface ArrangementSkeleton {
  markers: { time: number; name: string }[];
}

export type MemoryValue = any;

export interface MusicalIdentityProfile {
  traits: string[];
}

export interface ModelAvailability {
  available: string[];
  loaded: string[];
}

export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'sidecar';

export interface AIPort {
  // Music generation (routes to ACE-Step via sidecar)
  generateMusic(prompt: MusicGenerationPrompt): Promise<GeneratedAudioResult>

  // Stem separation (routes to Demucs via sidecar)
  separateStems(audioPath: string, stems: StemType[]): Promise<StemSeparationResult>

  // LLM copilot (routes to Ollama / OpenAI / Anthropic)
  chat(messages: ChatMessage[], context: ProjectContext, memory: SessionMemory): Promise<CopilotResponse>

  // GLSL generation
  generateShader(description: string, audioFeatures?: AudioFeatureHints): Promise<GLSLShaderResult>

  // Arrangement engine
  buildArrangement(spec: ArrangementSpec): Promise<ArrangementSkeleton>

  // Session memory
  saveMemory(key: string, value: MemoryValue): Promise<void>
  loadMemory(query: string): Promise<MemoryValue[]>
  buildIdentityProfile(): Promise<MusicalIdentityProfile>

  // Health / status
  getAvailableModels(): Promise<ModelAvailability>
  getActiveProvider(): AIProvider
}
