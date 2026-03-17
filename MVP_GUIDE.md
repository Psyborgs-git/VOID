# VOID - MVP Setup Guide

## Current Status: Phase 2 MVP

This is a working MVP of the VOID DAW with basic audio engine functionality.

## Features Implemented

### Phase 1 - Foundation ✅
- Hexagonal architecture with port interfaces
- Event bus for inter-module communication
- Electron shell with React renderer
- Dark industrial design system
- IPC bridge between main and renderer

### Phase 2 - Audio Engine (MVP) ✅
- **WebAudioAdapter**: Full implementation using Web Audio API + Tone.js
  - Multi-track audio engine
  - Transport control (play/stop/BPM)
  - Track routing with gain and pan
  - Real-time level metering
- **Mixer**: Channel strips with VU meters, faders, mute/solo
- **Transport**: BPM control, play/stop buttons
- **Track Management**: Create audio tracks dynamically

## Installation

```bash
# Install dependencies
pnpm install

# Start development mode
pnpm dev
```

The Electron app should open automatically.

## Usage

1. **Create a Track**: Click "+ Add Track" in the sidebar
2. **Adjust Volume**: Use the vertical fader on each channel strip
3. **Pan**: Adjust the pan slider (left/right positioning)
4. **Mute/Solo**: Click M (mute) or S (solo) buttons
5. **Transport**: Use Play/Stop buttons and adjust BPM

## Testing the Audio Engine

The audio engine is fully functional and can be tested by:

1. Creating multiple tracks
2. Adjusting volume faders (should reflect in level meters)
3. Muting/soloing tracks
4. Changing BPM (affects transport timing)

Note: Audio clip playback will be implemented in Phase 2.2-2.3 (Timeline + ClipBlock components).

## Architecture Highlights

- **Hexagonal Architecture**: `void-core` defines ports, `void-daw` implements adapters
- **No `any` types**: Fully typed TypeScript throughout
- **Event Bus**: All inter-module communication via typed events
- **Web Audio API**: Low-latency audio processing
- **Tone.js**: Professional transport and scheduling

## Next Steps

To complete a full audio playback MVP, the next features would be:

1. Timeline component (Phase 2.2)
2. Clip placement and waveform display (Phase 2.3)
3. Audio file loading (drag & drop)
4. Playback of audio clips on tracks

## Development

```bash
# Build all packages
pnpm build

# Lint code
pnpm lint

# Type check
cd packages/void-core && pnpm typecheck
```

## Troubleshooting

If the app doesn't start:
1. Ensure you're using Node.js 20+
2. Run `pnpm install` again
3. Check the console for errors

If audio doesn't work:
1. Check browser console for Web Audio API errors
2. Ensure your browser supports Web Audio API
3. Click somewhere in the app to activate audio context (browser security requirement)

## License

Private project - All rights reserved
