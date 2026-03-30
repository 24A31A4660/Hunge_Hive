'use client';
export default function StatsCard({ icon, label, value, trend, color = 'primary', className = '' }) {
  const colors = {
    primary: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    pink: 'from-pink-500 to-fuchsia-600',
  };

  return (
    <div className={`bento-item group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg border`} style={{
          background: color === 'primary' ? 'rgba(255,193,7,0.1)' : 'rgba(255,255,255,0.05)',
          borderColor: color === 'primary' ? 'rgba(255,193,7,0.3)' : 'rgba(255,255,255,0.1)',
          color: color === 'primary' ? '#FFC107' : '#FFF'
        }}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold font-display text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm" style={{ color: '#888' }}>{label}</p>
    </div>
  );
}
