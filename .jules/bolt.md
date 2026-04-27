## 2026-04-26 - O(N^2) Render Loop Bottleneck
**Learning:** Found a major performance bottleneck where O(Scenes × Clips) array filtering (`matrix.clips.filter`) was happening on *every* single render loop in the SessionView component. This type of nested looping directly inside render is a codebase-specific performance anti-pattern that drastically hurts performance as project sizes grow.
**Action:** Extract expensive filtering out of render loops and use `useMemo` to build O(1) hash maps / pre-computed lookups. Always pair this with `React.memo` to prevent unnecessary re-renders in highly dynamic components like SessionView.
## 2026-04-27 - React.memo on Pure UI Components
**Learning:** Pure UI components like Fader and Knob in packages/void-ui/components are highly susceptible to unnecessary re-renders when parent components update. Since these are low-level UI elements, rendering them repeatedly when props haven't changed is wasteful.
**Action:** Wrap pure presentation components in React.memo to prevent unnecessary re-renders, and make sure to explicitly set the displayName property so React DevTools continues to identify them properly.
