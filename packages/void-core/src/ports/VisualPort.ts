// VisualPort.ts
import type { AudioAnalyserRef } from './AudioPort';

export type ShaderRef = string;
export type ProjectionSurfaceRef = string;

export interface SurfaceConfig {
  id: string;
  width: number;
  height: number;
}

export interface Quad {
  topLeft: [number, number];
  topRight: [number, number];
  bottomRight: [number, number];
  bottomLeft: [number, number];
}

export type AudioFeature = 'rms' | 'peak' | 'centroid' | 'bass' | 'mid' | 'treble';

export interface DisplayInfo {
  id: number;
  bounds: { x: number; y: number; width: number; height: number };
}

export interface LiveCodeResult {
  success: boolean;
  error?: string;
}

export interface VisualPort {
  // Shader management
  loadShader(glsl: string, id: string): ShaderRef
  updateShader(id: string, glsl: string): void           // Hot-reload, no flicker
  removeShader(id: string): void

  // Surfaces (projection mapping)
  createSurface(config: SurfaceConfig): ProjectionSurfaceRef
  warpSurface(id: string, corners: Quad): void           // 4-corner warp
  assignShaderToSurface(shaderId: string, surfaceId: string): void

  // Audio reactivity
  bindAnalyser(analyser: AudioAnalyserRef): void
  setAudioBinding(shaderId: string, paramName: string, audioFeature: AudioFeature): void

  // Output
  setOutputWindow(windowId: number, display: DisplayInfo): void
  enterFullscreen(outputIndex: number): void
  exitFullscreen(): void
  previewInPanel(enabled: boolean): void

  // Live coding
  executeLiveCode(code: string): LiveCodeResult
  getLiveCodeError(): string | null
}
