# VOID Migration & Feature Gap Analysis

This document outlines the strategic plan to transition the original VOID concept into an absolute "Ableton Live" parity environment with extended "Generative Plugins" and dynamic pipeline features.

## 1. Feature Gap Analysis: VOID vs. Ableton Live Parity

The previous version of VOID focused on a linear timeline DAW with an AI copilot, node-graph synth, and visual engine. To achieve absolute Ableton Live parity, the following gaps need to be addressed:

| Feature Area | Previous VOID Architecture | Ableton Live Parity Requirement |
| :--- | :--- | :--- |
| **Arrangement vs. Session** | Linear Timeline only. | Dual-view system: **Session View** (Clip Matrix for non-linear, loop-based performance) and **Arrangement View** (linear timeline). |
| **Audio Warping** | Basic time-stretch/pitch-shift via Web Audio. | **Advanced Audio Warping** algorithms (Beats, Tones, Texture, Re-Pitch, Complex, Complex Pro equivalents) allowing seamless tempo manipulation without artifacts. |
| **Groove Extraction & Quantization** | Basic MIDI quantization. | **Groove Pool**: Ability to extract timing and velocity grooves from audio/MIDI clips and apply them globally or per-clip. |
| **Stock Devices** | Basic synth node-graph. | Comprehensive suite of **Stock Devices** (EQ Eight, Glue Compressor, Auto Filter, Wavetable, Operator equivalents) built directly into the mixer strip. |
| **Max for Live (M4L) Equivalent** | Standalone WASM plugin system. | Deeply integrated **WASM Plugin System** that acts as the M4L equivalent, allowing users to build custom instruments, MIDI effects, and audio effects that interact with the DAW's core API (Live Object Model equivalent). |
| **Generative & Dynamic Pipelines** | Single-shot AI generation via sidecar. | **Generative Plugins & Dynamic Pipelines**: The ability to chain WASM plugins and Python sidecar AI models in a continuous node graph (e.g., LLM MIDI generator -> WASM Synth -> AI Stem Separator) for endless generative music. |

## 2. Strategic Execution Plan

This execution plan updates the original 10-Phase build plan to integrate the new requirements natively into the architecture.

### Step 1: Foundation & Architecture Updates (Phase 1/2)
- **State Management Refactor**: Update the `void-core` domain models to support `SessionClip`, `Scene`, and `ClipMatrix` alongside the traditional `Timeline`.
- **AudioWarp Engine**: Implement a robust AudioWorklet-based warping engine (`packages/void-daw/engine/AudioWarp.ts`) to handle advanced time-stretching.
- **Groove Pool Store**: Create a centralized store for groove extraction and application (`packages/void-daw/engine/GroovePool.ts`).

### Step 2: UI Parity (Phase 2)
- **Session View Component**: Build the Ableton-style Clip Matrix UI (`packages/void-daw/components/SessionView`).
- **Device Rack**: Implement a horizontal device chain UI at the bottom of the screen (replacing the vertical channel strip inserts) to host Stock Devices and WASM plugins.
- **Stock Devices**: Implement the initial set of native WebAudio-based stock devices (EQ, Compressor, Filter).

### Step 3: Max for Live Equivalent via WASM (Phase 8)
- **Plugin API Expansion**: Expand `VoidPluginHostAPI` to allow WASM modules to control the DAW (e.g., launching clips, changing tempo, automating parameters), mimicking the Live Object Model.
- **Device Integration**: Ensure WASM plugins can be dropped seamlessly into the new horizontal Device Rack.

### Step 4: Generative Pipelines (Phase 8 Extension)
- **Pipeline Node Graph**: Create a dedicated UI/Engine (`void-plugins/pipelines`) where users can wire together WASM MIDI/Audio generators and Python Sidecar tasks.
- **Continuous Execution**: Update the sidecar to support streaming or continuous generation (e.g., generating the next 4 bars of MIDI right before they are needed).

## 3. Immediate Next Steps (The Migration Start)
1. Initialize the monorepo using Turborepo and pnpm as defined in Phase 1 of the `README.md`.
2. Scaffold the `void-core` and `void-daw` packages.
3. Define the TypeScript interfaces for `SessionView`, `AudioWarp`, and `GroovePool` within `void-core/ports` and `void-core/domain`.
4. Update the IPC channels to support the new generative pipeline events.
