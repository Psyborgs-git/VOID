import { useState, useRef, useEffect, useCallback } from 'react'
import type { TimelineClip } from './types'

interface ClipBlockProps {
  clip: TimelineClip
  trackId: string
  trackHeight: number
  beatWidth: number
  onMoved?: (clipId: string, newStartBeat: number) => void
  onRemoved?: (clipId: string) => void
}

/**
 * ClipBlock - Draggable audio/MIDI clip on timeline
 *
 * Features:
 * - Drag to move horizontally
 * - Drag edges to trim
 * - Double-click to open editor
 * - Waveform thumbnail
 * - Color-coded by track
 */
export function ClipBlock({
  clip,
  trackId,
  trackHeight,
  beatWidth,
  onMoved,
  onRemoved,
}: ClipBlockProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartBeat, setDragStartBeat] = useState(0)
  const blockRef = useRef<HTMLDivElement>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)

  const clipWidth = clip.durationBeats * beatWidth
  const clipLeft = clip.startBeat * beatWidth

  // Draw waveform thumbnail
  useEffect(() => {
    const canvas = waveformCanvasRef.current
    if (!canvas || clip.type !== 'audio' || !clip.audioBuffer) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw waveform
    const buffer = clip.audioBuffer
    const channelData = buffer.getChannelData(0)
    const step = Math.ceil(channelData.length / width)
    const amp = height / 2

    ctx.strokeStyle = 'var(--void-accent-bright)'
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let i = 0; i < width; i++) {
      const slice = channelData.slice(i * step, (i + 1) * step)
      const max = Math.max(...slice)
      const min = Math.min(...slice)

      const yMax = amp - max * amp
      const yMin = amp - min * amp

      if (i === 0) {
        ctx.moveTo(i, yMax)
      } else {
        ctx.lineTo(i, yMax)
      }

      ctx.lineTo(i, yMin)
    }

    ctx.stroke()
  }, [clip.audioBuffer, clip.type, clipWidth])

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return // Left mouse button only
      e.stopPropagation()

      setIsDragging(true)
      setDragStartX(e.clientX)
      setDragStartBeat(clip.startBeat)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - e.clientX
        const deltaBeat = deltaX / beatWidth
        const newStartBeat = Math.max(0, Math.round(dragStartBeat + deltaBeat))

        // Update clip position (would be handled by parent state)
        if (blockRef.current) {
          blockRef.current.style.transform = `translateX(${deltaBeat * beatWidth}px)`
        }
      }

      const handleMouseUp = (upEvent: MouseEvent) => {
        setIsDragging(false)

        const deltaX = upEvent.clientX - e.clientX
        const deltaBeat = deltaX / beatWidth
        const newStartBeat = Math.max(0, Math.round(dragStartBeat + deltaBeat))

        if (blockRef.current) {
          blockRef.current.style.transform = ''
        }

        if (newStartBeat !== clip.startBeat && onMoved) {
          onMoved(clip.id, newStartBeat)
        }

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [clip.startBeat, clip.id, beatWidth, dragStartBeat, onMoved]
  )

  // Handle double-click to open editor
  const handleDoubleClick = useCallback(() => {
    console.log('[ClipBlock] Double-clicked clip:', clip.id)
    // TODO: Open clip editor modal
  }, [clip.id])

  // Handle right-click context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      // Simple menu: Delete clip
      if (window.confirm(`Delete clip "${clip.name}"?`)) {
        if (onRemoved) {
          onRemoved(clip.id)
        }
      }
    },
    [clip.id, clip.name, onRemoved]
  )

  return (
    <div
      ref={blockRef}
      className="clip-block"
      style={{
        position: 'absolute',
        left: `${clipLeft}px`,
        top: '8px',
        width: `${clipWidth}px`,
        height: `${trackHeight - 16}px`,
        backgroundColor: clip.type === 'audio' ? 'var(--void-accent-dim)' : 'var(--void-blue)',
        border: '1px solid var(--void-accent)',
        borderRadius: 'var(--void-radius-sm)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        overflow: 'hidden',
        opacity: isDragging ? 0.7 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.4)' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Waveform canvas */}
      {clip.type === 'audio' && (
        <canvas
          ref={waveformCanvasRef}
          width={Math.floor(clipWidth)}
          height={trackHeight - 16}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Clip name */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '8px',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--void-text-primary)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          maxWidth: '90%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {clip.name}
      </div>

      {/* Duration indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '8px',
          fontSize: '10px',
          color: 'var(--void-text-secondary)',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          fontFamily: 'var(--void-font-mono)',
          pointerEvents: 'none',
        }}
      >
        {clip.durationBeats.toFixed(1)}b
      </div>
    </div>
  )
}
