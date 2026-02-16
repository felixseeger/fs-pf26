import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const wpUrl = (process.env.WORDPRESS_API_URL || '').replace(/\/+$/, '');
  const formId = process.env.CONTACT_FORM_7_ID || '';

  if (!wpUrl || !formId) {
    return NextResponse.json(
      { status: 'validation_failed', message: 'Contact form is not configured on the server.' },
      { status: 500 }
    );
  }

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

  const formData = new FormData();
  formData.append('_wpcf7', formId);
  formData.append('_wpcf7_version', '5.8');
  formData.append('_wpcf7_locale', 'en_US');
  formData.append('_wpcf7_unit_tag', `wpcf7-f${formId}-o1`);
  formData.append('your-name', fullName);
  formData.append('your-email', email);
  if (subject) formData.append('your-subject', subject);
  if (service) formData.append('your-service', service);
  formData.append('your-message', message);
  if (heardFrom) formData.append('your-heard-from', heardFrom);

  try {
    const cf7Res = await fetch(
      `${wpUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
      { method: 'POST', body: formData }
    );

    const data = await cf7Res.json();
    console.log('[contact] CF7 response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data, { status: cf7Res.status });
  } catch (err) {
    return NextResponse.json(
      { status: 'mail_failed', message: err instanceof Error ? err.message : 'Failed to reach WordPress.' },
      { status: 502 }
    );
  }
}
