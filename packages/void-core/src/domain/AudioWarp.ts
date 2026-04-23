export type WarpMode = 'Beats' | 'Tones' | 'Texture' | 'Re-Pitch' | 'Complex' | 'Complex Pro';

export interface AudioWarpMarker {
  id: string;
  samplePosition: number;
  beatPosition: number;
}

export interface AudioWarp {
  id: string;
  clipId: string;
  mode: WarpMode;
  markers: AudioWarpMarker[];
  preserveFormants?: boolean; // For Complex Pro
  envelope?: number; // For Complex Pro
  grainSize?: number; // For Texture
  flux?: number; // For Texture
}
