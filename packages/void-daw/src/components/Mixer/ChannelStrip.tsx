import { useEffect, useState } from 'react'
import { eventBus } from '@void/core'
import { Fader, VUMeter } from '@void/ui'

/**
 * Channel Strip - single track in the mixer
 */
export interface ChannelStripProps {
  trackId: string
  trackName: string
  volume: number
  pan: number
  muted: boolean
  soloed: boolean
  onVolumeChange: (volume: number) => void
  onPanChange: (pan: number) => void
  onMuteToggle: () => void
  onSoloToggle: () => void
}

export function ChannelStrip({
  trackId,
  trackName,
  volume,
  pan,
  muted,
  soloed,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
}: ChannelStripProps) {
  const [peak, setPeak] = useState(0)
  const [rms, setRms] = useState(0)

  useEffect(() => {
    // Subscribe to level updates
    const unsubscribe = eventBus.on('audio:levelUpdate', (event) => {
      if (event.trackId === trackId) {
        setPeak(event.peak)
        setRms(event.rms)
      }
    })

    return unsubscribe
  }, [trackId])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--void-space-3)',
        padding: 'var(--void-space-4)',
        backgroundColor: 'var(--void-bg-surface)',
        border: '1px solid var(--void-border)',
        borderRadius: 'var(--void-radius-md)',
        minWidth: '80px',
      }}
    >
      {/* Track name */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--void-text-primary)',
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {trackName}
      </div>

      {/* VU Meter */}
      <VUMeter id={`meter-${trackId}`} peak={peak} rms={rms} orientation="vertical" />

      {/* Volume Fader */}
      <Fader
        id={`fader-${trackId}`}
        label="Vol"
        value={volume}
        orientation="vertical"
        onChange={onVolumeChange}
      />

      {/* Pan Knob (simplified as slider for now) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <label style={{ fontSize: '11px', color: 'var(--void-text-secondary)' }}>Pan</label>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={pan}
          onChange={(e) => onPanChange(parseFloat(e.target.value))}
          style={{ width: '60px' }}
        />
        <span style={{ fontSize: '10px', fontFamily: 'var(--void-font-mono)', color: 'var(--void-text-muted)' }}>
          {pan.toFixed(2)}
        </span>
      </div>

      {/* Mute/Solo buttons */}
      <div style={{ display: 'flex', gap: 'var(--void-space-2)', width: '100%' }}>
        <button
          onClick={onMuteToggle}
          style={{
            flex: 1,
            padding: 'var(--void-space-2)',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: muted ? 'var(--void-red)' : 'var(--void-bg-elevated)',
            color: muted ? 'white' : 'var(--void-text-secondary)',
            border: '1px solid var(--void-border)',
            borderRadius: 'var(--void-radius-sm)',
            cursor: 'pointer',
          }}
        >
          M
        </button>
        <button
          onClick={onSoloToggle}
          style={{
            flex: 1,
            padding: 'var(--void-space-2)',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: soloed ? 'var(--void-yellow)' : 'var(--void-bg-elevated)',
            color: soloed ? 'black' : 'var(--void-text-secondary)',
            border: '1px solid var(--void-border)',
            borderRadius: 'var(--void-radius-sm)',
            cursor: 'pointer',
          }}
        >
          S
        </button>
      </div>
    </div>
  )
}
