import { resetDemo } from '@/lib/demo-seed'
import { NextRequest, NextResponse } from 'next/server'

// Called every night by Vercel Cron (vercel.json), which sends CRON_SECRET as a bearer token
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ entries: await resetDemo() })
}
