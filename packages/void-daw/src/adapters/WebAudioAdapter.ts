// Adapter: implements AudioPort
import * as Tone from 'tone'
import {
  AudioPort,
  AudioTrackRef,
  AudioNodeRef,
  ClipRef,
  ClipData,
  TrackType,
  eventBus,
} from '@void/core'

/**
 * WebAudioAdapter - implements AudioPort using Web Audio API + Tone.js
 *
 * This is the primary audio engine adapter for VOID.
 * Uses Tone.js for transport and scheduling, Web Audio API for audio graph.
 */
export class WebAudioAdapter implements AudioPort {
  private audioContext: AudioContext
  private tracks: Map<string, TrackNode> = new Map()
  private clips: Map<string, ClipNode> = new Map()
  private masterGain: GainNode
  private masterAnalyser: AnalyserNode
  private isPlaying = false
  private animationFrameId?: number

  constructor() {
    // Initialize Tone.js (creates AudioContext)
    this.audioContext = Tone.getContext().rawContext as AudioContext

    // Create master bus
    this.masterGain = this.audioContext.createGain()
    this.masterAnalyser = this.audioContext.createAnalyser()
    this.masterAnalyser.fftSize = 2048

    // Master chain: masterGain → masterAnalyser → destination
    this.masterGain.connect(this.masterAnalyser)
    this.masterAnalyser.connect(this.audioContext.destination)

    // Start level update loop
    this.startLevelUpdates()

    console.log('[WebAudioAdapter] Initialized')
  }

  // Transport control
  play(): void {
    Tone.getTransport().start()
    this.isPlaying = true
    eventBus.emit({ type: 'transport:play', beat: this.getCurrentBeat() })
    console.log('[WebAudioAdapter] Play')
  }

  stop(): void {
    Tone.getTransport().stop()
    this.isPlaying = false
    eventBus.emit({ type: 'transport:stop' })
    console.log('[WebAudioAdapter] Stop')
  }

  pause(): void {
    Tone.getTransport().pause()
    this.isPlaying = false
    eventBus.emit({ type: 'transport:pause', beat: this.getCurrentBeat() })
    console.log('[WebAudioAdapter] Pause')
  }

  record(): void {
    // Recording not implemented in Phase 2
    console.log('[WebAudioAdapter] Record (not implemented)')
  }

  setTransportBPM(bpm: number): void {
    Tone.getTransport().bpm.value = bpm
    eventBus.emit({ type: 'transport:bpmChange', bpm })
    console.log('[WebAudioAdapter] Set BPM:', bpm)
  }

  setTimeSignature(numerator: number, denominator: number): void {
    Tone.getTransport().timeSignature = [numerator, denominator]
    console.log('[WebAudioAdapter] Set time signature:', numerator, '/', denominator)
  }

  setLoopRegion(startBeat: number, endBeat: number): void {
    const startTime = this.beatsToTime(startBeat)
    const endTime = this.beatsToTime(endBeat)
    Tone.getTransport().loopStart = startTime
    Tone.getTransport().loopEnd = endTime
    Tone.getTransport().loop = true
    console.log('[WebAudioAdapter] Set loop region:', startBeat, '-', endBeat)
  }

  getCurrentBeat(): number {
    const bars = Tone.getTransport().position.split(':')
    const bar = parseInt(bars[0] || '0')
    const beat = parseInt(bars[1] || '0')
    const sixteenth = parseInt(bars[2] || '0')
    return bar * 4 + beat + sixteenth / 4
  }

  getCurrentTime(): number {
    return Tone.getTransport().seconds
  }

  // Track operations
  createTrack(type: TrackType, id: string): AudioTrackRef {
    const gainNode = this.audioContext.createGain()
    const panNode = this.audioContext.createStereoPanner()
    const analyser = this.audioContext.createAnalyser()

    analyser.fftSize = 2048

    // Track chain: gain → pan → analyser → master
    gainNode.connect(panNode)
    panNode.connect(analyser)
    analyser.connect(this.masterGain)

    const trackNode: TrackNode = {
      id,
      type,
      gainNode,
      panNode,
      analyser,
      muted: false,
      soloed: false,
      sources: [],
    }

    this.tracks.set(id, trackNode)

    eventBus.emit({ type: 'audio:trackCreated', trackId: id, trackType: type })
    console.log('[WebAudioAdapter] Created track:', id, type)

    return {
      id,
      gainNode,
      panNode,
      analyser,
    }
  }

