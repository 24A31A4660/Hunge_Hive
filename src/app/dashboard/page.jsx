'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/ui/StatsCard';
import DonationCard from '../../components/donations/DonationCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DonationsBarChart, StatusPieChart, ImpactAreaChart } from '../../components/charts/ImpactCharts';
import { useToast } from '../../contexts/ToastContext';
import { getBadgeInfo } from '../../lib/utils';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchDonations = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const url = user.role === 'ngo'
        ? `/api/donations?status=pending&status=accepted&limit=5`
        : user.role === 'volunteer'
          ? `/api/donations?status=accepted&limit=5`
          : `/api/donations?donor=${user.id}&limit=5`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setDonations(data.donations || []);
      }
    } catch {
      toast.error('Failed to load donations');
    } finally {
      setLoadingData(false);
    }
  }, [user, authFetch, toast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const statsRes = await authFetch('/api/stats');
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s);
        }
      } catch (err) {
        console.error('Stats error:', err);
        toast.error('Failed to load stats');
      }

      await fetchDonations();
    };

    fetchData();
  }, [user?.id]);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    try {
      const res = await authFetch(`/api/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'accepted' }),
      });
      const data = await res.json();
      if (res.ok && data.donation) {
        toast.success('Donation accepted!');
        await fetchDonations();
        return;
      }
      toast.error(data.error || 'Failed to accept donation');
    } catch (err) {
      console.error('Accept error:', err);
      toast.error('Failed to accept donation');
    } finally {
      setAcceptingId(null);
    }
  };

  const handlePickup = async (id) => {
    try {
      console.log('Pickup attempt for donation:', id);
      const res = await authFetch(`/api/deliveries`, {
        method: 'POST',
        body: JSON.stringify({ donationId: id }),
      });
      
      if (res.ok) {
        console.log('Delivery created successfully');
        const statusRes = await authFetch(`/api/donations/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'picked' }),
        });
        if (statusRes.ok) {
          toast.success('Picked up! ✅');
          setDonations(prev => prev.map(d => d._id === id ? { ...d, status: 'picked' } : d));
          return;
        } else {
          const statusError = await statusRes.json();
          console.error('Donation status update failed:', statusError);
          toast.error(`Status update failed: ${statusError.error || 'Unknown error'}`);
          return;
        }
      } else {
        const errorData = await res.json();
        console.error('Delivery creation failed:', errorData);
        toast.error(`Pickup failed: ${errorData.error || 'Unknown error'}`);
        // If already assigned to current user, try direct pickup
        if (errorData.error?.includes('already assigned')) {
          console.log('Handling existing delivery case...');
          const statusRes = await authFetch(`/api/donations/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'picked' }),
          });
          if (statusRes.ok) {
            toast.success('Picked up existing delivery! ✅');
            setDonations(prev => prev.map(d => d._id === id ? { ...d, status: 'picked' } : d));
          } else {
            const statusError = await statusRes.json();
            toast.error(`Direct pickup failed: ${statusError.error || 'Unknown'}`);
          }
        }
      }
    } catch (err) {
      console.error('Pickup error:', err);
      toast.error('Network error during pickup');
    }
  };



  if (authLoading || !user) return <LoadingSpinner />;

  const roleConfig = {
    donor: { greeting: 'Ready to share some food today?', cta: { label: '+ Add Donation', href: '/donations/new' } },
    ngo: { greeting: 'Here are available donations near you', cta: { label: 'View All Donations', href: '/donations' } },
    volunteer: { greeting: 'Ready for your next delivery mission?', cta: { label: 'View Deliveries', href: '/deliveries' } },
    admin: { greeting: 'Platform overview at a glance', cta: { label: 'Admin Panel', href: '/dashboard/admin' } },
  };

  const config = roleConfig[user.role] || roleConfig.donor;
  const currentBadge = user.badges?.length > 0 ? getBadgeInfo(user.badges[user.badges.length - 1]) : null;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Dashboard</h1>
            <p className="mt-1" style={{ color: '#888' }}>{config.greeting}</p>
          </div>
          <Link href={config.cta.href} className="btn-primary">
            {config.cta.label}
          </Link>
        </div>

        {/* Stats Bento Grid */}
        <div className="bento-grid animate-stagger">
          <StatsCard icon="🍱" label="Total Donations" value={stats?.stats?.totalDonations || 0} color="primary" />
          <StatsCard icon="🍽️" label="Meals Saved" value={stats?.stats?.totalMeals || 0} color="blue" />
          <StatsCard icon="⏳" label="Pending" value={stats?.stats?.pendingDonations || 0} color="orange" />
          <StatsCard icon="✅" label="Delivered" value={stats?.stats?.deliveredDonations || 0} color="purple" />
        </div>

        {/* Badge (donor only) */}
        {user.role === 'donor' && currentBadge && (
          <div className="glass-card p-5 border" style={{ background: '#111', borderColor: 'rgba(255,193,7,0.3)' }}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentBadge.icon}</span>
              <div>
                <p className="font-bold text-white">{currentBadge.label}</p>
                <p className="text-sm" style={{ color: '#888' }}>You&apos;ve made {user.totalDonations} donations. Keep going!</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bento-item span-1">
            <h3 className="text-lg font-bold font-display text-white mb-4">Monthly Donations</h3>
            {stats?.monthlyDonations?.length > 0 ? (
              <DonationsBarChart data={stats.monthlyDonations} />
            ) : (
              <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#666' }}>
                No data yet — start donating!
              </div>
            )}
          </div>
          <div className="bento-item span-1">
            <h3 className="text-lg font-bold font-display text-white mb-4">Impact Trend</h3>
            {stats?.monthlyDonations?.length > 0 ? (
              <ImpactAreaChart data={stats.monthlyDonations} />
            ) : (
              <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#666' }}>
                Impact data will appear here
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display text-white">
              {user.role === 'donor' ? 'Your Recent Donations' : 'Recent Available Donations'}
            </h3>
            <Link href="/donations" className="text-sm font-semibold transition-colors hover:text-white" style={{ color: '#FFC107' }}>
              View All →
            </Link>
          </div>
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
                />
              ))}
            </div>
          ) : (
            <div className="bento-item p-12 text-center">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="font-medium" style={{ color: '#888' }}>No donations yet</p>
              {user.role === 'donor' && (
                <Link href="/donations/new" className="btn-primary mt-4 inline-block">Create First Donation</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
