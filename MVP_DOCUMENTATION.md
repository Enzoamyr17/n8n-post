# Facebook Auto-Posting App - MVP Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Page Specifications](#page-specifications)
8. [Component Specifications](#component-specifications)
9. [Implementation Steps](#implementation-steps)
10. [Security Considerations](#security-considerations)
11. [n8n Integration](#n8n-integration)
12. [Testing Checklist](#testing-checklist)
13. [Deployment Guide](#deployment-guide)

---

## Project Overview

### Description
A minimalist Facebook auto-posting application where users can schedule posts with media uploads. Posts are automatically published via n8n workflow integration at scheduled times.

### Key Features
- User authentication (register/login)
- Schedule posts with date and time
- Upload photos and videos to Cloudinary
- Dashboard with posting metrics
- Automated posting via n8n
- Simple, clean UI

### User Flow
```
1. User registers/logs in
2. User creates a post with:
   - Caption text
   - Media files (images/videos)
   - Publish date and time
3. Media uploads to Cloudinary
4. Post saved to database as "pending"
5. n8n checks database every 10 minutes
6. When scheduled time arrives, n8n posts to Facebook
7. Post status updated to "published"
8. User sees updated metrics on dashboard
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (optional) or custom components
- **Icons:** lucide-react

### Backend
- **API:** Next.js API Routes
- **Authentication:** NextAuth.js v4
- **Password Hashing:** bcryptjs

### Database
- **Database:** PostgreSQL
- **ORM:** Prisma

### Media Storage
- **Service:** Cloudinary (shared account)
- **SDK:** cloudinary, next-cloudinary

### Automation
- **Tool:** n8n
- **Integration:** Webhook/HTTP requests

### Deployment
- **Frontend/Backend:** Vercel
- **Database:** Railway/Supabase/Neon
- **n8n:** Self-hosted or n8n.cloud

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id                    BigInt    @id @default(autoincrement())
  firstName             String
  middleName            String?
  lastName              String?
  email                 String    @unique
  password              String    // Hashed with bcrypt
  accessTokenExpiration DateTime?
  
  // Relations
  posts                 Post[]
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([email])
}

// Post model
model Post {
  id          Int       @id @default(autoincrement())
  userId      BigInt
  type        PostType
  typeCount   Int       @default(1)  // Number of files
  caption     String    @db.Text
  publishDate DateTime  @db.Date
  publishTime DateTime  @db.Time
  isPublished Boolean   @default(false)
  isVideo     Boolean   @default(false)
  
  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  files       PostFile[]
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([userId])
  @@index([publishDate, isPublished])
  @@index([isPublished])
}

// PostFile model
model PostFile {
  id       BigInt   @id @default(autoincrement())
  postId   Int
  url      String   @db.Text
  caption  String   @db.Text
  
  // Relations
  post     Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  // Timestamp
  createdAt DateTime @default(now())
  
  @@index([postId])
}

// Post type enum
enum PostType {
  SINGLE_IMAGE
  SINGLE_VIDEO
  MULTIPLE_IMAGES
  MULTIPLE_VIDEOS
  MIXED_MEDIA
}
```

### Database Relationships
- **User → Post:** One-to-Many (A user can have multiple posts)
- **Post → PostFile:** One-to-Many (A post can have multiple files)

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/facebook_autopost"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Cloudinary (Your Shared Account)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# n8n Integration
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/facebook-post"
N8N_API_KEY="your-secure-random-api-key"

# Facebook Graph API (for future use)
FACEBOOK_APP_ID="your-app-id"
FACEBOOK_APP_SECRET="your-app-secret"
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

---

## Project Structure

```
facebook-autopost/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── posts/
│   │   │   ├── page.tsx                # Posts list
│   │   │   ├── create/
│   │   │   │   └── page.tsx            # Create post
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx        # Edit post
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts            # NextAuth configuration
│   │   ├── posts/
│   │   │   ├── route.ts                # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts            # GET (single), PATCH (update), DELETE
│   │   │   ├── pending/
│   │   │   │   └── route.ts            # For n8n (get posts to publish)
│   │   │   └── stats/
│   │   │       └── route.ts            # Dashboard statistics
│   │   └── upload/
│   │       └── route.ts                # Cloudinary upload handler
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                        # Landing/redirect page
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── PostsTable.tsx
│   │   └── DashboardHeader.tsx
│   ├── posts/
│   │   ├── PostForm.tsx
│   │   ├── MediaUpload.tsx
│   │   ├── PostCard.tsx
│   │   └── MediaPreview.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
├── lib/
│   ├── prisma.ts                       # Prisma client instance
│   ├── cloudinary.ts                   # Cloudinary configuration
│   ├── auth.ts                         # NextAuth configuration
│   ├── utils.ts                        # Utility functions
│   └── validations.ts                  # Form validation schemas
├── types/
│   ├── index.ts
│   └── next-auth.d.ts                  # NextAuth type extensions
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── .env
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "M",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response (400):**
```json
{
  "error": "Email already exists"
}
```

---

#### POST `/api/auth/login`
Login user (handled by NextAuth).

---

### Posts

#### GET `/api/posts`
Get all posts for the authenticated user.

**Query Parameters:**
- `status` (optional): `all` | `published` | `pending`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "caption": "Check out our new product!",
      "publishDate": "2026-01-20",
      "publishTime": "14:00:00",
      "isPublished": false,
      "type": "SINGLE_IMAGE",
      "typeCount": 1,
      "files": [
        {
          "id": "1",
          "url": "https://res.cloudinary.com/.../image.jpg",
          "caption": "Product photo"
        }
      ],
      "createdAt": "2026-01-17T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

#### POST `/api/posts`
Create a new post.

**Request Body:**
```json
{
  "caption": "Check out our new product!",
  "publishDate": "2026-01-20",
  "publishTime": "14:00",
  "type": "SINGLE_IMAGE",
  "files": [
    {
      "url": "https://res.cloudinary.com/.../image.jpg",
      "caption": "Product photo"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "caption": "Check out our new product!",
    "publishDate": "2026-01-20T00:00:00Z",
    "publishTime": "14:00:00",
    "isPublished": false,
    "type": "SINGLE_IMAGE",
    "typeCount": 1
  }
}
```

---

#### GET `/api/posts/[id]`
Get a single post by ID.

**Response (200):**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "caption": "Check out our new product!",
    "publishDate": "2026-01-20",
    "publishTime": "14:00:00",
    "isPublished": false,
    "type": "SINGLE_IMAGE",
    "files": [
      {
        "id": "1",
        "url": "https://res.cloudinary.com/.../image.jpg",
        "caption": "Product photo"
      }
    ]
  }
}
```

---

#### PATCH `/api/posts/[id]`
Update a post.

**Request Body:**
```json
{
  "caption": "Updated caption",
  "publishDate": "2026-01-21",
  "publishTime": "15:00"
}
```

**Response (200):**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "caption": "Updated caption",
    "publishDate": "2026-01-21",
    "publishTime": "15:00:00"
  }
}
```

---

#### DELETE `/api/posts/[id]`
Delete a post.

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

#### GET `/api/posts/pending`
Get posts ready to publish (for n8n).

**Headers:**
- `x-api-key`: N8N API key (for authentication)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "checkTime": "2026-01-20T14:05:00Z",
  "posts": [
    {
      "id": 1,
      "userId": "1",
      "caption": "Check out our new product!",
      "files": [
        {
          "url": "https://res.cloudinary.com/.../image.jpg",
          "caption": "Product photo"
        }
      ],
      "type": "SINGLE_IMAGE",
      "isVideo": false,
      "publishDate": "2026-01-20T14:00:00Z"
    }
  ]
}
```

---

#### GET `/api/posts/stats`
Get dashboard statistics for the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "published": 15,
    "pending": 10,
    "thisWeek": 5,
    "thisMonth": 12
  }
}
```

---

### Upload

#### POST `/api/upload`
Upload media to Cloudinary.

**Request:** `multipart/form-data`
- `file`: File (image or video)
- `userId`: User ID (from session)

**Response (200):**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/demo/image/upload/v1234/user_1/abc123.jpg",
  "publicId": "user_1/abc123",
  "format": "jpg",
  "resourceType": "image",
  "width": 1920,
  "height": 1080
}
```

**Response (400):**
```json
{
  "error": "Invalid file type"
}
```

---

## Page Specifications

### 1. Login Page (`/login`)

**Design:**
- Centered card (max-width: 400px)
- White background with shadow
- Minimal form layout

**Elements:**
```
┌────────────────────────────┐
│                            │
│  [Logo/App Name]           │
│                            │
│  ┌──────────────────────┐  │
│  │ Email                │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Password             │  │
│  └──────────────────────┘  │
│                            │
│  ☐ Remember me             │
│                            │
│  ┌──────────────────────┐  │
│  │      Login           │  │
│  └──────────────────────┘  │
│                            │
│  Don't have an account?    │
│  Register                  │
│                            │
└────────────────────────────┘
```

**Features:**
- Form validation (email format, required fields)
- Error messages display below inputs
- Loading state on submit
- Redirect to dashboard on success
- Remember me functionality (optional)

**Technologies:**
- React Hook Form
- Zod validation
- NextAuth signIn function

---

### 2. Register Page (`/register`)

**Design:**
- Centered card (max-width: 500px)
- Similar style to login page

**Elements:**
```
┌────────────────────────────┐
│                            │
│  Create Account            │
│                            │
│  ┌──────────────────────┐  │
│  │ First Name           │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Middle Name (opt.)   │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Last Name            │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Email                │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Password             │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Confirm Password     │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │      Register        │  │
│  └──────────────────────┘  │
│                            │
│  Already have an account?  │
│  Login                     │
│                            │
└────────────────────────────┘
```

**Features:**
- Form validation
- Password strength indicator
- Password confirmation match
- Email uniqueness check
- Success message and auto-redirect to login

---

### 3. Dashboard (`/dashboard`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Logo        Dashboard                    [User ▼]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Dashboard                                          │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │  Total   │ │Published │ │ Pending  │ │This    ││
│  │   25     │ │    15    │ │    10    │ │Week: 5 ││
│  │  Posts   │ │  Posts   │ │  Posts   │ │Posts   ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│                                                     │
│  Recent Posts                    [+ Create Post]   │
│  ┌─────────────────────────────────────────────┐   │
│  │ Caption      Type    Date      Time   Status│   │
│  ├─────────────────────────────────────────────┤   │
│  │ Check out... Image  Jan 20  14:00  Pending │   │
│  │ New product  Video  Jan 21  10:00  Pending │   │
│  │ Happy new... Image  Jan 15  09:00  Posted  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│                                [View All Posts]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Stats Cards:**
- Total Posts (gray)
- Published Posts (green)
- Pending Posts (yellow)
- This Week Posts (blue)

**Recent Posts Table:**
- Shows last 5 posts
- Columns: Caption (truncated), Type, Publish Date, Publish Time, Status
- Status badge (color-coded)
- Click row to view/edit

**Features:**
- Real-time stats
- Quick action button to create post
- View all posts link
- Responsive grid layout

---

### 4. Create Post Page (`/posts/create`)

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Logo        Create Post                  [User ▼]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Create New Post                          [Cancel] │
│                                                     │
│  Upload Media                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │         📤  Drag & drop files here          │   │
│  │          or click to browse                 │   │
│  │                                             │   │
│  │      Images or Videos (max 10 files)       │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Image Preview] [Image Preview] [Video Preview]   │
│   [x] Caption     [x] Caption     [x] Caption      │
│                                                     │
│  Caption                                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ Write your caption here...                  │   │
│  │                                             │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│  0/2000 characters                                  │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Publish Date     │  │ Publish Time     │        │
│  │ [2026-01-20   ▼] │  │ [14:00        ▼] │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  Post Type                                          │
│  ┌────────────────────────────────┐                │
│  │ Single Image                ▼  │                │
│  └────────────────────────────────┘                │
│                                                     │
│                                                     │
│  ┌──────────────────────┐  ┌──────────────────┐   │
│  │   Schedule Post      │  │     Cancel       │   │
│  └──────────────────────┘  └──────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Drag & drop file upload
- Multiple file support (max 10)
- Image/video preview with captions
- Remove file button
- Character counter for caption
- Date picker (min: today)
- Time picker (12h or 24h format)
- Auto-detect post type based on uploads
- Form validation
- Loading state during upload
- Success notification

**Post Type Options:**
- Single Image
- Single Video
- Multiple Images
- Multiple Videos
- Mixed Media

---

## Component Specifications

### StatsCard Component

```tsx
// components/dashboard/StatsCard.tsx

interface StatsCardProps {
  title: string;
  value: number;
  color?: 'green' | 'yellow' | 'blue' | 'gray';
  icon?: React.ReactNode;
}

/**
 * Displays a statistic card with title, value, and optional icon
 * 
 * Usage:
 * <StatsCard 
 *   title="Total Posts" 
 *   value={25} 
 *   color="gray"
 *   icon={<FileText />}
 * />
 */
export function StatsCard({ title, value, color = 'gray', icon }: StatsCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### MediaUpload Component

```tsx
// components/posts/MediaUpload.tsx

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption: string;
}

interface MediaUploadProps {
  maxFiles?: number;
  onFilesChange: (files: MediaFile[]) => void;
}

/**
 * Drag & drop media upload component with preview
 * Uploads files to Cloudinary and manages file state
 * 
 * Features:
 * - Drag & drop
 * - Click to browse
 * - Image/video preview
 * - Per-file captions
 * - Remove files
 * - Loading states
 */
export function MediaUpload({ maxFiles = 10, onFilesChange }: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();

        return {
          id: data.publicId,
          url: data.url,
          type: data.resourceType === 'video' ? 'video' : 'image',
          caption: '',
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newFiles = [...files, ...uploadedFiles].slice(0, maxFiles);
      
      setFiles(newFiles);
      onFilesChange(newFiles);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: maxFiles - files.length,
    disabled: uploading || files.length >= maxFiles,
  });

  const removeFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const updateCaption = (id: string, caption: string) => {
    const newFiles = files.map(f => 
      f.id === id ? { ...f, caption } : f
    );
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {uploading ? (
          <p className="text-gray-600">Uploading...</p>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Images or videos ({files.length}/{maxFiles} uploaded)
            </p>
          </>
        )}
      </div>

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              {/* Preview */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt="Upload"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFile(file.id)}
                className="
                  absolute top-2 right-2 bg-red-500 text-white rounded-full p-1
                  opacity-0 group-hover:opacity-100 transition-opacity
                "
              >
                <X className="h-4 w-4" />
              </button>

              {/* Caption Input */}
              <input
                type="text"
                placeholder="Add caption..."
                value={file.caption}
                onChange={(e) => updateCaption(file.id, e.target.value)}
                className="
                  mt-2 w-full px-2 py-1 text-sm border rounded
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### PostsTable Component

```tsx
// components/dashboard/PostsTable.tsx

'use client';

import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: number;
  caption: string;
  type: string;
  publishDate: string;
  publishTime: string;
  isPublished: boolean;
}

interface PostsTableProps {
  posts: Post[];
  onDelete?: (id: number) => void;
}

/**
 * Displays a table of posts with actions
 * 
 * Features:
 * - Truncated captions
 * - Status badges
 * - Edit/delete actions
 * - Responsive design
 */
export function PostsTable({ posts, onDelete }: PostsTableProps) {
  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Caption
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Publish Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Publish Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {truncateText(post.caption)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {post.type.replace('_', ' ')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {format(new Date(post.publishDate), 'MMM dd, yyyy')}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {post.publishTime}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={post.isPublished ? 'success' : 'warning'}>
                  {post.isPublished ? 'Published' : 'Pending'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### PostForm Component

```tsx
// components/posts/PostForm.tsx

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

/**
 * Complete form for creating/editing posts
 * 
 * Features:
 * - Media upload
 * - Caption input with character count
 * - Date/time pickers
 * - Post type selection
 * - Validation
 * - Loading states
 */
export function PostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    publishDate: '',
    publishTime: '',
    type: 'SINGLE_IMAGE',
    files: [] as MediaFile[],
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
    
    setLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
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

      if (!response.ok) throw new Error('Failed to create post');

      alert('Post scheduled successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
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
        />
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Caption
        </label>
        <Textarea
          value={formData.caption}
          onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
          rows={5}
          maxLength={2000}
          placeholder="Write your caption here..."
          className="w-full"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.caption.length}/2000 characters
        </p>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date
          </label>
          <Input
            type="date"
            value={formData.publishDate}
            onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Time
          </label>
          <Input
            type="time"
            value={formData.publishTime}
            onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Post Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Type
        </label>
        <Select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="SINGLE_IMAGE">Single Image</option>
          <option value="SINGLE_VIDEO">Single Video</option>
          <option value="MULTIPLE_IMAGES">Multiple Images</option>
          <option value="MULTIPLE_VIDEOS">Multiple Videos</option>
          <option value="MIXED_MEDIA">Mixed Media</option>
        </Select>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading || formData.files.length === 0}
          className="flex-1"
        >
          {loading ? 'Scheduling...' : 'Schedule Post'}
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
```

---

## Implementation Steps

### Phase 1: Project Setup (Day 1)

#### 1.1 Initialize Next.js Project
```bash
npx create-next-app@latest facebook-autopost --typescript --tailwind --app
cd facebook-autopost
```

#### 1.2 Install Dependencies
```bash
# Core dependencies
npm install @prisma/client bcryptjs next-auth@beta
npm install cloudinary next-cloudinary
npm install react-dropzone lucide-react
npm install date-fns zod react-hook-form @hookform/resolvers

# Dev dependencies
npm install -D prisma @types/bcryptjs
```

#### 1.3 Setup Prisma
```bash
npx prisma init
```

Then update `prisma/schema.prisma` with the schema from this document.

```bash
# Create database migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

#### 1.4 Create Environment File
Copy `.env.example` to `.env` and fill in values.

#### 1.5 Create Lib Files

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Create `lib/cloudinary.ts`:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

---

### Phase 2: Authentication (Day 2)

#### 2.1 Configure NextAuth

Create `lib/auth.ts`:
```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### 2.2 Create Register API

Create `app/api/auth/register/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, middleName, lastName, email, password } = body;

    // Validation
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    return NextResponse.json({
      success: true,
      user,
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 2.3 Create Auth Pages

Create login and register pages as specified in Page Specifications section.

#### 2.4 Create Middleware for Protected Routes

Create `middleware.ts`:
```typescript
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/posts/:path*'],
};
```

---

### Phase 3: Core Features (Day 3-4)

#### 3.1 Create Posts API

Create `app/api/posts/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { caption, publishDate, publishTime, type, files } = body;

    // Validation
    if (!caption || !publishDate || !publishTime || !files || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${publishDate}T${publishTime}`);

    // Check if date is in the past
    if (scheduledDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot schedule post in the past' },
        { status: 400 }
      );
    }

    // Detect if any file is a video
    const isVideo = files.some((f: any) => f.url.includes('video'));

    // Create post with files
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        caption,
        publishDate: new Date(publishDate),
        publishTime: new Date(`1970-01-01T${publishTime}`),
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

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3.2 Create Upload API

