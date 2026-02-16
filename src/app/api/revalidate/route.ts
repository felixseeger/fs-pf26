import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/** Map WordPress post types to the frontend paths that display them. */
const POST_TYPE_PATHS: Record<string, string[]> = {
  post:      ['/blog'],
  page:      ['/'],
  portfolio: ['/portfolio'],
  service:   ['/services'],
  course:    ['/courses'],
};

/**
 * Extract paths to revalidate from a WordPress webhook payload.
 * Supports both WP Webhooks and CF7-to-Webhook style payloads.
 */
function getPathsFromPayload(body: Record<string, unknown> | null): string[] {
  if (!body) return ['/'];

  // Explicit path override — allows manual curl calls like {"path": "/services"}
  if (typeof body.path === 'string') return [body.path];

  // WordPress webhook payloads typically include post_type
  const post = body.post as Record<string, unknown> | undefined;
  const data = body.data as Record<string, unknown> | undefined;

  const postType =
    (body.post_type as string) ??
    (post?.post_type as string | undefined) ??
    (data?.post_type as string | undefined);

  if (postType && POST_TYPE_PATHS[postType]) {
    const paths = [...POST_TYPE_PATHS[postType]];

    // If a slug is available, also revalidate the detail page
    const slug =
      (body.post_name as string) ??
      (body.slug as string) ??
      (post?.post_name as string | undefined);

    if (slug) {
      for (const base of paths) {
        const detail = base === '/' ? `/${slug}` : `${base}/${slug}`;
        if (!paths.includes(detail)) paths.push(detail);
      }
    }

    return paths;
  }

  // Fallback: revalidate everything
  return ['/'];
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const paths = getPathsFromPayload(body);

  for (const p of paths) {
    revalidatePath(p, 'layout');
  }

  return NextResponse.json({ revalidated: true, paths });
}
