# AttendEase - Attendance ERP

A production-ready MERN stack attendance management system with enterprise-grade architecture.

## Tech Stack

### Frontend (Client)
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix-based)
- **Linting**: ESLint + Prettier

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Linting**: ESLint + Prettier

## Project Structure

```
attendease-dashboard-ui/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # UI components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   └── ...
└── README.md
```

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd attendease-dashboard-ui
```

### 2. Setup Client

```bash
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The client will be available at `http://localhost:3000`

### 3. Setup Server

```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The server will be available at `http://localhost:5000`

### 4. Verify Setup

- **Frontend**: Open `http://localhost:3000` in your browser
- **Backend**: Access `http://localhost:5000/api/health`

## Available Scripts

### Client

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

### Server

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

## Environment Variables

### Client (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_ENV` | Application environment | `development` |

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/attendease` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Architecture Highlights

- **Strict TypeScript**: No `any` types allowed, strict mode enabled
- **Centralized Error Handling**: Custom error classes with proper HTTP status codes
- **JWT Authentication**: Ready-to-use auth middleware with role-based authorization
- **Multi-tenant Ready**: Architecture supports RBAC expansion
- **Production Security**: Helmet, CORS, and security best practices

## License

ISC