Create `app/api/upload/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Determine resource type
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'facebook-posts',
      resource_type: resourceType,
      transformation: resourceType === 'image' ? [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
      ] : undefined,
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

#### 3.3 Create Dashboard Stats API

Create `app/api/posts/stats/route.ts`:
```typescript
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
```

#### 3.4 Create Dashboard Page

Build dashboard with stats cards and posts table as specified in Page Specifications.

#### 3.5 Create Post Form Page

Build create post page with media upload as specified in Page Specifications.

---

### Phase 4: n8n Integration (Day 5)

#### 4.1 Create Pending Posts API

Create `app/api/posts/pending/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time in Philippine timezone
    const now = new Date();
    const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));

    // Create time window (±10 minutes)
    const WINDOW_MINUTES = 10;
    const windowStart = new Date(phTime.getTime() - WINDOW_MINUTES * 60 * 1000);
    const windowEnd = new Date(phTime.getTime() + WINDOW_MINUTES * 60 * 1000);

    // Fetch pending posts within time window
    const posts = await prisma.post.findMany({
      where: {
        isPublished: false,
        publishDate: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        files: true,
      },
      orderBy: {
        publishDate: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      count: posts.length,
      checkTime: phTime.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      posts: posts.map(post => ({
        id: post.id,
        userId: post.userId.toString(),
        userName: `${post.user.firstName} ${post.user.lastName}`,
        userEmail: post.user.email,
        caption: post.caption,
        files: post.files.map(f => ({
          url: f.url,
          caption: f.caption,
        })),
        type: post.type,
        isVideo: post.isVideo,
        publishDate: post.publishDate,
      })),
    });

  } catch (error) {
    console.error('Error fetching pending posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 4.2 Create Update Post Status API

Update `app/api/posts/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    }

    const post = await prisma.post.update({
      where: { id: parseInt(params.id) },
      data: body,
      include: {
        files: true,
      },
    });

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 4.3 Configure n8n Workflow

See n8n Integration section below for complete workflow configuration.

---

### Phase 5: Polish & Testing (Day 6)

#### 5.1 Add Loading States
- Skeleton loaders for dashboard
- Loading spinners for forms
- Progress bars for uploads

#### 5.2 Error Handling
- Toast notifications
- Error boundaries
- Validation messages

#### 5.3 Form Validation
- Client-side validation with Zod
- Server-side validation
- Clear error messages

#### 5.4 Responsive Design
- Test on mobile, tablet, desktop
- Adjust layouts for small screens
- Touch-friendly buttons

#### 5.5 Testing
- Test all user flows
- Test API endpoints
- Test n8n integration
- Cross-browser testing

---

## Security Considerations

### 1. Authentication
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT sessions with NextAuth
- ✅ Protected API routes
- ✅ Secure session storage

### 2. API Security
- ✅ API key authentication for n8n
- ✅ Rate limiting (implement with Upstash/Redis)
- ✅ Input validation and sanitization
- ✅ CORS configuration

### 3. Data Security
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React sanitization)
- ✅ CSRF protection (NextAuth)
- ✅ Environment variables for secrets

### 4. File Upload Security
- ✅ File type validation
- ✅ File size limits
- ✅ Cloudinary transforms/sanitization
- ✅ Unique file names

### 5. Best Practices
- ✅ HTTPS only in production
- ✅ Secure headers (helmet.js)
- ✅ Regular dependency updates
- ✅ Error logging (Sentry)

---

## n8n Integration

### Workflow Overview

```
Schedule Trigger (Every 10 min)
    ↓
GET /api/posts/pending
    ↓
Has Posts? (IF node)
    ↓
Split Posts
    ↓
Post to Facebook (Graph API)
    ↓
PATCH /api/posts/[id] (mark as published)
    ↓
End
```

### n8n Workflow Configuration

```json
{
  "name": "Facebook Auto-Posting",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "*/10 * * * *"
            }
          ]
        },
        "timezone": "Asia/Manila"
      },
      "name": "Schedule Every 10 Minutes",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://your-app.vercel.app/api/posts/pending",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-api-key",
              "value": "={{ $env.N8N_API_KEY }}"
            }
          ]
        }
      },
      "name": "Get Pending Posts",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.count }}",
              "operation": "larger",
              "value2": 0
            }
          ]
        }
      },
      "name": "Has Posts?",
      "type": "n8n-nodes-base.if",
      "position": [650, 300]
    },
    {
      "parameters": {
        "fieldToSplitOut": "posts"
      },
      "name": "Split Posts",
      "type": "n8n-nodes-base.splitOut",
      "position": [850, 200]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "resource": "post",
        "operation": "create",
        "pageId": "={{ $env.FACEBOOK_PAGE_ID }}",
        "postAs": "page",
        "message": "={{ $json.caption }}"
      },
      "name": "Post to Facebook",
      "type": "n8n-nodes-base.facebookGraphApi",
      "position": [1050, 200]
    },
    {
      "parameters": {
        "method": "PATCH",
        "url": "https://your-app.vercel.app/api/posts/={{ $json.id }}",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-api-key",
              "value": "={{ $env.N8N_API_KEY }}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "isPublished",
              "value": true
            }
          ]
        }
      },
      "name": "Mark as Published",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1250, 200]
    }
  ],
  "connections": {
    "Schedule Every 10 Minutes": {
      "main": [[{ "node": "Get Pending Posts", "type": "main", "index": 0 }]]
    },
    "Get Pending Posts": {
      "main": [[{ "node": "Has Posts?", "type": "main", "index": 0 }]]
    },
    "Has Posts?": {
      "main": [[{ "node": "Split Posts", "type": "main", "index": 0 }]]
    },
    "Split Posts": {
      "main": [[{ "node": "Post to Facebook", "type": "main", "index": 0 }]]
    },
    "Post to Facebook": {
      "main": [[{ "node": "Mark as Published", "type": "main", "index": 0 }]]
    }
  }
}
```

### n8n Setup Steps

1. **Install n8n**
```bash
npm install -g n8n
# or use Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

