'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../../../components/map/MapPicker'), { ssr: false, loading: () => <div className="h-64 bg-surface-100 rounded-xl animate-pulse" /> });

export default function NewDonationPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    foodType: '',
    category: 'veg',
    quantity: '',
    unit: 'plates',
    pickupTime: '',
    expiryTime: '',
    cookedTime: '',
    notes: '',
    image: '',
  });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'donor' && user.role !== 'admin'))) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLocationChange = (loc) => {
    setLocation(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodType || !form.quantity || !form.pickupTime || !form.expiryTime) {
      toast.warning('Please fill in all required fields');
      return;
    }
    if (!location) {
      toast.warning('Please select a location on the map');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/api/donations', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          quantity: parseInt(form.quantity),
          location: {
            coordinates: [location.lng, location.lat],
            address: location.address,
          },
        }),
      });

      if (res.ok) {
        toast.success('Donation created successfully! 🎉');
        router.push('/donations');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create donation');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-surface-900">Add New Donation</h1>
          <p className="text-surface-500 mt-1">Share your surplus food with those in need</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Details */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-bold font-display text-surface-900 flex items-center gap-2">
              <span className="text-xl">🍱</span> Food Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Food Name / Description *</label>
              <input
                type="text"
                value={form.foodType}
                onChange={(e) => setForm(f => ({ ...f, foodType: e.target.value }))}
                className="input-field"
                placeholder="e.g. Biryani, Pasta, Rice & Curry"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Category *</label>
                <div className="flex gap-3">
                  {[{ id: 'veg', label: '🟢 Veg' }, { id: 'non-veg', label: '🔴 Non-Veg' }].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: c.id }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border-2
                        ${form.category === c.id
                          ? c.id === 'veg' ? 'border-green-400 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
                          : 'border-surface-200 text-surface-600 hover:border-surface-300'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Quantity *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                    className="input-field flex-1"
                    placeholder="50"
                    min="1"
                    required
                  />
                  <select
                    value={form.unit}
                    onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="input-field w-28"
                  >
                    <option value="plates">Plates</option>
                    <option value="kg">Kg</option>
                    <option value="packets">Packets</option>
                    <option value="boxes">Boxes</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-bold font-display text-surface-900 flex items-center gap-2">
              <span className="text-xl">⏰</span> Timing
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Pickup Time *</label>
                <input
                  type="datetime-local"
                  value={form.pickupTime}
                  onChange={(e) => setForm(f => ({ ...f, pickupTime: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Expiry Time *</label>
                <input
                  type="datetime-local"
                  value={form.expiryTime}
                  onChange={(e) => setForm(f => ({ ...f, expiryTime: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Cooked Time</label>
                <input
                  type="datetime-local"
                  value={form.cookedTime}
                  onChange={(e) => setForm(f => ({ ...f, cookedTime: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Location with Pin Drop */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-bold font-display text-surface-900 flex items-center gap-2">
              <span className="text-xl">📍</span> Pickup Location
            </h3>
            <p className="text-sm text-surface-500 -mt-2">Search for an address, use your current location, or click/drag the pin on the map</p>
            <MapPicker
              position={location ? [location.lat, location.lng] : null}
              onPositionChange={handleLocationChange}
              height="350px"
            />
            {location?.address && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-green-700 font-medium">📍 Selected: {location.address}</p>
              </div>
            )}
          </div>

          {/* Notes and Image */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-bold font-display text-surface-900 flex items-center gap-2">
              <span className="text-xl">📝</span> Additional Info
            </h3>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Image URL</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm(f => ({ ...f, image: e.target.value }))}
                className="input-field"
                placeholder="https://example.com/food-image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                className="input-field min-h-[80px] resize-y"
                placeholder="Any special instructions for pickup..."
                maxLength={500}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full !py-4 !text-base !rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating Donation...
              </span>
            ) : '🍱 Create Donation'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
