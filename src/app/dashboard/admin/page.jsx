'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatsCard from '../../../components/ui/StatsCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useToast } from '../../../contexts/ToastContext';

export default function AdminDashboard() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          authFetch('/api/stats'),
          authFetch(`/api/users?${filter ? `role=${filter}` : ''}`),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        }
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user, filter]);

  const toggleUser = async (userId, isActive) => {
    try {
      const res = await authFetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      }
    } catch { toast.error('Failed to update user'); }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await authFetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted');
        setUsers(prev => prev.filter(u => u._id !== userId));
      }
    } catch { toast.error('Failed to delete user'); }
  };

  if (authLoading || !user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-surface-900">Admin Panel</h1>
          <p className="text-surface-500 mt-1">Monitor and manage the entire platform</p>
        </div>

        {/* Stats */}
        <div className="bento-grid animate-stagger">
          <StatsCard icon="👥" label="Total Users" value={stats?.stats?.totalUsers || 0} color="blue" />
          <StatsCard icon="🍱" label="Total Donations" value={stats?.stats?.totalDonations || 0} color="primary" />
          <StatsCard icon="🚚" label="Deliveries Done" value={stats?.stats?.totalDeliveries || 0} color="purple" />
          <StatsCard icon="🍽️" label="Meals Saved" value={stats?.stats?.totalMeals || 0} color="orange" />
        </div>

        {/* Platform Breakdown */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="neu-card p-5 text-center">
            <p className="text-3xl mb-1">🍱</p>
            <p className="text-2xl font-bold font-display text-surface-900">{stats?.stats?.totalDonors || 0}</p>
            <p className="text-sm text-surface-500">Donors</p>
          </div>
          <div className="neu-card p-5 text-center">
            <p className="text-3xl mb-1">🏢</p>
            <p className="text-2xl font-bold font-display text-surface-900">{stats?.stats?.totalNGOs || 0}</p>
            <p className="text-sm text-surface-500">NGOs</p>
          </div>
          <div className="neu-card p-5 text-center">
            <p className="text-3xl mb-1">🚚</p>
            <p className="text-2xl font-bold font-display text-surface-900">{stats?.stats?.totalVolunteers || 0}</p>
            <p className="text-sm text-surface-500">Volunteers</p>
          </div>
        </div>

        {/* User Management */}
        <div className="glass-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold font-display text-surface-900">User Management</h3>
            <div className="flex gap-2">
              {['', 'donor', 'ngo', 'volunteer', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${filter === r ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
                >
                  {r || 'All'}
                </button>
              ))}
            </div>
          </div>

          {loadingData ? <LoadingSpinner text="Loading users..." /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-surface-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-surface-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-100 text-surface-700 capitalize">{u.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleUser(u._id, u.isActive)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${u.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteUser(u._id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center py-8 text-surface-400 text-sm">No users found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
