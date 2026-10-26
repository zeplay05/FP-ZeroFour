import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Check, 
  MessageCircle, 
  Sparkles, 
  RotateCcw, 
  Search,
  ExternalLink,
  ShoppingBag,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { getBoardTypeInfo } from '../utils/lotteryData';

export function SelectRemainingNumbersModal({
  isOpen,
  onClose,
  round,
  availableNumbers = []
}) {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Seller Facebook Page or Messenger link (Admin configured)
  const sellerFbUrl = useMemo(() => {
    const saved = localStorage.getItem('seller_fb_link');
    if (!saved || saved === 'https://m.me' || saved.trim() === '') {
      return 'https://m.me/filmxrux.khrzx';
    }
    return saved;
  }, []);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedNumbers([]);
      setSearchQuery('');
      setCopied(false);
      setShowSuccessModal(false);
    }
  }, [isOpen]);

  // Filter available numbers by search query
  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return availableNumbers;
    const q = searchQuery.trim();
    return availableNumbers.filter(n => n.includes(q));
  }, [availableNumbers, searchQuery]);

  if (!isOpen) return null;

  const pricePerNumber = round?.pricePerNumber || 0;
  const count = selectedNumbers.length;
  const rawTotal = count * pricePerNumber;
  
  // Board type configuration & dynamic promotion discount
  const typeInfo = getBoardTypeInfo(round?.boardType);
  const step = typeInfo.numbersPerStep; // 3 for duck/wheel, 4 for lotto
  const discount = typeInfo.calculateDiscount(count);
  const finalTotal = Math.max(0, rawTotal - discount);
  const remainder = count % step;
  const nextDiscountHint = count > 0 && remainder !== 0 ? step - remainder : 0;

  // Toggle selection of a single number
  const toggleNumber = (numStr) => {
    setSelectedNumbers(prev => {
      if (prev.includes(numStr)) {
        return prev.filter(n => n !== numStr);
      } else {
        return [...prev, numStr].sort((a, b) => Number(a) - Number(b));
      }
    });
  };

  // Random pick N numbers from available (รีเซ็ตและสุ่มใหม่ตามจำนวนที่กด ไม่บวกสะสม)
  const handleRandomPick = (pickCount) => {
    if (!availableNumbers || availableNumbers.length === 0) return;
    
    // Shuffle all available numbers
    const shuffled = [...availableNumbers].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(pickCount, availableNumbers.length));
    
    setSelectedNumbers(picked.sort((a, b) => Number(a) - Number(b)));
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedNumbers([]);
  };

  // Generate standardized short booking message
  const generateMessageText = () => {
    const numbersListStr = selectedNumbers.join(', ');
    const titleText = round?.title || 'รางวัลเลขท้าย';
    const nameLine = customerName.trim() ? `👤 ผู้จอง: ${customerName.trim()}\n` : '';

    let promoLine = '';
    if (discount > 0) {
      promoLine = `🎉 ส่วนลด ${discount} บาท\n`;
    }

    return `สนใจจองเบอร์:\n` +
      `📋 ${titleText}\n\n` +
      `🔢 เบอร์ที่ต้องการจอง:\n` +
      `${numbersListStr}\n\n` +
      promoLine +
      `💰 ยอดโอน: ${finalTotal.toLocaleString()} บาท\n` +
      nameLine +
      `\nรบกวนขอเลขบัญชี 🙏`;
  };

  // Open Facebook Chat / Messenger with auto-copied message
  const handleOpenMessenger = () => {
    if (selectedNumbers.length === 0) {
      alert('กรุณาเลือกเบอร์ที่ต้องการก่อนครับ');
      return;
    }
    const msg = generateMessageText();
    
    // Auto copy message into customer's clipboard immediately
    try {
      navigator.clipboard.writeText(msg);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    // Build Messenger URL
    let targetUrl = sellerFbUrl.trim();
    if (!targetUrl.startsWith('http')) {
      if (targetUrl.includes('facebook.com') || targetUrl.includes('m.me')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = `https://m.me/${targetUrl}`;
      }
    }

    // Append text parameter in URL
    const separator = targetUrl.includes('?') ? '&' : '?';
    const finalUrl = `${targetUrl}${separator}text=${encodeURIComponent(msg)}`;

    // Open chat in new tab
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  // Manual copy button inside modal
  const handleManualCopy = async () => {
    const msg = generateMessageText();
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
  };

  // Confirm booking & show confirmation popup
  const handleConfirmBooking = () => {
    if (selectedNumbers.length === 0) {
      alert('กรุณาเลือกเบอร์ที่ต้องการก่อนครับ');
      return;
    }
    const msg = generateMessageText();
    try {
      navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard write failed', e);
    }
    setShowSuccessModal(true);
  };

  return (
    <div className="select-modal-backdrop" onClick={onClose}>
      <div 
        className="select-modal-container animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Header */}
        <div className="select-modal-header">
          <div className="select-modal-title-group">
            <div className="select-modal-badge">
              <ShoppingBag size={14} />
              <span>เลือกเบอร์ที่ยังว่าง</span>
            </div>
            <h2 className="select-modal-title">
              เลือกเบอร์ที่ยังไม่ออก
            </h2>
            <p className="select-modal-subtitle">
              {round?.title} · เหลือว่าง {availableNumbers.length} เบอร์ (เบอร์ละ {pricePerNumber}.-)
            </p>
          </div>

          <button 
            type="button" 
            className="select-modal-btn-close" 
            onClick={onClose}
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Toolbar (Random Pick, Search, Clear) */}
        <div className="select-modal-toolbar">
          <div className="quick-random-group">
            <span className="quick-label"><Sparkles size={12} className="text-amber-400" /> สุ่มเบอร์:</span>
            {[1, 2, 3, 4].map((n) => (
              <button 
                key={n}
                type="button" 
                className="btn-quick-chip"
                onClick={() => handleRandomPick(n)}
                title={`สุ่ม ${n} เบอร์`}
              >
                {n} เบอร์
              </button>
            ))}
          </div>

          <div className="select-toolbar-actions">
            <div className="select-search-wrap">
              <Search size={14} className="search-icon-inside" />
              <input 
                type="text" 
                placeholder="ค้นหาเลข..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="select-search-field"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="select-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="ล้างการค้นหา"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {selectedNumbers.length > 0 && (
              <button 
                type="button" 
                className="btn-quick-chip chip-clear"
                onClick={handleClearSelection}
                title="ล้างที่เลือกทั้งหมด"
              >
                <RotateCcw size={12} /> ล้าง ({selectedNumbers.length})
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Numbers Grid (ONLY Available Remaining Numbers) */}
        <div className="select-numbers-scroll-area">
          {filteredAvailable.length === 0 ? (
            <div className="no-available-found">
              {searchQuery ? `ไม่พบเลข "${searchQuery}" ในเบอร์ที่ว่าง` : 'ไม่มีเบอร์ว่างเหลือแล้ว'}
            </div>
          ) : (
            <div className="select-pills-grid">
              {filteredAvailable.map((numStr) => {
                const isSelected = selectedNumbers.includes(numStr);
                return (
                  <button
                    key={numStr}
                    type="button"
                    className={`select-number-pill ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleNumber(numStr)}
                    title={`คลิกเพื่อ${isSelected ? 'ยกเลิก' : 'เลือก'}เบอร์ ${numStr}`}
                  >
                    {isSelected && (
                      <span className="pill-check-indicator">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                    <span className="pill-val-text">{numStr}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Details & Summary Drawer */}
        <div className="select-modal-footer">
          
          {/* Customer Name Input (Optional) */}
          <div className="customer-input-group full-width">
            <input 
              type="text" 
              placeholder="ชื่อเฟสของคุณ (ระบุเพื่อแจ้งผู้ขาย หรือเว้นว่างได้)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="customer-fb-input"
            />
          </div>

          {/* Selection Live Bar */}
          <div className="select-live-summary-bar">
            <div className="summary-left">
              <div className="selected-count-label">
                เลือกแล้ว <strong className="highlight-count">{count}</strong> เบอร์
              </div>
              <div className="selected-nums-preview">
                {count > 0 ? (
                  selectedNumbers.join(', ')
                ) : (
                  <span className="text-muted-italics">แตะเลือกเลขที่ต้องการจากกระดานด้านบน</span>
                )}
              </div>
              {/* Dynamic discount hint */}
              {nextDiscountHint > 0 && count > 0 && (
                <div className="next-discount-tip animate-fade-in">
                  💡 เลือกอีก <strong>{nextDiscountHint}</strong> เบอร์ รับส่วนลดเพิ่มเป็น <strong>{discount + typeInfo.discountPerStep}.-</strong>
                </div>
              )}
            </div>

            <div className="summary-right">
              {discount > 0 ? (
                <>
                  <div className="promo-discount-badge animate-fade-in">
                    ลด -{discount}.-
                  </div>
                  <div className="total-price-val">
                    <span className="raw-price-strikethrough">{rawTotal.toLocaleString()}</span>
                    {' '}{finalTotal.toLocaleString()} <span className="currency-unit">บาท</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="total-price-label">ยอดที่ต้องชำระ</div>
                  <div className="total-price-val">
                    {finalTotal.toLocaleString()} <span className="currency-unit">บาท</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons: ยืนยันจอง */}
          <div className="select-actions-row">
            <button
              type="button"
              className="btn-action-confirm-booking"
              onClick={handleConfirmBooking}
              disabled={selectedNumbers.length === 0}
            >
              <CheckCircle2 size={19} />
              <span>ยืนยันจอง {count > 0 ? `(${count} เบอร์)` : ''}</span>
            </button>
          </div>

        </div>

        {/* Booking Success Confirmation Dialog */}
        {showSuccessModal && (
          <div className="booking-success-backdrop animate-fade-in" onClick={() => setShowSuccessModal(false)}>
            <div className="booking-success-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
              
              <div className="booking-success-badge-icon">
                <CheckCircle2 size={42} className="text-success-neon" />
              </div>

              <h3 className="booking-success-title">เลือกเลขสำเร็จเรียบร้อย! 🎉</h3>
              <p className="booking-success-desc">
                ระบบได้คัดลอกข้อความสรุปการจองให้แล้ว สามารถนำข้อความไปวางส่งหาแอดมินในแชทได้ทันทีครับ
              </p>

              {/* Order summary card */}
              <div className="booking-summary-card">
                <div className="summary-card-row">
                  <span className="summary-card-label">รายการ:</span>
                  <span className="summary-card-val text-white font-semibold">{round?.title || 'รางวัลเลขท้าย'}</span>
                </div>
                <div className="summary-card-row">
                  <span className="summary-card-label">เบอร์ที่จอง ({count} เบอร์):</span>
                  <span className="summary-card-val highlight-nums">{selectedNumbers.join(', ')}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-card-row">
                    <span className="summary-card-label">ส่วนลด:</span>
                    <span className="summary-card-val text-emerald-400 font-bold">-{discount} บาท</span>
                  </div>
                )}
                <div className="summary-card-row total-highlight-row">
                  <span className="summary-card-label">ยอดที่ต้องชำระ:</span>
                  <span className="summary-card-val total-amt">{finalTotal.toLocaleString()} บาท</span>
                </div>
                {customerName.trim() && (
                  <div className="summary-card-row">
                    <span className="summary-card-label">ชื่อผู้จอง:</span>
                    <span className="summary-card-val text-slate-300">{customerName.trim()}</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="booking-success-actions">
                <button
                  type="button"
                  className="btn-modal-chat-admin"
                  onClick={handleOpenMessenger}
                >
                  <MessageCircle size={18} />
                  <span>แชทหาแอดมิน (Messenger)</span>
                  <ExternalLink size={14} className="send-ext-icon" />
                </button>

                <button
                  type="button"
                  className="btn-modal-copy-again"
                  onClick={handleManualCopy}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      <span>คัดลอกข้อความสำเร็จแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>คัดลอกข้อความอีกครั้ง</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-modal-close-simple"
                  onClick={() => setShowSuccessModal(false)}
                >
                  กลับไปที่กระดาน
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
