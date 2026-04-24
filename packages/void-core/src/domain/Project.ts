export interface ProjectContext {
  projectId: string;
  projectName: string;
  currentBpm: number;
  timeSignature: { num: number; denom: number };
}

export type TrackType = 'audio' | 'midi' | 'instrument' | 'bus';

export interface TrackData {
  id: string;
  name: string;
  type: TrackType;
  volume: number; // 0.0 - 1.0
  pan: number; // -1.0 - 1.0
  muted: boolean;
  soloed: boolean;
}

export interface ClipData {
  id: string;
  trackId: string;
  startBeat: number;
  length: number;
  type: 'audio' | 'midi' | 'automation';
}

export interface NodeData {
  id: string;
  type: string;
  params: Record<string, number>;
}

export interface ConnectionData {
  srcId: string;
  dstId: string;
  srcOutput?: number;
  dstInput?: number;
}
