import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, LogOut, Plus, ShieldCheck } from 'lucide-react';

export function AdminLoginModal({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  onOpenCreateModal
}) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Admin password
    const validPasswords = ['As@02030454'];
    if (validPasswords.includes(password.trim())) {
      onLogin();
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="select-modal-backdrop" onClick={onClose}>
      <div 
        className="select-modal-container animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
        role="dialog"
      >
        {/* Header */}
        <div className="select-modal-header">
          <div className="select-modal-title-group">
            <div className="select-modal-badge" style={{ color: '#f59e0b' }}>
              <Lock size={14} />
              <span>ระบบหลังบ้าน</span>
            </div>
            <h2 className="select-modal-title">
              {isAdmin ? 'แผงควบคุมแอดมิน' : 'เข้าสู่ระบบแอดมิน'}
            </h2>
            <p className="select-modal-subtitle">
              FP Zerofour Administrator Portal
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

        {/* Body */}
        <div style={{ padding: '22px' }}>
          {isAdmin ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '16px',
                borderRadius: '12px',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14.5px',
                fontWeight: 700
              }}>
                <ShieldCheck size={20} />
                <span>คุณเข้าสู่ระบบในฐานะแอดมินเรียบร้อยแล้ว</span>
              </div>

              <button
                type="button"
                className="btn-action-send-fb"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                onClick={() => {
                  onClose();
                  onOpenCreateModal();
                }}
              >
                <Plus size={18} />
                <span>+ เพิ่มการ์ดใหม่</span>
              </button>

              <button
                type="button"
                className="btn-action-copy-msg"
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                <LogOut size={16} />
                <span>ออกจากระบบแอดมิน</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="customer-input-group">
                <label className="input-tiny-label">รหัสผ่านแอดมิน:</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input 
                    type="password" 
                    placeholder="ใส่รหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="customer-fb-input"
                    style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>
                {errorMsg && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px' }}>
                    {errorMsg}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-action-send-fb"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                <Lock size={16} />
                <span>เข้าสู่ระบบ</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
