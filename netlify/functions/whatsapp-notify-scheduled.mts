import type { Config } from '@netlify/functions';

const BASE_URL = process.env.SITE_URL ?? 'https://sky.ro';
const AUTH_TOKEN = process.env.WHATSAPP_READ_AUTH_TOKEN ?? process.env.WHATSAPP_SEND_AUTH_TOKEN ?? process.env.OPENCLAW_HOOK_TOKEN;

export default async function handler() {
  if (!AUTH_TOKEN) {
    console.error('[whatsapp-notify-scheduled] Missing auth token configuration');
    return new Response(JSON.stringify({ ok: false, error: 'Missing auth token configuration' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const response = await fetch(`${BASE_URL}/api/whatsapp-notify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('[whatsapp-notify-scheduled] notify failed', response.status, text);
    return new Response(text || JSON.stringify({ ok: false, error: 'Notify failed' }), {
      status: response.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(text || JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export const config: Config = {
  schedule: '*/5 * * * *',
};
