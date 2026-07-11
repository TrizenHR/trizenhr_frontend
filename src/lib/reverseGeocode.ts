import { attendanceApi } from '@/lib/api';

const labelCache = new Map<string, string>();
const pending = new Map<string, Promise<string | undefined>>();

function cacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

export async function reverseGeocodeAreaName(
  latitude: number,
  longitude: number
): Promise<string | undefined> {
  const key = cacheKey(latitude, longitude);
  const cached = labelCache.get(key);
  if (cached) return cached;

  const inflight = pending.get(key);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const label = await attendanceApi.resolveAreaName(latitude, longitude);
      if (label) labelCache.set(key, label);
      return label || undefined;
    } catch {
      return undefined;
    } finally {
      pending.delete(key);
    }
  })();

  pending.set(key, request);
  return request;
}

export function formatPunchWithLocation(
  timeLabel: string,
  areaLabel?: string | null
): string {
  if (!areaLabel?.trim()) return timeLabel;
  return `${timeLabel} — ${areaLabel.trim()}`;
}