  deleteTrack(id: string): void {
    const track = this.tracks.get(id)
    if (!track) return

    // Disconnect and cleanup
    track.gainNode.disconnect()
    track.panNode.disconnect()
    track.analyser.disconnect()

    // Stop all sources
    track.sources.forEach((source) => {
      try {
        source.stop()
      } catch (e) {
        // Source might already be stopped
      }
    })

    this.tracks.delete(id)
    eventBus.emit({ type: 'audio:trackDeleted', trackId: id })
    console.log('[WebAudioAdapter] Deleted track:', id)
  }

  setTrackVolume(id: string, volume: number): void {
    const track = this.tracks.get(id)
    if (!track) return

    track.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    eventBus.emit({ type: 'audio:trackVolumeChange', trackId: id, volume })
  }

  setTrackPan(id: string, pan: number): void {
    const track = this.tracks.get(id)
    if (!track) return

    track.panNode.pan.setValueAtTime(pan, this.audioContext.currentTime)
    eventBus.emit({ type: 'audio:trackPanChange', trackId: id, pan })
  }

  setTrackMute(id: string, muted: boolean): void {
    const track = this.tracks.get(id)
    if (!track) return

    track.muted = muted
    if (muted) {
      track.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    } else {
      // Restore previous volume (stored would be better, using 0.8 as default)
      track.gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime)
    }
  }

  setTrackSolo(id: string, soloed: boolean): void {
    const track = this.tracks.get(id)
    if (!track) return

    track.soloed = soloed

    // Implement solo logic: mute all non-soloed tracks if any track is soloed
    const anySoloed = Array.from(this.tracks.values()).some((t) => t.soloed)

    if (anySoloed) {
      this.tracks.forEach((t) => {
        if (!t.soloed && !t.muted) {
          t.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
        } else if (t.soloed) {
          t.gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime)
        }
      })
    } else {
      // No tracks soloed, restore all unmuted tracks
      this.tracks.forEach((t) => {
        if (!t.muted) {
          t.gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime)
        }
      })
    }
  }

  routeTrackTo(srcId: string, dstId: string): void {
    const srcTrack = this.tracks.get(srcId)
    const dstTrack = this.tracks.get(dstId)

    if (!srcTrack || !dstTrack) return

    // Disconnect from master and connect to destination track
    srcTrack.analyser.disconnect(this.masterGain)
    srcTrack.analyser.connect(dstTrack.gainNode)

    console.log('[WebAudioAdapter] Routed track', srcId, 'to', dstId)
  }

  // Clip operations
  placeClip(trackId: string, clip: ClipData, startBeat: number): ClipRef {
    const track = this.tracks.get(trackId)
    if (!track) {
      throw new Error(`Track ${trackId} not found`)
    }

    const clipId = `clip-${Date.now()}-${Math.random()}`

    if (clip.type === 'audio' && clip.audioFilePath) {
      // Load and schedule audio file
      this.loadAndScheduleAudioClip(track, clip.audioFilePath, startBeat, clipId)
    }

    eventBus.emit({
      type: 'audio:clipPlaced',
      trackId,
      clipId,
      startBeat,
    })

    console.log('[WebAudioAdapter] Placed clip:', clipId, 'on track', trackId)

    return {
      id: clipId,
      source: null, // Will be set when audio loads
    }
  }

  removeClip(clipId: string): void {
    const clip = this.clips.get(clipId)
    if (!clip) return

    // Stop and disconnect source
    if (clip.source) {
      try {
        clip.source.stop()
      } catch (e) {
        // Already stopped
      }
      clip.source.disconnect()
    }

    this.clips.delete(clipId)
    console.log('[WebAudioAdapter] Removed clip:', clipId)
  }

  trimClip(clipId: string, startOffset: number, endOffset: number): void {
    // Trimming not fully implemented in Phase 2
    console.log('[WebAudioAdapter] Trim clip:', clipId, startOffset, endOffset)
  }

  // Node operations (for synth integration - Phase 4)
  connectNode(
    src: AudioNodeRef,
    dst: AudioNodeRef,
    srcOutput?: number,
    dstInput?: number
  ): void {
    const srcNode = src.node as AudioNode
    const dstNode = dst.node as AudioNode
    srcNode.connect(dstNode, srcOutput, dstInput)
  }

  disconnectNode(src: AudioNodeRef, dst: AudioNodeRef): void {
    const srcNode = src.node as AudioNode
    const dstNode = dst.node as AudioNode
    srcNode.disconnect(dstNode)
  }

  createAudioNode(type: string, params: Record<string, number>): AudioNodeRef {
    let node: AudioNode

    switch (type) {
      case 'gain':
        node = this.audioContext.createGain()
        if (params['gain'] !== undefined) {
          ;(node as GainNode).gain.value = params['gain']
        }
        break
      case 'biquadFilter':
        node = this.audioContext.createBiquadFilter()
        if (params['frequency']) (node as BiquadFilterNode).frequency.value = params['frequency']
        if (params['Q']) (node as BiquadFilterNode).Q.value = params['Q']
        break
      default:
        node = this.audioContext.createGain()
    }

    return { id: `node-${Date.now()}`, node }
  }

  // Analysis
  getAnalyserData(trackId: string, fftSize: number): Float32Array {
    const track = this.tracks.get(trackId)
    if (!track) return new Float32Array(fftSize / 2)

    track.analyser.fftSize = fftSize
    const dataArray = new Float32Array(track.analyser.frequencyBinCount)
    track.analyser.getFloatFrequencyData(dataArray)

    return dataArray
  }

  getPeakLevel(trackId: string): { peak: number; rms: number } {
    const track = this.tracks.get(trackId)
    if (!track) return { peak: 0, rms: 0 }

    const bufferLength = track.analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)
    track.analyser.getByteTimeDomainData(dataArray)

    let sum = 0
    let peak = 0

    for (let i = 0; i < bufferLength; i++) {
      const value = (dataArray[i]! - 128) / 128
      const abs = Math.abs(value)
      if (abs > peak) peak = abs
      sum += value * value
    }

    const rms = Math.sqrt(sum / bufferLength)

    return { peak, rms }
  }

  // Private helpers
  private beatsToTime(beats: number): string {
    const bars = Math.floor(beats / 4)
    const remainingBeats = beats % 4
    return `${bars}:${remainingBeats}:0`
  }

  private async loadAndScheduleAudioClip(
    track: TrackNode,
    audioFilePath: string,
    startBeat: number,
    clipId: string
  ): Promise<void> {
    try {
      // Load audio file
      const response = await fetch(audioFilePath)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      // Create source
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer

      // Connect to track
      source.connect(track.gainNode)

      // Schedule playback
      const startTime = this.beatsToTime(startBeat)
      source.start(Tone.getTransport().toSeconds(startTime))

      // Store reference
      track.sources.push(source)
      this.clips.set(clipId, { id: clipId, source, trackId: track.id })

      console.log('[WebAudioAdapter] Loaded audio clip:', audioFilePath)
    } catch (error) {
      console.error('[WebAudioAdapter] Failed to load audio:', error)
    }
  }

  private startLevelUpdates(): void {
    const updateLevels = () => {
      // Update levels for all tracks
      this.tracks.forEach((track) => {
        const { peak, rms } = this.getPeakLevel(track.id)
        eventBus.emit({
          type: 'audio:levelUpdate',
          trackId: track.id,
          peak,
          rms,
        })
      })

      this.animationFrameId = requestAnimationFrame(updateLevels)
    }

    updateLevels()
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.tracks.forEach((track) => {
      track.sources.forEach((source) => {
        try {
          source.stop()
        } catch (e) {
          // Already stopped
        }
      })
      track.gainNode.disconnect()
      track.panNode.disconnect()
      track.analyser.disconnect()
    })

    this.masterGain.disconnect()
    this.masterAnalyser.disconnect()

    console.log('[WebAudioAdapter] Destroyed')
  }
}

/**
 * Track node with audio graph
 */
interface TrackNode {
  id: string
  type: TrackType
  gainNode: GainNode
  panNode: StereoPannerNode
  analyser: AnalyserNode
  muted: boolean
  soloed: boolean
  sources: AudioBufferSourceNode[]
}

/**
 * Clip node with source
 */
interface ClipNode {
  id: string
  source: AudioBufferSourceNode | null
  trackId: string
}