2. **Configure Facebook OAuth**
- Go to n8n credentials
- Add Facebook Graph API OAuth2
- Set up Facebook App
- Add required permissions: `pages_manage_posts`, `pages_read_engagement`

3. **Set Environment Variables**
```bash
N8N_API_KEY=your-secure-api-key
FACEBOOK_PAGE_ID=your-facebook-page-id
```

4. **Import Workflow**
- Copy JSON above
- Import in n8n
- Update URLs to your deployed app
- Test workflow

---

## Testing Checklist

### User Registration & Login
- [ ] User can register with valid email
- [ ] Duplicate email shows error
- [ ] Password is hashed in database
- [ ] User can login with correct credentials
- [ ] Wrong password shows error
- [ ] Session persists after login
- [ ] Protected routes redirect to login

### Dashboard
- [ ] Dashboard shows correct total posts count
- [ ] Published count is accurate
- [ ] Pending count is accurate
- [ ] This week count is accurate
- [ ] Recent posts table displays correctly
- [ ] Stats update after creating post

### Create Post
- [ ] User can upload images
- [ ] User can upload videos
- [ ] Multiple files upload correctly
- [ ] Files preview correctly
- [ ] Can remove uploaded files
- [ ] Can add captions to files
- [ ] Caption character count works
- [ ] Date picker prevents past dates
- [ ] Form validation works
- [ ] Post saves to database
- [ ] Redirects to dashboard after save

