'use client';

import { useState, useEffect } from 'react';

interface GeoState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

// Default to BGC, Taguig, Metro Manila if geolocation is unavailable
export const PH_DEFAULT_LAT = 14.5547;
export const PH_DEFAULT_LNG = 121.0509;

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        loading: false,
        error: 'Geolocation not supported',
        latitude: PH_DEFAULT_LAT,
        longitude: PH_DEFAULT_LNG,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({
          latitude: PH_DEFAULT_LAT,
          longitude: PH_DEFAULT_LNG,
          accuracy: null,
          loading: false,
          error: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return state;
}
