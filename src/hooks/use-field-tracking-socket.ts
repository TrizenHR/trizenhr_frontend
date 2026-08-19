'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';

export type FieldTrackingLocationEvent = {
  sessionId: string;
  userId: string;
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
};

function getSocketUrl(): string {
  return API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/i, '') || 'http://localhost:5000';
}

function readAuth(preferredOrgId?: string | null): {
  token: string | null;
  organizationId: string | null;
} {
  if (typeof window === 'undefined') {
    return { token: null, organizationId: null };
  }
  const token = localStorage.getItem('token');
  const selectedOrgId = localStorage.getItem('selectedOrganizationId');
  let organizationId = preferredOrgId || selectedOrgId;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      organizationId =
        preferredOrgId ||
        selectedOrgId ||
        parsed.organizationId ||
        parsed.organization?._id ||
        parsed.organization?.id ||
        null;
    }
  } catch {
    // ignore
  }
  return { token, organizationId: organizationId ? String(organizationId) : null };
}

/**
 * Live admin map: Socket.IO only (no polling).
 * Server auto-joins the org room from JWT; client join is a backup.
 */
export function useFieldTrackingLiveSocket(
  enabled: boolean,
  onLocation: (payload: FieldTrackingLocationEvent) => void,
  organizationId?: string | null
) {
  const onLocationRef = useRef(onLocation);
  onLocationRef.current = onLocation;

  useEffect(() => {
    if (!enabled) return;

    const auth = readAuth(organizationId);
    if (!auth.token) return;

    const socket: Socket = io(getSocketUrl(), {
      auth: { token: auth.token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    const join = () => {
      if (auth.organizationId) {
        socket.emit('field-tracking:join', { organizationId: auth.organizationId });
      }
    };

    const onLocationEvent = (payload: FieldTrackingLocationEvent) => {
      onLocationRef.current(payload);
    };

    socket.on('connect', join);
    socket.io.on('reconnect', join);
    socket.on('field-tracking:location', onLocationEvent);
    if (socket.connected) {
      join();
    }

    return () => {
      if (auth.organizationId) {
        socket.emit('field-tracking:leave', { organizationId: auth.organizationId });
      }
      socket.off('connect', join);
      socket.io.off('reconnect', join);
      socket.off('field-tracking:location', onLocationEvent);
      socket.disconnect();
    };
  }, [enabled, organizationId]);
}
