import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare } from 'lucide-react';

export function CopyPostModal({
  isOpen,
  onClose,
  numbers,
  settings,
  winningNumber
}) {
  const [templateType, setTemplateType] = useState('available');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const availableNumbers = numbers.filter(n => n.status === 'available').map(n => n.number);
  const bookedNumbers = numbers.filter(n => n.status !== 'available');
  const paidCount = numbers.filter(n => n.status === 'paid').length;

  const getTemplateText = () => {
    if (templateType === 'available') {
      return `🔥 อัปเดตเบอร์ว่าง 00-99 (เหลือ ${availableNumbers.length} เบอร์สุดท้าย!) 🔥\n` +
        `🎁 รางวัล: ${settings.title}\n` +
        `📅 งวด: ${settings.roundName}\n` +
        `💰 เบอร์ละ ${settings.pricePerNumber} บาทเท่านั้น!\n\n` +
        `👇 เบอร์ที่ยังว่างอยู่ (${availableNumbers.length} เบอร์):\n` +
        availableNumbers.join(', ') + `\n\n` +
        `📩 สนใจเบอร์ไหนทักแชทด่วน! ช้าหมดอดลุ้น\n` +
        `📱 LINE/โทร: ${settings.sellerPhone || '-'}`;
    }

    if (templateType === 'bookedList') {
      let txt = `📋 รายชื่อคนจองเบอร์หวย (${settings.title})\n`;
      txt += `จองแล้ว ${bookedNumbers.length}/100 เบอร์ (จ่ายแล้ว ${paidCount} | ค้างชำระ ${bookedNumbers.length - paidCount})\n`;
      txt += `------------------------------------\n`;
      bookedNumbers.forEach(n => {
        txt += `เบอร์ ${n.number} : ${n.customerName || 'ไม่ระบุชื่อ'} [${n.status === 'paid' ? 'โอนแล้ว' : 'รอชำระ'}]\n`;
      });
      txt += `------------------------------------\n`;
      txt += `เหลือเบอร์ว่างอีก ${availableNumbers.length} เบอร์: ` + availableNumbers.slice(0, 15).join(', ') + (availableNumbers.length > 15 ? '...' : '');
      return txt;
    }

    if (templateType === 'winner') {
      const winner = numbers.find(n => n.number === winningNumber);
      return `🎉 ประกาศผลรางวัลประจำงวด! 🎉\n` +
        `🎁 รางวัล: ${settings.title}\n` +
        `🏆 เลขที่ออก: 【 ${winningNumber || '--'} 】\n` +
        `👑 ผู้โชคดีคือ: คุณ ${winner ? (winner.customerName || 'ผู้โชคดี') : 'ไม่มีผู้จอง'}\n\n` +
        `ขอแสดงความยินดีด้วยครับ/ค่ะ! เตรียมรับของรางวัลได้เลย 🥳✨`;
    }

    return '';
  };

  const textToCopy = getTemplateText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card copy-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title-wrap">
            <MessageSquare size={22} className="text-primary" />
            <div>
              <h3>คัดลอกข้อความไปโพสต์โซเชียล</h3>
              <p className="modal-sub">พร้อมส่งต่อลง LINE, Facebook, TikTok ได้ทันที</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="template-tabs">
          <button
            type="button"
            className={`tab-btn ${templateType === 'available' ? 'active' : ''}`}
            onClick={() => setTemplateType('available')}
          >
            🔥 โพสต์เบอร์ที่ยังว่าง ({availableNumbers.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${templateType === 'bookedList' ? 'active' : ''}`}
            onClick={() => setTemplateType('bookedList')}
          >
            📋 โพสต์สรุปรายชื่อคนจอง
          </button>
          {winningNumber && (
            <button
              type="button"
              className={`tab-btn ${templateType === 'winner' ? 'active' : ''}`}
              onClick={() => setTemplateType('winner')}
            >
              👑 โพสต์ผลรางวัล
            </button>
          )}
        </div>

        {/* Text Preview Box */}
        <div className="copy-text-preview-box">
          <textarea
            readOnly
            className="copy-textarea"
            rows={10}
            value={textToCopy}
          />
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            ปิด
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopy}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'คัดลอกลงคลิปบอร์ดแล้ว!' : 'คัดลอกข้อความทั้งหมด'}
          </button>
        </div>

      </div>
    </div>
  );
}
