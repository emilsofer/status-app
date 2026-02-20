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

  // Sync currentStatus from live data
  useEffect(() => {
    if (!displayName || !people.length) return
    const me = people.find((p) => p.display_name === displayName)
    if (me && me.current_status !== 'Unknown') {
      setCurrentStatus(me.current_status)
    }
  }, [people, displayName])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('people_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'people_status' },
        () => {
          fetchAll()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const handleStatusUpdate = async (status: string) => {
    const name = localStorage.getItem('display_name')
    const pwd = localStorage.getItem('password')
    if (!name || !pwd) return

    setUpdating(true)
    setStatusMsg('')

    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name, password: pwd, status }),
      })

      if (res.ok) {
        setCurrentStatus(status)
        setStatusMsg(`Status set to "${status}"`)
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

  if (!displayName) return null

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Where are you right now?</h1>
            <p style={styles.sub}>Logged in as <strong>{displayName}</strong></p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Log out
          </button>
        </div>

        <StatusButtons
          current={currentStatus}
          updating={updating}
          onSelect={handleStatusUpdate}
        />

        {statusMsg && (
          <p style={styles.statusMsg}>{statusMsg}</p>
        )}

        <LiveDashboardTable people={people} currentUser={displayName} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '32px 16px',
  },
  container: {
    maxWidth: '760px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    margin: '0 0 4px',
  },
  sub: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    background: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#666',
  },
  statusMsg: {
    fontSize: '14px',
    color: '#059669',
    background: '#ecfdf5',
    padding: '8px 14px',
    borderRadius: '8px',
    margin: '-24px 0 24px',
  },
}
