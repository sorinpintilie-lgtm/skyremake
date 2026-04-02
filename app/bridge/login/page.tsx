"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function BridgeLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/bridge/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok || !data.ok) {
      setError(data?.error || 'Autentificare eșuată');
      return;
    }
    router.push('/bridge');
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#04060c] px-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.14),rgba(255,255,255,0.02)_32%,rgba(0,0,0,0)_70%)]" />
      <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-7 backdrop-blur-2xl">
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">Private entry</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">WhatsApp Bridge</h1>
        <p className="mt-2 text-sm text-white/62">Inbox intern, protejat. Acces doar pentru echipa Sky.</p>
        <div className="mt-6 grid gap-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" />
        </div>
        {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
        <button disabled={loading} className="mt-5 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/92 disabled:opacity-50">{loading ? 'Se autentifică...' : 'Intră în inbox'}</button>
      </form>
    </main>
  );
}
