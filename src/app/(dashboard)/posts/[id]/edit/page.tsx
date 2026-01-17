'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PostForm } from '@/components/posts/PostForm';

export default function EditPostPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data.post);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Post not found</div>
      </div>
    );
  }

  // Convert UTC publishDateTime to Philippine Time for editing
  const publishDateTime = new Date(post.publishDateTime);
  // Add 8 hours to convert UTC to Philippine Time
  const philippineTime = new Date(publishDateTime.getTime() + (8 * 60 * 60 * 1000));
  const publishDate = philippineTime.toISOString().split('T')[0];
  const publishTime = philippineTime.toISOString().split('T')[1].substring(0, 5);

  return (
    <div>
      <DashboardHeader title="Edit Post" showCreateButton={false} />
      <PostForm
        initialData={{
          caption: post.caption,
          publishDate,
          publishTime,
          files: post.files.map((f: any) => ({
            id: f.id,
            url: f.url,
            type: f.url.includes('video') ? 'video' : 'image',
            caption: f.caption,
          })),
        }}
        postId={post.id}
      />
    </div>
  );
}
