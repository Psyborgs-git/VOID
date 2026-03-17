import { useEffect, useRef, useState, useCallback } from 'react'
import { eventBus } from '@void/core'
import { TrackLane } from './TrackLane'
import type { TimelineTrack } from './types'

interface TimelineProps {
  tracks: TimelineTrack[]
  bpm: number
  isPlaying: boolean
  onClipPlaced?: (trackId: string, clipId: string, startBeat: number) => void
  onClipMoved?: (clipId: string, newStartBeat: number) => void
  onClipRemoved?: (clipId: string) => void
}

/**
 * Timeline - Multi-track scrollable timeline with playhead
 *
 * Features:
 * - Horizontal scrolling (time axis)
 * - Vertical scrolling (tracks)
 * - Grid with bar/beat markers
 * - Animated playhead
 * - Track lanes for clip placement
 */
export function Timeline({
  tracks,
  bpm,
  isPlaying,
  onClipPlaced,
  onClipMoved,
  onClipRemoved,
}: TimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [zoom, setZoom] = useState(100) // pixels per beat

  // Constants
  const TRACK_HEIGHT = 80
  const RULER_HEIGHT = 40
  const TOTAL_BARS = 32 // Show 32 bars initially
  const BEATS_PER_BAR = 4

  // Draw timeline grid
  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = 'var(--void-bg-surface)'
    ctx.fillRect(0, 0, width, height)

    // Draw ruler
    ctx.fillStyle = 'var(--void-bg-elevated)'
    ctx.fillRect(0, 0, width, RULER_HEIGHT)

    // Draw grid lines and markers
    const totalBeats = TOTAL_BARS * BEATS_PER_BAR
    const beatWidth = zoom

    ctx.strokeStyle = 'var(--void-border)'
    ctx.fillStyle = 'var(--void-text-secondary)'
    ctx.font = '10px var(--void-font-mono)'

    for (let beat = 0; beat <= totalBeats; beat++) {
      const x = beat * beatWidth - scrollLeft
      const isBarStart = beat % BEATS_PER_BAR === 0

      if (x < 0 || x > width) continue

      // Draw vertical grid line
      if (isBarStart) {
        ctx.strokeStyle = 'var(--void-border-focus)'
        ctx.lineWidth = 1
      } else {
        ctx.strokeStyle = 'var(--void-border)'
        ctx.lineWidth = 0.5
      }

      ctx.beginPath()
      ctx.moveTo(x, RULER_HEIGHT)
      ctx.lineTo(x, height)
      ctx.stroke()

      // Draw bar number on ruler
      if (isBarStart) {
        const barNumber = Math.floor(beat / BEATS_PER_BAR) + 1
        ctx.fillStyle = 'var(--void-text-primary)'
        ctx.fillText(`${barNumber}`, x + 4, 20)
      }
    }

    // Draw track separators
    ctx.strokeStyle = 'var(--void-border)'
    ctx.lineWidth = 1
    for (let i = 1; i <= tracks.length; i++) {
      const y = RULER_HEIGHT + i * TRACK_HEIGHT
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw playhead
    if (isPlaying) {
      const playheadX = playheadPosition * beatWidth - scrollLeft
      if (playheadX >= 0 && playheadX <= width) {
        ctx.strokeStyle = 'var(--void-accent-bright)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(playheadX, 0)
        ctx.lineTo(playheadX, height)
        ctx.stroke()

        // Playhead triangle at top
        ctx.fillStyle = 'var(--void-accent-bright)'
        ctx.beginPath()
        ctx.moveTo(playheadX, 0)
        ctx.lineTo(playheadX - 6, 12)
        ctx.lineTo(playheadX + 6, 12)
        ctx.closePath()
        ctx.fill()
      }
    }
  }, [tracks.length, zoom, scrollLeft, playheadPosition, isPlaying])

  // Update playhead position from transport events
  useEffect(() => {
    const unsubTransportPlay = eventBus.on('transport:play', ({ beat }) => {
      setPlayheadPosition(beat)
    })

    const unsubTransportStop = eventBus.on('transport:stop', () => {
      setPlayheadPosition(0)
    })

    return () => {
      unsubTransportPlay()
      unsubTransportStop()
    }
  }, [])

  // Animate playhead during playback
  useEffect(() => {
    if (!isPlaying) return

    let animationFrameId: number
    const beatsPerSecond = bpm / 60

    const animate = () => {
      setPlayheadPosition((prev) => prev + beatsPerSecond / 60)
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying, bpm])

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawTimeline()
  }, [drawTimeline])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      drawTimeline()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [drawTimeline])

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  // Handle zoom with Ctrl+Scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -10 : 10
      setZoom((prev) => Math.max(50, Math.min(200, prev + delta)))
    }
  }

  const totalWidth = TOTAL_BARS * BEATS_PER_BAR * zoom

  return (
    <div
      ref={containerRef}
      className="timeline"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'var(--void-bg-surface)',
      }}
      onScroll={handleScroll}
      onWheel={handleWheel}
    >
      {/* Canvas for grid and playhead */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Track lanes (positioned over canvas) */}
      <div
        style={{
          position: 'relative',
          width: `${totalWidth}px`,
          minHeight: `${RULER_HEIGHT + tracks.length * TRACK_HEIGHT}px`,
          paddingTop: `${RULER_HEIGHT}px`,
        }}
      >
        {tracks.map((track, index) => (
          <TrackLane
            key={track.id}
            track={track}
            trackIndex={index}
            trackHeight={TRACK_HEIGHT}
            beatWidth={zoom}
            onClipPlaced={onClipPlaced}
            onClipMoved={onClipMoved}
            onClipRemoved={onClipRemoved}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--void-space-4)',
          right: 'var(--void-space-4)',
          padding: 'var(--void-space-2) var(--void-space-3)',
          backgroundColor: 'var(--void-bg-overlay)',
          border: '1px solid var(--void-border)',
          borderRadius: 'var(--void-radius-sm)',
          fontSize: '11px',
          color: 'var(--void-text-secondary)',
          fontFamily: 'var(--void-font-mono)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        Zoom: {zoom}px/beat • Ctrl+Scroll to zoom
      </div>
    </div>
  )
}
