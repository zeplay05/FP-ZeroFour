import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Upload, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  FileImage,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_PAYMENT_CONFIG, getPromptPayQrUrl } from '../utils/promptpay';
import { formatBookingTime } from '../utils/timeUtils';

// Helper to compress image into Base64 Data URL (fast loading & database friendly)
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
  const [copiedName, setCopiedName] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCustomerName(initialName || '');
      setCustomerContact('');
      setNote('');
      setSlipFile(null);
      setSlipPreview(null);
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen, initialName]);

  if (!isOpen || !round) return null;

  // Resolved payment configuration
  const resolvedConfig = {
    ...DEFAULT_PAYMENT_CONFIG,
    ...paymentConfig
  };

  // QR Code Image source: Use user's uploaded Make by KBank QR image by default
  const qrImageSrc = resolvedConfig.qrImageUrl || '/promptpay-qr.jpg';

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
      setErrorMessage('ไม่สามารถโหลดภาพสลิปได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCopyAccount = () => {
    const accNum = resolvedConfig.accountNumber || DEFAULT_PAYMENT_CONFIG.accountNumber;
    navigator.clipboard.writeText(accNum.replace(/-/g, ''));
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2200);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(finalTotal));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2200);
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(resolvedConfig.accountName);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2200);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('กรุณาระบุชื่อเฟสบุ๊ค หรือชื่อผู้จองของคุณครับ');
      return;
    }
    if (!slipPreview) {
      setErrorMessage('กรุณาแนบภาพสลิปการโอนเงินเพื่อยืนยันรายการครับ');
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
        status: 'booked',
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
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        // Confetti optional
      }
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
        className="payment-checkout-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        
        {/* Modal Top Header */}
        <div className="checkout-modal-header">
          <div className="checkout-header-info">
            <div className="checkout-title-row">
              <span className="checkout-badge-pill">
                <ShieldCheck size={14} /> ชำระเงินผ่านเว็บไซต์
              </span>
              <span className="checkout-secure-txt">ปลอดภัย 100% • ตรวจสอบสลิปผ่านระบบ</span>
            </div>
            <h3 className="checkout-main-title">{round.title || 'รายการจองเลขท้าย'}</h3>
          </div>
          <button 
            type="button" 
            className="btn-checkout-close" 
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {!isSuccess ? (
          <form onSubmit={handleSubmitPayment} className="checkout-modal-body">
            
            {/* Top Summary Banner: Selected Numbers + Amount */}
            <div className="checkout-summary-banner">
              <div className="summary-banner-left">
                <span className="summary-banner-label">เบอร์ที่เลือกจอง ({selectedNumbers.length} เบอร์):</span>
                <div className="checkout-numbers-pills">
                  {selectedNumbers.map(num => (
                    <span key={num} className="checkout-number-pill">{num}</span>
                  ))}
                </div>
              </div>

              <div className="summary-banner-right">
                {discount > 0 && (
                  <span className="checkout-discount-badge">
                    🎉 ได้รับส่วนลด {discount}.-
                  </span>
                )}
                <div className="checkout-total-group">
                  <span className="checkout-total-label">ยอดที่ต้องโอนสุทธิ:</span>
                  <div className="checkout-total-figure">
                    <span className="total-gold-num">{finalTotal.toLocaleString()}</span>
                    <span className="total-currency">บาท</span>
                    <button
                      type="button"
                      className="btn-copy-amount-pill"
                      onClick={handleCopyAmount}
                      title="คัดลอกยอดเงินที่ต้องโอน"
                    >
                      {copiedAmount ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedAmount ? 'คัดลอกแล้ว' : 'คัดลอกยอด'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Banner Alert */}
            {errorMessage && (
              <div className="checkout-error-banner animate-fade-in">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main 2-Column Responsive Content */}
            <div className="checkout-main-grid">
              
              {/* COLUMN 1: QR Code Card & Bank Details */}
              <div className="checkout-col-payment">
                
                {/* Clean QR Display Frame */}
                <div className="make-qr-card-box">
                  <div className="qr-badge-strip">
                    <span className="qr-badge-make">make by KBank</span>
                    <span className="qr-badge-pp">PromptPay • Thai QR</span>
                  </div>

                  <div className="qr-image-frame-container">
                    <img 
                      src={qrImageSrc} 
                      alt="Make by KBank PromptPay QR" 
                      className="make-qr-main-img" 
                    />
                  </div>

                  <div className="qr-bottom-meta">
                    <div className="qr-account-holder">
                      <span className="holder-label">ชื่อบัญชีรับเงิน:</span>
                      <strong className="holder-name">{resolvedConfig.accountName}</strong>
                    </div>
                    <div className="qr-bank-tag">
                      <span>{resolvedConfig.bankName}</span>
                      {resolvedConfig.accountNumber && (
                        <span> • {resolvedConfig.accountNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* QR Action Buttons */}
                  <div className="qr-actions-row">
                    <a
                      href={qrImageSrc}
                      download={`Make-QR-${finalTotal}-Baht.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-qr-download"
                    >
                      <Download size={14} />
                      <span>บันทึกรูป QR ลงเครื่อง</span>
                    </a>
                  </div>
                </div>

                {/* Account Details Copy Card */}
                <div className="bank-account-copy-card">
                  <div className="copy-card-heading">
                    <CreditCard size={14} className="text-cyan" />
                    <span>ข้อมูลบัญชีธนาคาร (โอนผ่านเลขบัญชี)</span>
                  </div>

                  <div className="copy-card-row">
                    <span className="copy-row-label">ธนาคาร:</span>
                    <strong className="copy-row-val text-cyan">{resolvedConfig.bankName}</strong>
                  </div>

                  <div className="copy-card-row">
                    <span className="copy-row-label">ชื่อบัญชี:</span>
                    <div className="copy-row-interactive">
                      <strong className="copy-row-val">{resolvedConfig.accountName}</strong>
                      <button
                        type="button"
                        className="btn-copy-chip"
                        onClick={handleCopyName}
                        title="คัดลอกชื่อบัญชี"
                      >
                        {copiedName ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedName ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="copy-card-row highlight-acc">
                    <span className="copy-row-label">เลขที่บัญชี:</span>
                    <div className="copy-row-interactive">
                      <strong className="copy-row-acc-digits">{resolvedConfig.accountNumber}</strong>
                      <button
                        type="button"
                        className="btn-copy-chip highlight"
                        onClick={handleCopyAccount}
                        title="คัดลอกเลขบัญชี"
                      >
                        {copiedAcc ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedAcc ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* COLUMN 2: Customer Inputs & Slip Upload Dropzone */}
              <div className="checkout-col-form">
                
                {/* Customer Details Inputs */}
                <div className="customer-inputs-panel">
                  <div className="checkout-field-block">
                    <label className="checkout-field-label">
                      <User size={14} className="text-purple" />
                      <span>ชื่อเฟสบุ๊ค หรือชื่อผู้จอง <strong className="text-rose-400">*</strong></span>
                    </label>
                    <input
                      type="text"
                      className="checkout-input-styled"
                      placeholder="เช่น สมชาย ใจดี / Filmx Rux"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                    <span className="checkout-field-tip">
                      ระบุชื่อสำหรับบันทึกรายการจองและประกาศรางวัล
                    </span>
                  </div>

                  <div className="checkout-field-block">
                    <label className="checkout-field-label">
                      <Phone size={14} className="text-emerald" />
                      <span>เบอร์โทรศัพท์ หรือ LINE ID (ไม่บังคับ)</span>
                    </label>
                    <input
                      type="text"
                      className="checkout-input-styled"
                      placeholder="เช่น 081-234-5678 หรือ LINE ID"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                    />
                  </div>
                </div>

                {/* Slip Upload Area */}
                <div className="slip-upload-panel">
                  <div className="slip-panel-header">
                    <div className="slip-header-title">
                      <FileImage size={15} className="text-neon-cyan" />
                      <span>แนบสลิปการโอนเงิน <strong className="text-rose-400">*</strong></span>
                    </div>
                    {slipPreview && (
                      <span className="slip-attached-status">
                        <Check size={12} /> แนบสลิปแล้ว
                      </span>
                    )}
                  </div>

                  {/* Hidden Native File Input */}
                  <input
                    type="file"
                    id="slip-file-input-el"
                    className="slip-hidden-file-input"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {/* Drag & Drop / Tap Box */}
                  {slipPreview ? (
                    <div className="slip-uploaded-box animate-fade-in">
                      <div className="slip-preview-img-frame">
                        <img 
                          src={slipPreview} 
                          alt="สลิปโอนเงินที่แนบ" 
                          className="slip-preview-thumb" 
                        />
                      </div>
                      <div className="slip-uploaded-info">
                        <span className="slip-success-txt">✓ บันทึกภาพสลิปเรียบร้อย</span>
                        <span className="slip-sub-tip">พร้อมส่งให้แอดมินตรวจสอบทันที</span>
                        <label htmlFor="slip-file-input-el" className="btn-reselect-slip">
                          <RefreshCw size={13} />
                          <span>เลือกรูปสลิปใหม่</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="slip-file-input-el" className="slip-dropzone-styled">
                      <div className="dropzone-icon-circle">
                        <Upload size={24} />
                      </div>
                      <div className="dropzone-text-group">
                        <strong className="dropzone-main-text">แตะที่นี่เพื่อแนบสลิปโอนเงิน</strong>
                        <span className="dropzone-sub-text">
                          รองรับรูปถ่ายจากกล้อง หรือรูปบันทึกจากแอปธนาคาร (JPG, PNG)
                        </span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Submit Booking Button */}
                <button
                  type="submit"
                  className="btn-confirm-checkout-order"
                  disabled={isSubmitting || !customerName.trim() || !slipPreview}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>กำลังส่งข้อมูลการจอง...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={19} />
                      <span>ยืนยันการชำระเงิน & จองเลขทันที ({finalTotal.toLocaleString()} ฿)</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          </form>
        ) : (
          /* Success Screen View */
          <div className="checkout-success-container animate-fade-in">
            <div className="success-badge-circle">
              <CheckCircle2 size={54} className="text-emerald" />
            </div>

            <h3 className="success-heading-title">🎉 บันทึกการจองและแนบสลิปสำเร็จ!</h3>
            <p className="success-heading-sub">
              ระบบได้ทำการจองเบอร์และส่งสลิปให้แอดมินเรียบร้อยแล้วครับ ข้อมูลจะอัปเดตลงบนกระดานแบบเรียลไทม์
            </p>

            {/* Receipt Summary Card */}
            <div className="receipt-summary-card">
              <div className="receipt-row-item">
                <span className="receipt-item-label">กระดาน:</span>
                <strong className="receipt-item-val text-white">{round.title}</strong>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">ผู้จอง:</span>
                <strong className="receipt-item-val text-cyan">{customerName}</strong>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">เบอร์ที่จอง ({selectedNumbers.length} เบอร์):</span>
                <div className="receipt-num-pills">
                  {selectedNumbers.map(n => (
                    <span key={n} className="receipt-num-pill">{n}</span>
                  ))}
                </div>
              </div>
              <div className="receipt-row-item highlight-total">
                <span className="receipt-item-label">ยอดเงินที่ชำระ:</span>
                <strong className="receipt-item-val text-gold">{finalTotal.toLocaleString()} บาท</strong>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">สถานะการชำระ:</span>
                <span className="receipt-status-pending">⏳ แนบสลิปแล้ว (รอแอดมินตรวจสอบ)</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-return-board"
              onClick={onClose}
            >
              <span>กลับสู่หน้ากระดาน</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentCheckoutModal;
