import React, { useState } from 'react';
import { 
  Home,
  Layers, 
  LayoutGrid,
  BookOpen,
  Headphones,
  Menu, 
  X
} from 'lucide-react';

export function AppNavbar({
  viewMode,
  activeTab,
  onSelectTab,
  onNavigateHome,
  onNavigateCards,
  onOpenContact,
  onOpenAdminLogin,
  isAdmin
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScrollToSection = (sectionId) => {
    if (viewMode !== 'home') {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMenuClick = (action) => {
    setIsMobileMenuOpen(false);
    action();
  };

  // Check if Home tab is active
  const isHomeActive = viewMode === 'home' && (!activeTab || activeTab === 'home');
  const isCardsActive = viewMode === 'cards' || activeTab === 'cards';
  const isBoardsActive = activeTab === 'boards';
  const isHowToActive = activeTab === 'how-to-book';
  const isContactActive = viewMode === 'contact' || activeTab === 'contact';

  return (
    <header className="fp-zerofour-navbar-v2">
      
      {/* Left: Brand Badge & Shop Info */}
      <div className="navbar-v2-left">
        <button
          type="button"
          className="brand-logo-btn-v2"
          onClick={() => {
            handleMenuClick(() => {
              onNavigateHome();
              onSelectTab?.('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
          }}
          title="FP ZEROFOUR"
        >
          <span className="brand-logo-futuristic">FP ZEROFOUR</span>
        </button>
      </div>

      {/* Center: Main Navigation Tabs (Matching User Image with Icons & Orange Active Line) */}
      <nav className="navbar-v2-center-nav" aria-label="Main Navigation">
        
        {/* 1. หน้าแรก */}
        <button
          type="button"
          className={`nav-v2-tab-item ${isHomeActive ? 'active' : ''}`}
          onClick={() => {
            onNavigateHome();
            onSelectTab?.('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="หน้าแรก"
        >
          <Home size={17} className="nav-tab-icon" />
          <span>หน้าแรก</span>
        </button>

        {/* 2. เมนูการ์ด (ปิด Disabled พร้อมแท็บเล็กๆ Coming soon) */}
        <button
          type="button"
          className="nav-v2-tab-item nav-item-disabled"
          disabled
          aria-disabled="true"
          title="การ์ด (Coming soon)"
        >
          <Layers size={17} className="nav-tab-icon" />
          <span>การ์ด</span>
          <span className="nav-coming-soon-badge">Coming soon</span>
        </button>

        {/* 3. กระดาน */}
        <button
          type="button"
          className={`nav-v2-tab-item ${isBoardsActive ? 'active' : ''}`}
          onClick={() => {
            onSelectTab?.('boards');
            handleScrollToSection('open-boards');
          }}
          title="ดูกระดานจองเลขทั้งหมด"
        >
          <LayoutGrid size={17} className="nav-tab-icon" />
          <span>กระดาน</span>
        </button>

        {/* 4. วิธีจอง */}
        <button
          type="button"
          className={`nav-v2-tab-item ${isHowToActive ? 'active' : ''}`}
          onClick={() => {
            onSelectTab?.('how-to-book');
            handleScrollToSection('how-to-book');
          }}
          title="ดูขั้นตอนการจอง 5 ขั้นตอน"
        >
          <BookOpen size={17} className="nav-tab-icon" />
          <span>วิธีจอง</span>
        </button>

        {/* 5. ติดต่อเรา */}
        <button
          type="button"
          className={`nav-v2-tab-item ${isContactActive ? 'active' : ''}`}
          onClick={() => {
            onSelectTab?.('contact');
            onOpenContact();
          }}
          title="ติดต่อแอดมิน FP Zerofour"
        >
          <Headphones size={17} className="nav-tab-icon" />
          <span>ติดต่อเรา</span>
        </button>

      </nav>

      {/* Right Controls: Mobile Hamburger */}
      <div className="navbar-v2-right">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="btn-mobile-hamburger"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          aria-label="เปิดเมนู"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-drawer animate-fade-in">
          <button
            type="button"
            className={`mobile-nav-item ${isHomeActive ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick(() => {
                onNavigateHome();
                onSelectTab?.('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
            }}
          >
            <Home size={18} />
            <span>หน้าแรก</span>
          </button>

          <button
            type="button"
            className="mobile-nav-item nav-item-disabled"
            disabled
            aria-disabled="true"
            title="การ์ด (Coming soon)"
          >
            <div className="mobile-nav-item-content">
              <Layers size={18} />
              <span>การ์ด</span>
            </div>
            <span className="nav-coming-soon-badge">Coming soon</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${isBoardsActive ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick(() => {
                onSelectTab?.('boards');
                handleScrollToSection('open-boards');
              });
            }}
          >
            <LayoutGrid size={18} />
            <span>กระดาน</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${isHowToActive ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick(() => {
                onSelectTab?.('how-to-book');
                handleScrollToSection('how-to-book');
              });
            }}
          >
            <BookOpen size={18} />
            <span>วิธีจอง</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-item ${isContactActive ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick(() => {
                onSelectTab?.('contact');
                onOpenContact();
              });
            }}
          >
            <Headphones size={18} />
            <span>ติดต่อเรา</span>
          </button>
        </div>
      )}

    </header>
  );
}

