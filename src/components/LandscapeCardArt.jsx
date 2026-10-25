import React from 'react';

// Renders the mountain & sun landscape art exactly like the screenshot
export function LandscapeCardArt({ gradient = 'green', coverImage = null, title = '' }) {
  if (coverImage) {
    return (
      <div className="card-art-box">
        <img src={coverImage} alt={title} className="card-custom-img" />
      </div>
    );
  }

  const GRADIENTS = {
    lime: 'linear-gradient(135deg, #a3c428 0%, #76ad1a 100%)',
    emerald: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
    blue: 'linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%)',
    teal: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
    coral: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)',
    purple: 'linear-gradient(135deg, #a855f7 0%, #581c87 100%)',
    spring: 'linear-gradient(135deg, #4ade80 0%, #059669 100%)',
    indigo: 'linear-gradient(135deg, #818cf8 0%, #4338ca 100%)',
    amber: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)'
  };

  const bg = GRADIENTS[gradient] || GRADIENTS.lime;

  return (
    <div className="card-art-box" style={{ background: bg }}>
      <svg
        viewBox="0 0 320 220"
        className="landscape-svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Sun / Moon circle */}
        <circle cx="240" cy="55" r="28" fill="#ffffff" opacity="0.32" />

        {/* Background Mountain */}
        <path
          d="M60 220 L160 100 L260 220 Z"
          fill="#000000"
          opacity="0.18"
        />

        {/* Foreground Mountain */}
        <path
          d="M-20 220 L90 120 L210 220 Z"
          fill="#000000"
          opacity="0.25"
        />
        <path
          d="M130 220 L220 135 L330 220 Z"
          fill="#000000"
          opacity="0.28"
        />
      </svg>
    </div>
  );
}
