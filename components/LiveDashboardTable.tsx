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

const STATUS_COLORS: Record<string, string> = {
  '4': '#dbeafe',
  '8': '#d1fae5',
  'Home': '#fef9c3',
  'Unknown': '#f3f4f6',
}

interface Props {
  people: Person[]
  currentUser: string
}

export default function LiveDashboardTable({ people, currentUser }: Props) {
  if (people.length === 0) {
    return <p style={{ color: '#999', marginTop: '32px' }}>No one here yet.</p>
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Everyone</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Status</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => {
            const isMe = p.display_name === currentUser
            const bgColor = STATUS_COLORS[p.current_status] ?? '#f3f4f6'
            return (
              <tr key={p.display_name} style={{ background: isMe ? '#f0f7ff' : 'transparent' }}>
                <td style={styles.td}>
                  <span style={{ fontWeight: isMe ? 700 : 400 }}>{p.display_name}</span>
                  {isMe && (
                    <span style={styles.youBadge}>you</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, background: bgColor }}>
                    {p.current_status || '—'}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right', color: '#999', fontSize: '13px' }}>
                  {timeAgo(p.updated_at)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: '16px',
  },
  heading: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '15px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    borderBottom: '2px solid #eee',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#888',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'middle',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 500,
  },
  youBadge: {
    marginLeft: '8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#3b82f6',
    background: '#eff6ff',
    padding: '2px 6px',
    borderRadius: '999px',
  },
}
