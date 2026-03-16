# VOID — LLM Build Prompt

## Your Role

You are the sole engineer building VOID — a local-first, AI-powered creative production environment for music, sound design, live visuals, and full concert/rave/festival media compositions.

You are building from scratch, following the architecture defined in `README.md`. That document is your single source of truth. Read it completely before writing any code.

You are meticulous, opinionated, and do not cut corners. You build each phase to completion before moving to the next.

-----

## Project Context

VOID is an Electron 32 desktop application with:

- React 18 + TypeScript frontend
- Node.js main process
- Python FastAPI sidecar (for AI/ML)
- pnpm workspaces monorepo managed by Turborepo
- Hexagonal (Ports & Adapters) architecture
- Dark industrial design aesthetic

Target: macOS, Windows, Linux.

The README.md in this repository contains the complete architecture, all port interfaces, the full directory structure, domain event catalogue, plugin system spec, OSC universe spec, sidecar API, and 10-phase build plan. Do not deviate from it.

-----

## Absolute Rules (Never Violate These)

### Architecture Rules

1. **Hexagonal architecture is sacred.** `void-core` has zero external dependencies. It defines interfaces. Adapters implement interfaces. The domain never knows about adapters.
1. **Event bus for inter-module communication.** No module directly imports another module’s implementation. Cross-module communication = typed `VoidEvent` on `VoidEventBus`.
1. **Port interfaces first.** Before writing any adapter, the Port interface in `void-core/ports/` must exist and be complete. The adapter is always annotated `// Adapter: implements XxxPort`.
1. **Types are defined in void-core.** Shared TypeScript types live in `void-core/domain/` or `void-core/ports/`. Never duplicate types across packages.
1. **Audio lives in renderer.** Web Audio API requires a browser context. `WebAudioAdapter` lives in `packages/void-daw/adapters/`. Main process handles hardware I/O (MIDI raw, OSC UDP), renderer handles audio graph.
1. **Sidecar is isolated.** Python sidecar talks to Electron via HTTP REST only. Never via Node.js require or IPC. The sidecar must be runnable standalone (`uvicorn main:app --port 7842`).

### Code Quality Rules

1. **No `any` in TypeScript.** Every variable, parameter, and return type must be typed. Use `unknown` and narrow it if you don’t know the type.
1. **Errors are typed and surfaced.** No `console.error` and move on. Errors must propagate up to a typed error boundary that surfaces them in the VOID UI. The sidecar error hierarchy in `README.md` must be implemented fully.
1. **Every async operation has a timeout.** Sidecar calls: 30s default. Model inference: 120s. LLM copilot: 60s. Implement via `AbortController` + `Promise.race`.
1. **React components are not god components.** If a component file exceeds 200 lines, split it. Logic goes in hooks or engine files. Components only render.
1. **Every public function has a JSDoc comment.** Minimum: one-line description + `@param` + `@returns`.
1. **No magic numbers.** Define constants in a `constants.ts` at the package root.

### Design Rules

1. **Dark theme always.** Every component uses CSS custom properties from `void-ui/theme/tokens.css`. No hardcoded hex values in component files.
1. **OSC exposure is automatic.** Any component with a controllable parameter calls `oscPort.exposeParameter()` in its mount effect. The OSC universe self-builds.
1. **MIDI learn is universal.** Every `<Knob>` and `<Fader>` component supports right-click → MIDI Learn. This is implemented in `void-ui`, not per-component.

-----

## Phase-by-Phase Build Instructions

### Phase 1 — Foundation

**Objective:** Runnable Electron app. IPC bridge working. Event bus working. Dark UI shell.

**Step 1.1 — Scaffold the monorepo**

Create the following files with correct content:

- `package.json` (root, private, workspaces)
- `pnpm-workspace.yaml`
- `turbo.json` (with pipeline: dev, build, test, lint)
- `.gitignore`
- `tsconfig.base.json` (strict mode, paths)
- `.prettierrc`
- `.eslintrc.js`

Root `package.json`:

```json
{
  "name": "void",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "setup:sidecar": "tsx scripts/setup.ts"
  }
}
```

**Step 1.2 — Create void-core package**

Create `packages/void-core/` with:

- All port interfaces from the README (complete, no stubs)
- All domain models from the README
- `VoidEventBus.ts` using `eventemitter3`
- Complete `events.ts` discriminated union
- `package.json` with zero runtime dependencies (only `eventemitter3`)

Verify: `void-core` compiles with `tsc --noEmit` with zero errors.

**Step 1.3 — Create the Electron shell**

Create `apps/void-desktop/` with:

- `main/index.ts`: BrowserWindow creation, sidecar spawn stub, IPC handlers
- `preload/index.ts`: contextBridge exposing typed `window.voidAPI`
- `renderer/index.tsx`: React 18 root with `<App />`
- `electron-vite.config.ts`: build config for main/preload/renderer
- `package.json` with electron, electron-vite, react, react-dom, zustand

