import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? process.env.whatsapp_verify_token;
const APP_SECRET = process.env.WHATSAPP_SECRET ?? process.env.whatsapp_secret;
const WEBHOOK_STORE_DIR = process.env.WHATSAPP_WEBHOOK_STORE_DIR ?? path.join(process.cwd(), 'data', 'whatsapp');
const EVENTS_FILE = path.join(WEBHOOK_STORE_DIR, 'events.ndjson');
const THREADS_FILE = path.join(WEBHOOK_STORE_DIR, 'threads.json');
const INBOX_FILE = path.join(WEBHOOK_STORE_DIR, 'inbox.json');

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
          object: payload.object,
          entryId: String(entry.id ?? ''),
          field: String(change.field ?? ''),
          phoneNumberId: metadata.phone_number_id ? String(metadata.phone_number_id) : null,
          displayPhoneNumber: metadata.display_phone_number ? String(metadata.display_phone_number) : null,
          waBusinessAccountId: entry.id ? String(entry.id) : null,
          from: message?.from ? String(message.from) : null,
          contact: contactsByWaId.get(String(message?.from ?? '')) ?? null,
          message: normalizeMessage(message),
          status: null,
          raw: { entry, change, value, message },
        });
      }

      for (const status of value.statuses ?? []) {
        normalizedEvents.push({
          kind: 'status',
          receivedAt: now,
          object: payload.object,
          entryId: String(entry.id ?? ''),
          field: String(change.field ?? ''),
          phoneNumberId: metadata.phone_number_id ? String(metadata.phone_number_id) : null,
          displayPhoneNumber: metadata.display_phone_number ? String(metadata.display_phone_number) : null,
          waBusinessAccountId: entry.id ? String(entry.id) : null,
          from: status?.recipient_id ? String(status.recipient_id) : null,
          contact: null,
          message: null,
          status: normalizeStatus(status),
          raw: { entry, change, value, status },
        });
      }
    }
  }

  await persistEvents(normalizedEvents);

  return NextResponse.json({
    ok: true,
    processed: normalizedEvents.length,
    messages: normalizedEvents.filter((event) => event.kind === 'message').length,
    statuses: normalizedEvents.filter((event) => event.kind === 'status').length,
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

async function persistEvents(events: StoredEvent[]) {
  if (!events.length) return;

  await fs.mkdir(WEBHOOK_STORE_DIR, { recursive: true });

  const ndjson = events.map((event) => JSON.stringify(event)).join('\n') + '\n';
  await fs.appendFile(EVENTS_FILE, ndjson, 'utf8');

  const threads = await readJson<Record<string, ThreadRecord>>(THREADS_FILE, {});
  const inbox = await readJson<InboxRecord[]>(INBOX_FILE, []);
  const inboxByMessageId = new Map(inbox.map((item) => [item.messageId, item]));

  for (const event of events) {
    if (event.kind !== 'message' || !event.message?.id) continue;

    const contactId = event.from ?? 'unknown';
    const existingThread = threads[contactId];
    const contactName =
      event.contact?.profile?.name ? String(event.contact.profile.name) :
      existingThread?.contactName ??
      null;
    const messagePreview = makePreview(event.message);

    const thread: ThreadRecord = existingThread ?? {
      contactId,
      contactName,
      lastMessageAt: event.receivedAt,
      lastMessageId: event.message.id,
      unreadCount: 0,
      phoneNumberId: event.phoneNumberId,
      displayPhoneNumber: event.displayPhoneNumber,
      messages: [],
    };

    thread.contactName = contactName;
    thread.lastMessageAt = event.receivedAt;
    thread.lastMessageId = event.message.id;
    thread.phoneNumberId = event.phoneNumberId ?? thread.phoneNumberId ?? null;
    thread.displayPhoneNumber = event.displayPhoneNumber ?? thread.displayPhoneNumber ?? null;
    thread.unreadCount = (thread.unreadCount ?? 0) + 1;
    thread.messages.push({
      id: event.message.id,
      receivedAt: event.receivedAt,
      timestamp: event.message.timestamp,
      type: event.message.type,
      preview: messagePreview,
      text: event.message.text,
    });
    thread.messages = thread.messages.slice(-50);
    threads[contactId] = thread;

    if (!inboxByMessageId.has(event.message.id)) {
      const item: InboxRecord = {
        messageId: event.message.id,
        contactId,
        contactName,
        receivedAt: event.receivedAt,
        timestamp: event.message.timestamp,
        type: event.message.type,
        preview: messagePreview,
        text: event.message.text,
        phoneNumberId: event.phoneNumberId,
        displayPhoneNumber: event.displayPhoneNumber,
        acknowledged: false,
      };
      inbox.push(item);
      inboxByMessageId.set(item.messageId, item);
    }
  }

  await fs.writeFile(THREADS_FILE, JSON.stringify(threads, null, 2) + '\n', 'utf8');
  await fs.writeFile(INBOX_FILE, JSON.stringify(inbox, null, 2) + '\n', 'utf8');
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error: unknown) {
    if (isErrorWithCode(error) && error.code === 'ENOENT') return fallback;
    throw error;
  }
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

function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error;
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
  raw: UnknownRecord;
};

type ThreadRecord = {
  contactId: string;
  contactName: string | null;
  lastMessageAt: string;
  lastMessageId: string;
  unreadCount: number;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  messages: Array<{
    id: string;
    receivedAt: string;
    timestamp: string | null;
    type: string;
    preview: string;
    text: string | null;
  }>;
};

type InboxRecord = {
  messageId: string;
  contactId: string;
  contactName: string | null;
  receivedAt: string;
  timestamp: string | null;
  type: string;
  preview: string;
  text: string | null;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  acknowledged: boolean;
};
