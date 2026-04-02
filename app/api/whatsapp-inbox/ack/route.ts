import { NextRequest, NextResponse } from 'next/server';
import { acknowledgeInboxMessage } from '@/lib/whatsapp-inbox';

const READ_AUTH_TOKEN = process.env.WHATSAPP_READ_AUTH_TOKEN ?? process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;

export async function POST(request: NextRequest) {
  if (!READ_AUTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Missing inbox auth token configuration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${READ_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { messageId?: string };
  if (!body.messageId) {
    return NextResponse.json({ ok: false, error: 'Missing messageId' }, { status: 400 });
  }

  const item = await acknowledgeInboxMessage(body.messageId);
  if (!item) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}
