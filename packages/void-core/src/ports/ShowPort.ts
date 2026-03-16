import { Cue, CueData, TriggerType } from '../domain/Cue'

/**
 * Trigger source
 */
export type TriggerSource = 'manual' | 'beat' | 'time' | 'midi' | 'osc'

/**
 * Cue execution status
 */
export interface CueExecutionStatus {
  cueId: string
  status: 'idle' | 'armed' | 'running' | 'complete'
  progress: number // 0-1
  startTime?: number
}

/**
 * ShowPort - interface for show cue system operations
 *
 * All show control adapters must implement this interface.
 * Implementation: CueEngine + StageWindow
 */
export interface ShowPort {
  /**
   * Trigger a cue
   * @param cueId Cue ID
   * @param source Trigger source
   */
  triggerCue(cueId: string, source: TriggerSource): Promise<void>

  /**
   * Schedule a cue for future execution
   * @param cueId Cue ID
   * @param when Time or beat to trigger
   * @param type Trigger type ('beat' or 'time')
   */
  scheduleCue(cueId: string, when: number, type: 'beat' | 'time'): void

  /**
   * Cancel a scheduled cue
   * @param cueId Cue ID
   */
  cancelCue(cueId: string): void

  /**
   * Execute panic - immediate stop and blackout
   */
  panic(): void

  /**
   * Go to next cue
   */
  nextCue(): Promise<void>

  /**
   * Go to previous cue
   */
  previousCue(): Promise<void>

  /**
   * Go to specific cue
   * @param cueId Cue ID
   */
  goToCue(cueId: string): Promise<void>

  /**
   * Get current cue status
   * @param cueId Cue ID
   * @returns Cue execution status
   */
  getCueStatus(cueId: string): CueExecutionStatus

  /**
   * Get active cue ID
   * @returns Current cue ID or undefined
   */
  getActiveCue(): string | undefined

  /**
   * Arm a cue for triggering
   * @param cueId Cue ID
   */
  armCue(cueId: string): void

  /**
   * Disarm a cue
   * @param cueId Cue ID
   */
  disarmCue(cueId: string): void

  // Stage view control
  /**
   * Open stage view window
   * @param displayId Display ID for output
   * @returns Window ID
   */
  openStageView(displayId: number): Promise<number>

  /**
   * Close stage view window
   */
  closeStageView(): Promise<void>

  /**
   * Get stage view window ID
   * @returns Window ID or undefined
   */
  getStageViewWindowId(): number | undefined

  /**
   * Update stage view content
   * @param content Content to display
   */
  updateStageView(content: unknown): void

  // Beat/time sync
  /**
   * Sync cue engine with transport
   * @param beat Current beat position
   */
  syncWithTransport(beat: number): void

  /**
   * Set show start time
   * @param timestamp Start timestamp
   */
  setShowStartTime(timestamp: number): void

  /**
   * Get elapsed show time in seconds
   * @returns Elapsed time
   */
  getElapsedTime(): number
}
