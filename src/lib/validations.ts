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
  type: z.enum(['SINGLE_IMAGE', 'SINGLE_VIDEO', 'MULTIPLE_IMAGES', 'MULTIPLE_VIDEOS', 'MIXED_MEDIA']),
  files: z.array(z.object({
    url: z.string().url('Invalid file URL'),
    caption: z.string().optional(),
  })).min(1, 'At least one file is required').max(10, 'Maximum 10 files allowed'),
});

// Post update schema
export const updatePostSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(2000, 'Caption must be less than 2000 characters').optional(),
  publishDate: z.string().optional(),
  publishTime: z.string().optional(),
  type: z.enum(['SINGLE_IMAGE', 'SINGLE_VIDEO', 'MULTIPLE_IMAGES', 'MULTIPLE_VIDEOS', 'MIXED_MEDIA']).optional(),
  isPublished: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
