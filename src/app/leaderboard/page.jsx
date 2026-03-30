'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LeaderboardPage() {
  const { user, loading: authLoading, authFetch } = useAuth();
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch_ = async () => {
      try {
        const res = await authFetch('/api/stats');
        if (res.ok) {
          const d = await res.json();
          setTopDonors(d.topDonors || []);
        }
      } catch {} finally { setLoading(false); }
    };
    fetch_();
  }, [user]);

  if (authLoading || !user) return <LoadingSpinner />;

  const medals = ['🥇', '🥈', '🥉'];
  const badgeIcons = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-display text-surface-900">🏆 Leaderboard</h1>
          <p className="text-surface-500 mt-1">Top donors making the biggest impact</p>
        </div>

        {loading ? <LoadingSpinner /> : topDonors.length > 0 ? (
          <div className="space-y-3">
            {topDonors.map((donor, i) => (
              <div key={donor._id} className={`glass-card p-5 flex items-center gap-4 ${i < 3 ? 'border-2 border-primary-200' : ''}`}>
                <div className="w-10 text-center">
                  {i < 3 ? (
                    <span className="text-3xl">{medals[i]}</span>
                  ) : (
                    <span className="text-lg font-bold text-surface-400">#{i + 1}</span>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
                  {donor.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 truncate">{donor.name}</p>
                  <div className="flex items-center gap-3 text-xs text-surface-500">
                    <span>🍱 {donor.totalDonations} donations</span>
                    <span>🍽️ {donor.totalMeals} meals</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {donor.badges?.map((b, j) => (
                    <span key={j} className="text-xl" title={b}>{badgeIcons[b] || ''}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-16 text-center">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-surface-500">No donors yet. Be the first!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
