import React from 'react';

export interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  height?: number;
}

export const Fader: React.FC<FaderProps> = ({
  value,
  min = 0,
  max = 1,
  onChange,
  height = 120
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        height,
        width: '24px',
        backgroundColor: 'var(--void-bg)',
        border: '1px solid var(--void-border)',
        borderRadius: 'var(--void-radius)',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: `${percentage}%`,
          width: '100%',
          height: '12px',
          backgroundColor: 'var(--void-surface)',
          borderTop: '2px solid var(--void-accent)',
          borderBottom: '2px solid var(--void-border)',
          transform: 'translateY(50%)',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};
