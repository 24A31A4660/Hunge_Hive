export function quantityToMeals(quantity, unit) {
  const conversionRates = {
    kg: 4,
    plates: 1,
    packets: 2,
    boxes: 8,
    liters: 3,
  };
  return Math.round(quantity * (conversionRates[unit] || 1));
}

export function getBadgeForDonations(totalDonations) {
  if (totalDonations >= 100) return 'platinum';
  if (totalDonations >= 50) return 'gold';
  if (totalDonations >= 20) return 'silver';
  if (totalDonations >= 5) return 'bronze';
  return null;
}

export function getBadgeInfo(badge) {
  const badges = {
    bronze: { label: 'Bronze Donor', color: '#CD7F32', icon: '🥉', minDonations: 5 },
    silver: { label: 'Silver Donor', color: '#C0C0C0', icon: '🥈', minDonations: 20 },
    gold: { label: 'Gold Donor', color: '#FFD700', icon: '🥇', minDonations: 50 },
    platinum: { label: 'Platinum Donor', color: '#E5E4E2', icon: '💎', minDonations: 100 },
  };
  return badges[badge] || null;
}

export function isExpired(expiryTime) {
  return new Date(expiryTime) < new Date();
}

export function getTimeRemaining(expiryTime) {
  const total = new Date(expiryTime) - new Date();
  if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds, expired: false };
}

export function getUrgencyLevel(expiryTime) {
  const remaining = getTimeRemaining(expiryTime);
  if (remaining.expired) return 'expired';
  if (remaining.total < 1000 * 60 * 60) return 'critical'; // < 1 hour
  if (remaining.total < 1000 * 60 * 60 * 3) return 'high'; // < 3 hours
  if (remaining.total < 1000 * 60 * 60 * 6) return 'medium'; // < 6 hours
  return 'low';
}
