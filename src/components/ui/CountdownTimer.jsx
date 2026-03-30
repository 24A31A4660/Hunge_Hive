'use client';
import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiryTime, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const total = new Date(expiryTime) - new Date();
      if (total <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(total / (1000 * 60 * 60 * 24)),
        hours: Math.floor((total / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((total / (1000 * 60)) % 60),
        seconds: Math.floor((total / 1000) % 60),
        expired: false,
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [expiryTime]);

  if (timeLeft.expired) {
    return <span className={`status-expired ${className}`}>⏰ Expired</span>;
  }

  const urgency = (timeLeft.days === 0 && timeLeft.hours < 1) ? 'text-red-600 bg-red-50'
    : (timeLeft.days === 0 && timeLeft.hours < 3) ? 'text-orange-600 bg-orange-50'
    : 'text-green-600 bg-green-50';

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${urgency} ${className}`}>
      <span>⏱</span>
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  );
}
