import { NextRequest, NextResponse } from 'next/server';
import { listInboxMessages } from '@/lib/whatsapp-inbox';

const READ_AUTH_TOKEN = process.env.WHATSAPP_READ_AUTH_TOKEN ?? process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;

export async function GET(request: NextRequest) {
  if (!READ_AUTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Missing inbox auth token configuration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${READ_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const onlyUnacknowledged = url.searchParams.get('onlyUnacknowledged') === 'true';
  const limit = Number(url.searchParams.get('limit') ?? '50');

  const items = await listInboxMessages({
    onlyUnacknowledged,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
  });

  return NextResponse.json({ ok: true, count: items.length, items });
}
