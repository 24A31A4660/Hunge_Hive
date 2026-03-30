'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

export default function EventsPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ eventName: '', date: '', estimatedFood: '', unit: 'plates', description: '' });

  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      try {
        const res = await authFetch('/api/events');
        if (res.ok) { const d = await res.json(); setEvents(d.events || []); }
      } catch { toast.error('Failed to load events'); }
      finally { setLoadingData(false); }
    };
    fetchEvents();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/events', { method: 'POST', body: JSON.stringify(form) });
      if (res.ok) { const d = await res.json(); toast.success('Event created!'); setEvents(prev => [d.event, ...prev]); setShowForm(false); }
    } catch { toast.error('Failed to create'); }
  };

  const handleRegister = async (eventId) => {
    try {
      const res = await authFetch('/api/events', { method: 'PUT', body: JSON.stringify({ eventId }) });
      if (res.ok) toast.success('Registered!');
    } catch { toast.error('Failed'); }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-surface-900">Events</h1>
            <p className="text-surface-500 mt-1">Pre-register for food donation events</p>
          </div>
          {(user.role === 'donor' || user.role === 'admin') && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : '+ Create'}</button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="glass-card p-6 space-y-4 animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Event Name" value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} className="input-field" required />
              <input type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
              <input type="number" placeholder="Est. Food Qty" value={form.estimatedFood} onChange={e => setForm(f => ({ ...f, estimatedFood: e.target.value }))} className="input-field" required />
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-field">
                <option value="plates">Plates</option><option value="kg">Kg</option><option value="packets">Packets</option>
              </select>
            </div>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field min-h-[60px]" />
            <button type="submit" className="btn-primary">Create Event</button>
          </form>
        )}

        {loadingData ? <LoadingSpinner /> : events.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(ev => (
              <div key={ev._id} className="glass-card p-5 space-y-3">
                <div className="flex justify-between"><h3 className="font-bold text-surface-900">{ev.eventName}</h3><StatusBadge status={ev.status} /></div>
                <p className="text-sm text-surface-600">📅 {new Date(ev.date).toLocaleDateString()}</p>
                <p className="text-sm text-surface-600">🍱 {ev.estimatedFood} {ev.unit}</p>
                {user.role === 'ngo' && ev.status === 'upcoming' && <button onClick={() => handleRegister(ev._id)} className="btn-secondary w-full !py-2 !text-sm">Register</button>}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center"><p className="text-5xl mb-4">📅</p><p className="text-surface-500">No events yet</p></div>
        )}
      </div>
    </DashboardLayout>
  );
}
