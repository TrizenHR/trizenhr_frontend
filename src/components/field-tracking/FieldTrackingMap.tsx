'use client';

import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FieldLocationPoint, FieldTrackingLiveSession } from '@/lib/types';

const DEFAULT_CENTER: [number, number] = [17.385044, 78.486671];
const DEFAULT_ZOOM = 12;

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({
  positions,
}: {
  positions: Array<[number, number]>;
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 16 });
  }, [map, positions]);

  return null;
}

function sessionDisplayName(session: FieldTrackingLiveSession): string {
  const u = session.user;
  if (!u) return session.userId || 'Employee';
  if (u.fullName) return u.fullName;
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return name || u.employeeId || u.email || session.userId || 'Employee';
}

export type FieldTrackingMapProps = {
  sessions: FieldTrackingLiveSession[];
  /** Travel route drawn on the same map when an employee is selected. */
  pathPoints?: FieldLocationPoint[];
  selectedSessionId?: string | null;
  /** Date used for check-in photo lookup (yyyy-MM-dd). */
  routeDate?: string;
  onSelectSession?: (session: FieldTrackingLiveSession) => void;
  onViewCheckInPhoto?: (session: FieldTrackingLiveSession) => void;
  className?: string;
};

export function FieldTrackingMap({
  sessions,
  pathPoints = [],
  selectedSessionId,
  onSelectSession,
  onViewCheckInPhoto,
  className,
}: FieldTrackingMapProps) {
  const livePositions = useMemo(
    () =>
      sessions
        .filter((s) => s.lastLocation)
        .map(
          (s) =>
            [s.lastLocation!.latitude, s.lastLocation!.longitude] as [number, number]
        ),
    [sessions]
  );

  const pathPositions = useMemo(
    () => pathPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
    [pathPoints]
  );

  // Prefer fitting to the selected route; otherwise show all live markers.
  const fitPositions = pathPositions.length > 0 ? pathPositions : livePositions;
  const center = fitPositions[0] ?? DEFAULT_CENTER;

  return (
    <div
      className={`relative z-0 isolate ${
        className ?? 'h-[520px] w-full overflow-hidden rounded-xl border'
      }`}
    >
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={fitPositions} />

        {/* Route for the selected employee — drawn on the same map */}
        {pathPositions.length > 0 ? (
          <Polyline
            positions={pathPositions}
            pathOptions={{ color: '#0f766e', weight: 5, opacity: 0.9 }}
          />
        ) : null}

        {/* Live markers for all active field employees */}
        {sessions.map((session) => {
          if (!session.lastLocation) return null;
          const { latitude, longitude, recordedAt, accuracy } = session.lastLocation;
          const isSelected = session.sessionId === selectedSessionId;
          return (
            <Marker
              key={session.sessionId}
              position={[latitude, longitude]}
              icon={isSelected ? selectedMarkerIcon : markerIcon}
              eventHandlers={{
                click: () => onSelectSession?.(session),
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{sessionDisplayName(session)}</p>
                  {session.user?.employeeId ? (
                    <p className="text-muted-foreground">ID: {session.user.employeeId}</p>
                  ) : null}
                  {recordedAt ? (
                    <p className="text-muted-foreground">
                      Updated: {new Date(recordedAt).toLocaleString()}
                    </p>
                  ) : null}
                  {typeof accuracy === 'number' ? (
                    <p className="text-muted-foreground">Accuracy: {Math.round(accuracy)} m</p>
                  ) : null}
                  {typeof session.pointCount === 'number' ? (
                    <p className="text-muted-foreground">Points: {session.pointCount}</p>
                  ) : null}
                  {session.attendanceId && onViewCheckInPhoto ? (
                    <button
                      type="button"
                      className="mt-2 w-full rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewCheckInPhoto(session);
                      }}
                    >
                      View check-in photo
                    </button>
                  ) : null}
                  <p className="text-xs text-muted-foreground">Click marker to show route on map</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
