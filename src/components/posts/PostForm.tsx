'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MediaUpload } from './MediaUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/contexts/ToastContext';

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
    files: MediaFile[];
  };
  postId?: number;
}

export function PostForm({ initialData, postId }: PostFormProps) {
  const router = useRouter();
  const { showToast, showTip } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caption: initialData?.caption || '',
    publishDate: initialData?.publishDate || '',
    publishTime: initialData?.publishTime || '',
    files: initialData?.files || [] as MediaFile[],
  });

  // Show tips when component mounts
  useEffect(() => {
    const tips = [
      'Posts scheduled between 1-3 PM typically get more engagement!',
      'Use high-quality images for better reach on Facebook.',
      'Add descriptive captions to make your posts more accessible.',
      'You can upload up to 10 images for a carousel post.',
      'Schedule posts in advance to maintain consistent engagement!',
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const timer = setTimeout(() => {
      showTip(randomTip);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showTip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.files.length === 0) {
      showToast('Please upload at least one file', 'warning');
      return;
    }

    if (!formData.caption.trim()) {
      showToast('Please enter a caption', 'warning');
      return;
    }

    if (!formData.publishDate) {
      showToast('Please select a publish date', 'warning');
      return;
    }

    if (!formData.publishTime) {
      showToast('Please select a publish time', 'warning');
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

      showToast(
        postId ? 'Post updated successfully!' : 'Post scheduled successfully!',
        'success'
      );

      // Navigate after a brief delay to show the success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving post:', error);
      showToast(error.message || 'Failed to save post', 'error');
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

      {/* Info about allowed file types and captions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-2">
          <strong>Allowed:</strong> Single image, multiple images (up to 10), or single video only. Mixed media is not allowed.
        </p>
        <p className="text-sm text-blue-700">
          <strong>Captions:</strong> The main caption above applies to the post. Individual image captions only appear for multiple images (carousel posts).
        </p>
      </div>

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
