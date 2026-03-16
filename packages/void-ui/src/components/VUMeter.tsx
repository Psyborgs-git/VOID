/**
 * VUMeter component - stereo peak + RMS meter
 *
 * @param props VU Meter properties
 * @returns VU Meter component
 */
export interface VUMeterProps {
  id: string
  peak: number // 0-1
  rms: number // 0-1
  orientation?: 'vertical' | 'horizontal'
}

/**
 * VUMeter component stub (to be fully implemented in Phase 2)
 */
export function VUMeter({ id, peak, rms, orientation = 'vertical' }: VUMeterProps) {
  const isVertical = orientation === 'vertical'

  // Determine color based on peak level
  const getColor = (level: number) => {
    if (level > 0.9) return 'var(--void-meter-red)'
    if (level > 0.7) return 'var(--void-meter-yellow)'
    return 'var(--void-meter-green)'
  }

  return (
    <div
      id={id}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column-reverse' : 'row',
        width: isVertical ? '20px' : '120px',
        height: isVertical ? '120px' : '20px',
        backgroundColor: 'var(--void-bg-elevated)',
        border: '1px solid var(--void-border)',
        borderRadius: 'var(--void-radius-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Peak indicator */}
      <div
        style={{
          [isVertical ? 'height' : 'width']: `${peak * 100}%`,
          backgroundColor: getColor(peak),
          transition: 'all var(--void-transition-fast)',
        }}
      />
    </div>
  )
}
