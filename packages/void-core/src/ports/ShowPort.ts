// ShowPort.ts
export type TriggerType = 'beat' | 'time' | 'manual';

export interface CueData {
  id: string;
  name: string;
  type: string; // 'AudioScene', 'VisualScene', 'MIDISend', 'OSCSend', 'AIGenerate', 'Tempo', 'Blackout', 'Custom'
  triggerType: TriggerType;
  triggerValue: number | string;
  duration?: number;
}

export interface ShowPort {
  fireCue(cueId: string): void;
  panic(): void;
}
