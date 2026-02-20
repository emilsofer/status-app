'use client'

const STATUSES = [
  { label: '4', emoji: '4️⃣' },
  { label: '8', emoji: '8️⃣' },
  { label: 'Home', emoji: '🏠' },
]

interface Props {
  saved: string
  pending: string
  onSelect: (status: string) => void
  updating: boolean
}

export default function StatusButtons({ saved, pending, onSelect, updating }: Props) {
  return (
    <div style={styles.grid}>
      {STATUSES.map(({ label, emoji }) => {
        const isPending = pending === label
        const isSaved = !pending && saved === label

        let bg = '#f0f0f0'
        let color = '#222'
        let border = '2px solid transparent'

        if (isPending) {
          bg = '#eff6ff'
          color = '#1d4ed8'
          border = '2px solid #3b82f6'
        } else if (isSaved) {
          bg = '#f0fdf4'
          color = '#15803d'
          border = '2px solid #22c55e'
        }

        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            disabled={updating}
            style={{
              ...styles.btn,
              background: bg,
              color,
              border,
              opacity: updating ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: '56px', lineHeight: 1 }}>{emoji}</span>
            <span style={{ fontWeight: 600, fontSize: '16px', marginTop: '6px' }}>{label}</span>
            {isSaved && <span style={styles.savedBadge}>✓ Current</span>}
            {isPending && <span style={styles.pendingBadge}>Selected</span>}
          </button>
        )
      })}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    margin: '20px 0',
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '20px 8px',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minHeight: '120px',
    justifyContent: 'center',
  },
  savedBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#15803d',
    marginTop: '4px',
  },
  pendingBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#1d4ed8',
    marginTop: '4px',
  },
}
