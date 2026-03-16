/**
 * Track type enumerations
 */
export type TrackType = 'audio' | 'midi' | 'instrument' | 'bus' | 'master'

/**
 * Track model - represents a single track in the DAW
 */
export interface Track {
  id: string
  name: string
  type: TrackType
  color: string
  muted: boolean
  solo: boolean
  armed: boolean
  volume: number // 0.0-1.0
  pan: number // -1.0 to 1.0
  clips: Clip[]
  sends: Send[]
  order: number
}

/**
 * Send routing to another track/bus
 */
export interface Send {
  id: string
  destinationTrackId: string
  amount: number // 0.0-1.0
  preFader: boolean
}
