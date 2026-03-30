'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../../components/map/MapPicker'), { ssr: false, loading: () => <div className="h-96 bg-surface-100 rounded-xl animate-pulse" /> });

export default function MapPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await authFetch('/api/donations?status=pending&limit=100');
        if (res.ok) {
          const data = await res.json();
          setDonations(data.donations || []);
        }
      } catch {
        toast.error('Failed to load map data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (authLoading || !user) return <LoadingSpinner />;

  const markers = donations
    .filter(d => d.location?.coordinates?.length === 2)
    .map(d => ({
      coordinates: [d.location.coordinates[1], d.location.coordinates[0]],
      type: 'donation',
      title: d.foodType,
      subtitle: `${d.quantity} ${d.unit} · ${d.category}`,
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-surface-900">Map View</h1>
          <p className="text-surface-500 mt-1">See all available donations on the map</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5"><span className="text-lg">🍱</span> Donations</span>
          <span className="flex items-center gap-1.5"><span className="text-lg">🟢</span> Donors</span>
          <span className="flex items-center gap-1.5"><span className="text-lg">🔵</span> NGOs</span>
          <span className="flex items-center gap-1.5"><span className="text-lg">🟣</span> Volunteers</span>
        </div>

        <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {loadingData ? (
            <LoadingSpinner text="Loading map data..." />
          ) : (
            <MapPicker markers={markers} height="100%" />
          )}
        </div>

        {/* Stats under map */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bento-item text-center">
            <p className="text-2xl font-bold font-display gradient-text">{markers.length}</p>
            <p className="text-xs text-surface-500 mt-1">Active Donations</p>
          </div>
          <div className="bento-item text-center">
            <p className="text-2xl font-bold font-display gradient-text">
              {donations.filter(d => d.category === 'veg').length}
            </p>
            <p className="text-xs text-surface-500 mt-1">🟢 Veg</p>
          </div>
          <div className="bento-item text-center">
            <p className="text-2xl font-bold font-display gradient-text">
              {donations.filter(d => d.category === 'non-veg').length}
            </p>
            <p className="text-xs text-surface-500 mt-1">🔴 Non-Veg</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