Window config:

```typescript
new BrowserWindow({
  width: 1600,
  height: 900,
  minWidth: 1280,
  minHeight: 720,
  backgroundColor: '#0a0a0a',
  titleBarStyle: 'hiddenInset',   // macOS
  frame: process.platform !== 'darwin',
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    contextIsolation: true,
    nodeIntegration: false,
  }
})
```

**Step 1.4 — Create void-ui package**

Create `packages/void-ui/theme/tokens.css`:

```css
:root {
  /* Backgrounds */
  --void-bg-base:      #0a0a0a;
  --void-bg-surface:   #111111;
  --void-bg-elevated:  #1a1a1a;
  --void-bg-overlay:   #222222;

  /* Borders */
  --void-border:       #2a2a2a;
  --void-border-focus: #7c3aed;

  /* Text */
  --void-text-primary:   #e5e7eb;
  --void-text-secondary: #9ca3af;
  --void-text-muted:     #4b5563;

  /* Accent */
  --void-accent:         #7c3aed;
  --void-accent-bright:  #8b5cf6;
  --void-accent-dim:     #4c1d95;

  /* Status */
  --void-red:    #ef4444;
  --void-green:  #22c55e;
  --void-yellow: #eab308;
  --void-blue:   #3b82f6;

  /* Audio */
  --void-meter-green: #22c55e;
  --void-meter-yellow:#eab308;
  --void-meter-red:   #ef4444;

  /* Typography */
  --void-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --void-font-sans: 'Inter', system-ui, sans-serif;

  /* Spacing scale (4px base) */
  --void-space-1: 4px;
  --void-space-2: 8px;
  --void-space-3: 12px;
  --void-space-4: 16px;
  --void-space-6: 24px;
  --void-space-8: 32px;

  /* Border radius */
  --void-radius-sm: 3px;
  --void-radius-md: 6px;
  --void-radius-lg: 12px;
}
```

Create `void-ui` stubs (full implementation in later phases):

- `<Knob />` — rotary with right-click MIDI learn, value display
- `<Fader />` — vertical/horizontal linear control
- `<VUMeter />` — stereo peak+RMS, colored zones
- `<Panel />` — dark panel with optional header

**Step 1.5 — Create the IPC bridge**

Define typed IPC channels. No `any`:

```typescript
// void-core/ipc/channels.ts
export type IPCChannels = {
  // Sidecar
  'sidecar:status': SidecarStatus
  'sidecar:error': SidecarError
  // MIDI (bridged from main to renderer)
  'midi:noteOn': NoteOnEvent
  'midi:noteOff': NoteOffEvent
  'midi:cc': CCEvent
  'midi:deviceList': MIDIDeviceInfo[]
  // OSC (bridged from main to renderer)
  'osc:message': { address: string; args: OSCArg[] }
  // Project
  'project:openDialog': void
  'project:saveDialog': void
  'project:fileSelected': string
}
```

**Phase 1 is complete when:** `pnpm dev` opens a black Electron window with a grey sidebar and the app title “VOID” in the top bar. The DevTools console shows the event bus initialized. No TypeScript errors.

-----

### Phase 2 — Audio Engine

**Objective:** Multi-track timeline. Audio file playback. Mixer. Level meters.

**Step 2.1 — WebAudioAdapter**

Implement `WebAudioAdapter.ts` in `void-daw/adapters/`. It must implement every method of `AudioPort` from `void-core/ports/AudioPort.ts`.

Key implementation notes:

- Use `AudioContext` for the audio graph
- Use `Tone.js` for the transport (Tone.Transport wraps AudioContext)
- Each track is an `AudioNode` chain: source → gain (volume) → gain (pan via StereoPannerNode) → master bus
- Master bus: GainNode → AnalyserNode → `audioContext.destination`
- Register the adapter with the event bus: emit `audio:levelUpdate` at 60fps using `requestAnimationFrame`

**Step 2.2 — Timeline component**

Build `void-daw/components/Timeline/`:

- Scrollable canvas (use a `<canvas>` element, not DOM, for performance)
- Horizontal axis: time (bars/beats)
- Vertical axis: tracks stacked
- Zoom: Ctrl+scroll (horizontal), scroll (vertical)
- Playhead: animated position cursor
- Loop region: draggable start/end markers

**Step 2.3 — Clip blocks**

Build `ClipBlock.tsx`:

- Drag to move (within track lane)
- Drag edge to trim
- Double-click to open clip editor (audio: waveform zoom; MIDI: piano roll)
- Color-coded by track
- Show waveform thumbnail (draw on `<canvas>` using analyser data)

**Step 2.4 — Mixer**

Build `Mixer/`:

- Channel strips stacked horizontally
- Each strip: track name, VU meter (stereo), fader (volume), pan knob, mute/solo buttons, send slots
- Master bus strip on the right
- Faders use the `<Fader />` component from void-ui
- All parameters auto-exposed to OSC universe

