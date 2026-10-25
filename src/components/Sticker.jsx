import React from 'react';

// Cool vector badge for "ติดจอง" styled like the Luffy sticker in the user's reference image
export function BookedSticker({ theme = 'pirate', customerName = '', status = 'booked' }) {
  const isPaid = status === 'paid';

  if (theme === 'pirate') {
    return (
      <div className={`sticker-badge pirate-sticker ${isPaid ? 'is-paid' : ''}`}>
        <svg viewBox="0 0 100 100" className="sticker-svg" aria-hidden="true">
          <defs>
            <filter id="sticker-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
            </filter>
            <linearGradient id="luffyHat" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="70%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="luffyVest" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>

          {/* Anime Character Face & Straw Hat Silhouette */}
          <g filter="url(#sticker-shadow)">
            {/* Straw Hat Brim */}
            <ellipse cx="50" cy="30" rx="36" ry="12" fill="url(#luffyHat)" stroke="#854d0e" strokeWidth="2" />
            {/* Red Ribbon on Hat */}
            <path d="M26 28 Q50 32 74 28 Q68 18 50 18 Q32 18 26 28 Z" fill="#dc2626" />
            {/* Hat Crown */}
            <path d="M30 25 Q50 6 70 25 Z" fill="url(#luffyHat)" stroke="#854d0e" strokeWidth="1.5" />

            {/* Face */}
            <circle cx="50" cy="48" r="20" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
            
            {/* Big Grin / Smile */}
            <path d="M38 52 Q50 64 62 52 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="1.5" />
            <path d="M42 54 L42 58 M47 55 L47 59 M53 55 L53 59 M58 54 L58 58" stroke="#9ca3af" strokeWidth="1" />
            
            {/* Eyes (Happy anime closed eyes) */}
            <path d="M38 43 Q42 39 46 43" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M54 43 Q58 39 62 43" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Cheek blush */}
            <ellipse cx="37" cy="49" rx="3" ry="1.5" fill="#f87171" opacity="0.8" />
            <ellipse cx="63" cy="49" rx="3" ry="1.5" fill="#f87171" opacity="0.8" />

            {/* Red Hoodie / Vest */}
            <path d="M32 64 Q50 72 68 64 L74 88 Q50 94 26 88 Z" fill="url(#luffyVest)" stroke="#991b1b" strokeWidth="1.5" />
            {/* Thumbs up hand */}
            <circle cx="26" cy="62" r="7" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
            <path d="M24 55 Q26 50 29 55 L29 64 Z" fill="#fed7aa" stroke="#c2410c" strokeWidth="1" />
          </g>
        </svg>

        {/* Text Ribbon */}
        <div className={`sticker-ribbon ${isPaid ? 'paid-ribbon' : 'booked-ribbon'}`}>
          <span className="ribbon-text">{isPaid ? 'จ่ายแล้ว ✓' : 'ติดจอง'}</span>
        </div>

        {customerName && (
          <div className="sticker-cust-name" title={customerName}>
            {customerName}
          </div>
        )}
      </div>
    );
  }

  // Luxury Gold / Default Theme Sticker
  return (
    <div className={`sticker-badge luxury-sticker ${isPaid ? 'is-paid' : ''}`}>
      <div className="badge-icon">
        {isPaid ? '✓' : '🔒'}
      </div>
      <div className={`sticker-ribbon ${isPaid ? 'paid-ribbon' : 'booked-ribbon'}`}>
        <span className="ribbon-text">{isPaid ? 'จ่ายแล้ว' : 'ติดจอง'}</span>
      </div>
      {customerName && (
        <div className="sticker-cust-name" title={customerName}>
          {customerName}
        </div>
      )}
    </div>
  );
}
