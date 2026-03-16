import { ChannelStrip } from './ChannelStrip'

/**
 * Track state for mixer
 */
export interface MixerTrack {
  id: string
  name: string
  volume: number
  pan: number
  muted: boolean
  soloed: boolean
}

/**
 * Mixer component - horizontal channel strips
 */
export interface MixerProps {
  tracks: MixerTrack[]
  onTrackVolumeChange: (trackId: string, volume: number) => void
  onTrackPanChange: (trackId: string, pan: number) => void
  onTrackMuteToggle: (trackId: string) => void
  onTrackSoloToggle: (trackId: string) => void
}

export function Mixer({
  tracks,
  onTrackVolumeChange,
  onTrackPanChange,
  onTrackMuteToggle,
  onTrackSoloToggle,
}: MixerProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--void-space-3)',
        padding: 'var(--void-space-4)',
        backgroundColor: 'var(--void-bg-base)',
        overflowX: 'auto',
        height: '100%',
      }}
    >
      {tracks.map((track) => (
        <ChannelStrip
          key={track.id}
          trackId={track.id}
          trackName={track.name}
          volume={track.volume}
          pan={track.pan}
          muted={track.muted}
          soloed={track.soloed}
          onVolumeChange={(vol) => onTrackVolumeChange(track.id, vol)}
          onPanChange={(pan) => onTrackPanChange(track.id, pan)}
          onMuteToggle={() => onTrackMuteToggle(track.id)}
          onSoloToggle={() => onTrackSoloToggle(track.id)}
        />
      ))}

      {tracks.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--void-text-muted)',
            fontSize: '14px',
          }}
        >
          No tracks. Create a track to get started.
        </div>
      )}
    </div>
  )
}
