import React from 'react';
import { ClipMatrix } from 'void-core';

interface SessionViewProps {
  matrix: ClipMatrix;
  onClipTrigger?: (clipId: string) => void;
  onSceneTrigger?: (sceneId: string) => void;
}

export const SessionView: React.FC<SessionViewProps> = ({ matrix, onClipTrigger, onSceneTrigger }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px' }}>
      <h2>Session View</h2>
      <div style={{ display: 'flex', gap: '16px' }}>
        {matrix.scenes.map(scene => (
          <div key={scene.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => onSceneTrigger?.(scene.id)}
              style={{ padding: '8px', backgroundColor: 'var(--void-surface)', color: 'white', border: '1px solid var(--void-border)' }}
            >
              {scene.name}
            </button>
            {matrix.clips.filter(c => c.id.startsWith(scene.id)).map(clip => (
               <button
                key={clip.id}
                onClick={() => onClipTrigger?.(clip.id)}
                style={{ padding: '24px', backgroundColor: clip.color || 'var(--void-accent)', color: 'white', border: 'none', borderRadius: '4px' }}
               >
                 {clip.name}
               </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