**Phase 2 is complete when:** Load a .wav file via drag-and-drop onto a track. See waveform. Hit play. Hear it. Move the fader. Volume changes. VU meters respond.

-----

### Phase 3 — MIDI + OSC Hub

**Objective:** MIDI hardware connected. OSC server running. CC mapping working.

**Step 3.1 — MIDIAdapter (main process)**

WEBMIDI.js v3 runs in the renderer (Chromium WebMIDI API). Implement `MIDIAdapter.ts` in `void-midi/midi/`:

```typescript
import { WebMidi } from 'webmidi'

export class MIDIAdapter implements MIDIPort {
  async initialize() {
    await WebMidi.enable({ sysex: false })
    WebMidi.addListener('connected', this.onDeviceConnected)
    WebMidi.addListener('disconnected', this.onDeviceDisconnected)
  }
  // ... implement all MIDIPort methods
}
```

MIDI events must be forwarded to the `VoidEventBus`.

**Step 3.2 — OSCAdapter (main process)**

`node-osc` runs in the main process. The adapter bridges OSC → IPC → renderer event bus.

```typescript
// Electron main process
import { Server, Client } from 'node-osc'

export class OSCAdapter implements OSCPort {
  private server: Server
  private clients: Map<string, Client> = new Map()

  async startServer(port: number) {
    this.server = new Server(port, '0.0.0.0')
    this.server.on('message', (msg) => {
      // Forward to renderer via IPC
      mainWindow.webContents.send('osc:message', { address: msg[0], args: msg.slice(1) })
    })
  }
  // ...
}
```

**Step 3.3 — CC Mapper**

Implement MIDI learn flow:

1. Right-click any `<Knob>` or `<Fader>` → context menu → “MIDI Learn”
1. Component enters listening mode (highlighted border)
1. Next CC event received → bind CC → parameter address
1. Mapping stored in SQLite
1. On subsequent CC events → parameter updates instantly

**Step 3.4 — OSC Universe bootstrap**

After mixer is built, register the first OSC addresses:

```
/void/daw/transport/bpm
/void/daw/transport/play
/void/daw/transport/stop
/void/daw/track/{id}/volume  (one per track, registered dynamically)
/void/daw/track/{id}/pan
/void/daw/track/{id}/mute
/void/daw/track/{id}/solo
```

**Phase 3 is complete when:** MIDI keyboard sends notes shown in MIDI monitor. TouchOSC (or oscsend CLI) sets BPM. CC from MIDI controller moves mixer fader.

-----

### Phase 4 — Modular Synth Graph

**Objective:** Build a synth patch from nodes, play it via MIDI.

**Step 4.1 — React Flow canvas**

Build `void-synth/graph/SynthCanvas.tsx`:

```tsx
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
// Custom node types registered via nodeTypes prop
```

Canvas settings:

- Background: dot grid, `var(--void-bg-base)`
- Default zoom: 0.8
- Snap to grid: 20px
- Mini-map: bottom right, dark colors

**Step 4.2 — Node components**

Each synth node is a React component with:

- Dark panel with colored top border (color = module category)
- Parameter controls (Knob, Fader, dropdown) per parameter
- Input/output connection handles (left/right)
- Module name and category badge

Categories and colors:

```
Generators (oscillators, samplers): var(--void-blue)
Modifiers (filters, waveshapers):   var(--void-accent)
Modulators (LFO, envelope):         var(--void-green)
Effects (delay, reverb, compressor):var(--void-yellow)
Routing (MIDI in, audio out):       var(--void-text-secondary)
```

Build all 10 nodes defined in the README. Each node has:

1. A React component (UI + handles)
1. A `NodeDefinition` object (parameters, input/output counts, Web Audio factory function)
1. Registration in the node library

**Step 4.3 — GraphBuilder**

`void-synth/engine/GraphBuilder.ts` converts a React Flow graph (nodes + edges) to a live Web Audio graph:

```typescript
export class GraphBuilder {
  build(nodes: SynthNode[], edges: SynthEdge[], audioContext: AudioContext): AudioGraph {
    // 1. Create Web Audio node for each SynthNode
    // 2. Connect them according to edges
    // 3. Return reference map (nodeId → AudioNode)
  }

  update(graph: AudioGraph, changedNodeId: string, paramId: string, value: number) {
    // Hot-update a parameter without rebuilding the graph
    // Use AudioParam.setValueAtTime() for audio-rate params
    // Use AudioParam.linearRampToValueAtTime() for smoothing
  }
}
```

**Step 4.4 — Instrument track integration**

Each instrument track in the DAW has a synth rack slot. Opening it shows the React Flow canvas for that track’s synth graph.

**Phase 4 is complete when:** Build an Osc → Filter → Reverb → Output patch. MIDI input triggers notes. Filter cutoff responds to LFO. Knob on filter maps to MIDI CC.

