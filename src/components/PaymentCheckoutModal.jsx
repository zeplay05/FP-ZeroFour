import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Upload, 
  Download, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPromptPayQrUrl, DEFAULT_PAYMENT_CONFIG } from '../utils/promptpay';
import { formatBookingTime } from '../utils/timeUtils';

// Helper to compress image into Base64 Data URL
function compressImage(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  round,
  selectedNumbers = [],
  customerName: initialName = '',
  finalTotal = 0,
  rawTotal = 0,
  discount = 0,
  onCompleteBooking,
  paymentConfig = DEFAULT_PAYMENT_CONFIG
}) {
  const [customerName, setCustomerName] = useState(initialName || '');
  const [customerContact, setCustomerContact] = useState('');
  const [note, setNote] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialName || '');
      setSlipFile(null);
      setSlipPreview(null);
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, initialName]);

  if (!isOpen || !round) return null;

  const promptPayTarget = paymentConfig.promptPayId || DEFAULT_PAYMENT_CONFIG.promptPayId;
  const qrUrl = paymentConfig.qrImageUrl || getPromptPayQrUrl(promptPayTarget, finalTotal);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage('');
    try {
      const base64 = await compressImage(file, 800, 0.75);
      setSlipFile(file);
      setSlipPreview(base64);
    } catch (err) {
      console.error(err);
      setErrorMessage('ไม่สามารถโหลดรูปภาพสลิปได้ โปรดลองอีกครั้ง');
    }
  };

  const handleCopyAccount = () => {
    const accNum = paymentConfig.accountNumber || DEFAULT_PAYMENT_CONFIG.accountNumber;
    navigator.clipboard.writeText(accNum.replace(/-/g, ''));
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(finalTotal));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('กรุณาระบุชื่อเฟสบุ๊ค หรือชื่อผู้จอง');
      return;
    }
    if (!slipPreview) {
      setErrorMessage('กรุณาแนบภาพสลิปการโอนเงินเพื่อยืนยันการจอง');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const bookingData = {
        customerName: customerName.trim(),
        facebookName: customerName.trim(),
        customerContact: customerContact.trim(),
        numbers: selectedNumbers,
        note: note.trim(),
        status: 'booked', // Mark as booked (ติดจอง/รอตรวจสลิป)
        paymentStatus: 'pending_verification',
        slipImage: slipPreview,
        rawPrice: rawTotal,
        discount: discount,
        finalPrice: finalTotal,
        paidAmount: finalTotal,
        createdAt: Date.now(),
        timeStr: formatBookingTime(Date.now())
      };

      if (onCompleteBooking) {
        await onCompleteBooking(bookingData);
      }

      setIsSuccess(true);
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-checkout-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="payment-checkout-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="checkout-modal-header">
          <div className="checkout-header-info">
            <div className="checkout-title-row">
              <span className="checkout-badge-pill">
                <ShieldCheck size={14} /> ชำระเงินผ่านเว็บไซต์
              </span>
            </div>
            <h3 className="checkout-main-title">{round.title}</h3>
          </div>
          <button 
            type="button" 
            className="btn-checkout-close" 
            onClick={onClose}
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        {!isSuccess ? (
          <form onSubmit={handleSubmitPayment} className="checkout-body-content">
            
            {/* Top Order Summary Strip */}
            <div className="checkout-summary-box">
              <div className="summary-left-nums">
                <span className="summary-label">เลขที่จอง ({selectedNumbers.length} เบอร์):</span>
                <div className="checkout-numbers-wrap">
                  {selectedNumbers.map(n => (
                    <span key={n} className="checkout-num-chip">{n}</span>
                  ))}
                </div>
              </div>

              <div className="summary-right-total">
                {discount > 0 && (
                  <span className="checkout-discount-tag">
                    ลดแล้ว {discount}.- (จาก {rawTotal}.-)
                  </span>
                )}
                <div className="checkout-amount-display">
                  <span className="amount-label">ยอดที่ต้องโอน:</span>
                  <strong className="amount-val text-gold">{finalTotal.toLocaleString()} ฿</strong>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="checkout-error-banner animate-fade-in">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Middle Section: QR Code & Bank Account Transfer Info */}
            <div className="checkout-payment-grid">
              
              {/* QR Code Container */}
              <div className="qr-payment-container">
                <div className="promptpay-logo-strip">
                  <span className="promptpay-thai-txt">พร้อมเพย์</span>
                  <span className="promptpay-en-txt">PromptPay</span>
                </div>

                <div className="qr-image-wrapper">
                  {qrUrl ? (
                    <img 
                      src={qrUrl} 
                      alt="PromptPay QR Code" 
                      className="promptpay-qr-img" 
                    />
                  ) : (
                    <div className="qr-loading-box">
                      <QrCode size={40} className="text-muted" />
                      <span>กำลังสร้าง QR Code...</span>
                    </div>
                  )}
                </div>

                <div className="qr-scan-hint">
                  <span className="scan-icon">📱</span>
                  <span>สแกน QR Code ด้วยแอปธนาคารทุกแห่ง</span>
                </div>

                {qrUrl && (
                  <a
                    href={qrUrl}
                    download={`promptpay-${finalTotal}-baht.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-download-qr"
                  >
                    <Download size={13} />
                    <span>บันทึกภาพ QR Code</span>
                  </a>
                )}
              </div>

              {/* Bank Details & Copy */}
              <div className="bank-details-container">
                <h4 className="bank-box-title">
                  <CreditCard size={16} /> หรือโอนผ่านเลขที่บัญชี
                </h4>

                <div className="bank-info-card">
                  <div className="bank-row">
                    <span className="bank-label">ธนาคาร:</span>
                    <strong className="bank-val text-cyan">
                      {paymentConfig.bankName || DEFAULT_PAYMENT_CONFIG.bankName}
                    </strong>
                  </div>

                  <div className="bank-row">
                    <span className="bank-label">ชื่อบัญชี:</span>
                    <strong className="bank-val">
                      {paymentConfig.accountName || DEFAULT_PAYMENT_CONFIG.accountName}
                    </strong>
                  </div>

                  <div className="bank-row highlighted">
                    <span className="bank-label">เลขที่บัญชี:</span>
                    <div className="acc-num-row">
                      <strong className="bank-acc-digits">
                        {paymentConfig.accountNumber || DEFAULT_PAYMENT_CONFIG.accountNumber}
                      </strong>
                      <button
                        type="button"
                        className="btn-copy-mini"
                        onClick={handleCopyAccount}
                        title="คลิกเพื่อคัดลอกเลขบัญชี"
                      >
                        {copiedAcc ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedAcc ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bank-row">
                    <span className="bank-label">ยอดโอนเป๊ะ:</span>
                    <div className="acc-num-row">
                      <strong className="bank-amount-digits text-gold">{finalTotal} บาท</strong>
                      <button
                        type="button"
                        className="btn-copy-mini"
                        onClick={handleCopyAmount}
                        title="คัดลอกยอดเงิน"
                      >
                        {copiedAmount ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedAmount ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Inputs */}
                <div className="checkout-inputs-group">
                  <div className="input-field-wrap">
                    <label className="input-field-lbl">
                      ชื่อเฟสบุ๊ค หรือชื่อของคุณ <span className="text-rose">*</span>
                    </label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="เช่น บัง, Tanawat Suksamdao, สมชาย"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-field-wrap">
                    <label className="input-field-lbl">เบอร์โทรศัพท์ / LINE ID (ไม่บังคับ)</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="เช่น 081-234-5678 หรือ Line ID"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: Slip Upload Box */}
            <div className="slip-upload-section">
              <label className="slip-upload-lbl">
                <span>หลักฐานการโอนเงิน (แนบสลิป)</span>
                <span className="text-rose"> *จำเป็นต้องแนบ</span>
              </label>

              <div className={`slip-dropzone ${slipPreview ? 'has-slip' : ''}`}>
                <input
                  type="file"
                  id="slip-upload-input"
                  className="slip-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {slipPreview ? (
                  <div className="slip-preview-container">
                    <img src={slipPreview} alt="สลิปการโอนเงิน" className="slip-preview-img" />
                    <div className="slip-preview-overlay">
                      <label htmlFor="slip-upload-input" className="btn-change-slip">
                        <Upload size={14} /> เปลี่ยนรูปสลิป
                      </label>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="slip-upload-input" className="slip-upload-prompt">
                    <div className="upload-icon-circle">
                      <Upload size={22} />
                    </div>
                    <div className="upload-prompt-text">
                      <strong className="upload-primary-txt">คลิกเพื่ออัปโหลดสลิปการโอนเงิน</strong>
                      <span className="upload-sub-txt">รองรับภาพถ่ายจากมือถือ หรือภาพบันทึกจากแอปธนาคาร (JPG, PNG)</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Footer Action Submit */}
            <div className="checkout-modal-footer">
              <button
                type="button"
                className="btn-checkout-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>

              <button
                type="submit"
                className="btn-checkout-submit"
                disabled={isSubmitting || !customerName.trim() || !slipPreview}
              >
                {isSubmitting ? (
                  <span>กำลังส่งข้อมูล...</span>
                ) : (
                  <>
                    <Check size={18} />
                    <span>ยืนยันการโอนเงิน & จองเลขทันที</span>
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Success Screen */
          <div className="checkout-success-view animate-fade-in">
            <div className="success-icon-badge">
              <CheckCircle2 size={54} className="text-emerald" />
            </div>
            
            <h3 className="success-main-heading">ส่งหลักฐานการจองเรียบร้อยแล้ว!</h3>
            <p className="success-sub-desc">
              ระบบได้บันทึกการจองเบอร์ <strong>{selectedNumbers.join(', ')}</strong> ({round.title})<br />
              และแนบสลิปยอด <strong>{finalTotal.toLocaleString()} บาท</strong> ให้แอดมินเรียบร้อยแล้วครับ
            </p>

            <div className="success-receipt-card">
              <div className="receipt-row">
                <span>ผู้จอง:</span>
                <strong>{customerName}</strong>
              </div>
              <div className="receipt-row">
                <span>เบอร์ที่จอง:</span>
                <strong className="text-gold">{selectedNumbers.join(', ')}</strong>
              </div>
              <div className="receipt-row">
                <span>ยอดเงิน:</span>
                <strong className="text-emerald">{finalTotal.toLocaleString()} ฿</strong>
              </div>
              <div className="receipt-row">
                <span>สถานะ:</span>
                <span className="badge-pending-check">⏳ รอแอดมินตรวจสอบสลิป</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-success-close"
              onClick={onClose}
            >
              <span>เสร็จสิ้น / กลับสู่หน้ากระดาน</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentCheckoutModal;
