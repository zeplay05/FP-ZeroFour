import React, { useState } from 'react';
import { X, Sparkles, Trophy, Shuffle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export function DrawPrizeModal({
  isOpen,
  onClose,
  numbers,
  settings,
  winningNumber,
  onSetWinningNumber
}) {
  const [manualInput, setManualInput] = useState(winningNumber || '');
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayRoll, setDisplayRoll] = useState(winningNumber || '00');

  if (!isOpen) return null;

  const winnerItem = numbers.find(n => n.number === (winningNumber || manualInput));

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const formatted = manualInput.trim().padStart(2, '0');
    if (formatted.length !== 2 || isNaN(Number(formatted))) {
      alert('กรุณากรอกเลข 2 หลัก เช่น 05, 48, 99');
      return;
    }
    onSetWinningNumber(formatted);
    triggerConfetti();
  };

  const handleRandomDraw = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      setDisplayRoll(rand);
      count++;
      if (count > 25) {
        clearInterval(interval);
        // Pick among booked or all numbers
        const finalNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        setDisplayRoll(finalNum);
        setManualInput(finalNum);
        onSetWinningNumber(finalNum);
        setIsSpinning(false);
        triggerConfetti();
      }
    }, 80);
  };

  const handleClearWinning = () => {
    onSetWinningNumber('');
    setManualInput('');
    setDisplayRoll('00');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card draw-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Trophy size={24} className="text-warning" />
            <div>
              <h3>ออกรางวัล / ตรวจผลผู้โชคดี</h3>
              <p className="modal-sub">{settings.title}</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Winner Announcement Card */}
        {winningNumber ? (
          <div className="winner-announcement-card animate-pulse-glow">
            <div className="winner-badge-icon">👑</div>
            <div className="winner-title">เลขที่ออกรางวัลคือ</div>
            <div className="winner-big-number">{winningNumber}</div>
            
            <div className="winner-detail-box">
              {winnerItem && winnerItem.status !== 'available' ? (
                <div className="winner-found">
                  <div className="found-name">
                    🎉 ขอแสดงความยินดีกับ: <strong>{winnerItem.customerName || 'ผู้จองนิรนาม'}</strong>
                  </div>
                  {winnerItem.customerPhone && (
                    <div className="found-phone">เบอร์ติดต่อ: {winnerItem.customerPhone}</div>
                  )}
                  <div className="found-status">
                    สถานะการชำระ: {winnerItem.status === 'paid' ? '✅ ชำระเงินแล้ว' : '⚠️ ยังไม่ได้ชำระ'}
                  </div>
                  <div className="found-prize">🏆 ได้รับรางวัล: {settings.title}</div>
                </div>
              ) : (
                <div className="winner-not-found">
                  <div className="no-winner-title">เลข {winningNumber} ยังไม่มีผู้จอง (เบอร์ว่าง)</div>
                  <div className="text-muted">รางวัลจะยกยอดไปงวดถัดไป หรือสุ่มใหม่อีกครั้ง</div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-outline-cancel mt-4"
              onClick={handleClearWinning}
            >
              <RotateCcw size={16} /> ล้างผลรางวัล / ออกรางวัลใหม่
            </button>
          </div>
        ) : (
          <div className="draw-roll-display">
            <div className={`roll-number-box ${isSpinning ? 'spinning' : ''}`}>
              {displayRoll}
            </div>
            <p className="text-muted">กดปุ่มสุ่มจับรางวัล หรือกรอกผลรางวัล 2 ตัวท้ายด้านล่าง</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="draw-controls-section">
          {/* Option 1: Random Wheel Spin */}
          <div className="draw-option-card">
            <h4>1. สุ่มจับรางวัลสดในระบบ</h4>
            <p className="option-desc">เหมาะสำหรับกิจกรรมแจกของรางวัล ไลฟ์สด หรือหมุนลุ้น</p>
            <button
              type="button"
              className="btn btn-spin-lottery"
              disabled={isSpinning}
              onClick={handleRandomDraw}
            >
              <Shuffle size={18} /> {isSpinning ? 'กำลังหมุนรางวัล...' : '🎲 สุ่มจับรางวัลทันที'}
            </button>
          </div>

          {/* Option 2: Enter Thai Lottery Winning Number */}
          <div className="draw-option-card">
            <h4>2. กรอกเลขรางวัล (เช่น เลขท้าย 2 ตัว รัฐบาล)</h4>
            <p className="option-desc">กรอกเลข 00 ถึง 99 เพื่อตรวจหาทันทีว่าใครได้รางวัล</p>
            <form onSubmit={handleManualSubmit} className="manual-draw-form">
              <input
                type="text"
                maxLength={2}
                placeholder="เช่น 77"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.replace(/\D/g, ''))}
                className="manual-num-input"
              />
              <button type="submit" className="btn btn-primary">
                <Sparkles size={16} /> ตรวจผลรางวัล
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