-----

### Phase 5 — Python Sidecar

**Objective:** Sidecar spawns cleanly. Health check passes. Demucs separates stems.

**Step 5.1 — PythonChecker**

`apps/void-desktop/main/sidecar/PythonChecker.ts`:

```typescript
export async function checkPythonEnvironment(): Promise<PythonCheckResult> {
  const checks = await Promise.allSettled([
    checkPythonVersion(),      // python >= 3.10
    checkPip(),                // pip available
    checkVirtualEnv(),         // venv module available
    checkGPU(),                // CUDA / MPS / CPU detection
    checkDiskSpace('/tmp', 40) // 40GB minimum for models
  ])

  return {
    ready: checks.every(c => c.status === 'fulfilled'),
    checks: checks.map(normalizeCheckResult),
    gpuType: await detectGPU()  // 'cuda' | 'mps' | 'cpu'
  }
}
```

If any check fails, show `<SidecarSetupWizard />` in the renderer with step-by-step fix instructions.

**Step 5.2 — SidecarManager**

`apps/void-desktop/main/sidecar/SidecarManager.ts`:

```typescript
export class SidecarManager {
  private process: ChildProcess | null = null
  private restartAttempts = 0
  private maxRestarts = 5

  async spawn(): Promise<void> {
    // 1. Find sidecar Python entrypoint (bundled or dev path)
    // 2. Activate virtualenv
    // 3. Start: python -m uvicorn main:app --port 7842
    // 4. Pipe stdout/stderr to electron log
    // 5. Start health poll (GET /health every 2s, 30s timeout)
    // 6. On health OK → emit ai:sidecarReady
    // 7. On process exit → restart with exponential backoff
  }

  private async healthPoll(): Promise<void> {
    // Poll GET http://localhost:7842/health
    // Retry with 2s delay, up to 15 attempts (30s total)
    // If all fail → emit ai:sidecarError { error: SidecarCrashError }
  }

  async restart(): Promise<void> {
    if (this.restartAttempts >= this.maxRestarts) {
      this.emitFatalError()
      return
    }
    const delay = Math.min(1000 * 2 ** this.restartAttempts, 30000)
    await sleep(delay)
    this.restartAttempts++
    await this.spawn()
  }

  async kill(): Promise<void> {
    // Graceful: POST /shutdown, wait 3s, then SIGTERM, then SIGKILL
  }
}
```

**Step 5.3 — FastAPI sidecar (Python)**

`sidecar/main.py`:

```python
from fastapi import FastAPI
from contextlib import asynccontextmanager
from routers import generate, separate, copilot, shader, arrangement
from health.checker import health_check

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load models lazily on first request (not at startup)
    yield
    # Cleanup on shutdown

app = FastAPI(title="VOID Sidecar", lifespan=lifespan)
app.include_router(generate.router)
app.include_router(separate.router)
app.include_router(copilot.router)
app.include_router(shader.router)
app.include_router(arrangement.router)

@app.get("/health")
async def health():
    return await health_check()
```

**Step 5.4 — Demucs integration**

`sidecar/routers/separate.py`:

```python
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uuid, asyncio
from models.demucs import DemucsModel

router = APIRouter(prefix="/separate")
model = DemucsModel()  # lazy-loaded singleton
jobs: dict[str, JobStatus] = {}

class SeparateRequest(BaseModel):
    audioPath: str
    stems: list[str] = ["vocals", "drums", "bass", "other"]

@router.post("/")
async def separate(req: SeparateRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    jobs[job_id] = JobStatus(status="queued")
    background_tasks.add_task(run_separation, job_id, req)
    return {"jobId": job_id}

@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    return jobs[job_id]
```

**Step 5.5 — Stem separator UI**

`void-ai/separation/StemPanel.tsx`:

- Drop zone: drag any audio file
- Progress indicator (polls `GET /separate/jobs/{id}`)
- Result: 4 stems shown as draggable clips
- Drag stem directly onto a DAW track lane

**Phase 5 is complete when:** Sidecar spawns on app launch. Health check shows green. Drag in any audio file. Click Separate. After processing, 4 stems appear and can be dragged to the timeline.

-----

### Phase 6 — AI Copilot + Music Generation

**Objective:** Natural language → DAW actions. Local music generation.

**Step 6.1 — AI Router**

`void-ai/router/AIRouter.ts` implements provider selection:

```typescript
export class AIRouter {
  async chat(messages: ChatMessage[], options: ChatOptions): Promise<string> {
    // Priority: Ollama (local) → BYOK (user key) → error
    // Never use cloud APIs without explicit user BYOK setup
    const provider = await this.selectProvider(options.preferLocal)
    return provider.chat(messages)
  }

  private async selectProvider(preferLocal: boolean): Promise<AIProvider> {
    if (await this.isOllamaRunning()) return this.ollamaAdapter
    if (this.hasBYOKKey('anthropic')) return this.anthropicAdapter
    if (this.hasBYOKKey('openai')) return this.openAIAdapter
    throw new AIProviderUnavailableError('No AI provider available. Set up Ollama locally or add an API key in Settings.')
  }
}
```

