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
    const { caption, publishDate, publishTime, type, files } = validatedData;

    // Combine date and time to UTC
    const publishDateTime = new Date(`${publishDate}T${publishTime}:00+08:00`); // Philippine time
    const utcDateTime = new Date(publishDateTime.toISOString());

    // Check if date is in the past
    if (utcDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot schedule post in the past' },
        { status: 400 }
      );
    }

    // Detect if any file is a video
    const isVideo = files.some((f: any) =>
      f.url.toLowerCase().includes('video') ||
      f.url.toLowerCase().includes('.mp4') ||
      f.url.toLowerCase().includes('.mov')
    );

    // Extract date and time separately for storage
    const dateOnly = new Date(utcDateTime.toISOString().split('T')[0]);
    const timeOnly = new Date(`1970-01-01T${utcDateTime.toISOString().split('T')[1].split('.')[0]}`);

    // Create post with files
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        caption,
        publishDate: dateOnly,
        publishTime: timeOnly,
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
