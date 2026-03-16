/**
 * Connection between synth nodes (patch cable)
 */
export interface Connection {
  id: string
  sourceNodeId: string
  sourcePort: number // Output port index
  targetNodeId: string
  targetPort: number // Input port index
  type: ConnectionType
}

/**
 * Connection type
 */
export type ConnectionType = 'audio' | 'cv' | 'gate' | 'midi'