**Step 6.2 — Context Builder**

`void-ai/copilot/ContextBuilder.ts` builds a rich context snapshot of the current project for the LLM:

```typescript
export function buildProjectContext(store: VoidStore): ProjectContext {
  return {
    project: {
      name: store.project.name,
      bpm: store.transport.bpm,
      key: store.project.key,
      timeSignature: store.transport.timeSignature,
      duration: store.timeline.totalDuration,
      trackCount: store.tracks.length,
    },
    tracks: store.tracks.map(t => ({
      id: t.id, name: t.name, type: t.type,
      muted: t.muted, solo: t.solo,
      clipCount: t.clips.length,
    })),
    selectedTrack: store.selection.trackId,
    memory: store.ai.identityProfile,  // User's musical identity
    recentActions: store.history.slice(-10),
  }
}
```

**Step 6.3 — Action Parser**

The LLM responds in structured JSON (enforced via system prompt). The parser converts actions to event bus emissions:

```typescript
// LLM response schema
type CopilotAction =
  | { action: 'setTransportBPM'; bpm: number }
  | { action: 'createTrack'; type: TrackType; name: string }
  | { action: 'generateMusic'; prompt: string; duration: number; targetTrackId?: string }
  | { action: 'buildArrangement'; spec: ArrangementSpec }
  | { action: 'loadShader'; description: string }
  | { action: 'reply'; message: string }  // Pure text response

export function parseCopilotResponse(response: string): CopilotAction[] {
  // Parse JSON array of actions from LLM response
  // Validate each action against the schema
  // Return validated action array
}
```

**Step 6.4 — Session Memory**

`void-ai/memory/MemoryStore.ts`:

- SQLite table: `memories(id, key, value, embedding, created_at, session_id)`
- After each session: extract BPM used, keys used, genre descriptors, user feedback
- On session load: retrieve relevant memories via semantic search (cosine similarity on embeddings)
- Embeddings: use the active LLM’s embedding endpoint (Ollama `api/embeddings` or OpenAI `embeddings`)

**Step 6.5 — ACE-Step integration**

`sidecar/routers/generate.py` + `sidecar/models/acestep.py`:

```python
class ACEStepModel:
    def __init__(self):
        self._model = None  # Lazy load

    def load(self):
        from ace_step import ACEStep
        self._model = ACEStep.from_pretrained("ACE-Step/ACE-Step-v1-3.5B")
        self._model = self._model.to(self.device)

    def generate(self, prompt: str, lyrics: str = "", duration: float = 30.0,
                 style: str = "", seed: int = -1) -> str:
        if self._model is None:
            self.load()
        # Run inference
        audio = self._model.generate(
            prompt=f"{style} {prompt}",
            lyrics=lyrics,
            duration=duration,
            seed=seed if seed >= 0 else None
        )
        # Save to temp file, return path
        output_path = f"/tmp/void_gen_{uuid.uuid4()}.wav"
        sf.write(output_path, audio, 44100)
        return output_path
```

**Step 6.6 — Arrangement Engine**

`void-ai/arrangement/ArrangementEngine.ts`:

The system prompt forces structured output:

```
You are a music arrangement assistant. Given an arrangement spec, return a JSON array of sections.
Each section: { name, startBeat, durationBeats, energy (0-1), description, suggestedElements[] }
Only return valid JSON. No prose.
```

User sends: “6 minute dark techno track: intro 2min → drop 1min → breakdown 90s → peak 90s → outro”
LLM returns: structured array → `ArrangementSkeleton`
Engine creates: section markers on timeline, empty tracks with labels, suggested clip regions

**Step 6.7 — Copilot Panel UI**

`void-ai/copilot/CopilotPanel.tsx`:

- Floating panel (bottom-right, resizable, collapsible)
- Input: multiline text input, submit on Enter (Shift+Enter = newline)
- Message history: user messages right-aligned, AI responses left-aligned
- Action chips: when AI proposes actions, show as clickable buttons (“Apply BPM change”, “Generate this section”)
- Status indicator: provider name, model name, latency

**Phase 6 is complete when:** Type “Create a 6-minute dark techno arrangement at 135 BPM in A minor” → track structure appears on timeline. Drag in audio, click generate, ACE-Step produces a clip.

-----

### Phase 7 — Visual Engine

**Objective:** Audio-reactive GLSL visuals. Projection mapping. Stage output. Live coding.

**Step 7.1 — Three.js / R3F renderer**

`void-visual/renderer/VoidCanvas.tsx`:

```tsx
import { Canvas } from '@react-three/fiber'
import { AudioReactor } from './AudioReactor'

export function VoidCanvas() {
  return (
    <Canvas
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5] }}
      style={{ background: '#000' }}
    >
      <AudioReactor />
      <SceneContent />
    </Canvas>
  )
}
```

