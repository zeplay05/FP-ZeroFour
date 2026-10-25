import React, { useState } from 'react';
import { X, Settings, Palette, RefreshCw, Download, Upload, Trash2, Check } from 'lucide-react';
import { THEMES } from '../utils/lotteryData';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetBoard,
  numbers,
  onImportNumbers
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [copiedSaved, setCopiedSaved] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setCopiedSaved(true);
    setTimeout(() => {
      setCopiedSaved(false);
      onClose();
    }, 600);
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataToExport = {
      settings: formData,
      numbers: numbers,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lottery-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.numbers && Array.isArray(parsed.numbers)) {
          onImportNumbers(parsed.numbers, parsed.settings || formData);
          alert('กู้คืนข้อมูลสำเร็จเรียบร้อย!');
          onClose();
        } else {
          alert('ไฟล์ข้อมูลไม่ถูกต้อง');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const confirmText = window.prompt('พิมพ์คำว่า "RESET" เพื่อยืนยันการล้างข้อมูลกระดานทั้งหมดและเริ่มงวดใหม่:');
    if (confirmText === 'RESET') {
      onResetBoard();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card settings-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Settings size={22} className="text-primary" />
            <div>
              <h3>ตั้งค่างวด & ปรับแต่งระบบ</h3>
              <p className="modal-sub">กำหนดรางวัล ราคา ธีม และสำรองข้อมูล</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          {/* Theme Selector */}
          <div className="form-group">
            <label className="form-label">
              <Palette size={16} /> ธีมหน้าตากระดานหวย:
            </label>
            <div className="theme-selector-grid">
              {Object.values(THEMES).map((th) => (
                <div
                  key={th.id}
                  className={`theme-card ${formData.theme === th.id ? 'active' : ''}`}
                  onClick={() => handleChange('theme', th.id)}
                >
                  <div className="theme-color-preview" style={{ background: th.bgGradient }}>
                    <div className="theme-inner-badge" style={{ background: th.boardBg, color: th.accent }}>
                      00-99
                    </div>
                  </div>
                  <span className="theme-name">{th.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lottery Title */}
          <div className="form-group">
            <label className="form-label">ชื่องวด / ของรางวัลหลัก:</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="เช่น ลุ้นทองคำแท่ง 1 สลึง & เงินสด"
              required
            />
          </div>

          {/* Subtitle / Round Info */}
          <div className="form-group">
            <label className="form-label">รายละเอียดงวด / วันที่ออกรางวัล:</label>
            <input
              type="text"
              className="form-input"
              value={formData.roundName}
              onChange={(e) => handleChange('roundName', e.target.value)}
              placeholder="เช่น งวดวันที่ 1 พฤศจิกายน 2569 (อิงเลขท้าย 2 ตัว)"
            />
          </div>

          {/* Price per number */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">ราคาต่อ 1 เบอร์ (บาท):</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.pricePerNumber}
                onChange={(e) => handleChange('pricePerNumber', Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">เบอร์โทรติดต่อแม่ค้า:</label>
              <input
                type="text"
                className="form-input"
                value={formData.sellerPhone}
                onChange={(e) => handleChange('sellerPhone', e.target.value)}
                placeholder="089-xxx-xxxx"
              />
            </div>
          </div>

          {/* LINE Link */}
          <div className="form-group">
            <label className="form-label">ลิงก์ LINE หรือ ID ของแม่ค้า:</label>
            <input
              type="text"
              className="form-input"
              value={formData.sellerLine}
              onChange={(e) => handleChange('sellerLine', e.target.value)}
              placeholder="https://line.me/ti/p/~yourid หรือไอดีไลน์"
            />
          </div>

          {/* Backup & Reset Utilities */}
          <div className="backup-section-box">
            <h4 className="backup-title">การสำรองข้อมูล & เริ่มงวดใหม่</h4>
            <div className="backup-btn-group">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleExportJSON}
              >
                <Download size={16} /> ส่งออกไฟล์สำรอง (Backup JSON)
              </button>

              <label className="btn btn-outline cursor-pointer mb-0">
                <Upload size={16} /> กู้คืนข้อมูล (Restore)
                <input
                  type="file"
                  accept=".json"
                  className="hidden-file-input"
                  onChange={handleImportJSON}
                />
              </label>

              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={handleReset}
              >
                <Trash2 size={16} /> ล้างกระดานเริ่มงวดใหม่
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              {copiedSaved ? <Check size={18} /> : null}
              {copiedSaved ? 'บันทึกเรียบร้อย' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
