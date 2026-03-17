/**
 * MIDI device information
 */
export interface MIDIDeviceInfo {
  id: string
  name: string
  manufacturer: string
  type: 'input' | 'output'
  connected: boolean
}

/**
 * MIDI Note On event
 */
export interface NoteOnEvent {
  channel: number // 0-15
  note: number // 0-127
  velocity: number // 0-127
  deviceId: string
  timestamp: number
}

/**
 * MIDI Note Off event
 */
export interface NoteOffEvent {
  channel: number
  note: number
  velocity: number
  deviceId: string
  timestamp: number
}

/**
 * MIDI Control Change event
 */
export interface CCEvent {
  channel: number
  cc: number // 0-127
  value: number // 0-127
  deviceId: string
  timestamp: number
}

/**
 * MIDI Pitch Bend event
 */
export interface PitchBendEvent {
  channel: number
  value: number // -1.0 to 1.0
  deviceId: string
  timestamp: number
}

/**
 * MIDI Clock event
 */
export interface ClockEvent {
  type: 'start' | 'stop' | 'continue' | 'tick'
  deviceId: string
  timestamp: number
}

/**
 * CC Mapping
 */
export interface CCMapping {
  parameterAddress: string // OSC-style address
  deviceId: string
  channel: number
  cc: number
  minValue: number
  maxValue: number
}
