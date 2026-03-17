import { ReactNode, CSSProperties } from 'react'

/**
 * Panel component - dark panel container with optional header
 *
 * @param props Panel properties
 * @returns Panel component
 */
export interface PanelProps {
  title?: string
  children: ReactNode
  style?: CSSProperties
  className?: string
}

/**
 * Panel component
 */
export function Panel({ title, children, style, className }: PanelProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--void-bg-surface)',
        border: '1px solid var(--void-border)',
        borderRadius: 'var(--void-radius-md)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: 'var(--void-space-3) var(--void-space-4)',
            backgroundColor: 'var(--void-bg-elevated)',
            borderBottom: '1px solid var(--void-border)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--void-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {title}
        </div>
      )}
      <div style={{ padding: 'var(--void-space-4)' }}>{children}</div>
    </div>
  )
}
