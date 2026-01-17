import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time in UTC
    const now = new Date();

    // Create time window (±10 minutes)
    const WINDOW_MINUTES = 10;
    const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
    const windowEnd = new Date(now.getTime() + WINDOW_MINUTES * 60 * 1000);

    // Fetch pending posts within time window
    // Note: We need to combine date and time for comparison
    const allPendingPosts = await prisma.post.findMany({
      where: {
        isPublished: false,
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

    // Filter posts by combining date and time
    const posts = allPendingPosts.filter((post: any) => {
      // Combine publishDate and publishTime
      const dateStr = post.publishDate.toISOString().split('T')[0];
      const timeStr = post.publishTime.toISOString().split('T')[1];
      const combinedDateTime = new Date(`${dateStr}T${timeStr}`);

      return combinedDateTime >= windowStart && combinedDateTime <= windowEnd;
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
        publishDate: post.publishDate,
        publishTime: post.publishTime,
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
