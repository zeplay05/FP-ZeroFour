import React, { useState } from 'react';
import { Camera, X, ZoomIn, ArrowLeft, Video, Image as ImageIcon, CheckCircle, Tag } from 'lucide-react';

export function CardsPage({ cards = [], onNavigateHome }) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [failedImgs, setFailedImgs] = useState({});

  const displayCards = cards && cards.length > 0 ? cards : [];

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setActivePhotoIdx(0);
  };

  const handleImgError = (cardId) => {
    setFailedImgs(prev => ({ ...prev, [cardId]: true }));
  };

  const fallbackSvgMap = {
    'store-card-1': '/graded-cards/pikachu_promo.svg',
    'store-card-2': '/graded-cards/lucario_vstar.svg',
    'store-card-3': '/graded-cards/great_saiyaman.svg',
    'store-card-4': '/graded-cards/vegetto.svg',
    'store-card-5': '/graded-cards/vegeta.svg',
    'store-card-6': '/graded-cards/luffy_tarou.svg',
    'store-card-7': '/graded-cards/uzumaki_naruto.svg',
    'store-card-8': '/graded-cards/ichigo_kurosaki.svg',
  };

  const getCardCover = (card) => {
    if (!card) return '/graded-cards/pikachu_promo.svg';
    if (failedImgs[card.id]) {
      return fallbackSvgMap[card.id] || '/graded-cards/pikachu_promo.svg';
    }
    return card.coverImage || card.image || fallbackSvgMap[card.id] || '/graded-cards/pikachu_promo.svg';
  };

  return (
    <div className="cards-showcase-page-container animate-fade-in">
      
      {/* Top Header Section (Matching Image 2) */}
      <div className="cards-showcase-hero">
        <h1 className="cards-showcase-title">
          บริการ<span className="text-orange-gradient">ขายการ์ดของเรา</span>
        </h1>
        <p className="cards-showcase-subtitle">
          ลูกค้าสามารถเลือกซื้อการ์ดที่ต้องการได้เลย
        </p>
      </div>

      {/* Graded Cards Grid (4 Columns x 2 Rows) */}
      <div className="cards-showcase-grid">
        {displayCards.map((card) => {
          const isSold = card.status === 'sold';
          const cover = getCardCover(card);

          return (
            <div 
              key={card.id} 
              className={`showcase-card-item ${isSold ? 'is-sold' : ''}`}
              onClick={() => handleCardClick(card)}
              role="button"
              tabIndex={0}
              title={`คลิกเพื่อดูรูปการ์ดขนาดใหญ่ ${card.title}`}
            >
              {/* Slab Image Container with Price & Status Badges */}
              <div className="showcase-slab-media-wrap">
                <img 
                  src={cover} 
                  alt={card.title} 
                  className="showcase-slab-img"
                  loading="lazy" 
                  onError={() => handleImgError(card.id)}
                />

                {/* Status Badge: มีสินค้า / ขายแล้ว */}
                <div className="card-floating-badges">
                  <span className={`status-pill-badge ${isSold ? 'sold' : 'available'}`}>
                    {isSold ? 'ขายแล้ว' : 'มีสินค้า'}
                  </span>
                  {card.price > 0 && (
                    <span className="price-pill-badge">
                      {Number(card.price).toLocaleString()} ฿
                    </span>
                  )}
                </div>

                <div className="showcase-slab-hover-overlay">
                  <ZoomIn size={22} className="zoom-icon" />
                  <span>แตะเพื่อดูรายละเอียด</span>
                </div>
              </div>

              {/* Title & Set Subtitle */}
              <div className="showcase-card-caption">
                <h3 className="showcase-card-name">{card.title}</h3>
                <p className="showcase-card-sub">{card.subtitle}</p>
                {card.grade && (
                  <span className="showcase-grade-tag">{card.grade}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="cards-showcase-action-row">
        <button 
          type="button" 
          className="btn-showcase-view-all"
          onClick={() => setIsExpanded(prev => !prev)}
        >
          <Camera size={16} />
          <span>{isExpanded ? 'ย่อผลงานลง' : `ดูผลงานทั้งหมด (${displayCards.length * 2} รูป)`}</span>
        </button>
      </div>

      {/* Expanded Bonus Cards if toggled */}
      {isExpanded && (
        <div className="cards-showcase-grid bonus-grid animate-fade-in">
          {displayCards.map((card) => {
            const isSold = card.status === 'sold';
            const cover = getCardCover(card);

            return (
              <div 
                key={`bonus-${card.id}`} 
                className="showcase-card-item"
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
              >
                <div className="showcase-slab-media-wrap">
                  <img 
                    src={cover} 
                    alt={card.title} 
                    className="showcase-slab-img"
                    loading="lazy" 
                    onError={() => handleImgError(card.id)}
                  />
                  <div className="card-floating-badges">
                    <span className={`status-pill-badge ${isSold ? 'sold' : 'available'}`}>
                      {isSold ? 'ขายแล้ว' : 'มีสินค้า'}
                    </span>
                  </div>
                </div>
                <div className="showcase-card-caption">
                  <h3 className="showcase-card-name">{card.title} (ชุดสะสม)</h3>
                  <p className="showcase-card-sub">{card.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal with Detail Photos & Video */}
      {selectedCard && (
        <div 
          className="card-lightbox-backdrop animate-fade-in"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="card-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              className="lightbox-close-btn"
              onClick={() => setSelectedCard(null)}
              aria-label="ปิด"
            >
              <X size={20} />
            </button>

            {/* Photo & Video View */}
            <div className="lightbox-slab-view">
              <div className="main-display-wrap">
                {(() => {
                  const photos = selectedCard.detailImages && selectedCard.detailImages.length > 0
                    ? selectedCard.detailImages
                    : [getCardCover(selectedCard)];
                  const curPhoto = photos[activePhotoIdx] || getCardCover(selectedCard);
                  return (
                    <img 
                      src={curPhoto} 
                      alt={selectedCard.title} 
                      className="lightbox-slab-large-img" 
                      onError={() => handleImgError(selectedCard.id)}
                    />
                  );
                })()}
              </div>

              {/* Detail Photos Thumbnails (รูปดีเทลยิบย่อย) */}
              {selectedCard.detailImages && selectedCard.detailImages.length > 1 && (
                <div className="detail-photos-thumbs-row">
                  {selectedCard.detailImages.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      className={`thumb-btn ${activePhotoIdx === idx ? 'active' : ''}`}
                      onClick={() => setActivePhotoIdx(idx)}
                    >
                      <img src={imgUrl} alt={`มุมที่ ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="lightbox-info-col">
              <div className="lightbox-badges-header">
                <span className="lightbox-grade-badge">{selectedCard.grade || 'PCG 10'}</span>
                <span className={`status-pill-badge ${selectedCard.status === 'sold' ? 'sold' : 'available'}`}>
                  {selectedCard.status === 'sold' ? 'ขายแล้ว' : 'มีสินค้า (พร้อมส่ง)'}
                </span>
              </div>

              <h2 className="lightbox-title">{selectedCard.title}</h2>
              <p className="lightbox-sub">{selectedCard.subtitle}</p>

              {selectedCard.price > 0 && (
                <div className="lightbox-price-tag">
                  <span className="lbl">ราคา:</span>
                  <span className="val">{Number(selectedCard.price).toLocaleString()} บาท</span>
                </div>
              )}

              {/* Video Button if video exists */}
              {selectedCard.videoUrl && (
                <div className="lightbox-video-box">
                  <a 
                    href={selectedCard.videoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-view-card-video"
                  >
                    <Video size={16} />
                    <span>กดดูคลิปวีดีโอตัวการ์ดจริง</span>
                  </a>
                </div>
              )}

              <div className="lightbox-meta-box">
                <div className="meta-line">
                  <span className="meta-lbl">สถาบันเกรด:</span>
                  <span className="meta-val">PCG / PSA Graded Card</span>
                </div>
                <div className="meta-line">
                  <span className="meta-lbl">สถานะสินค้า:</span>
                  <span className={`meta-val ${selectedCard.status === 'sold' ? 'text-red' : 'text-green'}`}>
                    {selectedCard.status === 'sold' ? 'ขายแล้ว (Sold Out)' : 'มีสินค้าพร้อมจัดส่ง'}
                  </span>
                </div>
                {selectedCard.description && (
                  <div className="meta-line-col">
                    <span className="meta-lbl">รายละเอียด:</span>
                    <p className="meta-desc-text">{selectedCard.description}</p>
                  </div>
                )}
              </div>

              <button 
                type="button" 
                className="btn-lightbox-back"
                onClick={() => onNavigateHome()}
              >
                <ArrowLeft size={16} />
                <span>ไปที่ตารางจองเลขท้าย</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
