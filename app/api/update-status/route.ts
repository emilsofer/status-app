import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

const VALID_STATUSES = ['4', '8', 'Home']

export async function POST(req: NextRequest) {
  const { display_name, password, status } = await req.json()

  if (!display_name || !password || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (password !== process.env.SHARED_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = getServerSupabase()

  const { error } = await supabase
    .from('people_status')
    .update({ current_status: status, updated_at: new Date().toISOString() })
    .eq('display_name', display_name)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
