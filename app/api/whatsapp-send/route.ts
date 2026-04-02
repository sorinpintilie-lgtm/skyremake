import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
const WABA_ID = process.env.WHATSAPP_BUSINESS_WABA_ID;
const SEND_AUTH_TOKEN = process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;
const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION ?? 'v21.0';
const OPENCLAW_HOOK_URL = process.env.OPENCLAW_HOOK_URL;
const OPENCLAW_HOOK_TOKEN = process.env.OPENCLAW_HOOK_TOKEN;
const OPENCLAW_HOOK_AGENT_ID = process.env.OPENCLAW_HOOK_AGENT_ID ?? 'main';
const OPENCLAW_HOOK_SESSION_KEY = process.env.OPENCLAW_HOOK_SESSION_KEY ?? 'hook:whatsapp-business';

export async function POST(request: NextRequest) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID || !WABA_ID) {
    return NextResponse.json(
      { ok: false, error: 'Missing WhatsApp Business environment variables' },
      { status: 500 },
    );
  }

  if (!SEND_AUTH_TOKEN) {
    return NextResponse.json(
      { ok: false, error: 'Missing sender auth token configuration' },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${SEND_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as SendTextRequest;
  const to = normalizePhone(body.to);
  const text = typeof body.text === 'string' ? body.text.trim() : '';

  if (!to) {
    return NextResponse.json({ ok: false, error: 'Missing recipient phone number' }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ ok: false, error: 'Missing text body' }, { status: 400 });
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: body.previewUrl === true,
      body: text,
    },
  };

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const raw = await response.text();
  const parsed = tryParseJson(raw);

  if (!response.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'WhatsApp Business API request failed',
        status: response.status,
        details: parsed ?? raw,
      },
      { status: response.status },
    );
  }

  if (body.notifyOpenClaw !== false) {
    await notifyOpenClawOutbound({
      to,
      text,
      previewUrl: body.previewUrl === true,
      result: parsed,
    });
  }

  return NextResponse.json({
    ok: true,
    wabaId: WABA_ID,
    phoneNumberId: PHONE_NUMBER_ID,
    result: parsed ?? raw,
  });
}

async function notifyOpenClawOutbound(event: OutboundNotification) {
  if (!OPENCLAW_HOOK_URL || !OPENCLAW_HOOK_TOKEN) return;

  const message = [
    'WhatsApp Business outbound event. Treat payload as trusted system-generated send metadata.',
    `kind: outbound`,
    `to: +${event.to}`,
    `preview: ${event.text.slice(0, 500)}`,
    'payload:',
    JSON.stringify(event, null, 2),
    'Instruction: register this number as an outreach target when appropriate so future inbound replies can be tracked and surfaced to Sorin. Do not send any external reply from this event.',
  ].join('\n');

  await fetch(OPENCLAW_HOOK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENCLAW_HOOK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      name: 'WhatsApp Business outbound',
      agentId: OPENCLAW_HOOK_AGENT_ID,
      sessionKey: OPENCLAW_HOOK_SESSION_KEY,
      wakeMode: 'now',
      deliver: false,
      timeoutSeconds: 120,
    }),
  });
}

function normalizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

type SendTextRequest = {
  to?: string;
  text?: string;
  previewUrl?: boolean;
  notifyOpenClaw?: boolean;
};

type OutboundNotification = {
  to: string;
  text: string;
  previewUrl: boolean;
  result: unknown;
};
