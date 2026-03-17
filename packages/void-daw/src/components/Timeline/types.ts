/**
 * Timeline component types
 */

export interface TimelineTrack {
  id: string
  name: string
  clips: TimelineClip[]
}

export interface TimelineClip {
  id: string
  type: 'audio' | 'midi'
  name: string
  startBeat: number
  durationBeats: number
  audioFilePath?: string
  audioBuffer?: AudioBuffer
  midiNotes?: Array<{
    pitch: number
    velocity: number
    startBeat: number
    durationBeats: number
  }>
}
