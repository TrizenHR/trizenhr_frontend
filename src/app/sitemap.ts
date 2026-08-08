import { promises as fs } from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://trizenhr.com';

async function pageLastModified(relativePagePath: string): Promise<string | undefined> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', relativePagePath);
    const stat = await fs.stat(filePath);
    return stat.mtime.toISOString();
  } catch {
    return undefined;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [landingLastMod, privacyLastMod] = await Promise.all([
    pageLastModified('page.tsx'),
    pageLastModified('privacy-policy/page.tsx'),
  ]);

  return [
    {
      url: baseUrl,
      lastModified: landingLastMod,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: privacyLastMod,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
