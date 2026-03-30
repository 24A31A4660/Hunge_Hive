'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function DonationsBarChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: `${d._id?.month || ''}/${d._id?.year || ''}`,
    donations: d.count || 0,
    meals: d.meals || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        />
        <Bar dataKey="donations" fill="#22c55e" radius={[6, 6, 0, 0]} name="Donations" />
        <Bar dataKey="meals" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Meals" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data = {} }) {
  const chartData = [
    { name: 'Pending', value: data.pending || 0 },
    { name: 'Accepted', value: data.accepted || 0 },
    { name: 'Picked', value: data.picked || 0 },
    { name: 'Delivered', value: data.delivered || 0 },
    { name: 'Expired', value: data.expired || 0 },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    chartData.push({ name: 'No Data', value: 1 });
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          paddingAngle={3}
          stroke="none"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ImpactAreaChart({ data = [] }) {
  const chartData = data.map(d => ({
    name: `${d._id?.month || ''}/${d._id?.year || ''}`,
    meals: d.meals || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="mealsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        />
        <Area type="monotone" dataKey="meals" stroke="#22c55e" strokeWidth={2} fill="url(#mealsGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