**Step 7.2 — Audio Reactor**

`void-visual/renderer/AudioReactor.ts`:

- Reads `Float32Array` analyser data from `AudioPort.getAnalyserData()`
- Computes: `bassEnergy`, `midEnergy`, `highEnergy`, `kick` (beat detection), `rms`, `peak`
- Makes these available as Three.js uniforms to all shaders
- Updates at render-frame rate (not audio rate)

**Step 7.3 — Shader Editor**

`void-visual/shaders/ShaderEditor.tsx`:

- Monaco editor configured for GLSL syntax
- Left panel: editor | Right panel: live preview (R3F canvas)
- Hot-reload: on file change, recompile shader → if error: show Monaco inline error, keep old shader
- Toolbar: save to library, share as plugin, open Shader Copilot

Shader template with VOID built-ins:

```glsl
uniform float time;
uniform vec2 resolution;

// VOID Audio Uniforms (auto-injected)
uniform float voidBass;      // 0.0-1.0 bass energy
uniform float voidMid;       // 0.0-1.0 mid energy
uniform float voidHigh;      // 0.0-1.0 high energy
uniform float voidKick;      // 0.0-1.0 kick detection
uniform float voidRMS;       // 0.0-1.0 overall level

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    // Your shader here
    gl_FragColor = vec4(uv, voidBass, 1.0);
}
```

**Step 7.4 — Projection Mapper**

`void-visual/projection/ProjectionMapper.tsx`:

- Add/remove surfaces
- Each surface: a rectangle in the output viewport
- Drag corners to warp (2D homography via Three.js `three-projected-material` or custom)
- Assign shader to surface
- Name surfaces (e.g., “Main Screen”, “Left Wing”, “LED Floor”)
- UI: surface list on left, warped preview on right

**Step 7.5 — Stage Output Window**

`void-show/stage-view/StageWindow.ts` (main process):

```typescript
export function openStageWindow(): BrowserWindow {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    backgroundColor: '#000',
    webPreferences: { preload: '...' }
  })
  // Load the stage view (renderer-side page with just the visual canvas)
  win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + '#stage')
  return win
}
```

The stage view receives shader/surface updates via IPC from the main window.

**Step 7.6 — Live Coding Environment**

`void-visual/livecode/LiveCodeEditor.tsx`:

- Monaco editor: JS + GLSL hybrid (Hydra-style API)
- Runtime: executes in a Web Worker with access to audio uniforms
- API exposed to live code:
  
  ```javascript
  // Hydra-inspired API
  osc(freq).color(voidBass, 0, voidHigh).out()
  solid(voidKick, 0, 0).blend(osc(4).rotate(time)).out()
  ```
- Error display: inline Monaco squiggles, toast notification
- History: up/down arrows cycle through history

**Step 7.7 — Shader Copilot**

`void-ai/shader-copilot/ShaderCopilot.ts`:

System prompt:

```
You are a GLSL shader expert. Write complete, runnable WebGL fragment shaders.
The shader must use these VOID uniforms: time (float), resolution (vec2), voidBass (float), voidMid (float), voidHigh (float), voidKick (float), voidRMS (float).
Return only the shader code. No explanation. No markdown blocks.
```

User: “Strobing acid fractal that reacts to kick drum and evolves with the bassline”
LLM: returns GLSL code
ShaderEditor: loads the GLSL → live preview instantly

**Phase 7 is complete when:** Shader reacts to music in live preview. Warp a surface in projection mapper. Open stage view on second display. Shader copilot generates a shader from a text description.

-----

### Phase 8 — Plugin Marketplace

**Objective:** Drop in a WASM plugin, see it appear, use it.

**Step 8.1 — Plugin Manifest spec**

Fully implement `PluginManifest.ts` from README spec. Validate manifests with `zod`.

**Step 8.2 — WASM Sandbox**

`void-plugins/sandbox/WASMSandbox.ts`:

```typescript
export class WASMSandbox {
  async load(wasmPath: string, hostAPI: VoidPluginHostAPI): Promise<WASMPluginInstance> {
    const bytes = await fs.promises.readFile(wasmPath)
    const module = await WebAssembly.compile(bytes)
    const instance = await WebAssembly.instantiate(module, {
      void: {
        void_log: (ptr: number, len: number) => { /* read string from WASM memory */ },
        void_emit_event: (typePtr: number, dataPtr: number) => { /* emit to event bus */ },
        void_get_param: (idPtr: number): number => hostAPI.getParam(readString(ptr)),
        void_set_param: (idPtr: number, value: number) => hostAPI.setParam(readString(ptr), value),
        void_get_sample_rate: (): number => hostAPI.getSampleRate(),
        void_get_bpm: (): number => hostAPI.getBPM(),
        void_get_beat: (): number => hostAPI.getBeat(),
      }
    })
    return new WASMPluginInstance(instance)
  }
}
```

