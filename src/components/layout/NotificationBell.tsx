'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Building2,
  CalendarClock,
  Check,
  CheckCheck,
  ClipboardList,
  CreditCard,
  Loader2,
  Trash2,
  UserX,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { notificationsApi } from '@/lib/api';
import type { DashboardNotificationItem } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { NOTIFICATIONS_REFRESH_EVENT } from '@/lib/notifications-events';

function notificationPollMs(user: { platformPreferences?: { notifications?: { pollIntervalSec?: number } } } | null) {
  const sec = user?.platformPreferences?.notifications?.pollIntervalSec ?? 45;
  const ms = Math.round(sec * 1000);
  return Math.min(300_000, Math.max(15_000, ms));
}

function iconForType(type: string) {
  switch (type) {
    case 'leave_pending':
      return ClipboardList;
    case 'leave_outcome':
      return CalendarClock;
    case 'attendance_reminder':
      return CalendarClock;
    case 'org_new':
    case 'org_inactive':
      return Building2;
    case 'org_deleted':
      return Trash2;
    case 'payroll_completed':
    case 'payroll_draft':
      return Wallet;
    case 'subscription_expiring':
      return CreditCard;
    case 'account_deactivated':
      return UserX;
    default:
      return Bell;
  }
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DashboardNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const nf = user?.platformPreferences?.notifications;
  const pollMs = user ? notificationPollMs(user) : 45_000;
  const refreshOnTabFocus = nf?.refreshOnTabFocus !== false;
  const showUnreadBadge = nf?.showUnreadBadge !== false;

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await notificationsApi.getList();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // Keep prior state; avoid toast spam on background poll
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), pollMs);
    const onVis = () => {
      if (!refreshOnTabFocus) return;
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user, refresh, pollMs, refreshOnTabFocus]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  useEffect(() => {
    const onRefresh = () => void refresh();
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  const onMarkAll = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.markAllRead();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  };

  const onItemClick = async (n: DashboardNotificationItem) => {
    try {
      setActionId(n.id);
      if (!n.read) {
        const data = await notificationsApi.markRead([n.id]);
        setItems(data.items);
        setUnreadCount(data.unreadCount);
      }
      setOpen(false);
      if (n.href) {
        router.push(n.href);
      }
    } finally {
      setActionId(null);
    }
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative shrink-0"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {showUnreadBadge && unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-1.5rem),22rem)] p-0 sm:w-96"
        collisionPadding={12}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          <div className="flex items-center gap-1">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" aria-hidden />}
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs text-blue-700"
                onClick={() => void onMarkAll()}
                disabled={loading}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[min(70vh,26rem)] overflow-y-auto overscroll-y-contain">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-gray-500">
              You&apos;re all caught up. Important updates for your role will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100" role="list">
              {items.map((n) => {
                const Icon = iconForType(n.type);
                const busy = actionId === n.id;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50',
                        !n.read && 'bg-blue-50/40'
                      )}
                      onClick={() => void onItemClick(n)}
                      disabled={busy}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          n.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Icon className="h-4 w-4" aria-hidden />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-gray-900">{n.title}</span>
                          {n.read ? (
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" aria-label="Read" />
                          ) : (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-hidden />
                          )}
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs text-gray-600">{n.body}</span>
                        <span className="mt-1 text-[11px] text-gray-400">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
