"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Message = {
  messageId: string;
  direction: 'inbound' | 'outbound';
  contactId: string;
  from: string | null;
  to: string | null;
  contactName: string | null;
  receivedAt: string;
  preview: string;
  text: string | null;
  acknowledged: boolean;
  deliveryStatus?: 'accepted' | 'sent' | 'delivered' | 'read' | 'failed' | 'unknown' | null;
  statusUpdatedAt?: string | null;
  statusHistory?: Array<{
    status: 'accepted' | 'sent' | 'delivered' | 'read' | 'failed' | 'unknown';
    timestamp: string | null;
    receivedAt: string;
    errorMessage?: string | null;
    errorCode?: number | null;
  }>;
};

type Conversation = {
  contactId: string;
  contactName: string | null;
  lastMessageAt: string;
  lastPreview: string;
  unreadCount: number;
  lastDirection: 'inbound' | 'outbound';
};

function normalizeContactId(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

function getConversationKey(message: Message) {
  return message.direction === 'inbound'
    ? normalizeContactId(message.from || message.contactId)
    : normalizeContactId(message.to || message.contactId);
}

function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const byId = new Map(existing.map((item) => [item.messageId, item]));
  for (const message of incoming) {
    byId.set(message.messageId, message);
  }
  return Array.from(byId.values());
}

function buildConversations(items: Message[]): Conversation[] {
  const map = new Map<string, Conversation>();
  for (const message of items) {
    const key = getConversationKey(message);
    if (!key) continue;
    const current = map.get(key);
    if (!current || current.lastMessageAt < message.receivedAt) {
      map.set(key, {
        contactId: key,
        contactName: message.contactName,
        lastMessageAt: message.receivedAt,
        lastPreview: message.preview,
        unreadCount: message.direction === 'inbound' && !message.acknowledged ? 1 : 0,
        lastDirection: message.direction,
      });
    } else if (message.direction === 'inbound' && !message.acknowledged) {
      current.unreadCount += 1;
      if (!current.contactName && message.contactName) current.contactName = message.contactName;
    }
  }
  return Array.from(map.values()).sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
}

function getLatestTimestamp(items: Message[]): string | null {
  if (!items.length) return null;
  let latest = items[0].receivedAt;
  for (let i = 1; i < items.length; i++) {
    if (items[i].receivedAt > latest) latest = items[i].receivedAt;
  }
  return latest;
}

