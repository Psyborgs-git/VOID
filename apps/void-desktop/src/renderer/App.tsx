import { useEffect, useState, useRef } from 'react'
import { eventBus, TrackType } from '@void/core'
import { WebAudioAdapter } from '@void/daw'
import { Mixer, type MixerTrack } from '@void/daw'
import { Panel } from '@void/ui'

/**
 * Main App component with DAW functionality
 */
export default function App() {
  const [tracks, setTracks] = useState<MixerTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const audioAdapter = useRef<WebAudioAdapter | null>(null)

  useEffect(() => {
    console.log('[VOID] App component mounted')

    // Initialize audio adapter
    audioAdapter.current = new WebAudioAdapter()
    audioAdapter.current.setTransportBPM(120)

    // Subscribe to transport events
    const unsubPlay = eventBus.on('transport:play', () => {
      setIsPlaying(true)
    })

    const unsubStop = eventBus.on('transport:stop', () => {
      setIsPlaying(false)
    })

    const unsubPause = eventBus.on('transport:pause', () => {
      setIsPlaying(false)
    })

    // Cleanup
    return () => {
      unsubPlay()
      unsubStop()
      unsubPause()
      if (audioAdapter.current) {
        audioAdapter.current.destroy()
      }
    }
  }, [])

  const handleCreateTrack = () => {
    if (!audioAdapter.current) return

    const trackId = `track-${Date.now()}`
    const trackName = `Track ${tracks.length + 1}`

    // Create track in audio engine
    audioAdapter.current.createTrack('audio', trackId)

    // Add to UI state
    const newTrack: MixerTrack = {
      id: trackId,
      name: trackName,
      volume: 0.8,
      pan: 0,
      muted: false,
      soloed: false,
    }

    setTracks([...tracks, newTrack])
  }

  const handlePlay = () => {
    if (!audioAdapter.current) return
    audioAdapter.current.play()
  }

  const handleStop = () => {
    if (!audioAdapter.current) return
    audioAdapter.current.stop()
  }

  const handleBpmChange = (newBpm: number) => {
    if (!audioAdapter.current) return
    setBpm(newBpm)
    audioAdapter.current.setTransportBPM(newBpm)
  }

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    if (!audioAdapter.current) return
    audioAdapter.current.setTrackVolume(trackId, volume)

    setTracks((prevTracks) =>
      prevTracks.map((t) => (t.id === trackId ? { ...t, volume } : t))
    )
  }

  const handleTrackPanChange = (trackId: string, pan: number) => {
    if (!audioAdapter.current) return
    audioAdapter.current.setTrackPan(trackId, pan)

    setTracks((prevTracks) =>
      prevTracks.map((t) => (t.id === trackId ? { ...t, pan } : t))
    )
  }

  const handleTrackMuteToggle = (trackId: string) => {
    if (!audioAdapter.current) return

    setTracks((prevTracks) => {
      const track = prevTracks.find((t) => t.id === trackId)
      if (!track) return prevTracks

      const newMuted = !track.muted
      audioAdapter.current!.setTrackMute(trackId, newMuted)

      return prevTracks.map((t) => (t.id === trackId ? { ...t, muted: newMuted } : t))
    })
  }

  const handleTrackSoloToggle = (trackId: string) => {
    if (!audioAdapter.current) return

    setTracks((prevTracks) => {
      const track = prevTracks.find((t) => t.id === trackId)
      if (!track) return prevTracks

      const newSoloed = !track.soloed
      audioAdapter.current!.setTrackSolo(trackId, newSoloed)

      return prevTracks.map((t) => (t.id === trackId ? { ...t, soloed: newSoloed } : t))
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">VOID</div>
        <div className="app-subtitle">DAW • Phase 2 MVP</div>

        {/* Transport controls */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 'var(--void-space-3)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--void-space-2)' }}>
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: isPlaying
                  ? 'var(--void-bg-elevated)'
                  : 'var(--void-accent)',
                color: isPlaying ? 'var(--void-text-muted)' : 'white',
                border: '1px solid var(--void-border)',
                borderRadius: 'var(--void-radius-sm)',
                cursor: isPlaying ? 'not-allowed' : 'pointer',
              }}
            >
              ▶ Play
            </button>
            <button
              onClick={handleStop}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--void-bg-elevated)',
                color: 'var(--void-text-primary)',
                border: '1px solid var(--void-border)',
                borderRadius: 'var(--void-radius-sm)',
                cursor: 'pointer',
              }}
            >
              ■ Stop
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--void-space-2)' }}>
            <label
              style={{ fontSize: '12px', color: 'var(--void-text-secondary)' }}
            >
              BPM:
            </label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => handleBpmChange(parseInt(e.target.value) || 120)}
              min="60"
              max="200"
              style={{
                width: '60px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'var(--void-font-mono)',
                backgroundColor: 'var(--void-bg-elevated)',
                color: 'var(--void-text-primary)',
                border: '1px solid var(--void-border)',
                borderRadius: 'var(--void-radius-sm)',
              }}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">
          <div className="sidebar">
            <Panel title="Tracks">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--void-space-3)' }}>
                <button
                  onClick={handleCreateTrack}
                  style={{
                    padding: 'var(--void-space-3)',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: 'var(--void-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--void-radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  + Add Track
                </button>

                {tracks.length > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--void-text-muted)' }}>
                    {tracks.length} track{tracks.length !== 1 ? 's' : ''}
                  </div>
                )}

                {tracks.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--void-text-muted)' }}>
                    No tracks yet. Click above to create your first track.
                  </p>
                )}
              </div>
            </Panel>

            <Panel title="Info" style={{ marginTop: 'var(--void-space-4)' }}>
              <div style={{ fontSize: '11px', color: 'var(--void-text-muted)', lineHeight: 1.6 }}>
                <div>Platform: {window.voidAPI.platform}</div>
                <div>Version: {window.voidAPI.version}</div>
                <div>Status: {isPlaying ? 'Playing' : 'Stopped'}</div>
              </div>
            </Panel>
          </div>

          <div className="workspace">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Timeline placeholder */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: 'var(--void-bg-surface)',
                  border: '1px solid var(--void-border)',
                  borderRadius: 'var(--void-radius-md)',
                  margin: 'var(--void-space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--void-text-muted)',
                  fontSize: '14px',
                }}
              >
                Timeline (coming in Phase 2.2)
              </div>

              {/* Mixer */}
              <div
                style={{
                  height: '300px',
                  borderTop: '1px solid var(--void-border)',
                }}
              >
                <Mixer
                  tracks={tracks}
                  onTrackVolumeChange={handleTrackVolumeChange}
                  onTrackPanChange={handleTrackPanChange}
                  onTrackMuteToggle={handleTrackMuteToggle}
                  onTrackSoloToggle={handleTrackSoloToggle}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
