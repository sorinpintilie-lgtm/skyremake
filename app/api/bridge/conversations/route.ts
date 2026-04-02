import { NextResponse } from 'next/server';
import { isDashboardAuthenticated } from '@/lib/dashboard-auth';
import { listConversationSummaries } from '@/lib/whatsapp-inbox';

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const items = await listConversationSummaries(100);
  return NextResponse.json({ ok: true, items });
}
