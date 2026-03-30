'use client';

export default function StatusBadge({ status }) {
  const statusMap = {
    pending: { label: 'Pending', class: 'status-pending' },
    accepted: { label: 'Accepted', class: 'status-accepted' },
    picked: { label: 'Picked Up', class: 'status-picked' },
    'in-transit': { label: 'In Transit', class: 'status-picked' },
    delivered: { label: 'Delivered', class: 'status-delivered' },
    expired: { label: 'Expired', class: 'status-expired' },
    cancelled: { label: 'Cancelled', class: 'status-cancelled' },
    assigned: { label: 'Assigned', class: 'status-accepted' },
    upcoming: { label: 'Upcoming', class: 'status-accepted' },
    active: { label: 'Active', class: 'status-delivered' },
    completed: { label: 'Completed', class: 'status-delivered' },
  };

  const info = statusMap[status] || { label: status, class: 'status-pending' };
  return <span className={info.class}>{info.label}</span>;
}