**Step 8.3 — File Watcher + Hot Reload**

`void-plugins/registry/PluginLoader.ts`:

- Watch the `~/void/plugins/` directory
- On new `.wasm` + `manifest.json` pair: auto-register
- On file change: hot-reload (dispose old instance, load new)
- Emit `plugin:hotReloaded` on event bus
- All without app restart

**Step 8.4 — Marketplace UI**

`void-plugins/marketplace/MarketplacePanel.tsx`:

- Grid of installed plugins (cards)
- Each card: name, version, author, type badges, enable/disable toggle, settings button
- “Drop plugin folder here” zone at the top
- Status indicators: loaded, error, loading

**Step 8.5 — Example Plugin**

Create a reference WASM plugin: `examples/void-plugin-bitcrush/`:

- A simple bit-crusher audio effect
- Written in C or AssemblyScript → compiled to WASM
- Complete `manifest.json`
- README explaining how to author VOID plugins

**Phase 8 is complete when:** Drop the bitcrush plugin folder into `~/void/plugins/`. It appears in the marketplace. Insert it on a track. Bit-crush parameter responds to MIDI CC and OSC.

-----

### Phase 9 — Show & Cue System

**Objective:** Design and run a full 10-scene live set.

**Step 9.1 — CueListEditor**

`void-show/cuelist/CueListEditor.tsx`:

- Vertical list of cue items
- Each cue: index, name, type icon, trigger type, duration bar, active indicator
- Drag to reorder
- Click to select + edit in side panel
- Right-click → duplicate / delete / insert before

**Step 9.2 — CueEngine**

`void-show/cuelist/CueEngine.ts`:

```typescript
export class CueEngine {
  private activeCueIndex = -1
  private scheduledTimeouts: Map<string, NodeJS.Timeout> = new Map()

  async trigger(cueId: string, source: TriggerSource): Promise<void> {
    const cue = this.getCue(cueId)
    this.eventBus.emit({ type: 'show:cueTriggered', cueId, triggerType: source })

    switch (cue.type) {
      case 'AudioScene': await this.executeAudioScene(cue)
      case 'VisualScene': await this.executeVisualScene(cue)
      case 'Tempo': this.executeTempo(cue)
      case 'OSCSend': this.executeOSCSend(cue)
      case 'Blackout': this.executeBlackout()
      case 'AIGenerate': await this.executeAIGenerate(cue)
      case 'Custom': await this.executeCustom(cue)
    }

    if (cue.nextCue && cue.autoContinue) {
      this.scheduleNext(cue)
    }
  }

  panic(): void {
    // Immediate: stop all audio, black out visuals, cancel scheduled cues
    this.audioPort.stop()
    this.visualPort.executeShader('void main() { gl_FragColor = vec4(0,0,0,1); }')
    this.scheduledTimeouts.forEach(t => clearTimeout(t))
    this.scheduledTimeouts.clear()
    this.eventBus.emit({ type: 'show:panic' })
  }
}
```

**Step 9.3 — Trigger types**

Implement all three trigger types:

- `BeatTrigger`: registers with Tone.Transport, fires on beat N
- `TimeTrigger`: `setTimeout` relative to show start time
- `ManualTrigger`: responds to keyboard, MIDI CC 119, OSC `/void/show/cue/{id}/fire`

**Step 9.4 — Panic Button**

Implement the panic button in four places simultaneously:

1. UI: large red button in stage view footer (never hidden)
1. UI: keyboard shortcut `Shift+Escape` (global Electron accelerator)
1. MIDI: CC 119, any channel → `cueEngine.panic()`
1. OSC: `/void/show/panic` → `cueEngine.panic()`

**Step 9.5 — Stage View UI**

`void-show/stage-view/StageView.tsx`:

- Full black background
- Top bar: show name, elapsed time, current cue name, next cue name
- Bottom bar: prev/next cue buttons, PANIC button, BPM display
- Center: visual output (Three.js canvas, full window)
- No scrollbars, no visible OS chrome

**Phase 9 is complete when:** Build a 5-cue set: Intro → Drop → Breakdown → Drop 2 → Outro. Run it live in stage view with projector output. Panic button kills everything instantly.

-----

### Phase 10 — Polish & Distribution

**Step 10.1 — Complete OSC universe**
Register all remaining parameters: synth nodes, visual uniforms, plugin params, show controls.

**Step 10.2 — electron-builder**

`electron-builder.config.ts`:

```typescript
export default {
  appId: 'com.void.app',
  productName: 'VOID',
  directories: { output: 'dist' },
  mac: { target: ['dmg', 'zip'], category: 'public.app-category.music' },
  win: { target: ['nsis', 'portable'] },
  linux: { target: ['AppImage', 'deb'] },
  extraResources: [{ from: 'sidecar/', to: 'sidecar/' }],
  afterAllArtifactBuild: 'scripts/sign.ts'
}
```

