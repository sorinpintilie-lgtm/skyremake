import { NextRequest, NextResponse } from 'next/server';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';

const SEND_AUTH_TOKEN = process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;

export async function POST(request: NextRequest) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!SEND_AUTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Missing sender auth token configuration' }, { status: 500 });
  }

  const body = await request.json();
  const response = await fetch(new URL('/api/whatsapp-send', request.url), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SEND_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: { 'content-type': 'application/json' },
  });
}
