import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';

// GET - List posts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = { userId: user.id };

    if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'pending') {
      where.isPublished = false;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          files: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = createPostSchema.parse(body);
    const { caption, publishDateTime, files } = validatedData;

    // Check if date is in the past
    const utcDateTime = new Date(publishDateTime);
    if (utcDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot schedule post in the past' },
        { status: 400 }
      );
    }

    // Auto-detect post type based on files
    const isVideo = files.some((f: any) =>
      f.url.toLowerCase().includes('video') ||
      f.url.toLowerCase().includes('.mp4') ||
      f.url.toLowerCase().includes('.mov') ||
      f.url.toLowerCase().includes('.avi') ||
      f.url.toLowerCase().includes('.webm')
    );

    // Determine post type automatically
    let type: 'SINGLE_IMAGE' | 'SINGLE_VIDEO' | 'MULTIPLE_IMAGES';
    if (isVideo) {
      type = 'SINGLE_VIDEO'; // Only single video allowed
    } else if (files.length === 1) {
      type = 'SINGLE_IMAGE';
    } else {
      type = 'MULTIPLE_IMAGES';
    }

    // Create post with files
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        caption,
        publishDateTime: utcDateTime,
        type,
        typeCount: files.length,
        isVideo,
        files: {
          create: files.map((file: any) => ({
            url: file.url,
            caption: file.caption || '',
          })),
        },
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json({
      success: true,
      post,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating post:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
