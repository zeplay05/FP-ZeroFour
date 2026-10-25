import React from 'react';
import { 
  Phone, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';

export function AppFooter({
  onNavigateHome,
  onNavigateCards,
  onOpenContact,
  onOpenAdminLogin
}) {
  const handleOpenMessenger = () => {
    const saved = localStorage.getItem('seller_fb_link');
    const customLink = (saved && saved !== 'https://m.me') ? saved : 'https://m.me/filmxrux.khrzx';
    window.open(customLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="app-main-footer">
      <div className="footer-container">
        
        {/* Main 2-Column Grid (Brand on Left, Contact on Right) */}
        <div className="footer-columns-grid">
          
          {/* Column 1: Brand & About */}
          <div className="footer-col col-brand">
            <div className="footer-brand-wrap">
              <span className="brand-logo-futuristic">FP ZEROFOUR</span>
            </div>
            <p className="footer-description">
              บริการจองเบอร์หวย เบอร์ทองคำ และการ์ดสะสมยอดนิยม 
              การันตีความปลอดภัยและโปร่งใสที่สุดในไทย พร้อมระบบตรวจนับยอดอัตโนมัติ
            </p>
            <div className="footer-trust-badge">
              <ShieldCheck size={16} className="text-emerald" />
              <span>ระบบตรวจสอบสิทธิ์และยืนยันยอดแม่นยำ 100%</span>
            </div>
          </div>

          {/* Column 2: ติดต่อ FP Zerofour (Contact Card with icons) */}
          <div className="footer-col col-contact">
            <div className="footer-heading-wrap">
              <h4 
                className="footer-heading"
                onClick={onOpenContact}
                style={{ cursor: 'pointer' }}
                title="คลิกเพื่อไปที่หน้าติดต่อเรา"
              >
                ติดต่อ FP Zerofour
              </h4>
            </div>
            <ul className="footer-contact-list">
              <li>
                <a 
                  href="https://www.facebook.com/filmxrux.khrzx" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item"
                  title="ติดต่อทาง Facebook: Card Di Wa (กดเปิดเพจ)"
                >
                  <span className="contact-icon-badge fb-badge">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#1877f2">
                      <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z"/>
                    </svg>
                  </span>
                  <div className="contact-info-text">
                    <span className="contact-val">FP Zerofour</span>
                  </div>
                </a>
              </li>

              <li>
                <a 
                  href="tel:0622986629" 
                  className="footer-contact-item"
                  title="โทรติดต่อ FP Zerofour: 098-096-6894"
                >
                  <span className="contact-icon-badge phone-badge">
                    <Phone size={18} />
                  </span>
                  <div className="contact-info-text">
                    <span className="contact-val highlight-phone">098-096-6894</span>
                  </div>
                </a>
              </li>

              <li>
                <div 
                  className="footer-contact-item"
                  title="บริการออนไลน์ จัดส่งด่วนปลอดภัยทั่วไทย"
                >
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-footer Copyright */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright-text">
            © 2026 FP Zerofour - All Rights Reserved. Card & Lucky Draw Booking System.
          </div>
          <div className="footer-legal-links">
            <span className="legal-link">นโยบายความเป็นส่วนตัว</span>
            <span className="legal-sep">•</span>
            <span className="legal-link">ข้อกำหนดและเงื่อนไข</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
