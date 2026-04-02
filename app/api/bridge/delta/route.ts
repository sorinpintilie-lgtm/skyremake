import { NextRequest, NextResponse } from 'next/server';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';
import { listInboxMessages } from '@/lib/whatsapp-inbox';

export async function GET(request: NextRequest) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const since = url.searchParams.get('since') ?? '';
  const contactId = url.searchParams.get('contactId') ?? '';

  const items = await listInboxMessages({ contactId: contactId || undefined, limit: 200 });

  let filtered = items;
  if (since) {
    const sinceTime = Date.parse(since);
    if (!isNaN(sinceTime)) {
      filtered = filtered.filter((item) => {
        const itemTime = Date.parse(item.receivedAt);
        return !isNaN(itemTime) && itemTime > sinceTime;
      });
    }
  }

  return NextResponse.json({
    ok: true,
    count: filtered.length,
    items: filtered.sort((a, b) => (a.receivedAt > b.receivedAt ? 1 : -1)),
    serverTime: new Date().toISOString(),
  });
}
