import React from 'react';

export interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  label?: string;
  size?: number;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders when parent components re-render but props haven't changed.
export const Knob: React.FC<KnobProps> = React.memo(({
  value,
  min = 0,
  max = 1,
  onChange,
  label,
  size = 40
}) => {
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: 'var(--void-surface)',
          border: '2px solid var(--void-border)',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '4px',
            bottom: '4px',
            left: '50%',
            width: '2px',
            backgroundColor: 'var(--void-accent)',
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: 'bottom center'
          }}
        />
      </div>
      {label && <span style={{ fontSize: '10px', color: 'var(--void-text-secondary)' }}>{label}</span>}
    </div>
  );
});

Knob.displayName = 'Knob';
