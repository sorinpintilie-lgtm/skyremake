import { getStore } from '@netlify/blobs';

const STORE_NAME = 'whatsapp-inbox';

type InboxMessage = {
  messageId: string;
  from: string | null;
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
  const key = inboxKey(message.messageId);
  await store.setJSON(key, message);
}

export async function getInboxMessage(messageId: string): Promise<InboxMessage | null> {
  const store = getWhatsappInboxStore();
  const value = await store.get(inboxKey(messageId), { type: 'json' });
  return (value as InboxMessage | null) ?? null;
}

export async function listInboxMessages(options?: { onlyUnacknowledged?: boolean; limit?: number }) {
  const store = getWhatsappInboxStore();
  const limit = options?.limit ?? 100;
  const { blobs } = await store.list({ prefix: 'inbound/', paginate: false });

  const rows = await Promise.all(
    blobs
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .slice(0, limit)
      .map(async (blob) => {
        const value = await store.get(blob.key, { type: 'json' });
        return value as InboxMessage | null;
      }),
  );

  const filtered = rows.filter((row): row is InboxMessage => Boolean(row));
  if (options?.onlyUnacknowledged) {
    return filtered.filter((row) => row.acknowledged !== true);
  }
  return filtered;
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

export function inboxKey(messageId: string) {
  return `inbound/${messageId}.json`;
}

export type { InboxMessage };
