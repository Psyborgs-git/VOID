export interface SessionClip {
  id: string;
  name: string;
  trackId: string;
  startBeat: number;
  length: number;
  loop: boolean;
  color?: string;
  type: 'audio' | 'midi';
}

export interface Scene {
  id: string;
  name: string;
  tempo?: number;
  timeSignature?: string;
}

export interface ClipMatrix {
  clips: SessionClip[];
  scenes: Scene[];
}

export interface SessionView {
  matrix: ClipMatrix;
}
