import { z } from 'zod';

// Registration schema
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Post creation schema
export const createPostSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(2000, 'Caption must be less than 2000 characters'),
  publishDate: z.string().min(1, 'Publish date is required'),
  publishTime: z.string().min(1, 'Publish time is required'),
  files: z.array(z.object({
    url: z.string().url('Invalid file URL'),
    caption: z.string().optional().default(''),
  })).min(1, 'At least one file is required').max(10, 'Maximum 10 files allowed'),
}).transform((data) => {
  // Combine date and time into UTC datetime
  const publishDateTime = new Date(`${data.publishDate}T${data.publishTime}:00+08:00`);

  // For single image or video, clear individual file captions (only use main post caption)
  const files = data.files.length === 1
    ? data.files.map(f => ({ ...f, caption: '' }))
    : data.files;

  return {
    ...data,
    files,
    publishDateTime: publishDateTime.toISOString(),
  };
}).refine((data) => {
  // Check for mixed media (not allowed)
  const hasVideo = data.files.some((f: any) =>
    f.url.toLowerCase().includes('video') ||
    f.url.toLowerCase().includes('.mp4') ||
    f.url.toLowerCase().includes('.mov') ||
    f.url.toLowerCase().includes('.avi') ||
    f.url.toLowerCase().includes('.webm')
  );
  const hasImage = data.files.some((f: any) =>
    f.url.toLowerCase().includes('image') ||
    f.url.toLowerCase().includes('.jpg') ||
    f.url.toLowerCase().includes('.jpeg') ||
    f.url.toLowerCase().includes('.png') ||
    f.url.toLowerCase().includes('.gif') ||
    f.url.toLowerCase().includes('.webp')
  );

  // If mixed media, reject
  if (hasVideo && hasImage) {
    return false;
  }

  // If video, only allow single video
  if (hasVideo && data.files.length > 1) {
    return false;
  }

  return true;
}, {
  message: 'Invalid file combination. Allowed: single image, multiple images (up to 10), or single video only. Mixed media is not allowed.',
});

// Post update schema
export const updatePostSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(2000, 'Caption must be less than 2000 characters').optional(),
  publishDate: z.string().optional(),
  publishTime: z.string().optional(),
  isPublished: z.boolean().optional(),
}).transform((data) => {
  // If both date and time are provided, combine them into UTC datetime
  if (data.publishDate && data.publishTime) {
    const publishDateTime = new Date(`${data.publishDate}T${data.publishTime}:00+08:00`);
    return {
      ...data,
      publishDateTime: publishDateTime.toISOString(),
    };
  }
  return data;
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
