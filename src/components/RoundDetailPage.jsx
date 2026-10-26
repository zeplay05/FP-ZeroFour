import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Download, 
  Circle, 
  Maximize2, 
  X, 
  Search, 
  MessageCircle
} from 'lucide-react';
import { formatThaiDate, getBoardTypeInfo } from '../utils/lotteryData';
import { SelectRemainingNumbersModal } from './SelectRemainingNumbersModal';

export function RoundDetailPage({
  round,
  onBackToGallery,
  onDeleteRound,
  onUpdateRoundBookings
}) {
  const [historySearch, setHistorySearch] = useState('');
  const [isRemainingModalOpen, setIsRemainingModalOpen] = useState(false);

  const bookings = round.bookings || [];
  const numbers = round.numbers || [];
  const isClosed = round.status === 'closed' || round.status === 'drawn';

  // Calculate counts
  const availableNumbers = useMemo(() => {
    return numbers.filter(n => n.status === 'available').map(n => n.number);
  }, [numbers]);

  const bookedNumbers = useMemo(() => {
    return numbers.filter(n => n.status === 'booked').map(n => n.number);
  }, [numbers]);

  const paidNumbers = useMemo(() => {
    return numbers.filter(n => n.status === 'paid').map(n => n.number);
  }, [numbers]);

  // Click a number on the grid opens remaining selector modal (only if open)
  const handleGridNumberClick = () => {
    if (isClosed) return;
    setIsRemainingModalOpen(true);
  };

  // Filter bookings by Facebook name or number (Sorted newest first)
  const filteredBookings = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => b.createdAt - a.createdAt);
    if (!historySearch.trim()) return sorted;
    const q = historySearch.toLowerCase().trim();
    return sorted.filter(b => {
      const custName = b.customerName || b.facebookName || '';
      const matchName = custName.toLowerCase().includes(q);
      const matchNums = Array.isArray(b.numbers)
        ? (b.numbers.some(n => String(n).includes(q)) || b.numbers.join('-').includes(q))
        : String(b.numbers || '').includes(q);
      return matchName || matchNums;
    });
  }, [bookings, historySearch]);

  // Export data
  const handleExport = () => {
    const dataStr = JSON.stringify(round, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `round-${round.title}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="round-detail-wrapper">
      {/* Main 2-Column Responsive Body */}
      {/* Desktop/Tablet/iPad: Side-by-side (Left: Grid / Right: History) */}
      {/* Mobile: Stacked (Right column collapses below) */}
      <div className="round-main-layout">
        
        {/* LEFT COLUMN: Header info, Slab Artwork, 10x10 Grid, Legend, Available Numbers */}
        <div className="round-left-column">

          {/* Card Title & Info Header */}
          <div className="round-header-row">
            <div className="round-title-group">
              <h2 className="round-page-title">{round.title}</h2>
              <p className="round-page-subtitle">
                {isClosed ? (
                  <span className="closed-round-status-pill">
                    🔒 ตารางประวัติ (ปิดให้บริการจองแล้ว)
                    {round.winningNumber && (
                      <span className="winning-badge-inline">🏆 เลขที่ออก: {round.winningNumber}</span>
                    )}
                  </span>
                ) : (
                  <>
                    เบอร์ละ {round.pricePerNumber}.- · เหลือว่าง {availableNumbers.length} เบอร์
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Slab / Cover Art Box */}
          <div className="round-slab-art-container">
            {round.coverImage ? (
              <img src={round.coverImage} alt={round.title} className="slab-img" />
            ) : (
              <div className="slab-card-placeholder">
                <div className="slab-inner-card">
                  <div className="slab-circle-motif" />
                </div>
              </div>
            )}
          </div>

          {/* 10x10 Grid (00 - 99) */}
          <div className="grid-10x10-box">
            <div className="pills-grid-10x10">
              {numbers.map((item) => {
                const isPaid = item.status === 'paid';
                const isBooked = item.status === 'booked';

                return (
                  <button
                    key={item.number}
                    type="button"
                    disabled={isClosed}
                    className={`grid-pill-btn ${
                      isPaid ? 'pill-state-paid' :
                      isBooked ? 'pill-state-booked' : 'pill-state-available'
                    } ${isClosed ? 'pill-disabled-closed' : ''}`}
                    onClick={() => handleGridNumberClick(item.number)}
                    title={
                      isClosed
                        ? `เบอร์ ${item.number} (ตารางปิดให้บริการจองแล้ว)`
                        : `เบอร์ ${item.number} : ${
                            isPaid ? `ชำระแล้ว (${item.customerName || 'ลูกค้า'})` :
                            isBooked ? `รอยอด (${item.customerName || 'ลูกค้า'})` : 'ว่าง (คลิกเพื่อเลือก)'
                          }`
                    }
                  >
                    {isPaid ? (
                      <span className="pill-booked-text">ติด<br/>จอง</span>
                    ) : isBooked ? (
                      <span className="pill-booked-text">ติด<br/>จอง</span>
                    ) : (
                      <span className="pill-number-text">{item.number}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Strip */}
          <div className="grid-legend-strip">
            <span className="legend-item legend-available">
              <span className="legend-dot dot-yellow" /> ว่าง {availableNumbers.length}
            </span>
            <span className="legend-item legend-booked">
              <span className="legend-dot dot-orange" /> รอยอด {bookedNumbers.length}
            </span>
            <span className="legend-item legend-paid">
              <span className="legend-dot dot-green" /> จ่ายแล้ว {paidNumbers.length}
            </span>
          </div>

          {/* Prominent Quick-Book Banner Button only if open */}
          {!isClosed && availableNumbers.length > 0 && (
            <button
              type="button"
              className="btn-banner-select-chat"
              onClick={() => setIsRemainingModalOpen(true)}
            >
              <MessageCircle size={18} />
              <span>เลือกเลขที่ต้องการ แล้วเด้งไปแชทเฟส ({availableNumbers.length} เบอร์ว่าง)</span>
            </button>
          )}

          {/* Banner Notice when round is closed (ประวัติตารางที่ปิดให้บริการจอง) */}
          {isClosed && (
            <div className="round-closed-notice-card">
              <div className="closed-notice-content">
                <span className="closed-icon-badge">🔒</span>
                <div>
                  <h4 className="closed-card-heading">ตารางนี้ปิดให้บริการจองแล้ว</h4>
                  <p className="closed-card-subtext">
                    {round.winningNumber 
                      ? `ผลรางวัลเลขที่ออก: ${round.winningNumber} 🏆`
                      : 'งวดนี้สิ้นสุดการจองและปิดรอบเรียบร้อยแล้ว'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Booking History */}
        <div className="round-right-column">

          {/* Box 2: ประวัติการจอง (Booking History List, Newest First) */}
          <div className="booking-history-box">
            <h3 className="section-box-title">
              ประวัติการจอง ({bookings.length})
            </h3>

            {/* Search filter for history */}
            <div className="history-search-wrap">
              <input
                type="text"
                placeholder="ค้นหาชื่อเฟส หรือเลข"
                className="history-search-input"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            {/* History Cards List (Sorted Newest First) */}
            <div className="history-cards-scrollable">
              {filteredBookings.length === 0 ? (
                <div className="empty-history-text">
                  {historySearch ? 'ไม่พบข้อมูลตามคำค้นหา' : 'ยังไม่มีประวัติการจอง'}
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isPaid = b.status === 'paid';
                  const numsFormatted = Array.isArray(b.numbers) ? b.numbers.join('-') : b.numbers;

                  return (
                    <div key={b.id} className="history-item-card">
                      <div className="history-card-header">
                        <span className="history-fb-name">
                          <span className="history-fb-prefix">ชื่อเฟส : </span>
                          <span className="history-fb-val">{b.customerName || b.facebookName || 'ลูกค้าไม่ระบุชื่อ'}</span>
                        </span>
                      </div>

                      <div className="history-card-nums">
                        เลขที่สั่ง : {numsFormatted}
                      </div>

                      <div className="history-card-footer">
                        <div className="history-status-wrap">
                          <span className="status-label-inline">สถานะ : </span>
                          <span className={`badge-status-btn ${isPaid ? 'badge-paid' : 'badge-booked'}`}>
                            {isPaid ? 'จ่ายแล้ว' : 'รอยอด'}
                          </span>
                        </div>

                        <div className="history-right-meta">
                          <span className="history-time-text">
                            {b.timeStr || '25 ต.ค. 10:46'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Multi-Select Remaining Numbers Modal (Only active if round is open) */}
      {!isClosed && (
        <SelectRemainingNumbersModal
          isOpen={isRemainingModalOpen}
          onClose={() => setIsRemainingModalOpen(false)}
          round={round}
          availableNumbers={availableNumbers}
        />
      )}

    </div>
  );
}
