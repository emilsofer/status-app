import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { display_name, password } = await req.json()

  if (!display_name?.trim() || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (password !== process.env.SHARED_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const supabase = getServerSupabase()

  // Insert if not exists — don't overwrite status on re-login
  const { error } = await supabase.from('people_status').upsert(
    {
      display_name: display_name.trim(),
      current_status: 'Unknown',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'display_name', ignoreDuplicates: true }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
