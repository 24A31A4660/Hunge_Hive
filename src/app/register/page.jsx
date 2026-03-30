'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

const roles = [
  {
    id: 'donor',
    label: 'Donor',
    desc: 'Restaurants, events & individuals',
    icon: '🍱',
    accent: '#FFC107',
    accentBg: 'rgba(255,193,7,0.1)',
    accentBorder: 'rgba(255,193,7,0.4)',
  },
  {
    id: 'ngo',
    label: 'NGO / Receiver',
    desc: 'Orgs distributing to those in need',
    icon: '🏢',
    accent: '#4CAF50',
    accentBg: 'rgba(76,175,80,0.1)',
    accentBorder: 'rgba(76,175,80,0.4)',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    desc: 'Delivery & logistics partners',
    icon: '🚚',
    accent: '#42A5F5',
    accentBg: 'rgba(66,165,245,0.1)',
    accentBorder: 'rgba(66,165,245,0.4)',
  },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const [sessionHandled, setSessionHandled] = useState(false);

  useEffect(() => {
    if (session?.appToken && session?.appUser && !sessionHandled) {
      setSessionHandled(true);
      login(session.appToken, session.appUser);
      toast.success('Welcome to HungerHive! 🎉');
      router.push('/dashboard');
    }
  }, [session, sessionHandled, login, router, toast]);

  const handleGoogleSignIn = () => {
    if (!form.role) {
      toast.warning('Please select a role first to continue with Google');
      return;
    }
    signIn('google', { callbackUrl: '/register' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      toast.warning('Please fill in all required fields and select a role');
      return;
    }
    if (form.password.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Registration failed'); setLoading(false); return; }
      login(data.token, data.user);
      toast.success('Welcome to HungerHive! 🎉');
      router.push('/dashboard');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.id === form.role);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,193,7,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-lg animate-scale-in">
        {/* Card */}
        <div className="auth-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg" style={{ background: '#FFC107' }}>H</div>
              <span className="text-2xl font-black font-display text-white">HungerHive</span>
            </Link>
            <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#FFC107' }}>Create Your Account</h1>
            <p className="text-sm" style={{ color: '#888' }}>Join the mission to end food waste</p>
          </div>

          {/* Step 1: Role Selection */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#CCC' }}>
              <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-black" style={{ background: '#FFC107' }}>1</span>
              I want to join as
            </p>
            <div className="grid grid-cols-3 gap-3">
              {roles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.id }))}
                  className="p-4 rounded-xl text-center transition-all duration-200 border"
                  style={{
                    background: form.role === r.id ? r.accentBg : '#111',
                    borderColor: form.role === r.id ? r.accentBorder : '#2A2A2A',
                    transform: form.role === r.id ? 'scale(1.03)' : 'scale(1)',
                    boxShadow: form.role === r.id ? `0 0 20px ${r.accentBg}` : 'none',
                  }}
                >
                  <div className="text-2xl mb-1.5">{r.icon}</div>
                  <p className="text-xs font-bold text-white">{r.label}</p>
                  <p className="text-[10px] mt-0.5 leading-tight" style={{ color: form.role === r.id ? r.accent : '#555' }}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Google or Email */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#CCC' }}>
              <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-black" style={{ background: '#FFC107' }}>2</span>
              Sign up with
            </p>

            {/* Google Button */}
            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                style={{
                  background: form.role ? '#1E1E1E' : '#141414',
                  border: `1.5px solid ${form.role ? (selectedRole?.accentBorder || '#2A2A2A') : '#222'}`,
                  color: form.role ? '#DDD' : '#444',
                  cursor: 'pointer',
                  opacity: form.role ? 1 : 0.6,
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {form.role ? `Continue with Google as ${selectedRole?.label}` : 'Select a role above first'}
              </button>
              {!form.role && (
                <p className="text-xs text-center" style={{ color: '#444' }}>Select Donor, NGO, or Volunteer to unlock</p>
              )}
            </div>

            {/* Divider */}
            <div className="divider mb-4">
              <span className="text-xs font-medium px-3" style={{ color: '#444' }}>OR WITH EMAIL</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#999' }}>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field !py-2.5 !text-sm"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#999' }}>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-field !py-2.5 !text-sm"
                    placeholder="+91 ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#999' }}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field !py-2.5 !text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#999' }}>Password *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field !py-2.5 !text-sm pr-10"
                    placeholder="Min. 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                    style={{ color: '#555' }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !form.role}
                className="btn-primary w-full !py-3.5 !text-sm disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : !form.role ? 'Select a role to continue' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm" style={{ color: '#555' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#FFC107' }}>Log In</Link>
          </p>
        </div>

        <p className="text-center mt-4 text-sm">
          <Link href="/" className="hover:text-yellow-400 transition-colors" style={{ color: '#444' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
