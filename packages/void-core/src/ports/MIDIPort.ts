// MIDIPort.ts

export interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer?: string;
}

export interface NoteOnEvent {
  channel: number;
  note: number;
  velocity: number;
  deviceId: string;
}

export interface NoteOffEvent {
  channel: number;
  note: number;
  deviceId: string;
}

export interface CCEvent {
  channel: number;
  cc: number;
  value: number;
  deviceId: string;
}

export interface PitchBendEvent {
  channel: number;
  value: number;
  deviceId: string;
}

export interface ClockEvent {
  deviceId: string;
}

export type Unsubscribe = () => void;

export interface CCMapping {
  parameterAddress: string;
  channel: number;
  cc: number;
}

export interface MIDIPort {
  // Device management
  getInputDevices(): MIDIDeviceInfo[]
  getOutputDevices(): MIDIDeviceInfo[]
  connectInput(deviceId: string): void
  connectOutput(deviceId: string): void

  // Event listeners
  onNoteOn(handler: (event: NoteOnEvent) => void): Unsubscribe
  onNoteOff(handler: (event: NoteOffEvent) => void): Unsubscribe
  onCC(handler: (event: CCEvent) => void): Unsubscribe
  onPitchBend(handler: (event: PitchBendEvent) => void): Unsubscribe
  onClock(handler: (event: ClockEvent) => void): Unsubscribe

  // Send MIDI
  sendNoteOn(deviceId: string, channel: number, note: number, velocity: number): void
  sendNoteOff(deviceId: string, channel: number, note: number): void
  sendCC(deviceId: string, channel: number, cc: number, value: number): void

  // MIDI Learn
  startLearn(parameterAddress: string): void
  stopLearn(): void
  getMappings(): CCMapping[]
  clearMapping(parameterAddress: string): void
}
