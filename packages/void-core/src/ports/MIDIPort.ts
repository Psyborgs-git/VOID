import {
  MIDIDeviceInfo,
  NoteOnEvent,
  NoteOffEvent,
  CCEvent,
  PitchBendEvent,
  ClockEvent,
  CCMapping,
} from '../events/eventTypes'

/**
 * Unsubscribe function type
 */
export type Unsubscribe = () => void

/**
 * MIDIPort - interface for MIDI device operations
 *
 * All MIDI adapters must implement this interface.
 * Implementation: MIDIAdapter (WEBMIDI.js v3)
 */
export interface MIDIPort {
  /**
   * Initialize MIDI subsystem
   */
  initialize(): Promise<void>

  // Device management
  /**
   * Get list of connected MIDI input devices
   * @returns Array of MIDI device info
   */
  getInputDevices(): MIDIDeviceInfo[]

  /**
   * Get list of connected MIDI output devices
   * @returns Array of MIDI device info
   */
  getOutputDevices(): MIDIDeviceInfo[]

  /**
   * Connect to a MIDI input device
   * @param deviceId Device ID
   */
  connectInput(deviceId: string): void

  /**
   * Connect to a MIDI output device
   * @param deviceId Device ID
   */
  connectOutput(deviceId: string): void

  /**
   * Disconnect from a MIDI input device
   * @param deviceId Device ID
   */
  disconnectInput(deviceId: string): void

  /**
   * Disconnect from a MIDI output device
   * @param deviceId Device ID
   */
  disconnectOutput(deviceId: string): void

  // Event listeners
  /**
   * Listen for MIDI Note On events
   * @param handler Event handler
   * @returns Unsubscribe function
   */
  onNoteOn(handler: (event: NoteOnEvent) => void): Unsubscribe

  /**
   * Listen for MIDI Note Off events
   * @param handler Event handler
   * @returns Unsubscribe function
   */
  onNoteOff(handler: (event: NoteOffEvent) => void): Unsubscribe

  /**
   * Listen for MIDI CC events
   * @param handler Event handler
   * @returns Unsubscribe function
   */
  onCC(handler: (event: CCEvent) => void): Unsubscribe

  /**
   * Listen for MIDI Pitch Bend events
   * @param handler Event handler
   * @returns Unsubscribe function
   */
  onPitchBend(handler: (event: PitchBendEvent) => void): Unsubscribe

  /**
   * Listen for MIDI Clock events
   * @param handler Event handler
   * @returns Unsubscribe function
   */
  onClock(handler: (event: ClockEvent) => void): Unsubscribe

  // Send MIDI
  /**
   * Send MIDI Note On
   * @param deviceId Device ID
   * @param channel MIDI channel (0-15)
   * @param note Note number (0-127)
   * @param velocity Velocity (0-127)
   */
  sendNoteOn(deviceId: string, channel: number, note: number, velocity: number): void

  /**
   * Send MIDI Note Off
   * @param deviceId Device ID
   * @param channel MIDI channel (0-15)
   * @param note Note number (0-127)
   */
  sendNoteOff(deviceId: string, channel: number, note: number): void

  /**
   * Send MIDI CC
   * @param deviceId Device ID
   * @param channel MIDI channel (0-15)
   * @param cc CC number (0-127)
   * @param value CC value (0-127)
   */
  sendCC(deviceId: string, channel: number, cc: number, value: number): void

  // MIDI Learn
  /**
   * Start MIDI learn mode for a parameter
   * @param parameterAddress OSC-style parameter address
   */
  startLearn(parameterAddress: string): void

  /**
   * Stop MIDI learn mode
   */
  stopLearn(): void

  /**
   * Get all MIDI CC mappings
   * @returns Array of CC mappings
   */
  getMappings(): CCMapping[]

  /**
   * Clear a MIDI mapping
   * @param parameterAddress Parameter address to clear
   */
  clearMapping(parameterAddress: string): void

  /**
   * Save mappings to storage
   */
  saveMappings(): Promise<void>

  /**
   * Load mappings from storage
   */
  loadMappings(): Promise<void>
}
