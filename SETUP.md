# Facebook Auto-Post - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Cloudinary account
- n8n instance (optional for now)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update the `.env` file with your actual values:

```env
# Database - Get this from your PostgreSQL provider (Railway, Supabase, Neon, or local)
DATABASE_URL="postgresql://user:password@localhost:5432/facebook_autopost"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-using-command-below>"

# Cloudinary (Your Shared Account)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# n8n Integration (optional for now)
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/facebook-post"
N8N_API_KEY="<generate-secure-random-key>"

# Facebook Graph API (for future use)
FACEBOOK_APP_ID="your-app-id"
FACEBOOK_APP_SECRET="your-app-secret"

# Application Timezone
TZ="Asia/Manila"
```

### 3. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET` in your `.env` file.

### 4. Setup Database

#### Option A: Local PostgreSQL

Make sure PostgreSQL is running locally, then create a database:

```sql
CREATE DATABASE facebook_autopost;
```

#### Option B: Cloud Database (Recommended)

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway add postgresql
# Copy the DATABASE_URL from Railway dashboard
```

**Supabase:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy the connection string (URI mode)

**Neon:**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## First Time Setup

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to the login page
3. Click "Register" to create your account
4. Fill in your details and register
5. Log in with your credentials
6. You'll be taken to the dashboard

## Database Timezone Configuration

**IMPORTANT:** All dates and times in the database are stored in **UTC+0**. The application automatically converts times between:
- **Philippine Time (UTC+8)** - for user input and display
- **UTC+0** - for database storage

This ensures consistent scheduling across different timezones and prevents issues with n8n integration.

## Cloudinary Setup

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret
4. Add these to your `.env` file

## Troubleshooting

### Database Connection Error

- Verify your `DATABASE_URL` is correct
- Check if PostgreSQL is running
- Ensure the database exists

### Prisma Client Not Found

```bash
npx prisma generate
```

### NextAuth Session Error

- Make sure `NEXTAUTH_SECRET` is set in `.env`
- Verify `NEXTAUTH_URL` matches your development URL
- Clear browser cookies and try again

### Cloudinary Upload Fails

- Verify API credentials are correct
- Check file size (max 50MB)
- Ensure file type is supported (images: JPEG, PNG, GIF, WebP; videos: MP4, MOV, AVI)

## Next Steps

1. **Test the application:**
   - Create a test post with images
   - Schedule it for a future time
   - View it in the dashboard

2. **Setup n8n (optional):**
   - Follow the n8n integration guide in `MVP_DOCUMENTATION.md`
   - Configure the workflow to auto-post at scheduled times

3. **Deploy to production:**
   - Follow the deployment guide in `MVP_DOCUMENTATION.md`
   - Deploy to Vercel for the app
   - Use Railway/Supabase/Neon for the database

## Important Notes

- **Timezone:** The app is configured for Philippine Time (UTC+8)
- **File Storage:** All media files are stored in Cloudinary
- **Authentication:** Uses NextAuth.js with credential-based auth
- **Database:** All timestamps are stored in UTC for consistency

## Support

For issues or questions, refer to the `MVP_DOCUMENTATION.md` file for detailed documentation.
