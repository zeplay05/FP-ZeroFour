import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, User, Phone, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatBookingTime } from '../utils/timeUtils';

export function BookingModal({
  isOpen,
  onClose,
  numberItem,
  onSaveBooking,
  onClearBooking,
  pricePerNumber
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [status, setStatus] = useState('booked');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (numberItem) {
      setCustomerName(numberItem.customerName || '');
      setCustomerPhone(numberItem.customerPhone || '');
      setStatus(numberItem.status === 'available' ? 'booked' : numberItem.status);
      setNote(numberItem.note || '');
    }
  }, [numberItem]);

  if (!isOpen || !numberItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() && status !== 'available') {
      alert('กรุณากรอกชื่อผู้จอง');
      return;
    }

    onSaveBooking({
      ...numberItem,
      status: status,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      note: note.trim(),
      bookedAt: numberItem.bookedAt || formatBookingTime(Date.now())
    });
    onClose();
  };

  const handleClear = () => {
    if (window.confirm(`ต้องการยกเลิกการจองเบอร์ ${numberItem.number} และเปลี่ยนเป็นเบอร์ว่างใช่หรือไม่?`)) {
      onClearBooking(numberItem.number);
      onClose();
    }
  };

  const handleMarkPaid = () => {
    onSaveBooking({
      ...numberItem,
      status: 'paid',
      customerName: customerName.trim() || 'ลูกค้าหน้าร้าน',
      customerPhone: customerPhone.trim(),
      note: note ? `${note} (ชำระแล้ว)` : 'ชำระแล้ว',
      bookedAt: numberItem.bookedAt || formatBookingTime(Date.now())
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card booking-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="badge-modal-number">{numberItem.number}</span>
            <div>
              <h3>จัดการข้อมูลเบอร์ {numberItem.number}</h3>
              <p className="modal-sub">ราคา {pricePerNumber} บาท • สถานะปัจจุบัน: {
                numberItem.status === 'paid' ? 'ชำระแล้ว' : 
                numberItem.status === 'booked' ? 'ติดจอง' : 'เบอร์ว่าง'
              }</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="ปิด">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Status Buttons */}
          <div className="form-group">
            <label className="form-label">สถานะของเบอร์นี้:</label>
            <div className="status-selector-grid">
              <button
                type="button"
                className={`status-btn btn-status-available ${status === 'available' ? 'active' : ''}`}
                onClick={() => setStatus('available')}
              >
                ว่าง (ยังไม่จอง)
              </button>
              <button
                type="button"
                className={`status-btn btn-status-booked ${status === 'booked' ? 'active' : ''}`}
                onClick={() => setStatus('booked')}
              >
                <Clock size={16} /> ติดจอง (รอชำระ)
              </button>
              <button
                type="button"
                className={`status-btn btn-status-paid ${status === 'paid' ? 'active' : ''}`}
                onClick={() => setStatus('paid')}
              >
                <CheckCircle size={16} /> ชำระเงินแล้ว
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div className="form-group">
            <label className="form-label">
              <User size={16} /> ชื่อคนจอง / ลูกค้า:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น คุณก้อย, พี่สมชาย, น้องแนน"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Customer Phone / LINE */}
          <div className="form-group">
            <label className="form-label">
              <Phone size={16} /> เบอร์โทรศัพท์ หรือ LINE ID:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น 081-234-5678 หรือ line_id"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={16} /> หมายเหตุเพิ่มเติม:
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น โอนแล้วเวลา 13:45, นัดรับเงินหน้าร้าน"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            {numberItem.status !== 'available' && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleClear}
                title="ลบข้อมูลคนจองและเปลี่ยนเป็นเบอร์ว่าง"
              >
                <Trash2 size={16} /> ยกเลิกการจอง
              </button>
            )}

            <div className="actions-right">
              {status !== 'paid' && numberItem.status !== 'available' && (
                <button
                  type="button"
                  className="btn btn-secondary-paid"
                  onClick={handleMarkPaid}
                >
                  <Check size={16} /> ปรับเป็นจ่ายแล้ว
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
