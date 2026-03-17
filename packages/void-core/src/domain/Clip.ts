/**
 * Clip type enumeration
 */
export type ClipType = 'audio' | 'midi' | 'automation'

/**
 * Base clip interface
 */
export interface BaseClip {
  id: string
  type: ClipType
  trackId: string
  startBeat: number
  durationBeats: number
  name: string
  color: string
  muted: boolean
}

/**
 * Audio clip with waveform data reference
 */
export interface AudioClip extends BaseClip {
  type: 'audio'
  audioFilePath: string
  startOffset: number // Trim start in seconds
  endOffset: number // Trim end in seconds
  gain: number // 0.0-2.0
  fadeIn: number // Duration in beats
  fadeOut: number // Duration in beats
  pitchShift: number // Semitones
  timeStretch: number // Ratio
}

/**
 * MIDI clip with note data
 */
export interface MIDIClip extends BaseClip {
  type: 'midi'
  notes: MIDINote[]
}

/**
 * MIDI note event
 */
export interface MIDINote {
  pitch: number // 0-127
  velocity: number // 0-127
  startBeat: number
  durationBeats: number
}

/**
 * Automation clip
 */
export interface AutomationClip extends BaseClip {
  type: 'automation'
  parameterAddress: string // OSC-style address
  points: AutomationPoint[]
  curve: AutomationCurve
}

/**
 * Automation point
 */
export interface AutomationPoint {
  beat: number
  value: number
}

/**
 * Automation curve types
 */
export type AutomationCurve = 'linear' | 'exponential' | 'logarithmic' | 'bezier'

/**
 * Union type for all clip types
 */
export type Clip = AudioClip | MIDIClip | AutomationClip
