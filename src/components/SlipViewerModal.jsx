import React from 'react';
import { X, Check, ExternalLink, Download, Clock, User, Phone, CheckCircle2 } from 'lucide-react';
import { formatThaiDateTime } from '../utils/timeUtils';

export function SlipViewerModal({
  isOpen,
  onClose,
  booking,
  round,
  onApprovePaid
}) {
  if (!isOpen || !booking) return null;

  const hasSlip = Boolean(booking.slipImage);
  const isPaid = booking.status === 'paid';
  const numsList = Array.isArray(booking.numbers) ? booking.numbers.join(', ') : booking.numbers;

  return (
    <div className="slip-viewer-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="slip-viewer-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="slip-viewer-header">
          <div className="slip-header-title-box">
            <h3 className="slip-viewer-title">
              🧾 ตรวจสอบสลิปการโอนเงิน
            </h3>
            <span className="slip-board-sub">{round?.title}</span>
          </div>
          <button 
            type="button" 
            className="btn-slip-close" 
            onClick={onClose}
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="slip-viewer-body">
          {/* Left: Slip Image */}
          <div className="slip-image-column">
            {hasSlip ? (
              <div className="slip-img-display-wrap">
                <img 
                  src={booking.slipImage} 
                  alt={`สลิปของ ${booking.customerName}`} 
                  className="slip-full-image" 
                />
                <div className="slip-img-actions-bar">
                  <a 
                    href={booking.slipImage} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-slip-action"
                    title="เปิดภาพในแท็บใหม่"
                  >
                    <ExternalLink size={13} />
                    <span>เปิดภาพเต็ม</span>
                  </a>
                  <a 
                    href={booking.slipImage} 
                    download={`slip-${booking.customerName || 'customer'}.jpg`}
                    className="btn-slip-action"
                    title="ดาวน์โหลดภาพสลิป"
                  >
                    <Download size={13} />
                    <span>ดาวน์โหลด</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="slip-missing-box">
                <span>ไม่มีรูปภาพสลิปแนบมากับรายการนี้</span>
              </div>
            )}
          </div>

          {/* Right: Booking & Payment Information */}
          <div className="slip-info-column">
            <div className="slip-meta-card">
              <div className="meta-row">
                <span className="meta-lbl">ชื่อเฟส / ผู้จอง:</span>
                <strong className="meta-val text-cyan">
                  <User size={13} /> {booking.customerName || booking.facebookName}
                </strong>
              </div>

              {booking.customerContact && (
                <div className="meta-row">
                  <span className="meta-lbl">เบอร์ / LINE:</span>
                  <span className="meta-val">
                    <Phone size={13} /> {booking.customerContact}
                  </span>
                </div>
              )}

              <div className="meta-row">
                <span className="meta-lbl">เบอร์ที่จอง:</span>
                <div className="slip-nums-tags">
                  {(booking.numbers || []).map(num => (
                    <span key={num} className="mini-num-tag">{num}</span>
                  ))}
                </div>
              </div>

              <div className="meta-row">
                <span className="meta-lbl">ยอดเงินที่ต้องโอน:</span>
                <strong className="meta-val text-gold highlight-amount">
                  {(booking.finalPrice || (booking.numbers?.length * (round?.pricePerNumber || 50))).toLocaleString()} ฿
                </strong>
              </div>

              <div className="meta-row">
                <span className="meta-lbl">เวลาที่ส่งสลิป:</span>
                <span className="meta-val text-muted">
                  <Clock size={13} /> {booking.createdAt ? formatThaiDateTime(booking.createdAt) : booking.timeStr || '-'}
                </span>
              </div>

              <div className="meta-row">
                <span className="meta-lbl">สถานะปัจจุบัน:</span>
                <span className={`chip-status-tag ${isPaid ? 'open' : 'closed'}`}>
                  {isPaid ? '✅ จ่ายแล้ว (ชำระแล้ว)' : '⏳ รอยอดตรวจสอบสลิป'}
                </span>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="slip-actions-footer">
              {!isPaid && onApprovePaid && (
                <button
                  type="button"
                  className="btn-approve-slip"
                  onClick={() => {
                    onApprovePaid(booking.id);
                    onClose();
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>✅ อนุมัติสลิป (เปลี่ยนเป็นจ่ายแล้ว)</span>
                </button>
              )}

              <button
                type="button"
                className="btn-close-viewer"
                onClick={onClose}
              >
                <span>ปิดหน้าต่าง</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default SlipViewerModal;