### Post Management
- [ ] Posts list displays correctly
- [ ] Can filter by status
- [ ] Pagination works
- [ ] Can edit post
- [ ] Can delete post
- [ ] Confirmation before delete

### n8n Integration
- [ ] n8n retrieves pending posts
- [ ] Posts within time window are returned
- [ ] API key authentication works
- [ ] Posts are marked as published
- [ ] Workflow runs on schedule

### UI/UX
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Loading states display
- [ ] Error messages are clear
- [ ] Success messages display
- [ ] Forms are accessible
- [ ] Buttons are touch-friendly

### Security
- [ ] Passwords are hashed
- [ ] Sessions are secure
- [ ] API endpoints require auth
- [ ] File uploads are validated
- [ ] SQL injection prevented
- [ ] XSS prevented

---

## Deployment Guide

### Deploy to Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Connect to Vercel**
- Go to vercel.com
- Import GitHub repository
- Configure environment variables
- Deploy

3. **Environment Variables on Vercel**
```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
N8N_WEBHOOK_URL
N8N_API_KEY
```

### Deploy Database

#### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up
```

#### Option 2: Supabase
- Go to supabase.com
- Create new project
- Get connection string
- Update DATABASE_URL

#### Option 3: Neon
- Go to neon.tech
- Create new project
- Get connection string
- Update DATABASE_URL

### Run Prisma Migrations on Production

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Deploy n8n

#### Self-Hosted (DigitalOcean/AWS)
```bash
# Docker Compose
docker-compose up -d

