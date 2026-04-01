import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? process.env.whatsapp_verify_token;
const APP_SECRET = process.env.WHATSAPP_SECRET ?? process.env.whatsapp_secret;

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
    return new NextResponse('Server error', { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifySignature(body, signature, APP_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = JSON.parse(body);

  if (payload.object === 'whatsapp_business_account') {
    payload.entry?.forEach((entry: any) => {
      entry.changes?.forEach((change: any) => {
        if (change.field === 'messages') {
          change.value.messages?.forEach((message: any) => {
            console.log('Incoming WhatsApp message:', message);
          });
        }

        change.value.statuses?.forEach((status: any) => {
          console.log('WhatsApp status update:', status);
        });
      });
    });
  }

  return new NextResponse('OK');
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
