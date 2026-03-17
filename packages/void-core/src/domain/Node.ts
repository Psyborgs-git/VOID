/**
 * Synth node in the modular graph
 */
export interface SynthNode {
  id: string
  type: NodeType
  x: number // Canvas position
  y: number
  parameters: Record<string, NodeParameter>
  inputs: NodePort[]
  outputs: NodePort[]
}

/**
 * Node types available in the synth
 */
export type NodeType =
  | 'oscillator'
  | 'filter'
  | 'envelope'
  | 'lfo'
  | 'delay'
  | 'reverb'
  | 'compressor'
  | 'sampler'
  | 'sequencer'
  | 'midiIn'
  | 'audioOut'

/**
 * Node parameter definition
 */
export interface NodeParameter {
  id: string
  name: string
  value: number
  min: number
  max: number
  default: number
  unit?: string
}

/**
 * Node input/output port
 */
export interface NodePort {
  id: string
  type: 'audio' | 'cv' | 'midi'
  name: string
}

/**
 * Connection between two nodes
 */
export interface Connection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}