# Or PM2
pm2 start n8n
```

#### n8n Cloud
- Go to n8n.cloud
- Create account
- Import workflow
- Configure credentials

---

## Color Scheme

```css
/* Tailwind CSS Configuration */
{
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: {
      50: '#f0fdf4',
      500: '#10b981',
      600: '#059669',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  }
}
```

---

## Additional Notes for AI Agents

### Code Quality Standards
- Use TypeScript for type safety
- Follow Next.js 14 App Router patterns
- Use Server Components where possible
- Implement proper error handling
- Add loading states for async operations
- Use Prisma for all database operations
- Validate all user inputs
- Sanitize data before rendering

### Naming Conventions
- Components: PascalCase (e.g., `PostForm.tsx`)
- Functions: camelCase (e.g., `getUserPosts`)
- API routes: kebab-case folders (e.g., `posts/pending`)
- Database fields: camelCase (e.g., `publishDate`)
- CSS classes: Tailwind utilities

### File Organization
- Keep components in `components/` folder
- Group by feature (auth, posts, dashboard)
- Shared UI components in `components/ui/`
- Keep API routes RESTful
- One component per file

### Performance Optimization
- Use Next.js Image component
- Implement lazy loading
- Optimize Cloudinary uploads
- Use database indexes
- Implement pagination
- Cache API responses where appropriate

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast ratios
- Add alt text to images

### Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Test error scenarios
- Test edge cases

---

## Troubleshooting

### Common Issues

**Prisma Client Not Found**
```bash
npx prisma generate
```

**Database Connection Error**
- Check DATABASE_URL format
- Verify database is running
- Check network/firewall settings

**NextAuth Session Error**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches deployment
- Clear cookies and retry

**Cloudinary Upload Fails**
- Verify API credentials
- Check file size limits
- Ensure proper CORS configuration

**n8n Can't Reach API**
- Verify webhook URL is correct
- Check API key matches
- Ensure app is deployed and accessible

---

## Future Enhancements (Post-MVP)

1. **Multi-Account Support**
   - Connect multiple Facebook pages
   - Switch between accounts

2. **Advanced Scheduling**
   - Recurring posts
   - Best time suggestions
   - Calendar view

3. **Analytics**
   - Post performance metrics
   - Engagement tracking
   - Audience insights

4. **Content Library**
   - Reusable content templates
   - Media library
   - Hashtag suggestions

5. **Team Collaboration**
   - Multiple users per account
   - Approval workflows
   - Comments/notes

6. **AI Features**
   - Caption generation
   - Image enhancement
   - Hashtag recommendations

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [n8n Docs](https://docs.n8n.io)

### Community
- Next.js Discord
- Prisma Slack
- n8n Community Forum

---

**End of Documentation**

This documentation provides everything needed to build the Facebook Auto-Posting MVP. Follow the implementation steps sequentially, and refer to the component specifications for detailed code examples.
