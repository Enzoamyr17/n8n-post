import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email is provided
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required in request body' },
        { status: 400 }
      );
    }

    // Get current time in UTC
    const now = new Date();

    // Create time window (±10 minutes)
    const WINDOW_MINUTES = 10;
    const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
    const windowEnd = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);

    // Fetch pending posts within time window for the specified user email
    const posts = await prisma.post.findMany({
      where: {
        isPublished: false,
        publishDateTime: {
          gte: windowStart,
          lte: windowEnd,
        },
        user: {
          email: email,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        files: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: posts.length,
      checkTime: now.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      posts: posts.map((post: any) => ({
        id: post.id,
        userId: post.userId.toString(),
        userName: `${post.user.firstName} ${post.user.lastName || ''}`.trim(),
        userEmail: post.user.email,
        caption: post.caption,
        files: post.files.map((f: any) => ({
          url: f.url,
          caption: f.caption,
        })),
        type: post.type,
        isVideo: post.isVideo,
        publishDateTime: post.publishDateTime,
      })),
    });

  } catch (error) {
    console.error('Error fetching pending posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
