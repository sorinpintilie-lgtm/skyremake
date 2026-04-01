import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === VERIFY_TOKEN) {
    return new NextResponse(challenge);
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifySignature(body, signature, APP_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = JSON.parse(body);

  if (payload.object === 'whatsapp_business_account') {
    payload.entry.forEach((entry: any) => {
      entry.changes.forEach((change: any) => {
        if (change.field === 'messages') {
          change.value.messages?.forEach((message: any) => {
            console.log('Mesaj primit:', message);
            // Aici poți adăuga logică pentru răspuns
          });
        }
        change.value.statuses?.forEach((status: any) => {
          console.log('Status update:', status);
          // Actualizează statusul mesajului
        });
      });
    });
  }

  return new NextResponse('OK');
}

function verifySignature(body: string, signature: string | null, appSecret: string): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(body, 'utf8')
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature));
}