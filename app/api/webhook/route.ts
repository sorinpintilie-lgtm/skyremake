import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveInboxMessage, updateOutboundStatus } from '@/lib/whatsapp-inbox';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? process.env.whatsapp_verify_token;
const APP_SECRET = process.env.WHATSAPP_SECRET ?? process.env.whatsapp_secret;

type UnknownRecord = Record<string, unknown>;

type ContactRecord = {
  wa_id?: string;
  profile?: {
    name?: string;
  };
};

type ValueMetadata = {
  phone_number_id?: string;
  display_phone_number?: string;
};

type IncomingMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string; id?: string };
    list_reply?: { title?: string; id?: string };
  };
  image?: { id?: string; mime_type?: string; caption?: string };
  document?: { id?: string; mime_type?: string; filename?: string; caption?: string };
  audio?: { id?: string; mime_type?: string; voice?: boolean };
  video?: { id?: string; mime_type?: string; caption?: string };
  location?: { latitude?: number; longitude?: number; name?: string; address?: string };
  contacts?: unknown[];
  referral?: unknown;
  context?: unknown;
} & UnknownRecord;

type IncomingStatus = {
  id?: string;
  recipient_id?: string;
  status?: string;
  timestamp?: string;
  conversation?: unknown;
  pricing?: unknown;
  errors?: unknown[];
};

type ChangeValue = {
  metadata?: ValueMetadata;
  contacts?: ContactRecord[];
  messages?: IncomingMessage[];
  statuses?: IncomingStatus[];
};

type WebhookChange = {
  field?: string;
  value?: ChangeValue;
};

type WebhookEntry = {
  id?: string;
  changes?: WebhookChange[];
};

type WebhookPayload = {
  object?: string;
  entry?: WebhookEntry[];
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && VERIFY_TOKEN && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!APP_SECRET) {
    return NextResponse.json({ ok: false, error: 'Missing WHATSAPP_SECRET' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifySignature(body, signature, APP_SECRET)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const payload = JSON.parse(body) as WebhookPayload;

  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ ok: true, ignored: true, reason: 'Unsupported object type' });
  }

  const events = normalizePayload(payload);
  const messages = events.filter((event) => event.kind === 'message' && event.message?.id);
  const statuses = events.filter((event) => event.kind === 'status' && event.status?.id);

  for (const event of messages) {
    if (!event.message?.id) continue;
    await saveInboxMessage({
      messageId: event.message.id,
      direction: 'inbound',
      contactId: event.from ?? 'unknown',
      from: event.from,
      to: event.displayPhoneNumber?.replace(/\D/g, '') ?? null,
      contactName: event.contact?.profile?.name ?? null,
      receivedAt: event.receivedAt,
      timestamp: event.message.timestamp,
      type: event.message.type,
      preview: makePreview(event.message),
      text: event.message.text,
      phoneNumberId: event.phoneNumberId,
      displayPhoneNumber: event.displayPhoneNumber,
      acknowledged: false,
      acknowledgedAt: null,
      deliveryStatus: null,
      statusUpdatedAt: null,
      statusHistory: [],
      source: 'whatsapp-business',
      raw: {
        kind: event.kind,
        object: event.object,
        entryId: event.entryId,
        field: event.field,
        from: event.from,
        contact: event.contact,
        message: event.message,
      },
    });
  }

  for (const event of statuses) {
    if (!event.status?.id) continue;
    await updateOutboundStatus(event.status.id, {
      status: normalizeDeliveryStatus(event.status.status),
      timestamp: event.status.timestamp,
      receivedAt: event.receivedAt,
      errors: event.status.errors,
    });
  }

  return NextResponse.json({
    ok: true,
    processed: events.length,
    messages: messages.length,
    statuses: statuses.length,
  });
}

function verifySignature(body: string, signature: string | null, appSecret: string): boolean {
  if (!signature) return false;

  const receivedSignature = signature.replace('sha256=', '');
  const expectedSignature = crypto.createHmac('sha256', appSecret).update(body, 'utf8').digest('hex');

  const a = Buffer.from(expectedSignature, 'hex');
  const b = Buffer.from(receivedSignature, 'hex');

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function normalizePayload(payload: WebhookPayload): StoredEvent[] {
  const now = new Date().toISOString();
  const normalizedEvents: StoredEvent[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue;

      const value = change.value ?? {};
      const metadata = value.metadata ?? {};
      const contactsByWaId = new Map<string, ContactRecord>();

      for (const contact of value.contacts ?? []) {
        if (contact?.wa_id) contactsByWaId.set(String(contact.wa_id), contact);
      }

      for (const message of value.messages ?? []) {
        normalizedEvents.push({
          kind: 'message',
          receivedAt: now,
          object: payload.object ?? 'whatsapp_business_account',
          entryId: String(entry.id ?? ''),
          field: String(change.field ?? ''),
          phoneNumberId: metadata.phone_number_id ? String(metadata.phone_number_id) : null,
          displayPhoneNumber: metadata.display_phone_number ? String(metadata.display_phone_number) : null,
          waBusinessAccountId: entry.id ? String(entry.id) : null,
          from: message?.from ? String(message.from) : null,
          contact: contactsByWaId.get(String(message?.from ?? '')) ?? null,
          message: normalizeMessage(message),
          status: null,
        });
      }

      for (const status of value.statuses ?? []) {
        normalizedEvents.push({
          kind: 'status',
          receivedAt: now,
          object: payload.object ?? 'whatsapp_business_account',
          entryId: String(entry.id ?? ''),
          field: String(change.field ?? ''),
          phoneNumberId: metadata.phone_number_id ? String(metadata.phone_number_id) : null,
          displayPhoneNumber: metadata.display_phone_number ? String(metadata.display_phone_number) : null,
          waBusinessAccountId: entry.id ? String(entry.id) : null,
          from: status?.recipient_id ? String(status.recipient_id) : null,
          contact: null,
          message: null,
          status: normalizeStatus(status),
        });
      }
    }
  }

  return normalizedEvents;
}

