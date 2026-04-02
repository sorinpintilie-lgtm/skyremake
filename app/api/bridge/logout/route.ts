import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DASHBOARD_COOKIE } from '@/lib/dashboard-auth';

export async function POST() {
  const store = await cookies();
  store.delete(DASHBOARD_COOKIE);
  return NextResponse.json({ ok: true });
}
