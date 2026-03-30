'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

export default function DeliveriesPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [otpModalDelivery, setOtpModalDelivery] = useState(null);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchDeliveries = async () => {
      try {
        const res = await authFetch('/api/deliveries');
        if (res.ok) {
          const data = await res.json();
          setDeliveries(data.deliveries || []);
        }
      } catch {
        toast.error('Failed to load deliveries');
      } finally {
        setLoadingData(false);
      }
    };
    fetchDeliveries();
  }, [user]);

  const updateStatus = async (id, status, otp = null) => {
    console.log(`updateStatus called with id: ${id}, status: ${status}`);
    try {
       const payload = { status };
       if (otp) payload.otp = otp;
      const res = await authFetch(`/api/deliveries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      console.log('authFetch res status:', res.status, res.ok);
      if (res.ok) {
        toast.success(status === 'delivered' ? 'Delivery completed successfully! 🎉' : `Status updated to ${status}!`);
        setDeliveries(prev => prev.map(d => d._id === id ? { ...d, status } : d));
        if (status === 'delivered') {
          setOtpModalDelivery(null);
          setOtpCode('');
        }
      } else {
        const data = await res.json();
        console.error('Update failed with payload:', data);
        toast.error(data.error || 'Failed to update status');
      }
    } catch (e) {
      console.error('Update status threw error:', e);
      toast.error('Network error during update: ' + e.message); 
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-surface-900">
            {user.role === 'volunteer' ? 'My Deliveries' : 'All Deliveries'}
          </h1>
          <p className="text-surface-500 mt-1">Track and manage food deliveries</p>
        </div>

        {loadingData ? (
          <LoadingSpinner text="Loading deliveries..." />
        ) : deliveries.length > 0 ? (
          <div className="space-y-4">
            {deliveries.map(d => (
              <div key={d._id} className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🚚</span>
                      <div>
                        <p className="font-semibold text-surface-900">
                          {d.donation?.foodType || 'Food Delivery'}
                        </p>
                        <p className="text-xs text-surface-500">
                          From: {d.donation?.donor?.name || 'Unknown'} · {d.donation?.quantity} {d.donation?.unit}
                        </p>
                      </div>
                    </div>
                    {d.pickupLocation?.address && (
                      <p className="text-xs text-surface-500 mt-1">📍 Pickup: {d.pickupLocation.address}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <StatusBadge status={d.status} />
                      {d.pickedAt && <span className="text-xs text-surface-400">Picked: {new Date(d.pickedAt).toLocaleString()}</span>}
                      {d.deliveredAt && <span className="text-xs text-surface-400">Delivered: {new Date(d.deliveredAt).toLocaleString()}</span>}
                    </div>
                  </div>

                  {/* One-click actions for volunteers */}
                  {user.role === 'volunteer' && (
                    <div className="flex gap-2">
                      {d.status === 'assigned' && (
                        <button onClick={() => updateStatus(d._id, 'picked')} className="btn-primary !py-2 !px-4 !text-sm">
                          📦 Pick Up
                        </button>
                      )}
                      {d.status === 'picked' && (
                        <button onClick={() => updateStatus(d._id, 'in-transit')} className="btn-primary !py-2 !px-4 !text-sm !bg-gradient-to-r !from-blue-500 !to-indigo-600">
                          🚚 In Transit
                        </button>
                      )}
                      {d.status === 'in-transit' && (
                        <button onClick={() => setOtpModalDelivery(d._id)} className="btn-primary !py-2 !px-4 !text-sm !bg-gradient-to-r !from-emerald-500 !to-green-600">
                          ✅ Delivered
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <p className="text-5xl mb-4">🚚</p>
            <p className="text-lg font-semibold text-surface-700 mb-2">No deliveries yet</p>
            <p className="text-sm text-surface-500">Accept donations to start delivering</p>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {otpModalDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-surface-900 font-display mb-2">Verify Handover</h3>
            <p className="text-sm text-surface-500 mb-6">
              Please enter the 6-digit OTP provided by the NGO receiver to complete this delivery.
            </p>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl font-mono tracking-widest p-4 bg-surface-50 border-2 border-surface-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all outline-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setOtpModalDelivery(null); setOtpCode(''); }}
                className="flex-1 py-2.5 px-4 font-semibold text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(otpModalDelivery, 'delivered', otpCode)}
                disabled={otpCode.length !== 6}
                className="flex-1 btn-primary !py-2.5 !px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
