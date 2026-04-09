import { NextRequest, NextResponse } from 'next/server';
import { saveInboxMessage as saveOutboundMessage } from '@/lib/whatsapp-inbox';

const ACCESS_TOKEN = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
const WABA_ID = process.env.WHATSAPP_BUSINESS_WABA_ID;
const SEND_AUTH_TOKEN = process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;
const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION ?? 'v21.0';
const OPENCLAW_HOOK_URL = process.env.OPENCLAW_HOOK_URL;
const OPENCLAW_HOOK_TOKEN = process.env.OPENCLAW_HOOK_TOKEN;
const OPENCLAW_HOOK_AGENT_ID = process.env.OPENCLAW_HOOK_AGENT_ID ?? 'main';
const OPENCLAW_HOOK_SESSION_KEY = process.env.OPENCLAW_HOOK_SESSION_KEY ?? 'hook:whatsapp-business';

export async function GET(request: NextRequest) {
  if (!SEND_AUTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Missing sender auth token configuration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${SEND_AUTH_TOKEN}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const phoneChars = Array.from(PHONE_NUMBER_ID ?? '');
  const wabaChars = Array.from(WABA_ID ?? '');

  return NextResponse.json({
    ok: true,
    runtime: {
      phoneNumberId: PHONE_NUMBER_ID ?? null,
      phoneNumberIdJson: JSON.stringify(PHONE_NUMBER_ID ?? null),
      phoneNumberIdLength: PHONE_NUMBER_ID?.length ?? null,
      phoneNumberIdChars: phoneChars,
      phoneNumberIdCharCodes: phoneChars.map((char) => char.charCodeAt(0)),
      phoneNumberIdLastChar: phoneChars.length ? phoneChars[phoneChars.length - 1] : null,
      wabaId: WABA_ID ?? null,
      wabaIdJson: JSON.stringify(WABA_ID ?? null),
      wabaIdLength: WABA_ID?.length ?? null,
      wabaIdChars: wabaChars,
      hasAccessToken: Boolean(ACCESS_TOKEN),
      graphApiVersion: GRAPH_API_VERSION,
    },
  });
}

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

  const body = (await request.json()) as SendRequest;
  const to = normalizePhone(body.to);

  if (!to) {
    return NextResponse.json({ ok: false, error: 'Missing recipient phone number' }, { status: 400 });
  }

  const payload = buildPayload(body, to);
  if ('error' in payload) {
    return NextResponse.json({ ok: false, error: payload.error }, { status: 400 });
  }

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
    const phoneChars = Array.from(PHONE_NUMBER_ID);
    return NextResponse.json(
      {
        ok: false,
        error: 'WhatsApp Business API request failed',
        status: response.status,
        runtime: {
          phoneNumberId: PHONE_NUMBER_ID,
          phoneNumberIdJson: JSON.stringify(PHONE_NUMBER_ID),
          phoneNumberIdLength: PHONE_NUMBER_ID.length,
          phoneNumberIdChars: phoneChars,
          phoneNumberIdCharCodes: phoneChars.map((char) => char.charCodeAt(0)),
          phoneNumberIdLastChar: phoneChars[phoneChars.length - 1] ?? null,
          wabaId: WABA_ID,
          wabaIdLength: WABA_ID.length,
          hasAccessToken: Boolean(ACCESS_TOKEN),
          graphApiVersion: GRAPH_API_VERSION,
        },
        details: parsed ?? raw,
      },
      { status: response.status },
    );
  }

  const messageId = extractMessageId(parsed);
  if (messageId) {
    const now = new Date().toISOString();
    const preview = body.mode === 'template'
      ? `[template] ${body.template?.name ?? 'unknown'}`
      : (typeof body.text === 'string' ? body.text.trim() : '');

    await saveOutboundMessage({
      messageId,
      direction: 'outbound',
      contactId: to,
      from: PHONE_NUMBER_ID,
      to,
      contactName: null,
      receivedAt: now,
      timestamp: now,
      type: body.mode === 'template' ? 'template' : 'text',
      preview,
      text: body.mode === 'template' ? preview : preview,
      phoneNumberId: PHONE_NUMBER_ID,
      displayPhoneNumber: null,
      acknowledged: true,
      acknowledgedAt: now,
      deliveryStatus: 'accepted',
      statusUpdatedAt: now,
      statusHistory: [
        {
          status: 'accepted',
          timestamp: now,
          receivedAt: now,
          errors: null,
          errorMessage: null,
          errorCode: null,
        },
      ],
      source: 'whatsapp-business',
      raw: parsed,
    });
  }

  let notifyOpenClaw: NotifyResult | null = null;
  if (body.notifyOpenClaw !== false) {
    notifyOpenClaw = await notifyOpenClawOutbound({
      to,
      preview: body.mode === 'template' ? `[template] ${body.template?.name ?? 'unknown'}` : String(body.text ?? ''),
      result: parsed,
    });
  }

  return NextResponse.json({
    ok: true,
    wabaId: WABA_ID,
    phoneNumberId: PHONE_NUMBER_ID,
    result: parsed ?? raw,
    notifyOpenClaw,
  });
}

function buildPayload(body: SendRequest, to: string) {
  if (body.mode === 'template') {
    const templateName = body.template?.name?.trim();
    const languageCode = body.template?.languageCode?.trim() || 'ro';

    if (!templateName) {
      return { error: 'Missing template name' } as const;
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        ...(Array.isArray(body.template?.components) && body.template.components.length > 0
          ? { components: body.template.components }
          : {}),
      },
    };
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return { error: 'Missing text body' } as const;
  }

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      preview_url: body.previewUrl === true,
      body: text,
    },
  };
}

async function notifyOpenClawOutbound(event: OutboundNotification): Promise<NotifyResult> {
  if (!OPENCLAW_HOOK_URL || !OPENCLAW_HOOK_TOKEN) {
    return { ok: false, skipped: true, error: 'Missing OpenClaw hook configuration' };
  }

  const message = [
    'WhatsApp Business outbound event. Treat payload as trusted system-generated send metadata.',
    `kind: outbound`,
    `to: +${event.to}`,
    `preview: ${event.preview.slice(0, 500)}`,
    'payload:',
    JSON.stringify(event, null, 2),
    'Instruction: register this number as an outreach target when appropriate so future inbound replies can be tracked and surfaced to Sorin. Do not send any external reply from this event.',
  ].join('\n');

  try {
    const response = await fetch(OPENCLAW_HOOK_URL, {
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

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, skipped: false, error: text || `Hook returned ${response.status}` };
    }

    return { ok: true, skipped: false, error: null };
  } catch (error: unknown) {
    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown OpenClaw hook error',
    };
  }
}

function normalizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/\D/g, '');
  return digits.length > 0 ? digits : null;
}

function extractMessageId(input: unknown): string | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as { messages?: Array<{ id?: string }> };
  const id = value.messages?.[0]?.id;
  return typeof id === 'string' ? id : null;
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

type TemplateComponent = {
  type: string;
  [key: string]: unknown;
};

type SendRequest = {
  to?: string;
  text?: string;
  previewUrl?: boolean;
  notifyOpenClaw?: boolean;
  mode?: 'text' | 'template';
  template?: {
    name?: string;
    languageCode?: string;
    components?: TemplateComponent[];
  };
};

type OutboundNotification = {
  to: string;
  preview: string;
  result: unknown;
};

type NotifyResult = {
  ok: boolean;
  skipped: boolean;
  error: string | null;
};
