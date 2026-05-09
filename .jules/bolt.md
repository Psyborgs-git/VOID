## 2026-04-26 - O(N^2) Render Loop Bottleneck
**Learning:** Found a major performance bottleneck where O(Scenes × Clips) array filtering (`matrix.clips.filter`) was happening on *every* single render loop in the SessionView component. This type of nested looping directly inside render is a codebase-specific performance anti-pattern that drastically hurts performance as project sizes grow.
**Action:** Extract expensive filtering out of render loops and use `useMemo` to build O(1) hash maps / pre-computed lookups. Always pair this with `React.memo` to prevent unnecessary re-renders in highly dynamic components like SessionView.
## 2026-04-27 - React.memo on Pure UI Components
**Learning:** Pure UI components like Fader and Knob in packages/void-ui/components are highly susceptible to unnecessary re-renders when parent components update. Since these are low-level UI elements, rendering them repeatedly when props haven't changed is wasteful.
**Action:** Wrap pure presentation components in React.memo to prevent unnecessary re-renders, and make sure to explicitly set the displayName property so React DevTools continues to identify them properly.
## 2026-04-28 - Loop Optimization in SessionView
**Learning:** Found an opportunity to optimize a nested loop mapping clips to scenes in `SessionView`. The loop iterates over all scenes for every clip, but a clip can only belong to one scene. By adding a `break` statement once a match is found, we reduce the loop iterations by ~50% on average, improving performance during render.
**Action:** Always look for opportunities to early-return or break out of loops when a match is found, especially when dealing with one-to-many or one-to-one relationships.
## 2026-05-15 - Prefix Lookup for SessionView Optimization
**Learning:** Found an opportunity to further optimize the nested loop mapping clips to scenes in `SessionView`. Although the previous optimization used a `break` to early return, it still resulted in an O(Scenes × Clips) complexity in the worst case. By using a Set of unique string lengths for the scene IDs and performing prefix matching against a Map of scene IDs, the complexity is reduced to O(Clips × Unique Scene ID Lengths), which is roughly O(Clips).
**Action:** Always consider using hash map lookups combined with length-based prefix matching when searching for prefixes among a large set of possible values to avoid O(N*M) looping structures.
## 2024-05-20 - GC Stutters from TypedArray Allocations in Audio Callbacks
**Learning:** Found a major performance bottleneck where a `new Float32Array(fftSize)` was being allocated on *every* call to `getAnalyserData`. In a 60fps UI render cycle for audio visualization, this causes massive object churn resulting in severe garbage collection pressure and micro-stutters.
**Action:** Always cache and reuse `TypedArray` objects in high-frequency audio or visual polling loops instead of allocating new ones, unless the requested array size changes dynamically.
