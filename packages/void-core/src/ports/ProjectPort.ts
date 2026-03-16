import { Project } from '../domain/Project'

/**
 * Project metadata for listings
 */
export interface ProjectMetadata {
  id: string
  name: string
  bpm: number
  key: string
  createdAt: number
  updatedAt: number
  duration: number
  trackCount: number
  thumbnail?: string
}

/**
 * Project export format
 */
export type ProjectExportFormat = 'json' | 'wav' | 'mp3' | 'stems'

/**
 * Project export options
 */
export interface ProjectExportOptions {
  format: ProjectExportFormat
  destination: string
  includeAudio?: boolean
  sampleRate?: number
  bitDepth?: number
}

/**
 * History entry for undo/redo
 */
export interface HistoryEntry {
  id: string
  timestamp: number
  action: string
  state: Partial<Project>
}

/**
 * ProjectPort - interface for project persistence operations
 *
 * All project storage adapters must implement this interface.
 * Implementation: SQLite + filesystem
 */
export interface ProjectPort {
  /**
   * Create a new project
   * @param name Project name
   * @returns New project
   */
  createProject(name: string): Promise<Project>

  /**
   * Load a project
   * @param projectId Project ID
   * @returns Loaded project
   */
  loadProject(projectId: string): Promise<Project>

  /**
   * Save a project
   * @param project Project to save
   */
  saveProject(project: Project): Promise<void>

  /**
   * Delete a project
   * @param projectId Project ID
   */
  deleteProject(projectId: string): Promise<void>

  /**
   * Get all projects metadata
   * @returns Array of project metadata
   */
  listProjects(): Promise<ProjectMetadata[]>

  /**
   * Export project
   * @param projectId Project ID
   * @param options Export options
   * @returns Path to exported file
   */
  exportProject(projectId: string, options: ProjectExportOptions): Promise<string>

  /**
   * Import project
   * @param filePath Path to project file
   * @returns Imported project
   */
  importProject(filePath: string): Promise<Project>

  // History/Undo
  /**
   * Save current state to history
   * @param projectId Project ID
   * @param action Action description
   * @param state Current state
   */
  pushHistory(projectId: string, action: string, state: Partial<Project>): Promise<void>

  /**
   * Undo last action
   * @param projectId Project ID
   * @returns Previous state or undefined
   */
  undo(projectId: string): Promise<Partial<Project> | undefined>

  /**
   * Redo last undone action
   * @param projectId Project ID
   * @returns Next state or undefined
   */
  redo(projectId: string): Promise<Partial<Project> | undefined>

  /**
   * Get history for a project
   * @param projectId Project ID
   * @returns Array of history entries
   */
  getHistory(projectId: string): Promise<HistoryEntry[]>

  /**
   * Clear history for a project
   * @param projectId Project ID
   */
  clearHistory(projectId: string): Promise<void>

  // Auto-save
  /**
   * Enable auto-save
   * @param interval Auto-save interval in milliseconds
   */
  enableAutoSave(interval: number): void

  /**
   * Disable auto-save
   */
  disableAutoSave(): void
}
