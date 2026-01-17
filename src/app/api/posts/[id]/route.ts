import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updatePostSchema } from '@/lib/validations';

// GET - Get single post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const post = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        files: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update post
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if request is from n8n
    const apiKey = request.headers.get('x-api-key');
    const isN8N = apiKey === process.env.N8N_API_KEY;

    if (!isN8N) {
      // Regular user update - require authentication
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

      // Verify post belongs to user
      const existingPost = await prisma.post.findFirst({
        where: {
          id: parseInt(id),
          userId: user.id,
        },
      });

      if (!existingPost) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    }

    // Validate input
    const validatedData = updatePostSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.caption !== undefined) {
      updateData.caption = validatedData.caption;
    }

    // Check if publishDateTime was added by transform (when both date and time provided)
    if ('publishDateTime' in validatedData) {
      updateData.publishDateTime = new Date((validatedData as any).publishDateTime);
    }

    if (validatedData.isPublished !== undefined) {
      updateData.isPublished = validatedData.isPublished;
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        files: true,
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error: any) {
    console.error('Error updating post:', error);

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

// DELETE - Delete post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify post belongs to user
    const existingPost = await prisma.post.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
