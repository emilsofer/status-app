'use client'

export type Person = {
  id: string
  display_name: string
  current_status: string
  updated_at: string
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const STATUS_META: Record<string, { color: string; dot: string }> = {
  '4':       { color: '#dbeafe', dot: '#3b82f6' },
  '8':       { color: '#d1fae5', dot: '#22c55e' },
  'Home':    { color: '#fef9c3', dot: '#eab308' },
  'Unknown': { color: '#f3f4f6', dot: '#d1d5db' },
}

interface Props {
  people: Person[]
  currentUser: string
}

export default function LiveDashboardTable({ people, currentUser }: Props) {
  if (people.length === 0) {
    return <p style={{ color: '#999', marginTop: '24px', fontSize: '15px' }}>No one here yet.</p>
  }

  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Team</p>
      <div style={styles.list}>
        {people.map((p) => {
          const isMe = p.display_name === currentUser
          const meta = STATUS_META[p.current_status] ?? STATUS_META['Unknown']

          return (
            <div
              key={p.display_name}
              style={{
                ...styles.row,
                borderLeft: isMe ? '3px solid #3b82f6' : '3px solid transparent',
                background: isMe ? '#f8faff' : '#fff',
              }}
            >
              <div style={styles.left}>
                <span
                  style={{ ...styles.dot, background: meta.dot }}
                />
                <span style={{ fontWeight: isMe ? 700 : 500, fontSize: '15px' }}>
                  {p.display_name}
                  {isMe && <span style={styles.youLabel}> · you</span>}
                </span>
              </div>
              <div style={styles.right}>
                <span style={{ ...styles.badge, background: meta.color }}>
                  {p.current_status || '—'}
                </span>
                <span style={styles.time}>{timeAgo(p.updated_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: '28px',
  },
  heading: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#aaa',
    marginBottom: '8px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: '10px',
    transition: 'background 0.1s',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 600,
  },
  time: {
    fontSize: '12px',
    color: '#bbb',
    minWidth: '48px',
    textAlign: 'right',
  },
  youLabel: {
    fontWeight: 400,
    color: '#3b82f6',
    fontSize: '13px',
  },
}
