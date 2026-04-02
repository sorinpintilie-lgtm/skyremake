import { getStore } from '@netlify/blobs';

const STORE_NAME = 'whatsapp-inbox';

type InboxMessage = {
  messageId: string;
  direction: 'inbound' | 'outbound';
  contactId: string;
  from: string | null;
  to: string | null;
  contactName: string | null;
  receivedAt: string;
  timestamp: string | null;
  type: string;
  preview: string;
  text: string | null;
  phoneNumberId: string | null;
  displayPhoneNumber: string | null;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  source: 'whatsapp-business';
  raw: unknown;
};

export function getWhatsappInboxStore() {
  return getStore(STORE_NAME);
}

export async function saveInboxMessage(message: InboxMessage) {
  const store = getWhatsappInboxStore();
  const key = inboxKey(message.direction, message.messageId);
  await store.setJSON(key, message);
}

export async function getInboxMessage(messageId: string): Promise<InboxMessage | null> {
  const store = getWhatsappInboxStore();
  const inbound = await store.get(inboxKey('inbound', messageId), { type: 'json' });
  if (inbound) return inbound as InboxMessage;
  const outbound = await store.get(inboxKey('outbound', messageId), { type: 'json' });
  return (outbound as InboxMessage | null) ?? null;
}

export async function listInboxMessages(options?: { onlyUnacknowledged?: boolean; limit?: number; contactId?: string }) {
  const store = getWhatsappInboxStore();
  const limit = options?.limit ?? 100;
  const [inbound, outbound] = await Promise.all([
    store.list({ prefix: 'inbound/', paginate: false }),
    store.list({ prefix: 'outbound/', paginate: false }),
  ]);

  const blobs = [...inbound.blobs, ...outbound.blobs]
    .sort((a, b) => {
      const aTs = getBlobTimestamp(a);
      const bTs = getBlobTimestamp(b);
      return bTs - aTs;
    })
    .slice(0, Math.max(limit * 4, limit));

  const rows = await Promise.all(
    blobs.map(async (blob) => {
      const value = await store.get(blob.key, { type: 'json' });
      return value as InboxMessage | null;
    }),
  );

  let filtered = rows.filter((row): row is InboxMessage => Boolean(row));
  if (options?.onlyUnacknowledged) filtered = filtered.filter((row) => row.acknowledged !== true);
  if (options?.contactId) filtered = filtered.filter((row) => row.contactId === options.contactId);
  return filtered.slice(0, limit);
}

export async function listConversationSummaries(limit = 100) {
  const messages = await listInboxMessages({ limit: 500 });
  const map = new Map<string, { contactId: string; contactName: string | null; lastMessageAt: string; lastPreview: string; unreadCount: number; lastDirection: 'inbound' | 'outbound' }>();

  for (const message of messages) {
    const current = map.get(message.contactId);
    if (!current || current.lastMessageAt < message.receivedAt) {
      map.set(message.contactId, {
        contactId: message.contactId,
        contactName: message.contactName,
        lastMessageAt: message.receivedAt,
        lastPreview: message.preview,
        unreadCount: message.direction === 'inbound' && !message.acknowledged ? 1 : 0,
        lastDirection: message.direction,
      });
    } else if (message.direction === 'inbound' && !message.acknowledged) {
      current.unreadCount += 1;
    }
  }

  return Array.from(map.values())
    .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
    .slice(0, limit);
}

function getBlobTimestamp(blob: unknown) {
  if (!blob || typeof blob !== 'object') return 0;
  const value = blob as { uploaded_at?: string; uploadedAt?: string };
  const raw = value.uploaded_at ?? value.uploadedAt ?? null;
  return raw ? Date.parse(raw) || 0 : 0;
}

export async function acknowledgeInboxMessage(messageId: string) {
  const current = await getInboxMessage(messageId);
  if (!current) return null;

  const updated: InboxMessage = {
    ...current,
    acknowledged: true,
    acknowledgedAt: new Date().toISOString(),
  };

  await saveInboxMessage(updated);
  return updated;
}

export function inboxKey(direction: 'inbound' | 'outbound', messageId: string) {
  return `${direction}/${messageId}.json`;
}

export type { InboxMessage };
