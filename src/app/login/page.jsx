'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast.success('Welcome back!');
      router.push('/dashboard');
    }
  }, [session, sessionHandled, login, router, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.warning('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Login failed'); setLoading(false); return; }
      login(data.token, data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,193,7,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="auth-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg" style={{ background: '#FFC107' }}>H</div>
              <span className="text-2xl font-black font-display text-white">HungerHive</span>
            </Link>
            <h1 className="text-2xl font-bold font-display mb-1" style={{ color: '#FFC107' }}>Welcome Back</h1>
            <p className="text-sm" style={{ color: '#888' }}>Log in to continue making an impact</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 mb-6"
            style={{ background: '#1E1E1E', border: '1.5px solid #2A2A2A', color: '#DDD' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,193,7,0.4)'; e.currentTarget.style.color = '#FFF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#DDD'; }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="divider mb-6">
            <span className="text-xs font-medium px-3" style={{ color: '#555' }}>OR LOGIN WITH EMAIL</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#CCC' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#CCC' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                  style={{ color: '#555' }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 !text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#666' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: '#FFC107' }}>Register here</Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-4 text-sm" style={{ color: '#444' }}>
          <Link href="/" className="hover:text-yellow-400 transition-colors" style={{ color: '#444' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
