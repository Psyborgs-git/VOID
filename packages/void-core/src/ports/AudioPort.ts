import { TrackType } from '../domain/Track'
import { Clip } from '../domain/Clip'

/**
 * AudioPort - interface for audio engine operations
 *
 * All audio engine adapters must implement this interface.
 * Implementation: WebAudioAdapter (Web Audio API + Tone.js)
 */
export interface AudioPort {
  // Transport control
  /**
   * Start playback
   */
  play(): void

  /**
   * Stop playback
   */
  stop(): void

  /**
   * Pause playback
   */
  pause(): void

  /**
   * Start recording
   */
  record(): void

  /**
   * Set transport BPM
   * @param bpm Beats per minute
   */
  setTransportBPM(bpm: number): void

  /**
   * Set time signature
   * @param numerator Time signature numerator
   * @param denominator Time signature denominator
   */
  setTimeSignature(numerator: number, denominator: number): void

  /**
   * Set loop region
   * @param startBeat Loop start position in beats
   * @param endBeat Loop end position in beats
   */
  setLoopRegion(startBeat: number, endBeat: number): void

  /**
   * Get current playback position in beats
   * @returns Current beat position
   */
  getCurrentBeat(): number

  /**
   * Get current playback time in seconds
   * @returns Current time in seconds
   */
  getCurrentTime(): number

  // Track operations
  /**
   * Create a new track
   * @param type Track type
   * @param id Track ID
   * @returns Audio track reference
   */
  createTrack(type: TrackType, id: string): AudioTrackRef

  /**
   * Delete a track
   * @param id Track ID
   */
  deleteTrack(id: string): void

  /**
   * Set track volume
   * @param id Track ID
   * @param volume Volume level (0.0-1.0)
   */
  setTrackVolume(id: string, volume: number): void

  /**
   * Set track pan
   * @param id Track ID
   * @param pan Pan position (-1.0 to 1.0)
   */
  setTrackPan(id: string, pan: number): void

  /**
   * Set track mute state
   * @param id Track ID
   * @param muted Mute state
   */
  setTrackMute(id: string, muted: boolean): void

  /**
   * Set track solo state
   * @param id Track ID
   * @param soloed Solo state
   */
  setTrackSolo(id: string, soloed: boolean): void

  /**
   * Route track to another track (send/bus routing)
   * @param srcId Source track ID
   * @param dstId Destination track ID
   */
  routeTrackTo(srcId: string, dstId: string): void

  // Clip operations
  /**
   * Place a clip on a track
   * @param trackId Track ID
   * @param clip Clip data
   * @param startBeat Start position in beats
   * @returns Clip reference
   */
  placeClip(trackId: string, clip: ClipData, startBeat: number): ClipRef

  /**
   * Remove a clip
   * @param clipId Clip ID
   */
  removeClip(clipId: string): void

  /**
   * Trim a clip
   * @param clipId Clip ID
   * @param startOffset Start offset in seconds
   * @param endOffset End offset in seconds
   */
  trimClip(clipId: string, startOffset: number, endOffset: number): void

  // Node operations (for synth integration)
  /**
   * Connect two audio nodes
   * @param src Source node
   * @param dst Destination node
   * @param srcOutput Source output index
   * @param dstInput Destination input index
   */
  connectNode(
    src: AudioNodeRef,
    dst: AudioNodeRef,
    srcOutput?: number,
    dstInput?: number
  ): void

  /**
   * Disconnect two audio nodes
   * @param src Source node
   * @param dst Destination node
   */
  disconnectNode(src: AudioNodeRef, dst: AudioNodeRef): void

  /**
   * Create an audio node
   * @param type Node type
   * @param params Initial parameters
   * @returns Audio node reference
   */
  createAudioNode(type: string, params: Record<string, number>): AudioNodeRef

  // Analysis
  /**
   * Get analyser data for visualizations
   * @param trackId Track ID
   * @param fftSize FFT size
   * @returns Frequency data array
   */
  getAnalyserData(trackId: string, fftSize: number): Float32Array

  /**
   * Get peak level for metering
   * @param trackId Track ID
   * @returns Peak and RMS levels
   */
  getPeakLevel(trackId: string): { peak: number; rms: number }
}

/**
 * Audio track reference
 */
export interface AudioTrackRef {
  id: string
  gainNode: unknown // Web Audio GainNode (opaque)
  panNode: unknown // Web Audio StereoPannerNode (opaque)
  analyser: unknown // Web Audio AnalyserNode (opaque)
}

/**
 * Audio node reference
 */
export interface AudioNodeRef {
  id: string
  node: unknown // Web Audio AudioNode (opaque)
}

/**
 * Clip reference
 */
export interface ClipRef {
  id: string
  source: unknown // Web Audio AudioBufferSourceNode (opaque)
}

/**
 * Clip data for placement
 */
export interface ClipData {
  type: 'audio' | 'midi'
  audioFilePath?: string
  midiNotes?: Array<{ pitch: number; velocity: number; startBeat: number; durationBeats: number }>
  durationBeats: number
}
