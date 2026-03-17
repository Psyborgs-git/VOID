/**
 * Fader component - vertical/horizontal linear control
 *
 * @param props Fader properties
 * @returns Fader component
 */
export interface FaderProps {
  id: string
  label: string
  value: number // 0-1
  orientation?: 'vertical' | 'horizontal'
  onChange: (value: number) => void
  onMIDILearn?: () => void
}

/**
 * Fader component stub (to be fully implemented in Phase 2)
 */
export function Fader({ id, label, value, orientation = 'vertical', onChange }: FaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    onChange(newValue)
  }

  const isVertical = orientation === 'vertical'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <label htmlFor={id} style={{ fontSize: '12px', color: 'var(--void-text-secondary)' }}>
        {label}
      </label>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={handleChange}
        orient={isVertical ? 'vertical' : 'horizontal'}
        style={{
          width: isVertical ? '20px' : '120px',
          height: isVertical ? '120px' : '20px',
          writingMode: isVertical ? 'bt-lr' : undefined,
        }}
      />
      <div style={{ fontSize: '11px', fontFamily: 'var(--void-font-mono)', color: 'var(--void-text-muted)' }}>
        {value.toFixed(2)}
      </div>
    </div>
  )
}
