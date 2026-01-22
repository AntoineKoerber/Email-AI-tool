# Account Manager Dashboard

A modern, full-stack dashboard application for managing email campaigns, operators, and promotional incentives. Built with Next.js 15, React 19, TypeScript, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

## Features

- **Email Campaign Management** - Track, review, and approve AI-generated email campaigns
- **Operator Dashboard** - Monitor operator relationships and engagement status
- **Campaign Scheduling** - Plan and track promotional campaigns with date ranges
- **Incentive Management** - Create and manage promotional offers
- **AI Calibration** - Personalize AI-generated content through calibration questions
- **Real-time Status Updates** - Live data synchronization with backend
- **Responsive Design** - Works seamlessly on desktop and mobile

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS + Radix UI |
| **Database** | Supabase (PostgreSQL) |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |

## Demo Mode

The application supports a **demo mode** that runs entirely with mock data - no database connection required. This is perfect for:
- Exploring the UI and features
- Code review and evaluation
- Local development without credentials

Demo mode activates automatically when Supabase credentials are not configured.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Quick Start (Demo Mode)

```bash
# Clone the repository
git clone https://github.com/AntoineKoerber/Email-AI-tool.git
cd Email-AI-tool

# Install dependencies
pnpm install

# Run in demo mode (no configuration needed!)
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard with mock data.

### Production Setup (with Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

3. Add your credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

## Project Structure

```
├── app/
│   ├── api/                 # API Routes
│   │   ├── emails/          # Email CRUD operations
│   │   ├── operators/       # Operator management
│   │   ├── campaigns/       # Campaign management
│   │   ├── promotions/      # Incentive management
│   │   └── calibration/     # AI calibration endpoints
│   ├── dashboard/           # Main dashboard page
│   ├── emails/              # Email management UI
│   ├── campaigns/           # Campaign management UI
│   ├── operators/           # Operator management UI
│   └── layout.tsx           # Root layout with navigation
├── components/
│   ├── ui/                  # Reusable UI components (shadcn/ui)
│   └── [feature]/           # Feature-specific components
├── hooks/                   # Custom React hooks
├── lib/
│   ├── supabase.ts          # Database configuration
│   ├── mockData.ts          # Demo mode data
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/emails` | GET, POST, PATCH | Email record operations |
| `/api/operators` | GET, POST, PATCH | Operator management |
| `/api/campaigns` | GET, POST, PATCH | Campaign lifecycle |
| `/api/promotions` | GET, POST, PATCH | Incentive/promotion data |
| `/api/incentives` | GET | Incentive lookup |
| `/api/calibration` | POST | Save calibration answers |
| `/api/calibration/status` | GET | Check calibration status |

## Architecture Highlights

- **Server Components** - Leverages Next.js 15 App Router for optimal performance
- **Type Safety** - Full TypeScript coverage with strict mode
- **API Design** - RESTful endpoints with consistent response formats
- **Demo Mode Pattern** - Graceful fallback to mock data without credentials
- **Component Library** - Built on Radix UI primitives for accessibility

## Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anonymous key |

*Not required for demo mode

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Antoine Koerber
