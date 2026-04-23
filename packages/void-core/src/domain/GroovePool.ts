export interface GrooveTimingEvent {
  beatPosition: number;
  velocity: number;
  duration?: number;
}

export interface Groove {
  id: string;
  name: string;
  baseTiming: '1/4' | '1/8' | '1/16' | '1/32';
  events: GrooveTimingEvent[];
}

export interface GroovePool {
  grooves: Groove[];
  globalAmount: number;
}

export interface GrooveApplication {
  grooveId: string;
  timing: number; // 0 to 1
  velocity: number; // 0 to 1
  random: number; // 0 to 1
}
