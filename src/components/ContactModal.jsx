import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageCircle, ExternalLink, Mail } from 'lucide-react';

export function ContactModal({ isOpen, onClose }) {
  const [senderName, setSenderName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Seller Facebook Page or Messenger link
  const [sellerFbUrl] = useState(() => {
    const saved = localStorage.getItem('seller_fb_link');
    return (saved && saved !== 'https://m.me') ? saved : 'https://m.me/filmxrux.khrzx';
  });

  if (!isOpen) return null;

  const generateFormattedMessage = () => {
    return `📩 ข้อความติดต่อถึงร้าน FP Zerofour:\n` +
      `👤 จากคุณ: ${senderName.trim() || 'ลูกค้า'}\n` +
      `📞 ช่องทางติดต่อกลับ: ${contactInfo.trim() || 'แชทนี้'}\n` +
      `📝 ข้อความ: ${message.trim() || 'สวัสดีครับ สอบถามข้อมูลเพิ่มเติม'}\n` +
      `ขอบคุณครับ 🙏`;
  };

  const handleCopyMessage = () => {
    if (!message.trim()) {
      alert('กรุณากรอกข้อความที่ต้องการส่งครับ');
      return;
    }
    const text = generateFormattedMessage();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      prompt('คัดลอกข้อความด้านล่าง:', text);
    });
  };

  const handleSendToFacebook = () => {
    if (!message.trim()) {
      alert('กรุณากรอกข้อความที่ต้องการส่งครับ');
      return;
    }
    const text = generateFormattedMessage();
    // Copy text to clipboard so it is ready to paste
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Target Messenger URL
    let targetUrl = sellerFbUrl.trim();
    if (!targetUrl.startsWith('http')) {
      if (targetUrl.includes('facebook.com') || targetUrl.includes('m.me')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = `https://m.me/${targetUrl}`;
      }
    }

    // Jump to Facebook chat in new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="select-modal-backdrop" onClick={onClose}>
      <div 
        className="select-modal-container animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
        role="dialog"
      >
        {/* Modal Header */}
        <div className="select-modal-header">
          <div className="select-modal-title-group">
            <div className="select-modal-badge" style={{ color: '#818cf8' }}>
              <Mail size={14} />
              <span>ติดต่อเรา</span>
            </div>
            <h2 className="select-modal-title">เขียนถึง FP Zerofour</h2>
            <p className="select-modal-subtitle">
              ส่งข้อความ สอบถาม สั่งจอง หรือแจ้งเรื่องโดยตรงกับทางร้าน
            </p>
          </div>
          <button 
            type="button" 
            className="select-modal-btn-close" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="customer-input-group">
            <label className="input-tiny-label">ชื่อของคุณ:</label>
            <input 
              type="text" 
              placeholder="เช่น ลูกค้าตัวอย่าง / สมชาย"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="customer-fb-input"
            />
          </div>

          <div className="customer-input-group">
            <label className="input-tiny-label">เบอร์โทร หรือ บัญชีเฟสบุ๊กของคุณ (เผื่อติดต่อกลับ):</label>
            <input 
              type="text" 
              placeholder="เช่น 089-xxx-xxxx หรือ ลิงก์เฟส"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="customer-fb-input"
            />
          </div>

          <div className="customer-input-group">
            <label className="input-tiny-label">ข้อความที่ต้องการเขียนถึง FP Zerofour: *</label>
            <textarea 
              rows={4}
              placeholder="พิมพ์ข้อความที่ต้องการสอบถาม สั่งจอง หรือติดต่อเรื่องต่างๆ ได้เลยครับ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="customer-fb-input"
              style={{ resize: 'vertical', minHeight: '90px' }}
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="select-modal-footer">
          <div className="select-actions-row">
            <button
              type="button"
              className="btn-action-copy-msg"
              onClick={handleCopyMessage}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความ'}</span>
            </button>

            <button
              type="button"
              className="btn-action-send-fb"
              onClick={handleSendToFacebook}
            >
              <MessageCircle size={18} />
              <span>ส่งเข้าแชทเฟส (Messenger)</span>
              <ExternalLink size={14} className="send-ext-icon" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
