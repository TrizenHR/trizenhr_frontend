'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { formatTimeOnly } from '@/lib/date-utils';
import { reverseGeocodeAreaName } from '@/lib/reverseGeocode';

type AttendancePunchCellProps = {
  time?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  /** When false, only the punch time is shown. */
  showLocation?: boolean;
};

function hasCoordinates(
  latitude?: number | null,
  longitude?: number | null
): latitude is number {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  );
}

export function AttendancePunchCell({
  time,
  latitude,
  longitude,
  locationLabel,
  showLocation = false,
}: AttendancePunchCellProps) {
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(locationLabel?.trim() || null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!showLocation) return;
    if (locationLabel?.trim()) {
      setResolvedLabel(locationLabel.trim());
      setIsResolving(false);
      return;
    }
    const lat = latitude;
    const lng = longitude;
    if (
      typeof lat !== 'number' ||
      !Number.isFinite(lat) ||
      typeof lng !== 'number' ||
      !Number.isFinite(lng)
    ) {
      setResolvedLabel(null);
      setIsResolving(false);
      return;
    }

    let cancelled = false;
    setIsResolving(true);
    void reverseGeocodeAreaName(lat, lng).then((label) => {
      if (!cancelled) {
        setResolvedLabel(label || null);
        setIsResolving(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showLocation, locationLabel, latitude, longitude]);

  if (!time) {
    return <span className="text-muted-foreground">—</span>;
  }

  const timeLabel = formatTimeOnly(time);
  const hasGps = hasCoordinates(latitude, longitude);
  const mapsHref = showLocation && hasGps ? `https://www.google.com/maps?q=${latitude},${longitude}` : null;

  const locationLine = (() => {
    if (!showLocation) return null;
    if (resolvedLabel) return resolvedLabel;
    if (isResolving) return null;
    if (!hasGps) return 'Not captured';
    return null;
  })();

  return (
    <div className="min-w-[120px] space-y-1">
      <div className="whitespace-nowrap font-medium">{timeLabel}</div>
      {locationLine ? (
        <div
          className={`text-xs leading-snug ${
            locationLine === 'Not captured' ? 'italic text-muted-foreground' : 'text-muted-foreground'
          }`}
        >
          {locationLine}
        </div>
      ) : null}
      {mapsHref ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <MapPin className="h-3 w-3" />
          Map
        </a>
      ) : null}
    </div>
  );
}

export function punchExportLabel(
  time?: string | null,
  locationLabel?: string | null,
  latitude?: number | null,
  longitude?: number | null,
  showLocation = false
): string {
  if (!time) return '-';
  const timePart = formatTimeOnly(time);
  if (!showLocation) return timePart;
  if (locationLabel?.trim()) return `${timePart} — ${locationLabel.trim()}`;
  if (hasCoordinates(latitude, longitude)) return `${timePart} — GPS recorded`;
  return `${timePart} — Not captured`;
}
