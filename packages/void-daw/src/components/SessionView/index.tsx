import React from 'react';
import { ClipMatrix, SessionClip, Scene } from 'void-core';

interface SessionViewProps {
  matrix: ClipMatrix;
  onClipTrigger?: (clipId: string) => void;
  onSceneTrigger?: (sceneId: string) => void;
}

const EMPTY_CLIP_ARRAY: SessionClip[] = [];

// ⚡ Bolt: Memoized ClipButton to prevent unnecessary re-renders in the matrix
const ClipButton = React.memo(({ clip, onClipTrigger }: { clip: SessionClip, onClipTrigger?: (clipId: string) => void }) => (
  <button
    key={clip.id}
    onClick={() => onClipTrigger?.(clip.id)}
    style={{ padding: '24px', backgroundColor: clip.color || 'var(--void-accent)', color: 'white', border: 'none', borderRadius: '4px' }}
  >
    {clip.name}
  </button>
));
ClipButton.displayName = 'ClipButton';

// ⚡ Bolt: Memoized SceneColumn to prevent entire column re-renders when other scenes update
const SceneColumn = React.memo(({ scene, sceneClips, onSceneTrigger, onClipTrigger }: { scene: Scene, sceneClips: SessionClip[], onSceneTrigger?: (sceneId: string) => void, onClipTrigger?: (clipId: string) => void }) => (
  <div key={scene.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <button
      onClick={() => onSceneTrigger?.(scene.id)}
      style={{ padding: '8px', backgroundColor: 'var(--void-surface)', color: 'white', border: '1px solid var(--void-border)' }}
    >
      {scene.name}
    </button>
    {sceneClips.map(clip => (
      <ClipButton key={clip.id} clip={clip} onClipTrigger={onClipTrigger} />
    ))}
  </div>
));
SceneColumn.displayName = 'SceneColumn';

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders
export const SessionView: React.FC<SessionViewProps> = React.memo(({ matrix, onClipTrigger, onSceneTrigger }) => {
  // ⚡ Bolt: Memoize the mapping of clips to scenes to avoid filtering an array inside the render loop.
  // Reduces time complexity from O(Scenes × Clips) to effectively O(Clips) by using a Map of scene IDs
  // combined with a sorted Set of unique scene ID lengths to perform prefix lookups.
  const clipsByScene = React.useMemo(() => {
    const map = new Map<string, typeof matrix.clips>();
    const sceneIdLengths = new Set<number>();

    for (const scene of matrix.scenes) {
      map.set(scene.id, []);
      sceneIdLengths.add(scene.id.length);
    }

    // Sort descending to match the most specific (longest) scene ID first
    const sortedLengths = Array.from(sceneIdLengths).sort((a, b) => b - a);

    for (const clip of matrix.clips) {
      for (const len of sortedLengths) {
        if (clip.id.length >= len) {
          const prefix = clip.id.substring(0, len);
          if (map.has(prefix)) {
            map.get(prefix)!.push(clip);
            break;
          }
        }
      }
    }
    return map;
  }, [matrix.clips, matrix.scenes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
      <h2>Session View</h2>
      <div style={{ display: 'flex', gap: '16px' }}>
        {matrix.scenes.map(scene => {
          const sceneClips = clipsByScene.get(scene.id) || EMPTY_CLIP_ARRAY;
          return (
            <SceneColumn
              key={scene.id}
              scene={scene}
              sceneClips={sceneClips}
              onSceneTrigger={onSceneTrigger}
              onClipTrigger={onClipTrigger}
            />
          );
        })}
      </div>
    </div>
  );
});

SessionView.displayName = 'SessionView';
