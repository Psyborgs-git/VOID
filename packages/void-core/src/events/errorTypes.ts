/**
 * Base sidecar error type
 */
export interface SidecarError {
  type: SidecarErrorType
  message: string
  code?: string
  recoverable: boolean
}

/**
 * Sidecar error types
 */
export type SidecarErrorType =
  | 'PythonNotFound'
  | 'DependencyMissing'
  | 'GPUUnavailable'
  | 'ModelNotDownloaded'
  | 'InsufficientDisk'
  | 'ModelLoadError'
  | 'InferenceError'
  | 'SidecarCrash'
  | 'SidecarTimeout'
  | 'SidecarNotRunning'
  | 'NetworkError'

/**
 * Error factory functions
 */
export function createSidecarError(
  type: SidecarErrorType,
  message: string,
  recoverable = false
): SidecarError {
  return { type, message, recoverable }
}

export class SidecarAPIError extends Error {
  constructor(
    public errorType: string,
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'SidecarAPIError'
  }
}

export class SidecarTimeoutError extends Error {
  constructor(public endpoint: string) {
    super(`Sidecar request to ${endpoint} timed out`)
    this.name = 'SidecarTimeoutError'
  }
}

export class SidecarNotRunningError extends Error {
  constructor() {
    super('Sidecar is not running')
    this.name = 'SidecarNotRunningError'
  }
}
