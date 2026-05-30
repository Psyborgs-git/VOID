import React from 'react';
import { ClipMatrix, SessionClip, Scene } from 'void-core';

interface ClipButtonProps {
  clip: SessionClip;
  onTrigger?: (clipId: string) => void;
}

// ⚡ Bolt: Extract mapped inline element to prevent re-renders when parent collection updates
const ClipButton: React.FC<ClipButtonProps> = React.memo(({ clip, onTrigger }) => {
  return (
    <button
      onClick={() => onTrigger?.(clip.id)}
      style={{ padding: '24px', backgroundColor: clip.color || 'var(--void-accent)', color: 'white', border: 'none', borderRadius: '4px' }}
    >
      {clip.name}
    </button>
  );
});
ClipButton.displayName = 'ClipButton';

interface SceneColumnProps {
  scene: Scene;
  clips: SessionClip[];
  onSceneTrigger?: (sceneId: string) => void;
  onClipTrigger?: (clipId: string) => void;
}

// ⚡ Bolt: Extract mapped inline element to prevent re-renders when parent collection updates
const SceneColumn: React.FC<SceneColumnProps> = React.memo(({ scene, clips, onSceneTrigger, onClipTrigger }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={() => onSceneTrigger?.(scene.id)}
        style={{ padding: '8px', backgroundColor: 'var(--void-surface)', color: 'white', border: '1px solid var(--void-border)' }}
      >
        {scene.name}
      </button>
      {clips.map(clip => (
        <ClipButton key={clip.id} clip={clip} onTrigger={onClipTrigger} />
      ))}
    </div>
  );
});
SceneColumn.displayName = 'SceneColumn';

interface SessionViewProps {
  matrix: ClipMatrix;
  onClipTrigger?: (clipId: string) => void;
  onSceneTrigger?: (sceneId: string) => void;
}

// ⚡ Bolt: Stable reference for fallback array to prevent React.memo invalidation
const EMPTY_CLIPS: SessionClip[] = [];

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
          const sceneClips = clipsByScene.get(scene.id) || EMPTY_CLIPS;
          return (
            <SceneColumn
              key={scene.id}
              scene={scene}
              clips={sceneClips}
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
