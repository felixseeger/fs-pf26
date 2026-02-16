import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const path = body?.path || '/';

  revalidatePath(path, 'layout');

  return NextResponse.json({ revalidated: true, path });
}
