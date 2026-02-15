import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, '') || '';
const CF7_FORM_ID = process.env.CONTACT_FORM_7_ID || '';

/** GET /api/contact?formId=357 - fetch CF7 form schema for debugging */
export async function GET(request: NextRequest) {
    const formId = request.nextUrl.searchParams.get('formId') || CF7_FORM_ID;
    if (!formId || !WORDPRESS_API_URL) {
        return NextResponse.json({ error: 'Missing formId or WORDPRESS_API_URL' }, { status: 400 });
    }
    const url = `${WORDPRESS_API_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    let formId = request.headers.get('x-cf7-form-id') || CF7_FORM_ID;

    // CF7 REST API expects numeric post ID; support hex IDs (e.g. a1672c2 -> 169241282)
    if (formId && /^[a-fA-F0-9]+$/.test(formId) && /[a-fA-F]/.test(formId)) {
        const decimal = parseInt(formId, 16);
        if (!Number.isNaN(decimal)) formId = String(decimal);
    }

    if (!formId) {
        return NextResponse.json(
            { status: 'error', message: 'Contact Form 7 ID not configured. Set CONTACT_FORM_7_ID in .env' },
            { status: 500 }
        );
    }

    if (!WORDPRESS_API_URL) {
        return NextResponse.json(
            { status: 'error', message: 'WordPress API URL not configured' },
            { status: 500 }
        );
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { status: 'error', message: 'Invalid JSON body' },
            { status: 400 }
        );
    }

    // Map our form fields to CF7 default field names
    // CF7 default form: your-name, your-email, your-subject, your-message
    // Required CF7 fields: _wpcf7_unit_tag, _wpcf7, _wpcf7_version
    const cf7Fields: Record<string, string> = {
        '_wpcf7_unit_tag': `wpcf7-f${formId}-o1`,
        '_wpcf7': formId,
        '_wpcf7_version': '5.8',
        '_wpcf7_locale': 'en_US',
        'your-name': String(body.fullName ?? body.name ?? ''),
        'your-email': String(body.email ?? ''),
        'your-subject': String(body.subject ?? ''),
        'your-message': String(body.message ?? ''),
    };

    // Optional: service, heard-from (if your CF7 form has these)
    if (body.service) cf7Fields['your-service'] = String(body.service);
    if (body.heardFrom) cf7Fields['your-heard-from'] = String(body.heardFrom);

    const url = `${WORDPRESS_API_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

    try {
        const formData = new FormData();
        for (const [key, value] of Object.entries(cf7Fields)) {
            formData.append(key, value);
        }

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
            redirect: 'manual', // prevent POST->GET on 301/302 (body would be lost)
        });

        // Redirect loses POST body - use https in WORDPRESS_API_URL
        if (res.status >= 301 && res.status < 400) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: `WordPress redirected (${res.status}). Use https in WORDPRESS_API_URL (e.g. https://fs26-back.felixseeger.de)`,
                },
                { status: 502 }
            );
        }

        const text = await res.text();
        const data = (() => {
            try {
                return JSON.parse(text) as Record<string, unknown>;
            } catch {
                return {} as Record<string, unknown>;
            }
        })();

        // Log for debugging (check terminal running npm run dev)
        if (process.env.NODE_ENV === 'development') {
            console.log('[contact API] CF7 response:', res.status, data);
        }

        if (!res.ok) {
            const msg = (data.message as string) || res.statusText || 'Request failed';
            return NextResponse.json(
                { status: 'error', message: msg, details: data },
                { status: res.status }
            );
        }

        // CF7 returns: mail_sent, mail_failed, validation_failed
        if (data.status === 'mail_sent') {
            return NextResponse.json({ status: 'success', message: (data.message as string) || 'Message sent' });
        }

        if (data.status === 'mail_failed') {
            const msg =
                (data.message as string) ||
                'Email could not be sent. Please check WordPress mail settings (SMTP / wp_mail).';
            return NextResponse.json(
                { status: 'error', message: msg, details: data },
                { status: 500 }
            );
        }

        if (data.status === 'validation_failed' && data.invalid_fields) {
            return NextResponse.json(
                { status: 'validation_failed', message: data.message, invalid_fields: data.invalid_fields },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { status: 'error', message: data.message || 'Form submission failed' },
            { status: 400 }
        );
    } catch (err) {
        console.error('CF7 API error:', err);
        return NextResponse.json(
            { status: 'error', message: 'Failed to submit form. Please try again.' },
            { status: 502 }
        );
    }
}
