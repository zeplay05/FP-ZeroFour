import React, { useState } from 'react';
import { X, Plus, Upload, Palette } from 'lucide-react';
import { generateInitialNumbers, BOARD_TYPES } from '../utils/lotteryData';
import { LandscapeCardArt } from './LandscapeCardArt';

const GRADIENT_OPTIONS = [
  { id: 'lime', name: 'เขียวมะนาว (ภูเขายามเช้า)', color: '#84cc16' },
  { id: 'emerald', name: 'เขียวมรกต (ทะเลสีฟ้า)', color: '#10b981' },
  { id: 'blue', name: 'น้ำเงินฟ้า (ตลาดน้ำ)', color: '#38bdf8' },
  { id: 'teal', name: 'เขียวอมฟ้า (ป่าฝนเขตร้อน)', color: '#14b8a6' },
  { id: 'coral', name: 'แดงคอรัล (น้ำตกใหญ่)', color: '#f43f5e' },
  { id: 'purple', name: 'ม่วงเข้ม (วัดกลางคืน)', color: '#a855f7' },
  { id: 'spring', name: 'เขียวสดใส (ถนนสายรุ้ง)', color: '#22c55e' },
  { id: 'indigo', name: 'ครามม่วง (หมู่บ้านริมคลอง)', color: '#6366f1' },
  { id: 'amber', name: 'ทองอำพัน (เมืองเก่า)', color: '#f59e0b' }
];

function processImageFile(file, maxWidth = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function CreateRoundModal({ isOpen, onClose, onCreateRound }) {
  const [title, setTitle] = useState('');
  const [gradient, setGradient] = useState('lime');
  const [coverImage, setCoverImage] = useState(null);
  const [pricePerNumber, setPricePerNumber] = useState(50);
  const [theme, setTheme] = useState('gold');
  const [boardType, setBoardType] = useState('duck');

  if (!isOpen) return null;

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await processImageFile(file);
      if (base64) setCoverImage(base64);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อการ์ด');
      return;
    }

    const newRound = {
      id: 'card-' + Date.now(),
      title: title.trim(),
      roundName: `งวดเบอร์หวย ${title.trim()} 00-99`,
      gradient: gradient,
      coverImage: coverImage,
      pricePerNumber: Number(pricePerNumber) || 50,
      boardType: boardType,
      theme: theme,
      createdAt: Date.now(), // Newest timestamp (ล่าสุดอยู่อันแรกเสมอ)
      sellerPhone: '089-123-4567',
      sellerLine: 'https://line.me',
      winningNumber: '',
      numbers: generateInitialNumbers('empty')
    };

    onCreateRound(newRound);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card create-round-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Plus size={22} className="text-primary" />
            <div>
              <h3>+ เพิ่มการ์ดใหม่ในแกลเลอรี</h3>
              <p className="modal-sub">การ์ดใหม่จะแสดงอยู่อันแรกสุดเสมอ (แถวละ 3)</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Card Preview */}
          <div className="form-group">
            <label className="form-label">ตัวอย่างการ์ดที่จะแสดง:</label>
            <div className="create-card-preview-wrapper">
              <div className="claude-image-card" style={{ maxWidth: '240px', margin: '0 auto', pointerEvents: 'none' }}>
                <div className="claude-card-media">
                  <LandscapeCardArt
                    gradient={gradient}
                    coverImage={coverImage}
                    title={title || 'ชื่อการ์ด'}
                  />
                </div>
                <div className="claude-card-label-bar">
                  <span className="claude-card-title">{title || 'ชื่อการ์ดของคุณ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">ชื่อข้างล่างการ์ด:</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น ภูเขายามเช้า, ทะเลสีฟ้า, ทองคำนำโชค"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Gradient Artwork Picker */}
          <div className="form-group">
            <label className="form-label">
              <Palette size={16} /> เลือกโทนสีภาพทิวทัศน์ (ภูเขา & พระอาทิตย์):
            </label>
            <div className="gradient-pickers-grid">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  className={`gradient-pick-btn ${gradient === g.id && !coverImage ? 'active' : ''}`}
                  onClick={() => { setGradient(g.id); setCoverImage(null); }}
                  title={g.name}
                >
                  <span className="color-swatch" style={{ background: g.color }} />
                  <span className="color-name">{g.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Custom Image */}
          <div className="form-group">
            <label className="custom-upload-label">
              <Upload size={16} /> {coverImage ? 'ใช้รูปที่อัปโหลดแล้ว (คลิกเปลี่ยน)' : 'หรืออัปโหลดรูปภาพของคุณเอง'}
              <input
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={handleCustomImageUpload}
              />
            </label>
          </div>

          {/* Board Type Options */}
          <div className="form-group">
            <label className="form-label">ประเภทกระดาน & โปรโมชั่น:</label>
            <div className="board-type-radio-options">
              {BOARD_TYPES.map(bt => (
                <label
                  key={bt.id}
                  className={`board-type-opt ${boardType === bt.id ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="modalBoardType"
                    value={bt.id}
                    checked={boardType === bt.id}
                    onChange={(e) => setBoardType(e.target.value)}
                  />
                  <div className="board-type-icon">{bt.icon}</div>
                  <div className="board-type-info-wrap">
                    <span className="board-type-opt-title">{bt.name}</span>
                    <span className="board-type-opt-promo">{bt.promoText}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Price per number */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">ราคาต่อ 1 เบอร์ (บาท):</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={pricePerNumber}
                onChange={(e) => setPricePerNumber(Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">ธีมตาราง 00-99:</label>
              <select
                className="form-input"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="gold">👑 ทองคำมงคล</option>
                <option value="pirate">🏴‍☠️ โจรสลัดวันพีช</option>
                <option value="neon">⚡ ไซเบอร์นีออน</option>
                <option value="emerald">🍀 เขียวมรกต</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> บันทึกและสร้างการ์ด
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
