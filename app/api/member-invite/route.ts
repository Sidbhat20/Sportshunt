import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type InvitePayload = {
  email: string;
  name: string;
  role: string;
  organizationName: string;
};

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as InvitePayload;
    if (!payload.email || !payload.organizationName || !payload.name || !payload.role) {
      return NextResponse.json({ ok: false, error: 'Missing invite payload.' }, { status: 400 });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json(
        { ok: false, mode: 'fallback', error: 'SMTP not configured.' },
        { status: 200 },
      );
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    await transporter.sendMail({
      from,
      to: payload.email,
      subject: `Sportshunt invite • ${payload.organizationName}`,
      text: [
        `Hi ${payload.name},`,
        '',
        `You've been invited to join ${payload.organizationName} on Sportshunt as ${payload.role}.`,
        '',
        'Open Sportshunt and sign in with your assigned testing credential to continue.',
        '',
        '— Sportshunt',
      ].join('\n'),
    });

    return NextResponse.json({ ok: true, mode: 'smtp' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown invite error.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
