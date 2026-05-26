'use client';

import { useEffect, useRef } from 'react';
import { useUpdateLocation } from './useDriverDashboard';

const HEARTBEAT_INTERVAL_MS = 10_000; // 10 seconds

/**
 * When isOnline=true, sends the driver's GPS position to the API every 10s.
 * Uses the browser Geolocation API with high accuracy.
 * Cleans up on unmount or when driver goes offline.
 */
export function useGPSHeartbeat(isOnline: boolean) {
  const { mutate: updateLocation } = useUpdateLocation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef = useRef<number | null>(null);
  const lastPos = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!isOnline || !navigator.geolocation) return;

    const sendLocation = (lat: number, lng: number) => {
      // Only send if position changed by >10m
      if (lastPos.current) {
        const dLat = Math.abs(lat - lastPos.current.lat);
        const dLng = Math.abs(lng - lastPos.current.lng);
        if (dLat < 0.0001 && dLng < 0.0001) return;
      }
      lastPos.current = { lat, lng };
      updateLocation({ latitude: lat, longitude: lng });
    };

    // Start watching position
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn('GPS error:', err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
    );

    // Fallback interval in case watchPosition doesn't fire frequently
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isOnline, updateLocation]);
}
