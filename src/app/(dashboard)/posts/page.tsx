'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PostsTable } from '@/components/dashboard/PostsTable';
import { Select } from '@/components/ui/Select';
import type { Post } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export default function PostsPage() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const url = filter === 'all'
          ? '/api/posts'
          : `/api/posts?status=${filter}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        showToast('Failed to load posts', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter, showToast]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
        showToast('Post deleted successfully', 'success');
      } else {
        showToast('Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete post', 'error');
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
      <DashboardHeader title="All Posts" />

      <div className="mb-6">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
        </Select>
      </div>

      <PostsTable posts={posts} onDelete={handleDelete} />
    </div>
  );
}
