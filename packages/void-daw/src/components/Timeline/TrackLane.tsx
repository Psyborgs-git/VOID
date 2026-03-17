import { useCallback, useState } from 'react'
import { ClipBlock } from './ClipBlock'
import type { TimelineTrack, TimelineClip } from './types'

interface TrackLaneProps {
  track: TimelineTrack
  trackIndex: number
  trackHeight: number
  beatWidth: number
  onClipPlaced?: (trackId: string, clipId: string, startBeat: number) => void
  onClipMoved?: (clipId: string, newStartBeat: number) => void
  onClipRemoved?: (clipId: string) => void
}

/**
 * TrackLane - Individual track row in the timeline
 *
 * Features:
 * - Drag & drop zone for audio files
 * - Hosts clip blocks
 * - Track name label
 */
export function TrackLane({
  track,
  trackIndex,
  trackHeight,
  beatWidth,
  onClipPlaced,
  onClipMoved,
  onClipRemoved,
}: TrackLaneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  // Handle drag over (for file drop)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  // Handle file drop
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const audioFile = files.find((f) => f.type.startsWith('audio/'))

      if (!audioFile) {
        console.warn('[TrackLane] No audio file dropped')
        return
      }

      // Calculate drop position in beats
      const rect = e.currentTarget.getBoundingClientRect()
      const offsetX = e.clientX - rect.left + e.currentTarget.scrollLeft
      const startBeat = Math.floor(offsetX / beatWidth)

      // Create object URL for the audio file
      const audioUrl = URL.createObjectURL(audioFile)

      // Generate clip ID
      const clipId = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Notify parent component
      if (onClipPlaced) {
        onClipPlaced(track.id, clipId, startBeat)
      }

      console.log('[TrackLane] Dropped audio file:', audioFile.name, 'at beat', startBeat)

      // Add clip to track (this would be handled by parent state)
      // For now, we'll emit an event
      // The parent component should handle adding the clip to the track
    },
    [track.id, beatWidth, onClipPlaced]
  )

  return (
    <div
      className="track-lane"
      style={{
        position: 'relative',
        height: `${trackHeight}px`,
        borderBottom: '1px solid var(--void-border)',
        backgroundColor: isDragOver ? 'var(--void-bg-elevated)' : 'transparent',
        transition: 'background-color 0.2s',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Track name label */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          padding: 'var(--void-space-2) var(--void-space-3)',
          display: 'flex',
          alignItems: 'center',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--void-text-primary)',
          backgroundColor: 'var(--void-bg-elevated)',
          borderRight: '1px solid var(--void-border)',
          zIndex: 5,
          pointerEvents: 'none',
          minWidth: '120px',
        }}
      >
        {track.name}
      </div>

      {/* Clip blocks */}
      {track.clips.map((clip) => (
        <ClipBlock
          key={clip.id}
          clip={clip}
          trackId={track.id}
          trackHeight={trackHeight}
          beatWidth={beatWidth}
          onMoved={onClipMoved}
          onRemoved={onClipRemoved}
        />
      ))}

      {/* Drop zone indicator */}
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '140px',
            transform: 'translateY(-50%)',
            fontSize: '11px',
            color: 'var(--void-accent)',
            fontWeight: 600,
            pointerEvents: 'none',
          }}
        >
          Drop audio file here
        </div>
      )}
    </div>
  )
}
