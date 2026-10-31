import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  CreditCard, 
  QrCode, 
  Check, 
  AlertCircle, 
  Building, 
  User, 
  Smartphone, 
  Hash, 
  RefreshCw 
} from 'lucide-react';
import { DEFAULT_PAYMENT_CONFIG, getPromptPayQrUrl } from '../utils/promptpay';
import { saveSettingToSupabase } from '../utils/supabaseClient';

export function PaymentSettingsModal({
  isOpen,
  onClose,
  paymentConfig = DEFAULT_PAYMENT_CONFIG,
  onSaveConfig
}) {
  const [formData, setFormData] = useState({
    promptPayId: DEFAULT_PAYMENT_CONFIG.promptPayId,
    accountName: DEFAULT_PAYMENT_CONFIG.accountName,
    bankName: DEFAULT_PAYMENT_CONFIG.bankName,
    accountNumber: DEFAULT_PAYMENT_CONFIG.accountNumber,
    qrImageUrl: DEFAULT_PAYMENT_CONFIG.qrImageUrl || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testAmount, setTestAmount] = useState('150');

  useEffect(() => {
    if (isOpen && paymentConfig) {
      setFormData({
        promptPayId: paymentConfig.promptPayId || DEFAULT_PAYMENT_CONFIG.promptPayId,
        accountName: paymentConfig.accountName || DEFAULT_PAYMENT_CONFIG.accountName,
        bankName: paymentConfig.bankName || DEFAULT_PAYMENT_CONFIG.bankName,
        accountNumber: paymentConfig.accountNumber || DEFAULT_PAYMENT_CONFIG.accountNumber,
        qrImageUrl: paymentConfig.qrImageUrl || ''
      });
      setSaveSuccess(false);
    }
  }, [isOpen, paymentConfig]);

  if (!isOpen) return null;

  const previewQrUrl = getPromptPayQrUrl(formData.promptPayId, Number(testAmount) || 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.promptPayId.trim()) {
      alert('กรุณาระบุหมายเลข PromptPay (เบอร์มือถือ หรือ เลขบัตรประชาชน)');
      return;
    }

    try {
      setIsSaving(true);
      const cleanConfig = {
        promptPayId: formData.promptPayId.trim(),
        accountName: formData.accountName.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        qrImageUrl: formData.qrImageUrl.trim()
      };

      // Save to localStorage
      localStorage.setItem('fp_payment_config', JSON.stringify(cleanConfig));

      // Save to Supabase Cloud
      await saveSettingToSupabase('payment_settings', JSON.stringify(cleanConfig));

      if (onSaveConfig) {
        onSaveConfig(cleanConfig);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving payment config:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="payment-settings-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="payment-settings-header">
          <div className="header-title-group">
            <div className="header-icon-box">
              <CreditCard size={20} className="text-neon-cyan" />
            </div>
            <div>
              <h3 className="modal-main-title">ตั้งค่าการชำระเงิน (PromptPay & บัญชีธนาคาร)</h3>
              <p className="modal-sub-title">ข้อมูลนี้จะถูกนำไปสร้าง QR Code พร้อมเพย์และแสดงให้ลูกค้าสแกนจ่ายเงินหน้าเว็บ</p>
            </div>
          </div>
          <button 
            type="button" 
            className="btn-modal-close" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="payment-settings-form">
          <div className="payment-settings-split-grid">
            
            {/* Left Column: Form Fields */}
            <div className="settings-fields-column">
              
              <div className="field-group">
                <label className="field-label">
                  <Smartphone size={14} className="field-icon text-cyan" />
                  <span>หมายเลขพร้อมเพย์ (PromptPay ID) <strong className="text-rose-400">*</strong></span>
                </label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="เช่น 0812345678 หรือ 1100400123456"
                  value={formData.promptPayId}
                  onChange={(e) => setFormData(prev => ({ ...prev, promptPayId: e.target.value }))}
                  required
                />
                <span className="field-hint">
                  รองรับทั้งเบอร์โทรศัพท์ 10 หลัก (เช่น 08xxxxxxxx) หรือเลขประจำตัวประชาชน 13 หลัก
                </span>
              </div>

              <div className="field-group">
                <label className="field-label">
                  <User size={14} className="field-icon text-purple" />
                  <span>ชื่อบัญชี (Account Name) <strong className="text-rose-400">*</strong></span>
                </label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="เช่น นายชลวิชย์ เขียว... / FP ZEROFOUR"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  required
                />
              </div>

              <div className="field-row-two-col">
                <div className="field-group">
                  <label className="field-label">
                    <Building size={14} className="field-icon text-emerald" />
                    <span>ธนาคาร (Bank Name)</span>
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="เช่น ธนาคารกสิกรไทย (KBANK)"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">
                    <Hash size={14} className="field-icon text-amber" />
                    <span>เลขที่บัญชีธนาคาร</span>
                  </label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="เช่น 123-4-56789-0"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="save-status-info-box">
                <AlertCircle size={15} className="text-cyan flex-shrink-0" />
                <span>
                  เมื่อกดบันทึก ข้อมูลจะซิงค์ไปยัง <strong>Supabase Cloud Database</strong> แบบเรียลไทม์ และมีผลต่อหน้าเว็บลูกค้าทันที
                </span>
              </div>

            </div>

            {/* Right Column: Live QR Code Simulator */}
            <div className="settings-preview-column">
              <div className="live-qr-preview-box">
                <div className="preview-heading">
                  <QrCode size={16} />
                  <span>ตัวอย่าง QR Code ที่ลูกค้าจะเห็น</span>
                </div>

                <div className="preview-qr-wrapper">
                  {previewQrUrl ? (
                    <img 
                      src={previewQrUrl} 
                      alt="PromptPay Live Preview" 
                      className="preview-qr-img" 
                    />
                  ) : (
                    <div className="preview-qr-placeholder">
                      <span>ระบุหมายเลขพร้อมเพย์เพื่อดูตัวอย่าง</span>
                    </div>
                  )}
                </div>

                <div className="preview-qr-meta">
                  <div className="preview-account-name">{formData.accountName || 'ชื่อบัญชีของคุณ'}</div>
                  <div className="preview-account-details">
                    <span>{formData.bankName || 'ธนาคาร'}</span>
                    {formData.accountNumber && <span> • เลขบัญชี {formData.accountNumber}</span>}
                  </div>
                  <div className="preview-promptpay-id">
                    พร้อมเพย์: <strong>{formData.promptPayId || '-'}</strong>
                  </div>
                </div>

                <div className="test-amount-picker">
                  <span className="picker-lbl">ทดสอบยอดเงิน:</span>
                  <input
                    type="number"
                    className="picker-input"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    min="1"
                    step="1"
                  />
                  <span className="currency-lbl">฿</span>
                </div>

              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="payment-settings-footer">
            <button
              type="button"
              className="btn-settings-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="btn-settings-save"
              disabled={isSaving}
            >
              {saveSuccess ? (
                <>
                  <Check size={16} />
                  <span>บันทึกสำเร็จเรียบร้อย!</span>
                </>
              ) : isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>บันทึกการตั้งค่าชำระเงิน</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
