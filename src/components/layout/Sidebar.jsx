'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = {
  donor: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/donations/new', label: 'Add Donation', icon: '➕' },
    { href: '/donations', label: 'My Donations', icon: '🍱' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/map', label: 'Map View', icon: '🗺️' },
  ],
  ngo: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/donations', label: 'Available Food', icon: '🍱' },
    { href: '/deliveries', label: 'My Pickups', icon: '📦' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/map', label: 'Map View', icon: '🗺️' },
  ],
  volunteer: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/deliveries', label: 'My Deliveries', icon: '🚚' },
    { href: '/donations', label: 'Donations', icon: '🍱' },
    { href: '/map', label: 'Map View', icon: '🗺️' },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/admin', label: 'Admin Panel', icon: '⚙️' },
    { href: '/donations', label: 'All Donations', icon: '🍱' },
    { href: '/deliveries', label: 'Deliveries', icon: '🚚' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/map', label: 'Map View', icon: '🗺️' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  ],
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = menuItems[user?.role] || menuItems.donor;
  const roleLabels = { donor: 'Donor', ngo: 'NGO', volunteer: 'Volunteer', admin: 'Admin' };
  const roleColors = {
    donor: 'bg-green-500',
    ngo: 'bg-blue-500',
    volunteer: 'bg-purple-500',
    admin: 'bg-red-500',
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-72 border-r z-50 transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }}>
        
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: '#2A2A2A' }}>
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black text-xl font-bold shadow-lg" style={{ background: '#FFC107' }}>
              H
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white">HungerHive</h1>
              <p className="text-xs" style={{ color: '#888' }}>Smart Food Distribution</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 mx-4 mt-6 rounded-xl border" style={{ background: '#111', borderColor: '#2A2A2A' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-md" style={{ background: '#FFC107' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${roleColors[user?.role] || 'bg-gray-500'}`}></span>
                <span className="text-xs" style={{ color: '#888' }}>{roleLabels[user?.role] || 'User'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1.5">
            {items.map(item => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent`}
                    style={isActive ? {
                      background: 'rgba(255,193,7,0.1)',
                      color: '#FFC107',
                      borderColor: 'rgba(255,193,7,0.3)',
                      boxShadow: '0 0 15px rgba(255,193,7,0.05)'
                    } : {
                      color: '#888'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#1A1A1A';
                        e.currentTarget.style.color = '#FFF';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#888';
                      }
                    }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#FFC107' }}></span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: '#2A2A2A' }}>
          <button
            onClick={() => { logout(); onClose?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-400 transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.05)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
