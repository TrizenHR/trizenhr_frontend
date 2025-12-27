import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AE</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">AttendEase</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center">
        <div className="container flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Attendance ERP Dashboard
            </h1>
            <p className="text-muted-foreground">
              Production scaffolding complete. Ready for feature implementation.
            </p>
          </div>

          <div className="flex gap-4">
            <Button>Get Started</Button>
            <Button variant="outline">Documentation</Button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <StatusCard title="Frontend" status="Ready" description="Next.js + TypeScript" />
            <StatusCard title="Styling" status="Ready" description="Tailwind + shadcn/ui" />
            <StatusCard title="Backend" status="Pending" description="Express + MongoDB" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container flex items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            AttendEase Attendance ERP &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  status: string;
  description: string;
}

function StatusCard({ title, status, description }: StatusCardProps) {
  const isReady = status === 'Ready';

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isReady
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
