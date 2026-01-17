'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PostsTable } from '@/components/dashboard/PostsTable';
import { FileText, CheckCircle, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Stats, Post } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, postsRes] = await Promise.all([
          fetch('/api/posts/stats'),
          fetch('/api/posts?limit=5'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setRecentPosts(postsData.posts);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecentPosts(recentPosts.filter(p => p.id !== id));
        if (stats) {
          setStats({
            ...stats,
            total: stats.total - 1,
            pending: stats.pending - 1,
          });
        }
        alert('Post deleted successfully');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="Dashboard" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Posts"
          value={stats?.total || 0}
          color="gray"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatsCard
          title="Published Posts"
          value={stats?.published || 0}
          color="green"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Pending Posts"
          value={stats?.pending || 0}
          color="yellow"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatsCard
          title="This Week"
          value={stats?.thisWeek || 0}
          color="blue"
          icon={<Calendar className="h-6 w-6" />}
        />
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
          <Link href="/posts" className="text-blue-600 hover:text-blue-700 text-sm">
            View All Posts
          </Link>
        </div>

        <PostsTable posts={recentPosts} onDelete={handleDelete} />
      </div>
    </div>
  );
}
