import { NextRequest, NextResponse } from 'next/server';
import { acknowledgeInboxMessage, listInboxMessages } from '@/lib/whatsapp-inbox';

const READ_AUTH_TOKEN = process.env.WHATSAPP_READ_AUTH_TOKEN ?? process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;
const SEND_AUTH_TOKEN = process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;
const OWNER_PHONE = process.env.WHATSAPP_OWNER_PHONE ?? '40773902533';

export async function POST(request: NextRequest) {
  if (!READ_AUTH_TOKEN || !SEND_AUTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Missing auth token configuration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${READ_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const inboxItems = await listInboxMessages({ onlyUnacknowledged: true, limit: 20 });
  const ownerDigits = OWNER_PHONE.replace(/\D/g, '');
  const candidate = inboxItems.find((item) => (item.from ?? '') !== ownerDigits);

  if (!candidate) {
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
      text: buildOwnerNotification(candidate),
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

  const acked = await acknowledgeInboxMessage(candidate.messageId);

  return NextResponse.json({
    ok: true,
    notified: true,
    item: acked,
    notification: parsed ?? raw,
  });
}

function buildOwnerNotification(item: {
  from: string | null;
  contactName: string | null;
  preview: string;
  receivedAt: string;
}) {
  const phone = item.from ? `+${item.from}` : '(necunoscut)';
  return [
    `Mesaj nou pe WhatsApp Business de la ${item.contactName || phone}.`,
    `Număr: ${phone}`,
    `Primit la: ${item.receivedAt}`,
    `Rezumat: ${item.preview}`,
  ].join('\n');
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}
