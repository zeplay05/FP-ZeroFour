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

  // Random pick N numbers from available
  const handleRandomPick = (pickCount) => {
    const unselected = availableNumbers.filter(n => !selectedNumbers.includes(n));
    if (unselected.length === 0) return;
    
    // Shuffle unselected
    const shuffled = [...unselected].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, pickCount);
    
    setSelectedNumbers(prev => [...prev, ...picked].sort((a, b) => Number(a) - Number(b)));
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
    
    // Auto copy message into customer's clipboard immediately (ไม่ต้องก๊อปเอง)
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
            <span className="quick-label">สุ่มเบอร์:</span>
            <button 
              type="button" 
              className="btn-quick-chip"
              onClick={() => handleRandomPick(1)}
              title="สุ่ม 1 เบอร์"
            >
              <Sparkles size={12} /> 1 เบอร์
            </button>
            <button 
              type="button" 
              className="btn-quick-chip"
              onClick={() => handleRandomPick(3)}
              title="สุ่ม 3 เบอร์"
            >
              <Sparkles size={12} /> 3 เบอร์
            </button>
            <button 
              type="button" 
              className="btn-quick-chip"
              onClick={() => handleRandomPick(5)}
              title="สุ่ม 5 เบอร์"
            >
              <Sparkles size={12} /> 5 เบอร์
            </button>
            {selectedNumbers.length > 0 && (
              <button 
                type="button" 
                className="btn-quick-chip chip-clear"
                onClick={handleClearSelection}
                title="ล้างที่เลือกทั้งหมด"
              >
                <RotateCcw size={12} /> ล้าง
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="select-search-wrap">
            <Search size={14} className="search-icon-inside" />
            <input 
              type="text" 
              placeholder="ค้นหาเลข..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="select-search-field"
            />
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
          <div className="select-footer-row">
            <div className="customer-input-group full-width">
              <label className="input-tiny-label">ชื่อเฟสของคุณ (เพื่อแจ้งผู้ขาย):</label>
              <input 
                type="text" 
                placeholder="เช่น สมชาย สายเปย์ (หรือเว้นว่างไว้)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="customer-fb-input"
              />
            </div>
          </div>

          {/* Promotion Banner Strip */}
          <div className="promo-badge-strip">
            <span className="promo-tag">🔥 {typeInfo.name}</span>
            <span className="promo-text">{typeInfo.promoDetail} ({typeInfo.promoText})</span>
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
                  <span className="text-muted-italics">ยังไม่ได้เลือกเบอร์ (กดเลือกได้จากตารางด้านบน)</span>
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
                    🎉 ลดทันที -{discount} บาท
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

          {/* Action Buttons */}
          <div className="select-actions-row">
            <button
              type="button"
              className="btn-action-send-fb"
              onClick={handleOpenMessenger}
              disabled={selectedNumbers.length === 0}
            >
              <MessageCircle size={18} />
              <span>ส่งเข้าแชทเฟส (Messenger)</span>
              <ExternalLink size={14} className="send-ext-icon" />
            </button>
          </div>

          {copied && (
            <div className="copy-hint-pill animate-fade-in">
              ✨ คัดลอกข้อความให้อัตโนมัติแล้ว! สามารถกด "วาง (Paste)" ในแชทได้ทันที
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
