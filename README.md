# Facebook Auto-Post Application

A minimalist Facebook auto-posting application built with Next.js 14, where users can schedule posts with media uploads. Posts are automatically published via n8n workflow integration at scheduled times.

## Features

- User authentication (register/login)
- Schedule posts with date and time (Philippine timezone)
- Upload photos and videos to Cloudinary
- Dashboard with posting metrics
- Automated posting via n8n
- Simple, clean UI

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

### Backend
- **API:** Next.js API Routes
- **Authentication:** NextAuth.js v4
- **Password Hashing:** bcryptjs

### Database
- **Database:** PostgreSQL
- **ORM:** Prisma

### Media Storage
- **Service:** Cloudinary

### Automation
- **Tool:** n8n

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account

### Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

1. Install dependencies: `npm install`
2. Setup `.env` file with your credentials
3. Run migrations: `npx prisma migrate dev --name init`
4. Start dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Important: Timezone Configuration

**All dates and times are handled with Philippine Time (UTC+8):**

- User Interface displays times in Philippine Time
- Database stores all timestamps in UTC+0
- Automatic conversion between timezones

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [MVP_DOCUMENTATION.md](./MVP_DOCUMENTATION.md) - Complete project documentation

## License

MIT
