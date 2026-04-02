import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionValue, DASHBOARD_COOKIE, getDashboardConfig, hasDashboardCredentials } from '@/lib/dashboard-auth';

export async function POST(request: NextRequest) {
  if (!hasDashboardCredentials()) {
    return NextResponse.json({ ok: false, error: 'Dashboard auth env vars are missing' }, { status: 500 });
  }

  const { username, password } = (await request.json()) as { username?: string; password?: string };
  const cfg = getDashboardConfig();

  if (username !== cfg.username || password !== cfg.password) {
    return NextResponse.json({ ok: false, error: 'Credențiale invalide' }, { status: 401 });
  }

  const store = await cookies();
  store.set(DASHBOARD_COOKIE, createSessionValue(cfg.username, cfg.sessionSecret), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
