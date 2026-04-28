import React from 'react';
import { ClipMatrix } from 'void-core';

interface SessionViewProps {
  matrix: ClipMatrix;
  onClipTrigger?: (clipId: string) => void;
  onSceneTrigger?: (sceneId: string) => void;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders
export const SessionView: React.FC<SessionViewProps> = React.memo(({ matrix, onClipTrigger, onSceneTrigger }) => {
  // ⚡ Bolt: Memoize the mapping of clips to scenes to avoid filtering an array inside the render loop.
  // Reduces time complexity during render from O(Scenes × Clips) to O(1) lookup per scene.
  const clipsByScene = React.useMemo(() => {
    const map = new Map<string, typeof matrix.clips>();
    for (const scene of matrix.scenes) {
      map.set(scene.id, []);
    }
    for (const clip of matrix.clips) {
      for (const scene of matrix.scenes) {
        if (clip.id.startsWith(scene.id)) {
          map.get(scene.id)!.push(clip);
          break; // ⚡ Bolt: Early return since a clip belongs to exactly one scene, reducing loop iterations by ~50%.
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
          const sceneClips = clipsByScene.get(scene.id) || [];
          return (
            <div key={scene.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => onSceneTrigger?.(scene.id)}
                style={{ padding: '8px', backgroundColor: 'var(--void-surface)', color: 'white', border: '1px solid var(--void-border)' }}
              >
                {scene.name}
              </button>
              {sceneClips.map(clip => (
                 <button
                  key={clip.id}
                  onClick={() => onClipTrigger?.(clip.id)}
                  style={{ padding: '24px', backgroundColor: clip.color || 'var(--void-accent)', color: 'white', border: 'none', borderRadius: '4px' }}
                 >
                   {clip.name}
                 </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

SessionView.displayName = 'SessionView';
