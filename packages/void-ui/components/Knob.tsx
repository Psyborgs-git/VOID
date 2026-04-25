import React from 'react';

export interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  label?: string;
  size?: number;
}

export const Knob: React.FC<KnobProps> = ({
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
};
