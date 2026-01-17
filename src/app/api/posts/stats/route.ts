import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, startOfMonth } from 'date-fns';

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

    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [total, published, pending, thisWeek, thisMonth] = await Promise.all([
      prisma.post.count({ where: { userId: user.id } }),
      prisma.post.count({ where: { userId: user.id, isPublished: true } }),
      prisma.post.count({ where: { userId: user.id, isPublished: false } }),
      prisma.post.count({
        where: {
          userId: user.id,
          createdAt: { gte: weekStart }
        }
      }),
      prisma.post.count({
        where: {
          userId: user.id,
          createdAt: { gte: monthStart }
        }
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        published,
        pending,
        thisWeek,
        thisMonth,
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
