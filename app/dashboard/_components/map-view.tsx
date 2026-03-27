'use client';

import { useEffect, useRef } from 'react';

interface MapBrand {
  id: string;
  brand_name: string;
  official_domain?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

interface MapViewProps {
  brands: MapBrand[];
  onMarkerClick?: (brand: MapBrand) => void;
}

// Simple lat/lng lookup for common cities (instant, no API)
const CITY_COORDS: Record<string, [number, number]> = {
  'new york': [40.7128, -74.0060],
  'los angeles': [34.0522, -118.2437],
  'london': [51.5074, -0.1278],
  'chicago': [41.8781, -87.6298],
  'san francisco': [37.7749, -122.4194],
  'toronto': [43.6532, -79.3832],
  'sydney': [-33.8688, 151.2093],
  'berlin': [52.5200, 13.4050],
  'paris': [48.8566, 2.3522],
  'amsterdam': [52.3676, 4.9041],
  'tokyo': [35.6762, 139.6503],
  'melbourne': [-37.8136, 144.9631],
  'austin': [30.2672, -97.7431],
  'seattle': [47.6062, -122.3321],
  'boston': [42.3601, -71.0589],
  'denver': [39.7392, -104.9903],
  'miami': [25.7617, -80.1918],
  'dallas': [32.7767, -96.7970],
  'atlanta': [33.7490, -84.3880],
  'vancouver': [49.2827, -123.1207],
  'montreal': [45.5017, -73.5673],
  'dubai': [25.2048, 55.2708],
  'singapore': [1.3521, 103.8198],
  'hong kong': [22.3193, 114.1694],
  'barcelona': [41.3851, 2.1734],
  'stockholm': [59.3293, 18.0686],
  'oslo': [59.9139, 10.7522],
  'copenhagen': [55.6761, 12.5683],
  'zurich': [47.3769, 8.5417],
  'munich': [48.1351, 11.5820],
  'portland': [45.5051, -122.6750],
  'nashville': [36.1627, -86.7816],
  'phoenix': [33.4484, -112.0740],
  'minneapolis': [44.9778, -93.2650],
  'san diego': [32.7157, -117.1611],
  'detroit': [42.3314, -83.0458],
  'philadelphia': [39.9526, -75.1652],
  'washington': [38.9072, -77.0369],
  'las vegas': [36.1699, -115.1398],
  'salt lake city': [40.7608, -111.8910],
  'kansas city': [39.0997, -94.5786],
  'calgary': [51.0447, -114.0719],
};

function guessCoords(location?: string): [number, number] | null {
  if (!location) return null;
  const low = location.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (low.includes(city)) return coords;
  }
  return null;
}

// Add small random jitter so overlapping pins spread out
function jitter(coord: number, amount = 0.08): number {
  return coord + (Math.random() - 0.5) * amount;
}

export default function MapView({ brands, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // Dynamically load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!mapRef.current || leafletRef.current) return;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [30, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      leafletRef.current = { map, L, markers: [] as unknown[] };
      updateMarkers(L, map, brands, onMarkerClick);
    });

    return () => {
      if (leafletRef.current?.map) {
        leafletRef.current.map.remove();
        leafletRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when brands change
  useEffect(() => {
    if (!leafletRef.current) return;
    const { L, map } = leafletRef.current;
    // Clear existing markers
    for (const m of leafletRef.current.markers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m as any).remove();
    }
    leafletRef.current.markers = [];
    updateMarkers(L, map, brands, onMarkerClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands]);

  function updateMarkers(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map: any,
    list: MapBrand[],
    onClick?: (b: MapBrand) => void,
  ) {
    if (!leafletRef.current) return;
    const bounds: [number, number][] = [];

    for (const brand of list) {
      const coords = guessCoords(brand.location);
      if (!coords) continue;

      const lat = jitter(coords[0], 0.05);
      const lng = jitter(coords[1], 0.05);

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:30px;height:30px;border-radius:50%;
          background:#1d4ed8;border:2px solid #fff;
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:10px;font-weight:700;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          cursor:pointer;
        ">${brand.brand_name?.[0]?.toUpperCase() ?? '?'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      if (onClick) {
        marker.on('click', () => onClick(brand));
      }

      leafletRef.current.markers.push(marker);
      bounds.push([lat, lng]);
    }

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      } catch { /* ignore */ }
    }
  }

  const mappableBrands = brands.filter((b) => guessCoords(b.location));

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
      {mappableBrands.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(248,250,252,0.85)', borderRadius: 'inherit',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🗺️</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
            Map pins will appear as brands are enriched
          </div>
        </div>
      )}
      {mappableBrands.length > 0 && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
          borderRadius: '6px', padding: '0.3rem 0.65rem',
          fontSize: '0.68rem', fontWeight: 600, color: '#1d4ed8',
          border: '1px solid #bfdbfe', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}>
          📍 {mappableBrands.length} brand{mappableBrands.length !== 1 ? 's' : ''} mapped
        </div>
      )}
    </div>
  );
}
