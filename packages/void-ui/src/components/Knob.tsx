import { ReactNode } from 'react'

/**
 * Knob component - rotary control with MIDI learn
 *
 * @param props Knob properties
 * @returns Knob component
 */
export interface KnobProps {
  id: string
  label: string
  value: number // 0-1
  min?: number
  max?: number
  onChange: (value: number) => void
  onMIDILearn?: () => void
}

/**
 * Knob component stub (to be fully implemented in Phase 2)
 */
export function Knob({ id, label, value, min = 0, max = 1, onChange }: KnobProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange(newValue)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <label htmlFor={id} style={{ fontSize: '12px', color: 'var(--void-text-secondary)' }}>
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step="0.01"
        value={value}
        onChange={handleChange}
        style={{ width: '60px' }}
      />
      <div style={{ fontSize: '11px', fontFamily: 'var(--void-font-mono)', color: 'var(--void-text-muted)' }}>
        {value.toFixed(2)}
      </div>
    </div>
  )
}
