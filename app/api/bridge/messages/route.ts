import { NextRequest, NextResponse } from 'next/server';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';
import { acknowledgeInboxMessage, listInboxMessages } from '@/lib/whatsapp-inbox';

export async function GET(request: NextRequest) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const contactId = url.searchParams.get('contactId') ?? '';
  if (!contactId) {
    return NextResponse.json({ ok: false, error: 'Missing contactId' }, { status: 400 });
  }

  const items = await listInboxMessages({ contactId, limit: 200 });
  return NextResponse.json({ ok: true, items: items.sort((a, b) => (a.receivedAt > b.receivedAt ? 1 : -1)) });
}

export async function POST(request: NextRequest) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { messageIds?: string[] };
  const ids = Array.isArray(body.messageIds) ? body.messageIds : [];
  const updated = await Promise.all(ids.map((id) => acknowledgeInboxMessage(id)));
  return NextResponse.json({ ok: true, updated: updated.filter(Boolean) });
}
