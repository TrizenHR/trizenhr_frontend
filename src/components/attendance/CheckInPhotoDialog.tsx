'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { formatTimeOnly } from '@/lib/date-utils';
import { Camera, Loader2 } from 'lucide-react';
import { attendanceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type CheckInPhotoTarget = {
  attendanceId: string;
  employeeName?: string;
  date?: string;
  checkIn?: string;
};

type CheckInPhotoDialogProps = {
  target: CheckInPhotoTarget | null;
  onClose: () => void;
};

export function CheckInPhotoDialog({ target, onClose }: CheckInPhotoDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const blob = await attendanceApi.getCheckInPhotoBlob(target.attendanceId);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data
            ?.error ||
          (err as Error)?.message ||
          'Could not load check-in photo';
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
  }, [target?.attendanceId]);

  const title = target?.employeeName
    ? `Check-in photo — ${target.employeeName}`
    : 'Check-in photo';

  const descriptionParts: string[] = [];
  if (target?.date) {
    descriptionParts.push(format(new Date(target.date), 'MMMM dd, yyyy'));
  }
  if (target?.checkIn) {
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
              alt="Check-in verification photo"
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
  onView: (target: CheckInPhotoTarget) => void;
  className?: string;
};

export function CheckInPhotoButton({
  attendanceId,
  employeeName,
  date,
  checkIn,
  onView,
  className,
}: CheckInPhotoButtonProps) {
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
        })
      }
    >
      <Camera className="mr-1.5 h-4 w-4" />
      View photo
    </Button>
  );
}
