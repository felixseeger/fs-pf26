import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'validation_failed', message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { fullName, email, subject, service, message, heardFrom } = body;

  if (!fullName || !email || !message) {
    return NextResponse.json(
      { status: 'validation_failed', message: 'Name, email, and message are required.' },
      { status: 400 }
    );
  }

  try {
    await sendContactEmails({ fullName, email, subject, service, message, heardFrom });
    return NextResponse.json({ status: 'mail_sent', message: 'Your message has been sent.' });
  } catch (err) {
    console.error('[contact] Email send error:', err);
    return NextResponse.json(
      { status: 'mail_failed', message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
