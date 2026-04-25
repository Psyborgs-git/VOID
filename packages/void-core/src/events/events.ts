// events.ts
import { TrackType } from '../domain/Project';
import { MIDIDeviceInfo } from '../ports/MIDIPort';
import { PluginManifest } from '../ports/PluginPort';
import { TriggerType } from '../ports/ShowPort';
import { StemType } from '../ports/AIPort';
import { CopilotResponse } from '../ports/AIPort';

export type SidecarError = {
  type: string;
  message: string;
};

export type StemMap = Record<StemType, string>;

export type GenerativePipelineEvent =
  | { type: 'pipeline:started'; pipelineId: string }
  | { type: 'pipeline:completed'; pipelineId: string; resultId: string }
  | { type: 'pipeline:failed'; pipelineId: string; error: string }
  | { type: 'pipeline:nodeCompleted'; pipelineId: string; nodeId: string; outputId: string };

export type VoidEvent =
  | GenerativePipelineEvent
  // Transport
  | { type: 'transport:play'; beat: number }
  | { type: 'transport:stop' }
  | { type: 'transport:bpmChange'; bpm: number }

  // Audio
  | { type: 'audio:clipPlaced'; trackId: string; clipId: string; startBeat: number }
  | { type: 'audio:trackCreated'; trackId: string; trackType: TrackType }
  | { type: 'audio:levelUpdate'; trackId: string; peak: number; rms: number }

  // MIDI
  | { type: 'midi:noteOn'; channel: number; note: number; velocity: number; deviceId: string }
  | { type: 'midi:cc'; channel: number; cc: number; value: number; deviceId: string }
  | { type: 'midi:deviceConnected'; device: MIDIDeviceInfo }

  // Visual
  | { type: 'visual:shaderLoaded'; shaderId: string }
  | { type: 'visual:shaderError'; shaderId: string; error: string }
  | { type: 'visual:fullscreenEntered'; outputIndex: number }

  // AI
  | { type: 'ai:generationStarted'; jobId: string }
  | { type: 'ai:generationComplete'; jobId: string; audioPath: string }
  | { type: 'ai:separationComplete'; jobId: string; stems: StemMap }
  | { type: 'ai:copilotResponse'; response: CopilotResponse }
  | { type: 'ai:sidecarReady' }
  | { type: 'ai:sidecarError'; error: SidecarError; recoverable: boolean }

  // Show
  | { type: 'show:cueTriggered'; cueId: string; triggerType: TriggerType }
  | { type: 'show:sceneStarted'; sceneId: string }
  | { type: 'show:panic' }

  // Plugin
  | { type: 'plugin:registered'; manifest: PluginManifest }
  | { type: 'plugin:hotReloaded'; pluginId: string }
  | { type: 'plugin:error'; pluginId: string; error: string }

  // Project
  | { type: 'project:loaded'; projectId: string }
  | { type: 'project:saved'; projectId: string }
  | { type: 'project:dirty' };

export type VoidEventType = VoidEvent['type'];
