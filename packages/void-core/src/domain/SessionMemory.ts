/**
 * Session memory - stores AI learnings about user's musical preferences
 */
export interface SessionMemory {
  id: string
  sessionId: string
  key: string
  value: MemoryValue
  embedding?: Float32Array
  createdAt: number
  importance: number // 0.0-1.0
}

/**
 * Memory value types
 */
export type MemoryValue =
  | { type: 'bpm'; value: number }
  | { type: 'key'; value: string }
  | { type: 'genre'; value: string }
  | { type: 'mixing'; value: string }
  | { type: 'synthesis'; value: string }
  | { type: 'feedback'; value: 'positive' | 'negative'; context: string }
  | { type: 'text'; value: string }

/**
 * Musical identity profile built from session memories
 */
export interface MusicalIdentityProfile {
  preferredBPMRange: [number, number]
  preferredKeys: string[]
  genres: string[]
  mixingStyle: string[]
  synthesisPreferences: string[]
  recentSessions: SessionSummary[]
}

/**
 * Session summary
 */
export interface SessionSummary {
  sessionId: string
  date: number
  bpm: number
  key: string
  trackCount: number
  highlights: string[]
}
