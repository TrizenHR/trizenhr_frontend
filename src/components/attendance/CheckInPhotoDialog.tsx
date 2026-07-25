'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatTimeOnly } from '@/lib/date-utils';
import { Camera, Loader2, LogIn, LogOut } from 'lucide-react';
import { attendanceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type AttendancePhotoKind = 'check-in' | 'check-out';

export type CheckInPhotoTarget = {
  attendanceId: string;
  employeeName?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  kind?: AttendancePhotoKind;
};

type CheckInPhotoDialogProps = {
  target: CheckInPhotoTarget | null;
  onClose: () => void;
};

export function CheckInPhotoDialog({ target, onClose }: CheckInPhotoDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const kind: AttendancePhotoKind = target?.kind ?? 'check-in';
  const kindLabel = kind === 'check-out' ? 'Check-out' : 'Check-in';

  useEffect(() => {
    if (!target?.attendanceId) {
      setImageSrc(null);
      setError(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    const loadPhoto = async () => {
      setIsLoading(true);
      setError(null);
      setImageSrc(null);

      try {
        const blob =
          kind === 'check-out'
            ? await attendanceApi.getCheckOutPhotoBlob(target.attendanceId)
            : await attendanceApi.getCheckInPhotoBlob(target.attendanceId);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data
            ?.error ||
          (err as Error)?.message ||
          `Could not load ${kindLabel.toLowerCase()} photo`;
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadPhoto();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [target?.attendanceId, kind, kindLabel]);

  const title = target?.employeeName
    ? `${kindLabel} photo — ${target.employeeName}`
    : `${kindLabel} photo`;

  const descriptionParts: string[] = [];
  if (target?.date) {
    descriptionParts.push(format(new Date(target.date), 'MMMM dd, yyyy'));
  }
  if (kind === 'check-out' && target?.checkOut) {
    descriptionParts.push(formatTimeOnly(target.checkOut));
  } else if (target?.checkIn) {
    descriptionParts.push(formatTimeOnly(target.checkIn));
  }

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {title}
          </DialogTitle>
          {descriptionParts.length > 0 && (
            <DialogDescription>{descriptionParts.join(' · ')}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex min-h-[280px] items-center justify-center rounded-lg border bg-muted/30 p-2">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading photo…</p>
            </div>
          ) : error ? (
            <p className="px-4 text-center text-sm text-destructive">{error}</p>
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={`${kindLabel} verification photo`}
              className="max-h-[420px] w-full rounded-md object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No photo available</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CheckInPhotoButtonProps = {
  attendanceId: string;
  employeeName?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  kind?: AttendancePhotoKind;
  onView: (target: CheckInPhotoTarget) => void;
  className?: string;
};

/** Single photo button — prefer AttendancePhotoButtons for admin tables. */
export function CheckInPhotoButton({
  attendanceId,
  employeeName,
  date,
  checkIn,
  checkOut,
  kind = 'check-in',
  onView,
  className,
}: CheckInPhotoButtonProps) {
  const label = kind === 'check-out' ? 'View check-out' : 'View check-in';
  const Icon = kind === 'check-out' ? LogOut : LogIn;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() =>
        onView({
          attendanceId,
          employeeName,
          date,
          checkIn,
          checkOut,
          kind,
        })
      }
    >
      <Icon className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}

type AttendancePhotoButtonsProps = {
  attendanceId: string;
  employeeName?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  hasCheckInPhoto?: boolean;
  hasCheckOutPhoto?: boolean;
  photoUrl?: string | null;
  checkOutPhotoUrl?: string | null;
  onView: (target: CheckInPhotoTarget) => void;
  className?: string;
};

/** Admin: View check-in / View check-out (only when each photo exists). */
export function AttendancePhotoButtons({
  attendanceId,
  employeeName,
  date,
  checkIn,
  checkOut,
  hasCheckInPhoto,
  hasCheckOutPhoto,
  photoUrl,
  checkOutPhotoUrl,
  onView,
  className,
}: AttendancePhotoButtonsProps) {
  const showCheckIn = Boolean(hasCheckInPhoto || photoUrl);
  const showCheckOut = Boolean(hasCheckOutPhoto || checkOutPhotoUrl);

  if (!showCheckIn && !showCheckOut) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      {showCheckIn ? (
        <CheckInPhotoButton
          attendanceId={attendanceId}
          employeeName={employeeName}
          date={date}
          checkIn={checkIn}
          kind="check-in"
          onView={onView}
        />
      ) : null}
      {showCheckOut ? (
        <CheckInPhotoButton
          attendanceId={attendanceId}
          employeeName={employeeName}
          date={date}
          checkOut={checkOut}
          kind="check-out"
          onView={onView}
        />
      ) : null}
    </div>
  );
}
