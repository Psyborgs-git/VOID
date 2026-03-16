/**
 * Cue - discrete action in a show
 */
export interface Cue {
  id: string
  index: number
  name: string
  type: CueType
  trigger: CueTrigger
  duration?: number // Duration in seconds if applicable
  nextCueId?: string
  autoContinue: boolean
  data: CueData
}

/**
 * Cue types
 */
export type CueType =
  | 'AudioScene'
  | 'VisualScene'
  | 'MIDISend'
  | 'OSCSend'
  | 'AIGenerate'
  | 'Tempo'
  | 'Blackout'
  | 'Custom'

/**
 * Trigger types
 */
export interface CueTrigger {
  type: TriggerType
  config: TriggerConfig
}

export type TriggerType = 'manual' | 'beat' | 'time'

export type TriggerConfig =
  | { type: 'manual' }
  | { type: 'beat'; beat: number }
  | { type: 'time'; seconds: number }

/**
 * Cue-specific data (discriminated union)
 */
export type CueData =
  | { type: 'AudioScene'; trackIds: string[]; action: 'arm' | 'play' | 'stop' }
  | { type: 'VisualScene'; shaderId: string; transitionDuration: number }
  | { type: 'MIDISend'; deviceId: string; channel: number; data: number[] }
  | { type: 'OSCSend'; address: string; args: OSCArg[] }
  | { type: 'AIGenerate'; prompt: string; targetTrackId?: string }
  | { type: 'Tempo'; bpm: number }
  | { type: 'Blackout' }
  | { type: 'Custom'; script: string }

/**
 * OSC argument types
 */
export type OSCArg = number | string | boolean
