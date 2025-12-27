# AttendEase Client

Next.js 16 frontend for the AttendEase Attendance ERP system.

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS 4**
- **shadcn/ui** components

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

```
src/
├── app/           # App Router pages and layouts
├── components/    # React components
│   └── ui/        # shadcn/ui components
├── features/      # Feature-based modules
├── hooks/         # Custom React hooks
└── lib/           # Utilities and helpers
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript type checking

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add button card dialog
```

## Environment Variables

See `.env.example` for required environment variables.
