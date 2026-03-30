'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Link from 'next/link';

export default function DonationsPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const fetchDonations = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const params = new URLSearchParams();
      if (user.role === 'donor') {
        params.set('donor', user.id);
      } else if (user.role === 'ngo' && !statusFilter) {
        params.append('status', 'pending');
        params.append('status', 'accepted');
      } else if (user.role === 'volunteer' && !statusFilter) {
        params.set('status', 'accepted');
      } else if (statusFilter) {
        params.set('status', statusFilter);
      }
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('limit', '50');

      const url = `/api/donations?${params.toString()}`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Error loading donations:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user, statusFilter, categoryFilter, authFetch, toast]);

  useEffect(() => {
    if (user) fetchDonations();
  }, [user?.id, statusFilter, categoryFilter]);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    try {
      const res = await authFetch(`/api/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'accepted' }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.donation) {
        toast.success('Accepted!');
        await fetchDonations();
        return;
      }
      
      if (res.status === 403) {
        toast.error('You must be logged in as an NGO to accept donations.');
      } else if (res.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(data.error || 'Failed to accept donation');
      }
    } catch (err) {
      toast.error('Error accepting donation');
    } finally {
      setAcceptingId(null);
    }
  };

  const handlePickup = async (id) => {
    try {
      await authFetch('/api/deliveries', { method: 'POST', body: JSON.stringify({ donationId: id }) });
      const res = await authFetch(`/api/donations/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'picked' }) });
      if (res.ok) { 
        toast.success('Picked up!'); 
        await fetchDonations(); 
      } else {
        toast.error('Failed to pick up donation');
      }
    } catch (err) { 
      console.error('Pickup error:', err);
      toast.error('Failed to pick up donation'); 
    }
  };

  const handleDeliver = async (id) => {
    try {
      const res = await authFetch(`/api/donations/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'delivered' }) });
      if (res.ok) { 
        toast.success('Delivered! 🎉'); 
        await fetchDonations(); 
      } else {
        toast.error('Failed to deliver donation');
      }
    } catch (err) { 
      console.error('Deliver error:', err);
      toast.error('Failed to deliver donation'); 
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold font-display text-surface-900">
                {user.role === 'donor' ? 'My Donations' : 'Available Donations'}
              </h1>
              <span className="px-2 py-1 rounded-md text-xs font-semibold bg-primary-100 text-primary-700 capitalize">
                {user.role}
              </span>
            </div>
            <p className="text-surface-500 mt-1">
              {user.role === 'donor' ? 'Track all your food donations' : 'Browse and accept available food donations'}
            </p>
          </div>
          {user.role === 'donor' && (
            <Link href="/donations/new" className="btn-primary">+ Add Donation</Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5 p-1 bg-surface-100 rounded-xl">
            {['', 'pending', 'accepted', 'picked', 'delivered', 'expired'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                  ${statusFilter === s ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 p-1 bg-surface-100 rounded-xl">
            {['', 'veg', 'non-veg'].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                  ${categoryFilter === c ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}
              >
                {c === 'veg' ? '🟢 Veg' : c === 'non-veg' ? '🔴 Non-Veg' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loadingData ? (
          <LoadingSpinner text="Loading donations..." />
        ) : donations.length > 0 ? (
          <div className="space-y-4">
            {donations.map(d => (
              <DonationCard
                key={d._id}
                donation={d}
                userRole={user.role}
                acceptingId={acceptingId}
                onAccept={handleAccept}
                onPickup={handlePickup}
                onDeliver={handleDeliver}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-lg font-semibold text-surface-700 mb-2">No donations found</p>
            <p className="text-sm text-surface-500 mb-4">Try adjusting your filters or check back later</p>
            {user.role === 'donor' && (
              <Link href="/donations/new" className="btn-primary inline-block">Create First Donation</Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