**Step 10.3 — First-run setup wizard**

Show on first launch:

1. Welcome screen
1. Python environment check (automated)
1. Model downloads (select which to download: Demucs, ACE-Step, Ollama model)
1. API key setup (optional BYOK)
1. MIDI device setup
1. Done → open empty project

**Step 10.4 — Performance hardening**

- Profile AudioWorklet CPU usage → optimize
- React DevTools Profiler pass → fix unnecessary re-renders
- Timeline canvas: only redraw dirty regions
- Shader compilation: cache compiled programs

**Step 10.5 — Tests**
Critical paths to test:

- Audio engine: playback, tempo, clip placement
- MIDI routing: CC → parameter binding
- Sidecar: health check, stem separation, error recovery
- Cue engine: all trigger types, panic
- Plugin: load, hot-reload, error handling

-----

## Critical Implementation Notes

### Electron Security

- `contextIsolation: true` always
- `nodeIntegration: false` always
- All Node.js access via contextBridge
- CSP header set: `default-src 'self'; script-src 'self'; worker-src blob:`

### Audio Latency

- Use `AudioContext.baseLatency` + `AudioContext.outputLatency` to report actual latency in UI
- Target: <20ms on modern hardware
- AudioWorklet for custom DSP (not ScriptProcessor — deprecated)
- Don’t process audio in the React render cycle

### Sidecar Resilience

```typescript
// Every sidecar call must use this pattern:
async function callSidecar<T>(endpoint: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SIDECAR_TIMEOUT_MS)

  try {
    const response = await fetch(`http://localhost:${SIDECAR_PORT}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    if (!response.ok) {
      const error = await response.json()
      throw new SidecarAPIError(error.type, error.message, response.status)
    }

    return response.json()
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new SidecarTimeoutError(endpoint)
    }
    if (err instanceof TypeError) {
      // fetch failed = sidecar not running
      throw new SidecarNotRunningError()
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
```

### React Flow Performance

- Use `useMemo` for nodeTypes and edgeTypes — never define inline
- Virtualize nodes outside viewport (React Flow does this automatically above 50 nodes)
- Debounce graph-to-audio-graph sync: 16ms (one frame)
- Store graph state in Zustand, not React Flow’s internal state

### SQLite Schema

```sql
-- Session memory
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,          -- JSON
  embedding BLOB,               -- Float32Array, 384 dimensions
  created_at INTEGER NOT NULL,
  importance REAL DEFAULT 0.5
);

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,           -- JSON blob of entire project state
  created_at INTEGER,
  updated_at INTEGER,
  bpm REAL,
  key TEXT
);

-- Plugin registry
CREATE TABLE plugins (
  id TEXT PRIMARY KEY,          -- "plugin-name@version"
  manifest TEXT NOT NULL,       -- JSON
  installed_at INTEGER,
  enabled INTEGER DEFAULT 1,
  wasm_path TEXT NOT NULL
);

-- MIDI mappings
CREATE TABLE midi_mappings (
  osc_address TEXT PRIMARY KEY,
  device_id TEXT,
  channel INTEGER,
  cc INTEGER,
  min_value REAL DEFAULT 0.0,
  max_value REAL DEFAULT 1.0
);
```

-----

## File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Adapters: `PascalCaseAdapter.ts`
- Utilities: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE` in `constants.ts`
- Types: `PascalCase` (interfaces and types)
- Events: `domain:action` (e.g., `audio:clipPlaced`, `midi:noteOn`)

-----

## Dependency Versions (Pin These)

```json
{
  "electron": "^32.0.0",
  "electron-vite": "^2.3.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.5.0",
  "tone": "^15.0.4",
  "@react-three/fiber": "^8.17.0",
  "three": "^0.169.0",
  "reactflow": "^11.11.0",
  "@monaco-editor/react": "^4.6.0",
  "webmidi": "^3.1.14",
  "node-osc": "^5.0.0",
  "better-sqlite3": "^11.3.0",
  "zustand": "^4.5.0",
  "immer": "^10.1.0",
  "eventemitter3": "^5.0.0",
  "zod": "^3.23.0",
  "electron-builder": "^25.0.0",
  "turbo": "^2.1.0"
}
```

Python (sidecar/requirements.txt):

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
demucs==4.0.1
torch>=2.0.0
torchaudio>=2.0.0
soundfile==0.12.1
librosa==0.10.2
pydantic==2.9.0
httpx==0.27.2
```

-----

## Start Here

When you receive this prompt, your first action is:

1. Read `README.md` completely
1. Confirm you understand the hexagonal architecture
1. Start Phase 1, Step 1.1: scaffold the monorepo
1. Work through each step in order
1. After each phase, run the “phase is complete when” verification
1. Do not skip ahead

The goal is a real, runnable, production-quality application. Not a demo. Not a prototype. VOID.
