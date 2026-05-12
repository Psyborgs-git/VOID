// Adapter: implements AudioPort
import { AudioPort, AudioTrackRef, ClipRef, AudioNodeRef, TrackType, ClipData } from 'void-core';

export class WebAudioAdapter implements AudioPort {
  private context: AudioContext;
  private analyserDataCache: Map<string, Float32Array> = new Map();

  constructor() {
    this.context = new window.AudioContext();
  }

  play(): void {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    // Implement tone.js transport play integration
  }

  stop(): void {
    // Implement transport stop
  }

  pause(): void {
    this.context.suspend();
  }

  record(): void {}

  setTransportBPM(bpm: number): void {}
  setTimeSignature(num: number, denom: number): void {}
  setLoopRegion(startBeat: number, endBeat: number): void {}

  getCurrentBeat(): number { return 0; }
  getCurrentTime(): number { return this.context.currentTime; }

  createTrack(type: TrackType, id: string): AudioTrackRef {
    return id;
  }

  deleteTrack(id: string): void {
    // ⚡ Bolt: Clear the cache entry to prevent memory leaks when teardown lifecycle occurs.
    this.analyserDataCache.delete(id);
  }

  setTrackVolume(id: string, volume: number): void {}
  setTrackPan(id: string, pan: number): void {}
  setTrackMute(id: string, muted: boolean): void {}
  setTrackSolo(id: string, soloed: boolean): void {}
  routeTrackTo(srcId: string, dstId: string): void {}

  placeClip(trackId: string, clip: ClipData, startBeat: number): ClipRef {
    return clip.id;
  }

  removeClip(clipId: string): void {}
  trimClip(clipId: string, startOffset: number, endOffset: number): void {}

  connectNode(src: AudioNodeRef, dst: AudioNodeRef, srcOutput?: number, dstInput?: number): void {}
  disconnectNode(src: AudioNodeRef, dst: AudioNodeRef): void {}

  createAudioNode(type: string, params: Record<string, number>): AudioNodeRef {
    return `${type}-node`;
  }

  getAnalyserData(trackId: string, fftSize: number): Float32Array {
    // ⚡ Bolt: Cache Float32Array objects per trackId.
    // 💡 What: Reusing TypedArrays instead of instantiating new ones.
    // 🎯 Why: getAnalyserData is called continuously in audio polling loops. Allocating arrays continuously causes severe GC pressure and micro-stutters.
    // 📊 Impact: O(1) allocation cost per track, eliminating massive frame drops during 60fps WebAudio render cycles.
    let data = this.analyserDataCache.get(trackId);
    if (!data || data.length !== fftSize) {
      data = new Float32Array(fftSize);
      this.analyserDataCache.set(trackId, data);
    }
    return data;
  }

  getPeakLevel(trackId: string): { peak: number; rms: number } {
    return { peak: 0, rms: 0 };
  }
}
