'use client';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: '🍱',
    title: 'Donate Surplus Food',
    titleAccent: 'Donate',
    desc: 'Share leftover food from restaurants, events, or your home — easily listed in under 60 seconds.',
    color: 'yellow',
  },
  {
    icon: '🏢',
    title: 'Find Available Food',
    titleAccent: 'Find',
    desc: 'NGOs and receivers discover nearby donations in real-time with smart location-based matching.',
    color: 'green',
  },
  {
    icon: '🚚',
    title: 'Track Every Delivery',
    titleAccent: 'Track',
    desc: 'Volunteers pick up and deliver with live status updates — from origin to destination.',
    color: 'yellow',
  },
  {
    icon: '📊',
    title: 'Measure Your Impact',
    titleAccent: 'Measure',
    desc: 'Real-time dashboards show meals saved, waste reduced, and communities served.',
    color: 'green',
  },
];

const stats = [
  { value: '10K+', label: 'Meals Saved', icon: '🍽️' },
  { value: '500+', label: 'Active Donors', icon: '❤️' },
  { value: '120+', label: 'NGO Partners', icon: '🏢' },
  { value: '50+', label: 'Cities Covered', icon: '🌍' },
];

const steps = [
  { step: '01', icon: '📝', title: 'List Your Food', desc: 'Donors add surplus food with photos, quantity & pickup time in seconds.' },
  { step: '02', icon: '✅', title: 'NGO Accepts', desc: 'Nearby NGOs view and claim available donations on their dashboard.' },
  { step: '03', icon: '🚚', title: 'Volunteer Picks Up', desc: 'A volunteer collects the food from the donor at the set time.' },
  { step: '04', icon: '🎉', title: 'Delivered & Recorded', desc: 'Food reaches those in need — every delivery is logged and celebrated.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Restaurant Owner · Donor', text: 'I used to throw away 20kg of food daily. Now it reaches hundreds of families. HungerHive made this effortless.', avatar: '👩‍🍳' },
  { name: 'Hope Foundation', role: 'NGO Partner', text: 'We\'ve served 3x more families since joining. The real-time alerts and pick-up coordination are game-changing.', avatar: '🏢' },
  { name: 'Arjun Mehta', role: 'Delivery Volunteer', text: 'Takes 30 mins on weekends. Knowing every trip feeds a family makes it the most rewarding thing I do.', avatar: '🧑‍🤝‍🧑' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0D0D0D] border-b border-[#2A2A2A] shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-black text-lg shadow-lg" style={{ background: '#FFC107' }}>H</div>
            <span className="text-xl font-black font-display text-white tracking-tight">HungerHive</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="nav-link">How It Works</a>
            <a href="#impact" className="nav-link">Impact</a>
            <a href="#testimonials" className="nav-link">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="nav-link">Log In</Link>
            <Link href="/register" className="btn-primary !py-2 !px-5 !text-sm !rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero-food-bg relative min-h-screen flex items-center overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-float" style={{ background: 'radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-float" style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.07) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '2s' }} />

        {/* Food emoji floating elements */}
        <div className="absolute top-28 right-16 text-5xl animate-float opacity-20 select-none" style={{ animationDelay: '0s' }}>🍱</div>
        <div className="absolute top-48 left-12 text-4xl animate-float opacity-15 select-none" style={{ animationDelay: '1.5s' }}>🥘</div>
        <div className="absolute bottom-32 left-20 text-4xl animate-float opacity-15 select-none" style={{ animationDelay: '3s' }}>🌽</div>
        <div className="absolute bottom-40 right-24 text-3xl animate-float opacity-20 select-none" style={{ animationDelay: '1s' }}>🍅</div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 animate-slide-up"
              style={{ background: 'rgba(255,193,7,0.08)', borderColor: 'rgba(255,193,7,0.2)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: '#FFC107' }} />
              <span className="text-sm font-medium" style={{ color: '#FFC107' }}>Fighting Food Waste, One Meal at a Time</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black font-display text-white mb-6 leading-[1.1] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Join the Fight<br />
              Against{' '}
              <span style={{ color: '#FFC107' }}>Food</span>{' '}
              <span style={{ color: '#4CAF50' }}>Waste</span>
            </h1>

            <p className="text-lg text-[#CCCCCC] mb-10 leading-relaxed max-w-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
              HungerHive connects food donors with NGOs and volunteers to ensure surplus food reaches those who need it most — quickly, safely, and with zero waste.
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/register" className="btn-primary !py-4 !px-8 !text-base !rounded-xl">
                Start Donating →
              </Link>
              <Link href="/register" className="btn-secondary !py-4 !px-8 !text-base !rounded-xl">
                Join as NGO
              </Link>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-8 mt-14 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-xl font-black font-display" style={{ color: '#FFC107' }}>{s.value}</p>
                    <p className="text-xs text-[#888]">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0A)' }} />
      </section>

      {/* ── Features / How it works ── */}
      <section id="features" className="py-28" style={{ background: '#0D0D0D' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#FFC107' }}>What We Do</p>
            <h2 className="text-4xl lg:text-5xl font-black font-display text-white mb-4">
              Every Feature Built for <span style={{ color: '#FFC107' }}>Impact</span>
            </h2>
            <p className="text-[#888] text-lg max-w-xl mx-auto">Our platform removes every friction point between surplus food and hungry people.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="feature-card group cursor-default">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: f.color === 'yellow' ? 'rgba(255,193,7,0.12)' : 'rgba(76,175,80,0.12)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-white mb-2">
                      <span style={{ color: f.color === 'yellow' ? '#FFC107' : '#4CAF50' }}>{f.titleAccent} </span>
                      {f.title.replace(f.titleAccent + ' ', '')}
                    </h3>
                    <p className="text-[#999] leading-relaxed text-sm">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4-Step Process ── */}
      <section className="py-28" style={{ background: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#4CAF50' }}>Simple Process</p>
            <h2 className="text-4xl lg:text-5xl font-black font-display text-white mb-4">
              From Surplus to <span style={{ color: '#4CAF50' }}>Sustenance</span>
            </h2>
            <p className="text-[#888] text-lg">Four steps. Zero food wasted.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: 'linear-gradient(90deg, #FFC107, #4CAF50)' }} />

            {steps.map((s, i) => (
              <div key={i} className="text-center group relative">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg relative z-10"
                    style={{
                      background: '#1A1A1A',
                      borderColor: i % 2 === 0 ? 'rgba(255,193,7,0.4)' : 'rgba(76,175,80,0.4)',
                      boxShadow: i % 2 === 0 ? '0 0 0 0 rgba(255,193,7,0)' : '0 0 0 0 rgba(76,175,80,0)'
                    }}>
                    {s.icon}
                  </div>
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full text-black text-xs font-black flex items-center justify-center z-20"
                    style={{ background: i % 2 === 0 ? '#FFC107' : '#4CAF50' }}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold font-display text-white mb-2">{s.title}</h3>
                <p className="text-xs text-[#888] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section id="impact" className="py-20 relative overflow-hidden" style={{ background: '#111111' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(255,193,7,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#FFC107' }}>Our Impact</p>
            <h2 className="text-4xl font-black font-display text-white">Numbers That Matter</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 group"
                style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
                <div className="text-4xl mb-3">{s.icon}</div>
                <p className="text-4xl font-black font-display mb-1" style={{ color: i % 2 === 0 ? '#FFC107' : '#4CAF50' }}>{s.value}</p>
                <p className="text-sm text-[#888] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-28" style={{ background: '#0D0D0D' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#4CAF50' }}>Stories</p>
            <h2 className="text-4xl lg:text-5xl font-black font-display text-white">Real People, Real <span style={{ color: '#4CAF50' }}>Change</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#1A1A1A', borderColor: '#2A2A2A' }}>
                {/* Quote mark */}
                <div className="text-5xl font-serif leading-none mb-4" style={{ color: '#FFC107', opacity: 0.4 }}>&ldquo;</div>
                <p className="text-[#CCC] text-sm leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: '#2A2A2A' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: '#252525' }}>{t.avatar}</div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-[#666] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.08) 0%, rgba(76,175,80,0.08) 100%)', borderTop: '1px solid rgba(255,193,7,0.15)', borderBottom: '1px solid rgba(255,193,7,0.15)' }} />
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl lg:text-5xl font-black font-display text-white mb-4">
            Ready to Make a <span style={{ color: '#FFC107' }}>Difference?</span>
          </h2>
          <p className="text-[#999] text-lg mb-8">Join thousands of donors, NGOs, and volunteers ending food waste together.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary !py-4 !px-10 !text-base !rounded-xl">
              Join HungerHive Free
            </Link>
            <Link href="/login" className="btn-secondary !py-4 !px-10 !text-base !rounded-xl">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-12" style={{ background: '#080808', borderColor: '#1A1A1A' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm" style={{ background: '#FFC107' }}>H</div>
              <span className="text-lg font-black font-display text-white">HungerHive</span>
            </div>
            <p className="text-sm" style={{ color: '#555' }}>© 2024 HungerHive · Built to reduce food waste and fight hunger.</p>
            <div className="flex gap-6">
              <Link href="/login" className="text-sm hover:text-yellow-400 transition-colors" style={{ color: '#555' }}>Login</Link>
              <Link href="/register" className="text-sm hover:text-yellow-400 transition-colors" style={{ color: '#555' }}>Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
