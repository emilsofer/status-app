'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import StatusButtons from '@/components/StatusButtons'
import LiveDashboardTable, { type Person } from '@/components/LiveDashboardTable'

export default function DashboardPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [currentStatus, setCurrentStatus] = useState('')
  const [pendingStatus, setPendingStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from('people_status')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) setPeople(data as Person[])
  }, [])

  useEffect(() => {
    const name = localStorage.getItem('display_name')
    const pwd = localStorage.getItem('password')
    if (!name || !pwd) {
      router.push('/login')
      return
    }
    setDisplayName(name)
    fetchAll()
  }, [router, fetchAll])

  useEffect(() => {
    if (!displayName || !people.length) return
    const me = people.find((p) => p.display_name === displayName)
    if (me && me.current_status !== 'Unknown') {
      setCurrentStatus(me.current_status)
    }
  }, [people, displayName])

  useEffect(() => {
    const channel = supabase
      .channel('people_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'people_status' },
        () => { fetchAll() }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  const handleStatusClick = (status: string) => {
    setPendingStatus(status === pendingStatus ? '' : status)
  }

  const handleSave = async () => {
    if (!pendingStatus) return
    const name = localStorage.getItem('display_name')
    const pwd = localStorage.getItem('password')
    if (!name || !pwd) return

    setUpdating(true)
    setStatusMsg('')

    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name, password: pwd, status: pendingStatus }),
      })

      if (res.ok) {
        setCurrentStatus(pendingStatus)
        setPendingStatus('')
        setStatusMsg(`הסטטוס עודכן ל"${pendingStatus}"`)
        setTimeout(() => setStatusMsg(''), 2500)
      } else {
        const d = await res.json()
        setStatusMsg(`Error: ${d.error}`)
      }
    } catch {
      setStatusMsg('Network error')
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('display_name')
    localStorage.removeItem('password')
    router.push('/login')
  }

  const handleClearBoard = async () => {
    if (!confirm('לנקות את הלוח לכולם?')) return
    const name = localStorage.getItem('display_name')
    const pwd = localStorage.getItem('password')
    if (!name || !pwd) return

    const res = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name, password: pwd }),
    })

    if (res.ok) {
      setCurrentStatus('')
      setStatusMsg('הלוח נוקה בהצלחה')
      setTimeout(() => setStatusMsg(''), 2500)
    }
  }

  if (!displayName) return null

  const isAdmin = displayName === process.env.NEXT_PUBLIC_ADMIN_NAME
  const hasPending = pendingStatus && pendingStatus !== currentStatus

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <span style={styles.appName}>סטטוס צוות</span>
          <span style={styles.userName}>{displayName}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>יציאה</button>
      </div>

      <div style={styles.content}>
        <p style={styles.prompt}>איפה אתה עכשיו?</p>

        <StatusButtons
          saved={currentStatus}
          pending={pendingStatus}
          onSelect={handleStatusClick}
          updating={updating}
        />

        {hasPending && (
          <button
            onClick={handleSave}
            disabled={updating}
            style={styles.saveBtn}
          >
            {updating ? 'שומר…' : `שמור — אני ב${pendingStatus}`}
          </button>
        )}

        {statusMsg && (
          <p style={styles.statusMsg}>{statusMsg}</p>
        )}

        <LiveDashboardTable people={people} currentUser={displayName} />

        {isAdmin && (
          <button onClick={handleClearBoard} style={styles.clearBtn}>
            🗑 נקה לוח
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 10,
  },
  appName: {
    fontWeight: 700,
    fontSize: '16px',
    marginRight: '8px',
  },
  userName: {
    fontSize: '14px',
    color: '#888',
  },
  logoutBtn: {
    padding: '6px 14px',
    fontSize: '13px',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#666',
  },
  content: {
    padding: '20px 16px',
    maxWidth: '520px',
    margin: '0 auto',
    width: '100%',
  },
  prompt: {
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '4px',
    color: '#111',
  },
  saveBtn: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 700,
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '4px',
    marginBottom: '12px',
    transition: 'background 0.15s ease',
  },
  statusMsg: {
    fontSize: '14px',
    color: '#059669',
    background: '#ecfdf5',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  clearBtn: {
    marginTop: '32px',
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    background: 'transparent',
    color: '#e53e3e',
    border: '1px solid #fed7d7',
    borderRadius: '10px',
    cursor: 'pointer',
  },
}
