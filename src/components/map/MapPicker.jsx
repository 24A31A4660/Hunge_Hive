'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export default function MapPicker({ position, onPositionChange, markers = [], height = '400px', className = '' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) return;

      const defaultPos = position || [17.385, 78.4867]; // Hyderabad
      const map = L.map(mapRef.current).setView(defaultPos, 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 250);

      // Draggable marker for pin selection
      if (onPositionChange) {
        const marker = L.marker(defaultPos, { draggable: true }).addTo(map);
        markerRef.current = marker;

        const updateAddress = async (lat, lng) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setAddress(addr);
            onPositionChange({ lat, lng, address: addr });
          } catch {
            const addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setAddress(addr);
            onPositionChange({ lat, lng, address: addr });
          }
        };

        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          updateAddress(lat, lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          updateAddress(e.latlng.lat, e.latlng.lng);
        });

        if (position) {
          updateAddress(position[0], position[1]);
        }
      }

      // Static markers
      const colorIcons = {
        donor: '🟢',
        ngo: '🔵',
        volunteer: '🟣',
        donation: '🍱',
      };

      markers.forEach(m => {
        if (m.coordinates) {
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${colorIcons[m.type] || '📍'}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          L.marker(m.coordinates, { icon })
            .addTo(map)
            .bindPopup(`<strong>${m.title || ''}</strong><br/>${m.subtitle || ''}`);
        }
      });
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker if position changes externally
  useEffect(() => {
    if (position && markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng(position);
      mapInstanceRef.current.setView(position, 14);
    }
  }, [position]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const results = await res.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latNum, lngNum], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([latNum, lngNum]);
        }
        setAddress(display_name);
        onPositionChange?.({ lat: latNum, lng: lngNum, address: display_name });
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (mapInstanceRef.current) mapInstanceRef.current.setView([lat, lng], 15);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(r => r.json())
          .then(data => {
            const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setAddress(addr);
            onPositionChange?.({ lat, lng, address: addr });
          })
          .catch(() => {
            onPositionChange?.({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          });
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {onPositionChange && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field flex-1"
          />
          <button type="button" onClick={handleSearch} className="btn-primary !py-2 !px-4">
            🔍
          </button>
          <button type="button" onClick={handleLocateMe} className="btn-secondary !py-2 !px-4" title="Use my location">
            📍
          </button>
        </div>
      )}
      <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-xl overflow-hidden border border-surface-200" />
      {address && onPositionChange && (
        <p className="text-xs text-surface-500 px-1">📍 {address}</p>
      )}
    </div>
  );
}