export default function BridgeDashboard() {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [manualTo, setManualTo] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const latestRef = useRef<string | null>(null);
  const autoSelectedRef = useRef(false);

  const loadFull = useCallback(async () => {
    const res = await fetch('/api/bridge/messages', { cache: 'no-store' });
    const data = await res.json();
    if (data.ok) {
      setAllMessages(data.items);
      latestRef.current = getLatestTimestamp(data.items);
    }
  }, []);

  const loadDelta = useCallback(async () => {
    const since = latestRef.current;
    const url = since ? `/api/bridge/delta?since=${encodeURIComponent(since)}` : '/api/bridge/delta';
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.ok && data.items.length > 0) {
        setAllMessages((prev) => mergeMessages(prev, data.items));
        latestRef.current = getLatestTimestamp(data.items) ?? latestRef.current;
      }
    } catch {
      // silent
    }
  }, []);

  const sendDelta = useCallback(async () => {
    await loadDelta();
  }, [loadDelta]);

  useEffect(() => {
    const initial = setTimeout(() => {
      void loadFull();
    }, 0);
    const id = setInterval(() => {
      void sendDelta();
    }, 3000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [loadFull, sendDelta]);

  const conversations = useMemo(() => buildConversations(allMessages), [allMessages]);
  const normalizedSelected = useMemo(() => normalizeContactId(selected), [selected]);
  const selectedConversation = useMemo(
    () => conversations.find((item) => item.contactId === normalizedSelected) ?? null,
    [conversations, normalizedSelected],
  );
  const messages = useMemo(
    () => allMessages.filter((item) => getConversationKey(item) === normalizedSelected),
    [allMessages, normalizedSelected],
  );

  useEffect(() => {
    if (autoSelectedRef.current) return;
    if (!conversations.length) return;
    autoSelectedRef.current = true;
    const firstId = conversations[0].contactId;
    if (firstId) {
      const timer = setTimeout(() => setSelected(firstId), 0);
      return () => clearTimeout(timer);
    }
  }, [conversations]);

  useEffect(() => {
    const unacked = messages
      .filter((item) => item.direction === 'inbound' && !item.acknowledged)
      .map((item) => item.messageId);
    if (!unacked.length) return;
    const initial = setTimeout(() => {
      void fetch('/api/bridge/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds: unacked }),
      }).then(() => {
        setAllMessages((prev) =>
          prev.map((item) =>
            unacked.includes(item.messageId) ? { ...item, acknowledged: true } : item,
          ),
        );
      });
    }, 0);
    return () => clearTimeout(initial);
  }, [messages]);

  async function sendMessage() {
    const selectedId = normalizedSelected;
    const contactName = selectedConversation?.contactName;
    const to = selectedId || normalizeContactId(manualTo);
    const text = draft.trim();
    if (!to || !text) return;

    const targetLabel = contactName ? `${contactName} (+${to})` : `+${to}`;
    console.log('[bridge] send:start', {
      selectedId,
      contactName,
      to,
      targetLabel,
      text,
      timestamp: new Date().toISOString(),
    });

    if (!selectedId) {
      setError(`Se trimite către: ${targetLabel}. Confirmă manual că e corect.`);
      return;
    }

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/bridge/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, text }),
      });
      const data = await res.json().catch(() => ({}));
      console.log('[bridge] send:response', { status: res.status, ok: res.ok, data, targetLabel });
      setSending(false);
      if (!res.ok || !data.ok) {
        setError(data?.details?.error?.message || data?.error || 'Mesajul nu a putut fi trimis.');
        console.error('[bridge] send:error', { status: res.status, data, targetLabel });
        return;
      }
      setDraft('');
      await loadDelta();
      console.log('[bridge] send:done', { to, targetLabel, timestamp: new Date().toISOString() });
    } catch (err) {
      setSending(false);
      const message = err instanceof Error ? err.message : 'Unknown send error';
      setError(message);
      console.error('[bridge] send:exception', err);
    }
  }

  async function logout() {
    await fetch('/api/bridge/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">Hidden inbox</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">WhatsApp Bridge</h1>
            <div className="mt-1 text-xs text-white/45">
              {conversations.length} conversații · {allMessages.length} mesaje · live 3s
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.1]"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 backdrop-blur-xl">
            <div className="mb-3 px-2 text-xs uppercase tracking-[0.22em] text-white/45">Conversații</div>
            <div className="space-y-2">
              {conversations.map((item) => (
                <button
                  key={item.contactId}
                  onClick={() => setSelected(item.contactId)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selected === item.contactId
                      ? 'border-white/28 bg-white/[0.08]'
                      : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.contactName || `+${item.contactId}`}
                      </div>
                      <div className="mt-1 text-xs text-white/42">+{item.contactId}</div>
                    </div>
                    {item.unreadCount > 0 ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
                        {item.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-white/62">{item.lastPreview}</div>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(90%_120%_at_10%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_44%,rgba(0,0,0,0.4))] p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Conversație activă</div>
                <div className="mt-1 text-lg font-semibold">
                  {selectedConversation?.contactName || (selected ? `+${selected}` : 'Selectează o conversație')}
                </div>
              </div>
            </div>

            <div className="mb-4 h-[52vh] overflow-y-auto rounded-[24px] border border-white/8 bg-black/20 p-3">
              <div className="space-y-3">
                {messages.map((message) => {
                  const lastStatus = message.statusHistory?.[message.statusHistory.length - 1] ?? null;
                  const failureReason = message.deliveryStatus === 'failed'
                    ? lastStatus?.errorMessage || (lastStatus?.errorCode ? `Error ${lastStatus.errorCode}` : 'Unknown failure')
                    : null;

                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.direction === 'outbound'
                            ? 'bg-white text-black'
                            : 'border border-white/10 bg-white/[0.04] text-white'
                        }`}
                      >
                        <div>{message.text || message.preview}</div>
                        <div
                          className={`mt-2 text-[11px] ${message.direction === 'outbound' ? 'text-black/55' : 'text-white/42'}`}
                        >
                          {new Date(message.receivedAt).toLocaleString('ro-RO')}
                          {message.direction === 'outbound' && message.deliveryStatus ? ` · ${message.deliveryStatus}` : ''}
                        </div>
                        {failureReason ? (
                          <div className="mt-1 text-[11px] text-red-500">{failureReason}</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {!messages.length ? (
                  <div className="text-sm text-white/45">
                    Nu există mesaje încă în această conversație.
                  </div>
                ) : null}
                {!!messages.length ? (
                  <div className="pt-2 text-center text-[11px] uppercase tracking-[0.18em] text-white/28">
                    {messages.length} mesaje încărcate
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              {!selectedConversation ? (
                <input
                  value={manualTo}
                  onChange={(e) => setManualTo(e.target.value)}
                  placeholder="Număr (ex: 4077...)"
                  className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                />
              ) : null}
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="Scrie mesajul aici..."
                className="resize-none rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                {error ? (
                  <div className="max-w-[70%] text-sm text-red-300">{error}</div>
                ) : (
                  <div className="text-xs uppercase tracking-[0.18em] text-white/36">
                    Live 3s · delta merge · sursă: Netlify Blobs
                  </div>
                )}
                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                >
                  {sending ? 'Se trimite...' : 'Trimite mesajul'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
