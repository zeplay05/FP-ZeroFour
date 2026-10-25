import React, { useState } from 'react';
import { Send, CheckSquare, Trash2, ShoppingBag, X } from 'lucide-react';

export function CustomerOrderDrawer({
  selectedNumbers,
  onClearSelection,
  pricePerNumber,
  sellerLine,
  sellerPhone,
  onConfirmCustomerBooking,
  roundName
}) {
  const [showDirectForm, setShowDirectForm] = useState(false);
  const [custName, setCustName] = useState('');
  const [custContact, setCustContact] = useState('');

  if (selectedNumbers.length === 0) return null;

  const totalAmount = selectedNumbers.length * pricePerNumber;
  const numbersText = selectedNumbers.sort((a, b) => Number(a) - Number(b)).join(', ');

  const handleLineOrder = () => {
    const message = `สวัสดีครับ/ค่ะ ขอจองเบอร์หวย/เบอร์ทอง 00-99\n🎯 หมายเลขที่ต้องการ (${selectedNumbers.length} เบอร์): ${numbersText}\n💰 ยอดรวม: ${totalAmount} บาท\n📅 งวด: ${roundName}\nรบกวนส่งเลขบัญชีสำหรับโอนเงินด้วยครับ/ค่ะ`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message);
    
    // If seller line provided
    if (sellerLine && sellerLine.startsWith('http')) {
      window.open(sellerLine, '_blank');
    } else {
      alert(`คัดลอกข้อความสั่งจองเรียบร้อยแล้ว!\n\n${message}\n\nคุณสามารถนำข้อความนี้ไปวางในแชท LINE ของแม่ค้าได้ทันที`);
    }
  };

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    if (!custName.trim()) {
      alert('กรุณากรอกชื่อของคุณ');
      return;
    }
    onConfirmCustomerBooking({
      numbers: selectedNumbers,
      customerName: custName.trim(),
      customerContact: custContact.trim()
    });
    setShowDirectForm(false);
    setCustName('');
    setCustContact('');
  };

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="customer-order-floating-bar animate-slide-up">
        <div className="order-summary-info">
          <div className="order-icon-badge">
            <ShoppingBag size={20} />
            <span className="count-pill">{selectedNumbers.length}</span>
          </div>
          <div className="order-text">
            <div className="order-numbers-list">
              เลือก <strong>{selectedNumbers.length} เบอร์</strong>: <span className="highlight-nums">{numbersText}</span>
            </div>
            <div className="order-price">
              ยอดรวม <strong>{totalAmount.toLocaleString()}</strong> บาท ({pricePerNumber} บ./เบอร์)
            </div>
          </div>
        </div>

        <div className="order-actions">
          <button
            type="button"
            className="btn btn-outline-cancel"
            onClick={onClearSelection}
            title="ยกเลิกการเลือก"
          >
            <Trash2 size={16} /> ล้าง
          </button>
          
          <button
            type="button"
            className="btn btn-direct-book"
            onClick={() => setShowDirectForm(true)}
          >
            <CheckSquare size={16} /> บันทึกจองเลย
          </button>

          <button
            type="button"
            className="btn btn-line-order"
            onClick={handleLineOrder}
            title="คัดลอกข้อความและส่งทาง LINE"
          >
            <Send size={16} /> ส่งจองทาง LINE
          </button>
        </div>
      </div>

      {/* Direct Quick Booking Modal for Customer */}
      {showDirectForm && (
        <div className="modal-overlay" onClick={() => setShowDirectForm(false)}>
          <div className="modal-card mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>ยืนยันการจอง {selectedNumbers.length} เบอร์</h3>
              <button className="btn-close" onClick={() => setShowDirectForm(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleDirectSubmit} className="modal-form">
              <div className="order-review-box">
                <div className="review-label">เบอร์ที่เลือก:</div>
                <div className="review-numbers">{numbersText}</div>
                <div className="review-total">ยอดชำระ: {totalAmount.toLocaleString()} บาท</div>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อของคุณ:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น คุณสมศรี, บอย"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์ หรือ LINE ID:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น 089-xxx-xxxx"
                  value={custContact}
                  onChange={(e) => setCustContact(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDirectForm(false)}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  ยืนยันการจอง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
