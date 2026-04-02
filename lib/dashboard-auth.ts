import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const DASHBOARD_COOKIE = 'sky_bridge_session';

export function getDashboardConfig() {
  return {
    username: process.env.WHATSAPP_DASHBOARD_USERNAME ?? '',
    password: process.env.WHATSAPP_DASHBOARD_PASSWORD ?? '',
    sessionSecret: process.env.WHATSAPP_DASHBOARD_SESSION_SECRET ?? '',
  };
}

export function hasDashboardCredentials() {
  const cfg = getDashboardConfig();
  return Boolean(cfg.username && cfg.password && cfg.sessionSecret);
}

export function createSessionValue(username: string, sessionSecret: string) {
  return crypto.createHmac('sha256', sessionSecret).update(username).digest('hex');
}

export async function isDashboardAuthenticated() {
  const cfg = getDashboardConfig();
  if (!cfg.username || !cfg.sessionSecret) return false;
  const store = await cookies();
  const value = store.get(DASHBOARD_COOKIE)?.value;
  if (!value) return false;
  return value === createSessionValue(cfg.username, cfg.sessionSecret);
}
