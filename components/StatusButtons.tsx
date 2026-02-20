'use client'

const STATUSES = [
  { label: '4', emoji: '4️⃣' },
  { label: '8', emoji: '8️⃣' },
  { label: 'Home', emoji: '🏠' },
]

interface Props {
  current: string
  updating: boolean
  onSelect: (status: string) => void
}

export default function StatusButtons({ current, updating, onSelect }: Props) {
  return (
    <div style={styles.grid}>
      {STATUSES.map(({ label, emoji }) => {
        const isActive = current === label
        return (
          <button
            key={label}
            onClick={() => onSelect(label)}
            disabled={updating}
            style={{
              ...styles.btn,
              background: isActive ? '#111' : '#f0f0f0',
              color: isActive ? '#fff' : '#222',
              transform: isActive ? 'scale(1.03)' : 'scale(1)',
              opacity: updating && !isActive ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: '72px', lineHeight: 1 }}>{emoji}</span>
            <span style={{ fontWeight: 600, fontSize: '18px' }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
    margin: '24px 0 40px',
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '28px 12px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
}
