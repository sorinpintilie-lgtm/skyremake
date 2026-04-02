This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## WhatsApp Business webhook -> OpenClaw

`app/api/webhook/route.ts` is wired for Meta WhatsApp Business inbound events and forwards normalized events into OpenClaw hook ingress.

Required environment variables:

- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_SECRET`
- `OPENCLAW_HOOK_URL` — example: `http://YOUR_OPENCLAW_HOST:18789/hooks/agent`
- `OPENCLAW_HOOK_TOKEN`
- `WHATSAPP_BUSINESS_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_WABA_ID`
- `WHATSAPP_BUSINESS_ACCESS_TOKEN`

Optional environment variables:

- `OPENCLAW_HOOK_AGENT_ID` — default: `main`
- `OPENCLAW_HOOK_SESSION_KEY` — default: `hook:whatsapp-business`
- `OPENCLAW_HOOK_TIMEOUT_MS` — default: `15000`
- `WHATSAPP_SEND_AUTH_TOKEN` — bearer token for `/api/whatsapp-send`; defaults to `OPENCLAW_HOOK_TOKEN`
- `WHATSAPP_GRAPH_API_VERSION` — default: `v21.0`

Behavior:

- verifies Meta challenge on `GET`
- verifies `x-hub-signature-256` on `POST`
- normalizes inbound message and status events
- stores inbound WhatsApp Business messages in Netlify Blobs
- exposes `/api/whatsapp-inbox` for authenticated inbox reads
- exposes `/api/whatsapp-inbox/ack` to mark messages as acknowledged
- exposes `/api/whatsapp-send` for authenticated outbound text sending through WhatsApp Business API

Important:

- The OpenClaw gateway must be reachable from your Netlify function.
- `OPENCLAW_HOOK_TOKEN` must match `hooks.token` in your OpenClaw config.
- If your gateway is loopback-only, you need a public or private reachable URL in front of it before Netlify can call it.
