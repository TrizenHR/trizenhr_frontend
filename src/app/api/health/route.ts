import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      build:
        process.env.NEXT_PUBLIC_BUILD_ID ||
        process.env.CAPROVER_GIT_COMMIT_SHA ||
        'unknown',
      timestamp: new Date().toISOString(),
      time: Date.now(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
