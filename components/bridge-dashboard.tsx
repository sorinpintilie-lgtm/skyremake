"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

type Conversation = {
  contactId: string;
  contactName: string | null;
  lastMessageAt: string;
  lastPreview: string;
  unreadCount: number;
  lastDirection: 'inbound' | 'outbound';
};

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
};

export default function BridgeDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [manualTo, setManualTo] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/bridge/conversations', { cache: 'no-store' });
    const data = await res.json();
    if (data.ok) {
      setConversations(data.items);
      if (!selected && data.items[0]?.contactId) setSelected(data.items[0].contactId);
    }
  }, [selected]);

  const loadMessages = useCallback(async (contactId: string) => {
    if (!contactId) return;
    const res = await fetch(`/api/bridge/messages?contactId=${encodeURIComponent(contactId)}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.ok) {
      setMessages(data.items);
      const unacked = data.items.filter((item: Message) => item.direction === 'inbound' && !item.acknowledged).map((item: Message) => item.messageId);
      if (unacked.length) {
        await fetch('/api/bridge/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: unacked }),
        });
      }
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => {
      void loadConversations();
    }, 0);
    const id = setInterval(() => {
      void loadConversations();
    }, 15000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!selected) return;
    const initial = setTimeout(() => {
      void loadMessages(selected);
    }, 0);
    const id = setInterval(() => {
      void loadMessages(selected);
    }, 12000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, [selected]);

  const selectedConversation = useMemo(() => conversations.find((item) => item.contactId === selected) ?? null, [conversations, selected]);

  async function sendMessage() {
    const to = (selectedConversation?.contactId || manualTo).trim();
    if (!to || !draft.trim()) return;
    setSending(true);
    setError('');
    const res = await fetch('/api/whatsapp-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 2mKZ0xbBs2Bof9ySf5fArOon8ZBldaLE',
      },
      body: JSON.stringify({ to, text: draft.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok || !data.ok) {
      setError(data?.error || 'Mesajul nu a putut fi trimis.');
      return;
    }
    setDraft('');
    if (!selectedConversation) setManualTo('');
    await loadConversations();
    await loadMessages(to);
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
          </div>
          <button onClick={logout} className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.1]">Logout</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 backdrop-blur-xl">
            <div className="mb-3 px-2 text-xs uppercase tracking-[0.22em] text-white/45">Conversații</div>
            <div className="space-y-2">
              {conversations.map((item) => (
                <button
                  key={item.contactId}
                  onClick={() => setSelected(item.contactId)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${selected === item.contactId ? 'border-white/28 bg-white/[0.08]' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{item.contactName || `+${item.contactId}`}</div>
                      <div className="mt-1 text-xs text-white/42">+{item.contactId}</div>
                    </div>
                    {item.unreadCount > 0 ? <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">{item.unreadCount}</span> : null}
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
                <div className="mt-1 text-lg font-semibold">{selectedConversation?.contactName || (selected ? `+${selected}` : 'Selectează o conversație')}</div>
              </div>
            </div>

            <div className="mb-4 h-[52vh] overflow-y-auto rounded-[24px] border border-white/8 bg-black/20 p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.messageId} className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.direction === 'outbound' ? 'bg-white text-black' : 'border border-white/10 bg-white/[0.04] text-white'}`}>
                      <div>{message.text || message.preview}</div>
                      <div className={`mt-2 text-[11px] ${message.direction === 'outbound' ? 'text-black/55' : 'text-white/42'}`}>{new Date(message.receivedAt).toLocaleString('ro-RO')}</div>
                    </div>
                  </div>
                ))}
                {!messages.length ? <div className="text-sm text-white/45">Nu există mesaje încă în această conversație.</div> : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              {!selectedConversation ? (
                <input value={manualTo} onChange={(e) => setManualTo(e.target.value)} placeholder="Număr (ex: 4077...)" className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" />
              ) : null}
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Scrie mesajul aici..." className="resize-none rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" />
              <div className="flex items-center justify-between gap-3">
                {error ? <div className="text-sm text-red-300">{error}</div> : <div className="text-xs uppercase tracking-[0.18em] text-white/36">Polling 12–15s</div>}
                <button onClick={sendMessage} disabled={sending} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">{sending ? 'Se trimite...' : 'Trimite mesajul'}</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
