'use client';
import CountdownTimer from '../ui/CountdownTimer';
import StatusBadge from '../ui/StatusBadge';

export default function DonationCard({ donation, onAccept, onPickup, onDeliver, showActions = true, userRole = 'donor', acceptingId = null }) {
  const { foodType, category, quantity, unit, estimatedMeals, location, expiryTime, status, image, donor, createdAt } = donation;
  const created = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {image ? (
            <img src={image} alt={foodType} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">{category === 'veg' ? '🥗' : '🍗'}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-surface-900 truncate">{foodType}</h3>
              <p className="text-xs text-surface-500 mt-0.5">
                {donor?.name || 'Unknown'} · {created}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="flex flex-wrap gap-2 mb-3 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-surface-100 text-surface-600">
              {quantity} {unit}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-surface-100 text-surface-600">
              ~{estimatedMeals} meals
            </span>
            <span className={`px-2 py-0.5 rounded-md ${category === 'veg' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {category === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
            </span>
          </div>

          {location?.address && (
            <p className="text-xs text-surface-500 mb-2 truncate">📍 {location.address}</p>
          )}

          {donation.deliveryOtp && userRole === 'ngo' && status !== 'delivered' && (
            <div className="mb-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-800">Verification OTP:</span>
              <span className="text-lg font-mono font-bold tracking-widest text-orange-600 bg-white px-2 py-0.5 rounded shadow-sm">
                {donation.deliveryOtp}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <CountdownTimer expiryTime={expiryTime} />
            
            {showActions && (
              <div className="flex gap-2">
                {status === 'pending' && userRole === 'ngo' && onAccept && (
                  <button 
                    onClick={() => onAccept(donation._id)} 
                    disabled={acceptingId === donation._id || new Date(expiryTime) < new Date() || status === 'expired'}
                    className="btn-primary !py-1.5 !px-4 !text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                    {new Date(expiryTime) < new Date() ? 'Expired' : acceptingId === donation._id ? 'Accepting...' : 'Accept'}
                  </button>
                )}
                {status === 'accepted' && userRole === 'volunteer' && onPickup && (
                  <button 
                    onClick={() => onPickup(donation._id)} 
                    disabled={new Date(expiryTime) < new Date() || status === 'expired'}
                    className="btn-primary !py-1.5 !px-4 !text-xs disabled:opacity-50 disabled:cursor-not-allowed border-none">
                    {new Date(expiryTime) < new Date() ? 'Expired' : 'Pick Up'}
                  </button>
                )}
                {status === 'picked' && userRole === 'volunteer' && onDeliver && (
                  <button onClick={() => onDeliver(donation._id)} className="btn-primary !py-1.5 !px-4 !text-xs">
                    Delivered
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
