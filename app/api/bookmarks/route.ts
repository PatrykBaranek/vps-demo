import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleLink, articleTitle, articleSource } = body;

    if (!articleLink) {
      return NextResponse.json({ error: 'Article link is required' }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        articleLink,
        articleTitle,
        articleSource,
      },
    });

    return NextResponse.json({ success: true, bookmark });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
    }
    console.error('Failed to create bookmark:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleLink } = body;

    if (!articleLink) {
      return NextResponse.json({ error: 'Article link is required' }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: session.user.id,
        articleLink,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete bookmark:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}