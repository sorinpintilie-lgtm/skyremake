import { NextRequest, NextResponse } from 'next/server';
import { acknowledgeInboxMessage, listInboxMessages } from '@/lib/whatsapp-inbox';

const READ_AUTH_TOKEN = process.env.WHATSAPP_READ_AUTH_TOKEN ?? process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;
const SEND_AUTH_TOKEN = process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;
const OWNER_PHONE = process.env.WHATSAPP_OWNER_PHONE ?? '40773902533';
const MAX_BATCH = Number(process.env.WHATSAPP_NOTIFY_BATCH_SIZE ?? '10');

export async function POST(request: NextRequest) {
  if (!READ_AUTH_TOKEN || !SEND_AUTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Missing auth token configuration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${READ_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const inboxItems = await listInboxMessages({ onlyUnacknowledged: true, limit: 50 });
  const ownerDigits = OWNER_PHONE.replace(/\D/g, '');
  const candidates = inboxItems
    .filter((item) => (item.from ?? '') !== ownerDigits)
    .slice(0, Math.max(1, Math.min(MAX_BATCH, 20)));

  if (!candidates.length) {
    return NextResponse.json({ ok: true, notified: false, reason: 'No unacknowledged client messages' });
  }

  const notifyResponse = await fetch(new URL('/api/whatsapp-send', request.url), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SEND_AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: ownerDigits,
      text: buildOwnerNotification(candidates),
      notifyOpenClaw: false,
    }),
  });

  const raw = await notifyResponse.text();
  const parsed = tryParseJson(raw);

  if (!notifyResponse.ok) {
    return NextResponse.json(
      { ok: false, error: 'Failed to notify owner', status: notifyResponse.status, details: parsed ?? raw },
      { status: notifyResponse.status },
    );
  }

  const acked = await Promise.all(candidates.map((item) => acknowledgeInboxMessage(item.messageId)));

  return NextResponse.json({
    ok: true,
    notified: true,
    count: candidates.length,
    items: acked.filter(Boolean),
    notification: parsed ?? raw,
  });
}

function buildOwnerNotification(items: Array<{
  from: string | null;
  contactName: string | null;
  preview: string;
  receivedAt: string;
}>) {
  const header = items.length === 1
    ? 'Ai 1 mesaj nou pe WhatsApp Business:'
    : `Ai ${items.length} mesaje noi pe WhatsApp Business:`;

  const lines = items.map((item, index) => {
    const phone = item.from ? `+${item.from}` : '(necunoscut)';
    return [
      `${index + 1}. ${item.contactName || phone}`,
      `Număr: ${phone}`,
      `Primit la: ${item.receivedAt}`,
      `Rezumat: ${item.preview}`,
    ].join('\n');
  });

  return [header, '', ...lines].join('\n\n');
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}
