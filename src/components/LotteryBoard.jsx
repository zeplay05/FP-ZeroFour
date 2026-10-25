import React from 'react';
import { BookedSticker } from './Sticker';
import { Crown, Sparkles, CheckCircle2 } from 'lucide-react';

export function LotteryBoard({
  boardRef,
  numbers,
  settings,
  isAdmin,
  selectedNumbers,
  onNumberClick,
  searchQuery,
  filterStatus,
  winningNumber
}) {
  const isPirate = settings.theme === 'pirate';

  return (
    <div className={`lottery-board-container theme-${settings.theme}`}>
      {/* Printable / Capturable Board Area */}
      <div className="lottery-board-sheet" ref={boardRef} id="lottery-capture-target">
        
        {/* Header Art / Poster Banner */}
        <div className="board-header">
          {isPirate ? (
            <div className="pirate-header-art">
              <div className="pirate-compass-icon">🧭</div>
              <div className="header-titles">
                <div className="poster-stamp">DON!! どん!!</div>
                <h1 className="poster-title">{settings.title}</h1>
                <p className="poster-subtitle">
                  {settings.roundName} • <span className="price-tag">เบอร์ละ {settings.pricePerNumber} บาท</span>
                </p>
              </div>
              <div className="pirate-hat-icon">👒</div>
            </div>
          ) : (
            <div className="gold-header-art">
              <div className="gold-crown-icon"><Crown size={32} /></div>
              <div className="header-titles">
                <div className="gold-stamp">LUCKY LOTTERY BOARD 00-99</div>
                <h1 className="poster-title">{settings.title}</h1>
                <p className="poster-subtitle">
                  {settings.roundName} • <span className="price-tag">เบอร์ละ {settings.pricePerNumber} บาท</span>
                </p>
              </div>
              <div className="gold-sparkle-icon"><Sparkles size={32} /></div>
            </div>
          )}
        </div>

        {/* 10x10 Grid of Numbers (00 - 99) */}
        <div className="grid-10x10">
          {numbers.map((item) => {
            const num = item.number;
            const isBooked = item.status === 'booked' || item.status === 'paid';
            const isPaid = item.status === 'paid';
            const isWinner = winningNumber && winningNumber === num;
            const isSelected = selectedNumbers.includes(num);

            // Filter match check
            let isDimmed = false;
            if (searchQuery.trim()) {
              const q = searchQuery.trim().toLowerCase();
              const matchNum = num.includes(q);
              const matchName = item.customerName.toLowerCase().includes(q);
              const matchPhone = item.customerPhone.includes(q);
              if (!matchNum && !matchName && !matchPhone) {
                isDimmed = true;
              }
            } else if (filterStatus !== 'all') {
              if (filterStatus === 'available' && isBooked) isDimmed = true;
              if (filterStatus === 'booked' && item.status !== 'booked') isDimmed = true;
              if (filterStatus === 'paid' && !isPaid) isDimmed = true;
            }

            return (
              <div
                key={num}
                id={`lottery-number-${num}`}
                className={`number-cell 
                  status-${item.status} 
                  ${isSelected ? 'is-selected' : ''} 
                  ${isWinner ? 'is-winner' : ''} 
                  ${isDimmed ? 'is-dimmed' : ''}
                `}
                onClick={() => onNumberClick(item)}
                role="button"
                tabIndex={0}
                title={
                  isBooked 
                    ? `เบอร์ ${num} จองโดย: ${item.customerName || 'ไม่ระบุชื่อ'} (${item.status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'})` 
                    : `เบอร์ ${num} (ว่าง - คลิกเพื่อจอง)`
                }
              >
                {/* Cell Corner Indicator */}
                <span className="cell-num-badge">{num}</span>

                {/* Main Content inside cell */}
                {isWinner ? (
                  <div className="winner-cell-content">
                    <span className="winner-crown">👑</span>
                    <span className="winner-num">{num}</span>
                    <span className="winner-label">ผู้โชคดี!</span>
                    {item.customerName && (
                      <span className="winner-name">{item.customerName}</span>
                    )}
                  </div>
                ) : isBooked ? (
                  <BookedSticker
                    theme={settings.theme}
                    customerName={isAdmin ? item.customerName : ''}
                    status={item.status}
                  />
                ) : (
                  <div className="available-num-display">
                    <span className="num-digits">{num}</span>
                    {isSelected && (
                      <span className="selected-check">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </div>
                )}

                {/* Admin Quick Hover Indicator */}
                {isAdmin && isBooked && item.customerName && (
                  <div className="admin-cell-hover-hint">
                    {item.customerName}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Board Footer Artwork */}
        <div className="board-footer">
          {isPirate ? (
            <div className="pirate-footer-art">
              <span className="footer-ship">⛵ เรือโจรสลัดสู่สมบัติแห่งโชคลาภ</span>
              <span className="footer-credit">เบอร์หวยนำโชค 00-99 • ตรวจสอบได้ตลอด 24 ชม.</span>
            </div>
          ) : (
            <div className="gold-footer-art">
              <span className="footer-gold">⭐ ขอให้ทุกท่านโชคดี ร่ำรวยเงินทอง เฮงๆ ปังๆ ⭐</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
