import { TrackType } from '../domain/Track'
import { MIDIDeviceInfo, NoteOnEvent, NoteOffEvent, CCEvent } from './eventTypes'
import { SidecarError } from './errorTypes'
import { CopilotResponse } from '../ports/AIPort'
import { PluginManifest } from '../domain/PluginManifest'
import { TriggerType } from '../domain/Cue'

/**
 * All VOID events - discriminated union for type safety
 */
export type VoidEvent =
  // Transport events
  | { type: 'transport:play'; beat: number }
  | { type: 'transport:stop' }
  | { type: 'transport:pause'; beat: number }
  | { type: 'transport:bpmChange'; bpm: number }
  | { type: 'transport:seek'; beat: number }

  // Audio events
  | { type: 'audio:clipPlaced'; trackId: string; clipId: string; startBeat: number }
  | { type: 'audio:clipRemoved'; trackId: string; clipId: string }
  | { type: 'audio:trackCreated'; trackId: string; trackType: TrackType }
  | { type: 'audio:trackDeleted'; trackId: string }
  | { type: 'audio:levelUpdate'; trackId: string; peak: number; rms: number }
  | { type: 'audio:trackVolumeChange'; trackId: string; volume: number }
  | { type: 'audio:trackPanChange'; trackId: string; pan: number }

  // MIDI events
  | { type: 'midi:noteOn'; event: NoteOnEvent }
  | { type: 'midi:noteOff'; event: NoteOffEvent }
  | { type: 'midi:cc'; event: CCEvent }
  | { type: 'midi:deviceConnected'; device: MIDIDeviceInfo }
  | { type: 'midi:deviceDisconnected'; deviceId: string }
  | { type: 'midi:mappingCreated'; parameterAddress: string; cc: number; channel: number }

  // OSC events
  | { type: 'osc:message'; address: string; args: unknown[] }
  | { type: 'osc:parameterExposed'; address: string }
  | { type: 'osc:serverStarted'; port: number }
  | { type: 'osc:serverStopped' }

  // Visual events
  | { type: 'visual:shaderLoaded'; shaderId: string }
  | { type: 'visual:shaderError'; shaderId: string; error: string }
  | { type: 'visual:shaderUpdated'; shaderId: string }
  | { type: 'visual:surfaceCreated'; surfaceId: string }
  | { type: 'visual:fullscreenEntered'; outputIndex: number }
  | { type: 'visual:fullscreenExited' }

  // AI events
  | { type: 'ai:generationStarted'; jobId: string }
  | { type: 'ai:generationProgress'; jobId: string; progress: number }
  | { type: 'ai:generationComplete'; jobId: string; audioPath: string }
  | { type: 'ai:generationError'; jobId: string; error: string }
  | { type: 'ai:separationStarted'; jobId: string }
  | { type: 'ai:separationComplete'; jobId: string; stems: Record<string, string> }
  | { type: 'ai:separationError'; jobId: string; error: string }
  | { type: 'ai:copilotResponse'; response: CopilotResponse }
  | { type: 'ai:sidecarReady' }
  | { type: 'ai:sidecarError'; error: SidecarError; recoverable: boolean }

  // Show/Cue events
  | { type: 'show:cueTriggered'; cueId: string; triggerType: TriggerType }
  | { type: 'show:sceneStarted'; sceneId: string }
  | { type: 'show:sceneEnded'; sceneId: string }
  | { type: 'show:panic' }

  // Plugin events
  | { type: 'plugin:registered'; manifest: PluginManifest }
  | { type: 'plugin:loaded'; pluginId: string; instanceId: string }
  | { type: 'plugin:hotReloaded'; pluginId: string }
  | { type: 'plugin:error'; pluginId: string; error: string }
  | { type: 'plugin:enabled'; instanceId: string }
  | { type: 'plugin:disabled'; instanceId: string }

  // Project events
  | { type: 'project:loaded'; projectId: string }
  | { type: 'project:saved'; projectId: string }
  | { type: 'project:dirty' }
  | { type: 'project:new' }
