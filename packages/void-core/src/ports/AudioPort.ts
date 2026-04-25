// AudioPort.ts
import type { TrackType, ClipData } from '../domain/Project';

export type AudioTrackRef = string;
export type ClipRef = string;
export type AudioNodeRef = string;
export type AudioAnalyserRef = unknown; // Platform specific

export interface AudioPort {
  // Transport
  play(): void
  stop(): void
  pause(): void
  record(): void
  setTransportBPM(bpm: number): void
  setTimeSignature(num: number, denom: number): void
  setLoopRegion(startBeat: number, endBeat: number): void
  getCurrentBeat(): number
  getCurrentTime(): number

  // Tracks
  createTrack(type: TrackType, id: string): AudioTrackRef
  deleteTrack(id: string): void
  setTrackVolume(id: string, volume: number): void       // 0.0 - 1.0
  setTrackPan(id: string, pan: number): void             // -1.0 to 1.0
  setTrackMute(id: string, muted: boolean): void
  setTrackSolo(id: string, soloed: boolean): void
  routeTrackTo(srcId: string, dstId: string): void       // Sends / bus routing

  // Clips
  placeClip(trackId: string, clip: ClipData, startBeat: number): ClipRef
  removeClip(clipId: string): void
  trimClip(clipId: string, startOffset: number, endOffset: number): void

  // Nodes (for synth graph integration)
  connectNode(src: AudioNodeRef, dst: AudioNodeRef, srcOutput?: number, dstInput?: number): void
  disconnectNode(src: AudioNodeRef, dst: AudioNodeRef): void
  createAudioNode(type: string, params: Record<string, number>): AudioNodeRef

  // Analysis
  getAnalyserData(trackId: string, fftSize: number): Float32Array
  getPeakLevel(trackId: string): { peak: number; rms: number }
}
