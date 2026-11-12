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
  RefreshCw, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  FileImage,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPromptPayQrUrl, DEFAULT_PAYMENT_CONFIG } from '../utils/promptpay';

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

export function BorderCheckoutModal({
  isOpen,
  onClose,
  selectedItems = [],
  materials = [],
  shippingConfig = { fee: 80, freeThreshold: 10 },
  paymentConfig = DEFAULT_PAYMENT_CONFIG,
  onCompleteOrder
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculations
  const totalItemsCount = selectedItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const itemsSubtotal = selectedItems.reduce((acc, it) => acc + (it.unitPrice * (it.quantity || 1)), 0);
  const isFreeShipping = totalItemsCount >= shippingConfig.freeThreshold;
  const shippingFee = isFreeShipping ? 0 : shippingConfig.fee;
  const finalTotal = itemsSubtotal + shippingFee;

  useEffect(() => {
    if (isOpen) {
      setSlipFile(null);
      setSlipPreview(null);
      setIsSubmitting(false);
      setIsSuccess(false);
      setSubmittedOrder(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      setErrorMessage('ไม่สามารถโหลดรูปภาพสลิปได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleCopyAcc = async () => {
    const acc = paymentConfig.bankAccount || DEFAULT_PAYMENT_CONFIG.bankAccount;
    try {
      await navigator.clipboard.writeText(acc);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    } catch (e) {}
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(String(finalTotal));
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch (e) {}
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('กรุณาระบุชื่อเฟสบุ๊คจริงของคุณ (จะได้ตามตัวได้ง่ายครับ)');
      return;
    }
    if (!customerContact.trim()) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์สำหรับจัดส่งพัสดุ');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMessage('กรุณาระบุที่อยู่สำหรับจัดส่งพัสดุให้ครบถ้วน');
      return;
    }
    if (!slipPreview) {
      setErrorMessage('กรุณาแนบภาพสลิปการโอนเงินเพื่อยืนยันคำสั่งซื้อ');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const orderPayload = {
        customerName: customerName.trim(),
        facebookName: customerName.trim(),
        customerContact: customerContact.trim(),
        shippingAddress: shippingAddress.trim(),
        note: note.trim(),
        items: selectedItems.map(it => ({
          borderId: it.borderId,
          code: it.code,
          name: it.name,
          caseType: it.caseType,
          image: it.image,
          materialId: it.materialId,
          materialName: it.materialName,
          unitPrice: it.unitPrice,
          quantity: it.quantity || 1,
          subtotal: it.unitPrice * (it.quantity || 1)
        })),
        totalItems: totalItemsCount,
        itemsSubtotal,
        shippingFee,
        finalTotal,
        slipImage: slipPreview,
        status: 'pending_verification',
        createdAt: Date.now()
      };

      if (onCompleteOrder) {
        const created = await onCompleteOrder(orderPayload);
        setSubmittedOrder(created || orderPayload);
      } else {
        setSubmittedOrder(orderPayload);
      }

      setIsSuccess(true);

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      console.error(err);
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
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
      >
        {/* Header */}
        <div className="checkout-header-bar">
          <div className="checkout-header-title-wrap">
            <span className="checkout-badge-pill">
              <Truck size={13} /> สั่งทำขอบการ์ด FP ZEROFOUR
            </span>
            <h3 className="checkout-main-title">
              {isSuccess ? '🎉 สรุปคำสั่งซื้อสำเร็จ' : 'ชำระเงินและแนบสลิปสั่งทำขอบการ์ด'}
            </h3>
          </div>
          <button
            type="button"
            className="checkout-btn-close"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {!isSuccess ? (
          <form onSubmit={handleSubmitOrder} className="checkout-form-container">
            {errorMessage && (
              <div className="checkout-alert-error animate-fade-in">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="checkout-body-grid">
              
              {/* COLUMN 1: Items List & Payment QR */}
              <div className="checkout-col-qr">
                
                {/* Selected Items Summary Mini List */}
                <div className="border-checkout-items-box">
                  <div className="border-checkout-box-title">
                    <span>รายการขอบการ์ดที่สั่ง ({totalItemsCount} ชิ้น)</span>
                  </div>
                  <div className="border-checkout-items-scroll">
                    {selectedItems.map((item, idx) => (
                      <div key={`${item.borderId}-${item.materialId}-${idx}`} className="border-checkout-mini-item">
                        <img src={item.image} alt={item.name} className="mini-item-thumb" />
                        <div className="mini-item-details">
                          <span className="mini-item-code">{item.code} ({item.caseType})</span>
                          <span className="mini-item-name">{item.name}</span>
                          <span className="mini-item-mat">วัสดุ: {item.materialName} x {item.quantity || 1}</span>
                        </div>
                        <div className="mini-item-price">
                          {(item.unitPrice * (item.quantity || 1)).toLocaleString()} ฿
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-checkout-breakdown">
                    <div className="breakdown-row">
                      <span>ค่าขอบการ์ด ({totalItemsCount} ชิ้น):</span>
                      <span>{itemsSubtotal.toLocaleString()} ฿</span>
                    </div>
                    <div className="breakdown-row">
                      <span>ค่าจัดส่งพัสดุ:</span>
                      <span className={isFreeShipping ? 'text-emerald font-bold' : ''}>
                        {isFreeShipping ? 'ส่งฟรี (0 บาท)' : `${shippingFee} บาท`}
                      </span>
                    </div>
                    <div className="breakdown-row total-highlight">
                      <span>ยอดชำระสุทธิ:</span>
                      <strong className="text-gold text-lg">{finalTotal.toLocaleString()} บาท</strong>
                    </div>
                  </div>
                </div>

                {/* PromptPay QR Frame */}
                <div className="checkout-qr-frame-box">
                  <div className="qr-badge-header">
                    <span className="qr-thai-tag">THAI QR PAYMENT</span>
                    <span className="qr-promptpay-tag">พร้อมเพย์ PromptPay</span>
                  </div>
                  
                  <div className="qr-image-wrapper">
                    <img 
                      src={qrUrl} 
                      alt="PromptPay QR Code" 
                      className="checkout-qr-image" 
                    />
                  </div>

                  <span className="qr-scan-hint-text">
                    📱 สแกน QR Code ด้วยแอปธนาคารทุกแห่ง
                  </span>

                  <a 
                    href={qrUrl} 
                    download={`promptpay-qr-${finalTotal}thb.png`}
                    className="btn-download-qr-action"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={14} /> บันทึกภาพ QR Code ลงเครื่อง
                  </a>
                </div>

                {/* Bank Account Info Card */}
                <div className="bank-account-info-card">
                  <div className="bank-card-header">
                    <CreditCard size={14} className="text-cyan" />
                    <span>โอนผ่านเลขบัญชีธนาคาร</span>
                  </div>

                  <div className="bank-meta-details">
                    <div className="bank-row">
                      <span className="bank-lbl">ธนาคาร:</span>
                      <span className="bank-val text-brand-teal">
                        {paymentConfig.bankName || DEFAULT_PAYMENT_CONFIG.bankName}
                      </span>
                    </div>
                    <div className="bank-row">
                      <span className="bank-lbl">ชื่อบัญชี:</span>
                      <span className="bank-val text-white font-bold">
                        {paymentConfig.accountName || DEFAULT_PAYMENT_CONFIG.accountName}
                      </span>
                    </div>
                    
                    <div className="bank-acc-number-row">
                      <span className="acc-num-code font-mono">
                        {paymentConfig.bankAccount || DEFAULT_PAYMENT_CONFIG.bankAccount}
                      </span>
                      <button 
                        type="button" 
                        onClick={handleCopyAcc} 
                        className="btn-copy-chip"
                        title="คัดลอกเลขบัญชี"
                      >
                        {copiedAcc ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                        <span>{copiedAcc ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>

                    <div className="bank-amount-to-pay-row">
                      <span className="amount-label-txt">ยอดโอนเป๊ะ:</span>
                      <span className="amount-val-txt text-gold">{finalTotal.toLocaleString()} บาท</span>
                      <button 
                        type="button" 
                        onClick={handleCopyAmount} 
                        className="btn-copy-chip"
                        title="คัดลอกยอดเงิน"
                      >
                        {copiedAmount ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                        <span>{copiedAmount ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* COLUMN 2: Customer Inputs & Shipping Address & Slip Upload */}
              <div className="checkout-col-form">
                
                {/* Customer Details Inputs */}
                <div className="customer-inputs-panel">
                  <div className="checkout-field-block">
                    <label className="checkout-field-label">
                      <User size={14} className="text-purple" />
                      <span>ชื่อเฟสบุ๊ค หรือชื่อผู้สั่งซื้อ <strong className="text-rose-400">*</strong></span>
                    </label>
                    <input
                      type="text"
                      className="checkout-input-styled"
                      placeholder="ระบุชื่อเฟสจริง เช่น สมชาย ใจดี / Filmx Rux"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                    <span className="checkout-field-tip">
                      ระบุชื่อเฟสจริงๆ จะได้ตามตัวได้ง่ายและส่งสรุปให้
                    </span>
                  </div>

                  <div className="checkout-field-block">
                    <label className="checkout-field-label">
                      <Phone size={14} className="text-purple" />
                      <span>เบอร์โทรศัพท์ติดต่อ / LINE ID <strong className="text-rose-400">*</strong></span>
                    </label>
                    <input
                      type="text"
                      className="checkout-input-styled"
                      placeholder="เช่น 081-234-5678"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      required
                    />
                  </div>

                  <div className="checkout-field-block">
                    <label className="checkout-field-label">
                      <MapPin size={14} className="text-purple" />
                      <span>ที่อยู่สำหรับจัดส่งพัสดุ <strong className="text-rose-400">*</strong></span>
                    </label>
                    <textarea
                      rows={3}
                      className="checkout-input-styled checkout-textarea"
                      placeholder="บ้านเลขที่, หมู่, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
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

                  <input
                    type="file"
                    id="border-slip-file-input"
                    className="slip-hidden-file-input"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

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
                        <label htmlFor="border-slip-file-input" className="btn-reselect-slip">
                          <RefreshCw size={13} />
                          <span>เลือกรูปสลิปใหม่</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="border-slip-file-input" className="slip-dropzone-styled">
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
                  disabled={isSubmitting || !customerName.trim() || !customerContact.trim() || !shippingAddress.trim() || !slipPreview}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>กำลังส่งคำสั่งซื้อ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span className="btn-confirm-txt">ยืนยันสั่งซื้อ</span>
                      <span className="btn-confirm-pill-amt">{finalTotal.toLocaleString()} ฿</span>
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

            <h3 className="success-heading-title">🎉 บันทึกคำสั่งซื้อและแนบสลิปสำเร็จ!</h3>
            <p className="success-heading-sub">
              ระบบได้รับคำสั่งซื้อเรียบร้อยแล้ว แอดมินจะตรวจสอบสลิปและดำเนินการผลิตจัดส่งให้ตามคิวครับ
            </p>

            {/* Glowing Order Code Pill */}
            {submittedOrder?.orderCode && (
              <div className="order-code-prominent-box">
                <span className="order-code-lbl">รหัสคำสั่งซื้อของคุณ:</span>
                <strong className="order-code-val font-mono">{submittedOrder.orderCode}</strong>
                <button
                  type="button"
                  className="btn-copy-chip"
                  onClick={() => {
                    navigator.clipboard.writeText(submittedOrder.orderCode);
                    setCopiedOrderCode(true);
                    setTimeout(() => setCopiedOrderCode(false), 2000);
                  }}
                >
                  {copiedOrderCode ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                  <span>{copiedOrderCode ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'}</span>
                </button>
              </div>
            )}

            {/* Receipt Summary Card */}
            <div className="receipt-summary-card">
              <div className="receipt-row-item">
                <span className="receipt-item-label">รหัสออเดอร์:</span>
                <strong className="receipt-item-val text-gold">{submittedOrder?.orderCode || 'FP-0001'}</strong>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">ผู้สั่งซื้อ:</span>
                <strong className="receipt-item-val text-cyan">{customerName}</strong>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">เบอร์ติดต่อ:</span>
                <span className="receipt-item-val">{customerContact}</span>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">ที่อยู่จัดส่ง:</span>
                <span className="receipt-item-val text-muted text-sm">{shippingAddress}</span>
              </div>
              <div className="receipt-row-item">
                <span className="receipt-item-label">จำนวนสินค้า:</span>
                <span className="receipt-item-val">{totalItemsCount} ชิ้น</span>
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
              className="btn-back-to-boards"
              onClick={onClose}
            >
              <span>เสร็จสิ้น / กลับสู่หน้าหลัก</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default BorderCheckoutModal;