function normalizeMessage(message: IncomingMessage) {
  const type = String(message?.type ?? 'unknown');
  const textBody = message?.text?.body ? String(message.text.body) : null;
  const interactiveTitle =
    message?.interactive?.button_reply?.title ??
    message?.interactive?.list_reply?.title ??
    null;
  const interactiveId =
    message?.interactive?.button_reply?.id ??
    message?.interactive?.list_reply?.id ??
    null;

  return {
    id: message?.id ? String(message.id) : null,
    from: message?.from ? String(message.from) : null,
    timestamp: message?.timestamp ? String(message.timestamp) : null,
    type,
    text: textBody,
    button: message?.button?.text ? String(message.button.text) : null,
    interactive: interactiveTitle || interactiveId ? {
      title: interactiveTitle ? String(interactiveTitle) : null,
      id: interactiveId ? String(interactiveId) : null,
    } : null,
    image: message?.image ? {
      id: message.image.id ? String(message.image.id) : null,
      mimeType: message.image.mime_type ? String(message.image.mime_type) : null,
      caption: message.image.caption ? String(message.image.caption) : null,
    } : null,
    document: message?.document ? {
      id: message.document.id ? String(message.document.id) : null,
      mimeType: message.document.mime_type ? String(message.document.mime_type) : null,
      filename: message.document.filename ? String(message.document.filename) : null,
      caption: message.document.caption ? String(message.document.caption) : null,
    } : null,
    audio: message?.audio ? {
      id: message.audio.id ? String(message.audio.id) : null,
      mimeType: message.audio.mime_type ? String(message.audio.mime_type) : null,
      voice: Boolean(message.audio.voice),
    } : null,
    video: message?.video ? {
      id: message.video.id ? String(message.video.id) : null,
      mimeType: message.video.mime_type ? String(message.video.mime_type) : null,
      caption: message.video.caption ? String(message.video.caption) : null,
    } : null,
    location: message?.location ? {
      latitude: message.location.latitude ?? null,
      longitude: message.location.longitude ?? null,
      name: message.location.name ? String(message.location.name) : null,
      address: message.location.address ? String(message.location.address) : null,
    } : null,
    contacts: Array.isArray(message?.contacts) ? message.contacts : null,
    referral: message?.referral ?? null,
    context: message?.context ?? null,
    rawTypePayload: isRecord(message[type]) ? message[type] : null,
  };
}

function normalizeDeliveryStatus(status: string | null | undefined) {
  const value = String(status ?? '').toLowerCase();
  if (value === 'sent') return 'sent';
  if (value === 'delivered') return 'delivered';
  if (value === 'read') return 'read';
  if (value === 'failed') return 'failed';
  return 'unknown';
}

function normalizeStatus(status: IncomingStatus) {
  return {
    id: status?.id ? String(status.id) : null,
    recipientId: status?.recipient_id ? String(status.recipient_id) : null,
    status: status?.status ? String(status.status) : null,
    timestamp: status?.timestamp ? String(status.timestamp) : null,
    conversation: status?.conversation ?? null,
    pricing: status?.pricing ?? null,
    errors: Array.isArray(status?.errors) ? status.errors : null,
  };
}

function makePreview(message: ReturnType<typeof normalizeMessage>): string {
  if (message.text) return message.text;
  if (message.button) return `[button] ${message.button}`;
  if (message.interactive?.title) return `[interactive] ${message.interactive.title}`;
  if (message.image?.caption) return `[image] ${message.image.caption}`;
  if (message.document?.filename) return `[document] ${message.document.filename}`;
  if (message.audio) return message.audio.voice ? '[voice]' : '[audio]';
  if (message.video?.caption) return `[video] ${message.video.caption}`;
  if (message.location?.name) return `[location] ${message.location.name}`;
  return `[${message.type}]`;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

type StoredEvent = {
  kind: 'message' | 'status';
  receivedAt: string;
  object: string;
  entryId: string;
  field: string;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  waBusinessAccountId: string | null;
  from: string | null;
  contact: ContactRecord | null;
  message: ReturnType<typeof normalizeMessage> | null;
  status: ReturnType<typeof normalizeStatus> | null;
};
