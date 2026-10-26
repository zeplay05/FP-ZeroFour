import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, 
  Search, 
  Layers, 
  Hourglass, 
  CheckCircle2, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { LandscapeCardArt } from './LandscapeCardArt';
import { RainBackground } from './RainBackground';
import { getBoardTypeInfo } from '../utils/lotteryData';


export function CardHomePage({
  rounds,
  onSelectRound,
  onOpenCreateModal,
  isAdmin
}) {
  // Sort rounds newest first
  const sortedRounds = useMemo(() => {
    return [...rounds].sort((a, b) => b.createdAt - a.createdAt);
  }, [rounds]);

  // First/featured round for hero quick preview card
  const featuredRound = sortedRounds[0];

  // Helper to compute round stats
  const getRoundStats = (round) => {
    if (!round || !round.numbers) return { available: 0, booked: 0, paid: 0, total: 100 };
    const available = round.numbers.filter(n => n.status === 'available').length;
    const booked = round.numbers.filter(n => n.status === 'booked').length;
    const paid = round.numbers.filter(n => n.status === 'paid').length;
    const total = round.numbers.length;
    return { available, booked, paid, total };
  };

  // Open boards (กระดานที่เปิดให้จอง: เฉพาะกระดานที่สถานะเปิดจองเท่านั้น)
  const openRounds = useMemo(() => {
    return sortedRounds.filter(r => (r.status === 'open' || !r.status) && r.status !== 'closed' && r.status !== 'drawn');
  }, [sortedRounds]);

  // Closed/history boards (ประวัติตารางที่ปิดให้บริการจอง)
  const closedRounds = useMemo(() => {
    return sortedRounds.filter(r => r.status === 'closed' || r.status === 'drawn');
  }, [sortedRounds]);

  // Pagination for closed rounds (6 cards per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(closedRounds.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedClosedRounds = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return closedRounds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [closedRounds, currentPage]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      scrollToSection('all-boards');
    }
  };

  return (
    <div className="homepage-v2-container">
      
      {/* =========================================================================
          SECTION 1: HERO SECTION
          ========================================================================= */}
      <section className="hero-v2-section">
        
        {/* Animated Rain Background Effect (Matching User CSS) */}
        <RainBackground />

        <div className="hero-v2-content">
          
          {/* Top Pill Tag */}
          <div className="hero-pill-tag">
            <span className="hero-pill-emoji">🎯</span>
            <span>กระดานมหาสนุก • FP Zerofour</span>
          </div>

          {/* Big Bold Headline */}
          <h1 className="hero-main-headline">
            จองเลข <span className="gradient-brand-purple">FP Zerofour</span> โปร่งใส
            <br />
            ดูเลขว่างแบบ <span className="gradient-brand-cyan">Real-time</span>
          </h1>

          {/* Two Action CTA Buttons */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => scrollToSection('open-boards')}
            >
              <span className="cta-icon">🎯</span>
              <span>เลือกกระดานจองเลข</span>
            </button>

            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => scrollToSection('how-to-book')}
            >
              <span className="cta-icon">🔍</span>
              <span>วิธีจอง</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: "กระดานที่เปิดให้จอง" (เด่นชัด สวยงาม Real-time)
          ========================================================================= */}
      <section id="open-boards" className="open-boards-v2-section">
        <div className="section-header-showcase open-boards-header">
          <div className="live-status-pill-badge">
            <span className="live-dot-pulse" />
            <span>กำลังเปิดรับจองแบบ Real-time</span>
          </div>
          <h2 className="section-showcase-title">
            กระดานที่<span className="text-emerald-gradient">เปิดให้จอง</span>
          </h2>
          <p className="section-showcase-sub">
            เลือกกระดานและคลิกเพื่อเข้าสู่หน้าเลือกเบอร์ตัวเลขที่ชอบได้ทันที ระบบหักลบเลขว่างอัตโนมัติ
          </p>
          {isAdmin && (
            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                className="btn-admin-add-round"
                onClick={onOpenCreateModal}
              >
                + เพิ่มการ์ดกระดานใหม่
              </button>
            </div>
          )}
        </div>

        {/* Featured Open Boards Grid or Empty State Notice */}
        {openRounds.length === 0 ? (
          <div className="empty-open-boards-box animate-fade-in">
            <div className="empty-open-boards-icon">
              <Sparkles size={30} />
            </div>
            <h3 className="empty-open-boards-title">กระดานใหม่เร็วนี้</h3>
            <p className="empty-open-boards-desc">
              ขณะนี้ยังไม่มีกระดานที่เปิดรับจอง สามารถติดตามกระดานใหม่ได้เร็วๆ นี้ หรือเลือกดูประวัติตารางที่ปิดรอบแล้วด้านล่าง
            </p>
          </div>
        ) : (
          <div className="open-boards-cards-grid">
            {openRounds.map((round) => {
            const stats = getRoundStats(round);
            const bookedCount = stats.booked + stats.paid;
            const bookedPct = Math.round((bookedCount / stats.total) * 100);

            return (
              <div
                key={round.id}
                className="open-board-spotlight-card"
                onClick={() => onSelectRound(round)}
                role="button"
                tabIndex={0}
                title={`คลิกเพื่อเปิดกระดาน ${round.title}`}
              >
                <div className="open-board-inner-container">
                  {/* Left Column: Card Media */}
                  <div className="open-board-media-box">
                    {round.coverImage ? (
                      <img src={round.coverImage} alt={round.title} className="open-board-custom-img" />
                    ) : (
                      <div className="open-board-slab-graphic">
                        <div className="slab-outer-casing glow-cyan">
                          <div className="slab-card-inner">
                            <div className="slab-card-motif" />
                            <div className="slab-gold-seal">00-99</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Card Content & Details */}
                  <div className="open-board-body">
                    {/* Top Badges Row */}
                    <div className="open-board-badges-row">
                      <span className="badge-status-pill open-live">
                        <span className="dot-pulse-mini" /> เปิดให้จอง
                      </span>
                      <span className="badge-price-pill highlight-gold">
                        {round.pricePerNumber || 50}.- / เบอร์
                      </span>
                    </div>

                    <h3 className="open-board-title">{round.title}</h3>
                    {round.description && (
                      <p className="open-board-desc">{round.description}</p>
                    )}

                    {/* Progress & Numbers Remaining */}
                    <div className="open-board-stat-block">
                      <div className="open-board-numbers-row">
                        <span className="open-avail-count">
                          ว่าง <strong className="num-glow-cyan">{stats.available}</strong> เบอร์
                        </span>
                        <span className="open-booked-pct">
                          จองแล้ว {bookedCount}/{stats.total} ({bookedPct}%)
                        </span>
                      </div>

                      <div className="board-progress-track">
                        <div 
                          className="board-progress-fill gradient-emerald" 
                          style={{ width: `${bookedPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Compact Action Button */}
                    <div className="btn-select-board-cta">
                      <span>🎯 เลือกเบอร์และจองเลข</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 3: "ประวัติตารางที่ปิดให้บริการจอง" (ตารางที่ปิดรอบแล้ว)
          ========================================================================= */}
      <section id="all-boards" className="all-boards-v2-section">
        <div className="section-header-showcase">
          <h2 className="section-showcase-title">
            ประวัติ<span className="text-orange-gradient">ตารางที่ปิดให้บริการจอง</span>
          </h2>
          <p className="section-showcase-sub">
           ลูกค้าสามารถดูประวัติที่ปิดให้บริการจองได้ที่นี่
          </p>
        </div>

        <div className="boards-cards-v2-grid">
          {paginatedClosedRounds.map((round) => {
            const stats = getRoundStats(round);
            const bookedPct = Math.round(((stats.total - stats.available) / stats.total) * 100);

            return (
              <div
                key={round.id}
                className="board-v2-item-card is-closed"
                onClick={() => onSelectRound(round)}
                role="button"
                tabIndex={0}
                title={`คลิกเพื่อดูประวัติกระดาน ${round.title}`}
              >
                {/* Artwork Area with Badges & Graded Slab Graphic */}
                <div className="board-card-media-wrap">
                  
                  {/* Top Badges */}
                  <div className="card-top-badges-row">
                    <span className="badge-price-pill">
                      {round.pricePerNumber || 50}.- / เบอร์
                    </span>
                    <span className="badge-status-pill closed">
                      {round.winningNumber ? `🏆 เลขที่ออก ${round.winningNumber}` : 'ปิดให้บริการจอง'}
                    </span>
                  </div>

                  {/* Graded Slab Graphic Artwork / Custom Cover Image */}
                  <div className="board-slab-artwork-area">
                    {(round.coverImage || round.image) ? (
                      <img 
                        src={round.coverImage || round.image} 
                        alt={round.title} 
                        className="board-custom-cover" 
                      />
                    ) : (
                      <div className="graded-slab-illustration">
                        <div className="slab-outer-casing">
                          <div className="slab-card-inner">
                            <div className="slab-card-motif" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Information Bar */}
                <div className="board-card-info-bar">
                  <span className="board-card-title">{round.title}</span>
                  {round.description && (
                    <p className="board-card-desc-preview">{round.description}</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Pagination Bar (แสดงเมื่อครบ 6 การ์ดหรือมีมากกว่า 6 การ์ด) */}
        {totalPages > 1 && (
          <div className="boards-pagination-container">
            <button
              type="button"
              className="btn-pagination-nav"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="หน้าก่อนหน้า"
            >
              <ChevronLeft size={16} />
              <span>ย้อนกลับ</span>
            </button>

            <div className="pagination-numbers-row">
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-num-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-pagination-nav"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="หน้าถัดไป"
            >
              <span>ถัดไป</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4: "จองง่าย 5 ขั้นตอน" & Warning Notice
          ========================================================================= */}
      <section id="how-to-book" className="how-to-book-v2-section">
        <h2 className="section-main-title">จองง่ายภายใน 5 ขั้นตอน</h2>

        {/* 5 Step Cards Grid */}
        <div className="steps-v2-grid">
          
          {/* Step 1 */}
          <div className="step-v2-card">
            <div className="step-number-circle">
              <span>1</span>
            </div>
            <h3 className="step-card-title">เลือกกระดาน</h3>
            <p className="step-card-desc">
              เปิดกระดานแล้วดูเลขที่ยังว่าง
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-v2-card">
            <div className="step-number-circle">
              <span>2</span>
            </div>
            <h3 className="step-card-title">เลือกเลขที่ชอบ</h3>
            <p className="step-card-desc">
              เลือกเบอร์ตัวเลขที่คุณต้องการบนกระดาน
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-v2-card">
            <div className="step-number-circle">
              <span>3</span>
            </div>
            <h3 className="step-card-title">กดยืนยันเลขต้องการ</h3>
            <p className="step-card-desc">
              ตรวจสอบรายการเบอร์ที่เลือกแล้วกดยืนยัน
            </p>
          </div>

          {/* Step 4 */}
          <div className="step-v2-card">
            <div className="step-number-circle">
              <span>4</span>
            </div>
            <h3 className="step-card-title">ส่งเลขหาแอดมิน</h3>
            <p className="step-card-desc">
              หลังจากกดแล้ว เลขที่เลือกจะถูกส่งไปหาแอดมิน
            </p>
          </div>

          {/* Step 5 */}
          <div className="step-v2-card">
            <div className="step-number-circle">
              <span>5</span>
            </div>
            <h3 className="step-card-title">ชำระเงินเสร็จสิ้น</h3>
            <p className="step-card-desc">
              จากนั้นชำระเงินคือเสร็จสิ้น ตรวจสอบสถานะได้ทันที
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}
