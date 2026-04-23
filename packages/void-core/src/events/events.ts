export type GenerativePipelineEvent =
  | { type: 'pipeline:started'; pipelineId: string }
  | { type: 'pipeline:completed'; pipelineId: string; resultId: string }
  | { type: 'pipeline:failed'; pipelineId: string; error: string }
  | { type: 'pipeline:nodeCompleted'; pipelineId: string; nodeId: string; outputId: string };

export type VoidEvent = GenerativePipelineEvent; // Will be expanded
