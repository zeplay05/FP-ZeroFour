import React from 'react';

export const RAIN_FRONT_DROPS = [
  { id: 1, left: '2%', delay: '0.2s', duration: '2.1s' },
  { id: 2, left: '5%', delay: '1.4s', duration: '2.3s' },
  { id: 3, left: '9%', delay: '0.8s', duration: '1.9s' },
  { id: 4, left: '13%', delay: '2.1s', duration: '2.2s' },
  { id: 5, left: '17%', delay: '0.1s', duration: '2.0s' },
  { id: 6, left: '20%', delay: '1.1s', duration: '2.4s' },
  { id: 7, left: '24%', delay: '2.6s', duration: '1.95s' },
  { id: 8, left: '28%', delay: '0.6s', duration: '2.25s' },
  { id: 9, left: '31%', delay: '1.7s', duration: '2.05s' },
  { id: 10, left: '35%', delay: '0.9s', duration: '2.35s' },
  { id: 11, left: '38%', delay: '2.3s', duration: '2.0s' },
  { id: 12, left: '42%', delay: '0.3s', duration: '2.15s' },
  { id: 13, left: '46%', delay: '1.3s', duration: '2.45s' },
  { id: 14, left: '50%', delay: '2.8s', duration: '1.9s' },
  { id: 15, left: '53%', delay: '0.5s', duration: '2.2s' },
  { id: 16, left: '57%', delay: '1.9s', duration: '2.3s' },
  { id: 17, left: '61%', delay: '1.0s', duration: '2.05s' },
  { id: 18, left: '64%', delay: '2.5s', duration: '2.5s' },
  { id: 19, left: '68%', delay: '0.15s', duration: '1.95s' },
  { id: 20, left: '72%', delay: '1.5s', duration: '2.2s' },
  { id: 21, left: '75%', delay: '0.8s', duration: '2.4s' },
  { id: 22, left: '79%', delay: '2.7s', duration: '1.9s' },
  { id: 23, left: '83%', delay: '1.2s', duration: '2.1s' },
  { id: 24, left: '86%', delay: '2.2s', duration: '2.55s' },
  { id: 25, left: '90%', delay: '0.4s', duration: '2.0s' },
  { id: 26, left: '94%', delay: '1.8s', duration: '2.3s' },
  { id: 27, left: '97%', delay: '0.7s', duration: '2.1s' },
];

export const RAIN_BACK_DROPS = [
  { id: 101, right: '3%', delay: '0.9s', duration: '2.7s' },
  { id: 102, right: '8%', delay: '2.2s', duration: '2.5s' },
  { id: 103, right: '14%', delay: '0.5s', duration: '2.9s' },
  { id: 104, right: '19%', delay: '1.6s', duration: '2.6s' },
  { id: 105, right: '25%', delay: '2.8s', duration: '2.8s' },
  { id: 106, right: '31%', delay: '0.8s', duration: '2.5s' },
  { id: 107, right: '37%', delay: '1.9s', duration: '3.0s' },
  { id: 108, right: '43%', delay: '0.2s', duration: '2.5s' },
  { id: 109, right: '48%', delay: '1.4s', duration: '2.75s' },
  { id: 110, right: '54%', delay: '2.9s', duration: '2.6s' },
  { id: 111, right: '60%', delay: '1.1s', duration: '2.9s' },
  { id: 112, right: '66%', delay: '2.3s', duration: '2.5s' },
  { id: 113, right: '71%', delay: '0.4s', duration: '3.0s' },
  { id: 114, right: '77%', delay: '1.8s', duration: '2.7s' },
  { id: 115, right: '82%', delay: '2.7s', duration: '2.65s' },
  { id: 116, right: '88%', delay: '0.7s', duration: '2.9s' },
  { id: 117, right: '93%', delay: '1.5s', duration: '2.75s' },
  { id: 118, right: '98%', delay: '2.4s', duration: '2.55s' },
];

export function RainBackground() {
  return (
    <div className="rain-container" aria-hidden="true">
      <div className="rain front-row">
        {RAIN_FRONT_DROPS.map(d => (
          <div
            key={d.id}
            className="drop"
            style={{
              left: d.left,
              animationDelay: d.delay,
              animationDuration: d.duration
            }}
          >
            <div className="stem" style={{ animationDelay: d.delay, animationDuration: d.duration }} />
            <div className="splat" style={{ animationDelay: d.delay, animationDuration: d.duration }} />
          </div>
        ))}
      </div>
      <div className="rain back-row">
        {RAIN_BACK_DROPS.map(d => (
          <div
            key={d.id}
            className="drop"
            style={{
              right: d.right,
              animationDelay: d.delay,
              animationDuration: d.duration
            }}
          >
            <div className="stem" style={{ animationDelay: d.delay, animationDuration: d.duration }} />
            <div className="splat" style={{ animationDelay: d.delay, animationDuration: d.duration }} />
          </div>
        ))}
      </div>
    </div>
  );
}
