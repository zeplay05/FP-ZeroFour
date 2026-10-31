import React from 'react';
import { Clock } from 'lucide-react';
import { useRealtimeClock } from '../utils/timeUtils';

export function LiveClock({ variant = 'navbar', className = '' }) {
  const { dateStr, thaiDay, timeWithSec } = useRealtimeClock(1000);

  return (
    <div 
      className={`live-clock-pill-widget ${variant} ${className}`}
      title={`เวลาประเทศไทยแบบ Real-time: ${thaiDay} ${dateStr} ${timeWithSec}`}
    >
      <span className="live-clock-pulse-dot" />
      <Clock size={13} className="live-clock-icon" />
      <span className="live-clock-date-text">{dateStr}</span>
      <span className="live-clock-separator">•</span>
      <span className="live-clock-time-digits">{timeWithSec}</span>
    </div>
  );
}

export default LiveClock;
