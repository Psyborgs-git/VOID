## 2026-04-26 - O(N^2) Render Loop Bottleneck
**Learning:** Found a major performance bottleneck where O(Scenes × Clips) array filtering (`matrix.clips.filter`) was happening on *every* single render loop in the SessionView component. This type of nested looping directly inside render is a codebase-specific performance anti-pattern that drastically hurts performance as project sizes grow.
**Action:** Extract expensive filtering out of render loops and use `useMemo` to build O(1) hash maps / pre-computed lookups. Always pair this with `React.memo` to prevent unnecessary re-renders in highly dynamic components like SessionView.
## 2026-04-27 - React.memo on Pure UI Components
**Learning:** Pure UI components like Fader and Knob in packages/void-ui/components are highly susceptible to unnecessary re-renders when parent components update. Since these are low-level UI elements, rendering them repeatedly when props haven't changed is wasteful.
**Action:** Wrap pure presentation components in React.memo to prevent unnecessary re-renders, and make sure to explicitly set the displayName property so React DevTools continues to identify them properly.
## 2026-04-28 - Loop Optimization in SessionView
**Learning:** Found an opportunity to optimize a nested loop mapping clips to scenes in `SessionView`. The loop iterates over all scenes for every clip, but a clip can only belong to one scene. By adding a `break` statement once a match is found, we reduce the loop iterations by ~50% on average, improving performance during render.
**Action:** Always look for opportunities to early-return or break out of loops when a match is found, especially when dealing with one-to-many or one-to-one relationships.
## 2026-04-29 - TypedArray Garbage Collection Pressure
**Learning:** Found a severe performance anti-pattern in the WebAudioAdapter where a `new Float32Array` was allocated on every `getAnalyserData` call. In high-frequency polling loops like 60fps WebAudio render cycles, this constant allocation of TypedArrays causes intense garbage collection (GC) pressure, leading to UI micro-stutters and audio dropouts.
**Action:** Always cache and reuse TypedArray objects (like `Float32Array` or `Uint8Array`) in high-frequency rendering or audio loops. Use a `Map` to store them by an identifier and only re-allocate if the required size changes.
