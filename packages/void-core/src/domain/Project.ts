import { Track } from './Track'
import { Cue } from './Cue'

/**
 * Project - root aggregate containing the entire session state
 */
export interface Project {
  id: string
  name: string
  bpm: number
  timeSignature: TimeSignature
  key: MusicalKey
  tracks: Track[]
  cueLists: CueList[]
  createdAt: number
  updatedAt: number
  sampleRate: number
  bufferSize: number
}

/**
 * Time signature
 */
export interface TimeSignature {
  numerator: number
  denominator: number
}

/**
 * Musical key
 */
export interface MusicalKey {
  tonic: string // 'C', 'D', 'E', etc.
  mode: 'major' | 'minor'
}

/**
 * CueList - collection of cues for live performance
 */
export interface CueList {
  id: string
  name: string
  cues: Cue[]
}
