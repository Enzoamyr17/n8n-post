'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaUpload } from './MediaUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
}

interface PostFormProps {
  initialData?: {
    caption: string;
    publishDate: string;
    publishTime: string;
    type: string;
    files: MediaFile[];
  };
  postId?: number;
}

export function PostForm({ initialData, postId }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caption: initialData?.caption || '',
    publishDate: initialData?.publishDate || '',
    publishTime: initialData?.publishTime || '',
    type: initialData?.type || 'SINGLE_IMAGE',
    files: initialData?.files || [] as MediaFile[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.files.length === 0) {
      alert('Please upload at least one file');
      return;
    }

    if (!formData.caption.trim()) {
      alert('Please enter a caption');
      return;
    }

    if (!formData.publishDate) {
      alert('Please select a publish date');
      return;
    }

    if (!formData.publishTime) {
      alert('Please select a publish time');
      return;
    }

    setLoading(true);

    try {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: formData.caption,
          publishDate: formData.publishDate,
          publishTime: formData.publishTime,
          type: formData.type,
          files: formData.files.map(f => ({
            url: f.url,
            caption: f.caption,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save post');
      }

      alert(postId ? 'Post updated successfully!' : 'Post scheduled successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error saving post:', error);
      alert(error.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Media
        </label>
        <MediaUpload
          onFilesChange={(files) => setFormData({ ...formData, files })}
          initialFiles={formData.files}
        />
      </div>

      {/* Caption */}
      <div>
        <Textarea
          label="Caption"
          value={formData.caption}
          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          rows={5}
          maxLength={2000}
          placeholder="Write your caption here..."
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.caption.length}/2000 characters
        </p>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Publish Date"
          value={formData.publishDate}
          onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          required
        />

        <Input
          type="time"
          label="Publish Time (Philippine Time)"
          value={formData.publishTime}
          onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
          required
        />
      </div>

      {/* Post Type */}
      <Select
        label="Post Type"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
      >
        <option value="SINGLE_IMAGE">Single Image</option>
        <option value="SINGLE_VIDEO">Single Video</option>
        <option value="MULTIPLE_IMAGES">Multiple Images</option>
        <option value="MULTIPLE_VIDEOS">Multiple Videos</option>
        <option value="MIXED_MEDIA">Mixed Media</option>
      </Select>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading || formData.files.length === 0}
          className="flex-1"
        >
          {loading ? 'Saving...' : postId ? 'Update Post' : 'Schedule Post'}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
