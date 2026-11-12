import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Layers, 
  Sparkles, 
  Check, 
  CreditCard, 
  MessageCircle, 
  ExternalLink, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  ShieldCheck,
  ShoppingBag,
  Truck,
  ArrowRight
} from 'lucide-react';
import { CASE_TYPES } from '../utils/customBordersData';
import { BorderCheckoutModal } from './BorderCheckoutModal';

export function CustomBordersPage({
  borders = [],
  materials = [],
  shippingConfig = { fee: 80, freeThreshold: 10 },
  paymentConfig,
  onSaveOrder,
  onNavigateHome
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('ALL');
  
  // Selected items map: { [borderId]: { borderId, code, name, caseType, image, materialId, materialName, unitPrice, quantity } }
  const [selectedMap, setSelectedMap] = useState({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [copiedHint, setCopiedHint] = useState(false);

  // Default material fallback
  const defaultMat = materials[0] || { id: 'matte', name: 'กระดาษด้าน', price: 140 };

  // Filtered borders
  const filteredBorders = useMemo(() => {
    return borders.filter(b => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        b.code?.toLowerCase().includes(q) || 
        b.name?.toLowerCase().includes(q) ||
        b.caseType?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q);

      const matchCase = selectedCaseType === 'ALL' || b.caseType === selectedCaseType;
      return matchSearch && matchCase;
    });
  }, [borders, searchQuery, selectedCaseType]);

  // Selected items array
  const selectedList = useMemo(() => {
    return Object.values(selectedMap);
  }, [selectedMap]);

  const totalItemsCount = useMemo(() => {
    return selectedList.reduce((acc, it) => acc + (it.quantity || 1), 0);
  }, [selectedList]);

  const itemsSubtotal = useMemo(() => {
    return selectedList.reduce((acc, it) => acc + (it.unitPrice * (it.quantity || 1)), 0);
  }, [selectedList]);

  const isFreeShipping = totalItemsCount >= shippingConfig.freeThreshold;
  const shippingFee = isFreeShipping ? 0 : (totalItemsCount > 0 ? shippingConfig.fee : 0);
  const finalTotal = itemsSubtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, shippingConfig.freeThreshold - totalItemsCount);

  // Toggle border selection
  const handleToggleBorder = (border) => {
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[border.id]) {
        delete next[border.id];
      } else {
        next[border.id] = {
          borderId: border.id,
          code: border.code,
          name: border.name,
          caseType: border.caseType,
          image: border.image,
          materialId: defaultMat.id,
          materialName: defaultMat.name,
          unitPrice: defaultMat.price,
          quantity: 1
        };
      }
      return next;
    });
  };

  // Change material for a selected item
  const handleChangeMaterial = (borderId, material) => {
    setSelectedMap(prev => {
      if (!prev[borderId]) return prev;
      return {
        ...prev,
        [borderId]: {
          ...prev[borderId],
          materialId: material.id,
          materialName: material.name,
          unitPrice: material.price
        }
      };
    });
  };

  // Change quantity for a selected item
  const handleUpdateQuantity = (borderId, delta) => {
    setSelectedMap(prev => {
      if (!prev[borderId]) return prev;
      const currentQty = prev[borderId].quantity || 1;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[borderId];
        return next;
      }
      return {
        ...prev,
        [borderId]: {
          ...prev[borderId],
          quantity: newQty
        }
      };
    });
  };

  // Messenger Order Text Generator
  const generateMessengerText = () => {
    let msg = `🔥 สั่งทำขอบการ์ดเกรด FP ZEROFOUR\n`;
    msg += `------------------------------------\n`;
    selectedList.forEach((it, idx) => {
      msg += `${idx + 1}. [${it.code}] ${it.name} (${it.caseType})\n`;
      msg += `   - วัสดุ: ${it.materialName} x ${it.quantity} ชิ้น = ${(it.unitPrice * it.quantity).toLocaleString()} บาท\n`;
    });
    msg += `------------------------------------\n`;
    msg += `รวมสินค้า: ${totalItemsCount} ชิ้น (${itemsSubtotal.toLocaleString()} บาท)\n`;
    msg += `ค่าจัดส่ง: ${isFreeShipping ? 'ส่งฟรี (0 บาท) 🎉' : `${shippingFee} บาท`}\n`;
    msg += `ยอดสุทธิทั้งสิ้น: ${finalTotal.toLocaleString()} บาท\n`;
    msg += `------------------------------------\n`;
    msg += `(แจ้งชื่อ-ที่อยู่จัดส่ง และหลักฐานการโอนได้ในแชทนี้เลยครับ)`;
    return msg;
  };

  const handleOpenMessenger = () => {
    if (selectedList.length === 0) return;
    const text = generateMessengerText();
    try {
      navigator.clipboard.writeText(text);
      setCopiedHint(true);
      setTimeout(() => setCopiedHint(false), 3500);
    } catch (e) {}

    const fbUrl = paymentConfig?.messengerUrl || 'https://m.me/fpzerofour';
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="custom-borders-page-container animate-fade-in">
      
      {/* Hero Header Banner */}
      <div className="borders-showcase-hero">
        <div className="borders-hero-badge">
          <Sparkles size={14} className="text-gold" />
          <span>FP ZEROFOUR CUSTOM SLAB BORDERS</span>
        </div>
        <h1 className="borders-showcase-title">
          สั่งทำ<span className="text-orange-gradient">ขอบการ์ดเกรดสะสม</span>
        </h1>
        <p className="borders-showcase-subtitle">
          เลือกลายขอบเคสเกรด PSA, CGC, PCG, BGS พร้อมกำหนดประเภทวัสดุ สรุปยอดและสั่งซื้อได้ทันที
        </p>

        {/* Promotion Strip */}
        <div className="borders-promo-strip">
          <span className="promo-badge-pill">🔥 โปรโมชั่นพิเศษ</span>
          <span className="promo-desc-text">
            ค่าจัดส่ง 80 บาท | <strong>สั่งครบ 10 ชิ้นขึ้นไป ส่งฟรีทั่วประเทศ!</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="borders-filter-toolbar">
        
        {/* Search Input Box */}
        <div className="borders-search-box">
          <Search size={18} className="search-icon-muted" />
          <input
            type="text"
            className="borders-search-input"
            placeholder="ค้นหารหัสสินค้า เช่น FP-B01 หรือชื่อลาย / วันพีซ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Case Type Filter Pills */}
        <div className="case-type-pills-row">
          <button
            type="button"
            className={`case-pill-btn ${selectedCaseType === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCaseType('ALL')}
          >
            ทั้งหมด ({borders.length})
          </button>
          {CASE_TYPES.map(ct => {
            const count = borders.filter(b => b.caseType === ct).length;
            return (
              <button
                key={ct}
                type="button"
                className={`case-pill-btn ${selectedCaseType === ct ? 'active' : ''}`}
                onClick={() => setSelectedCaseType(ct)}
              >
                {ct} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Borders Gallery Grid */}
      <div className="borders-catalog-grid">
        {filteredBorders.map((border) => {
          const isSelected = Boolean(selectedMap[border.id]);
          const selectedData = selectedMap[border.id];

          return (
            <div
              key={border.id}
              className={`border-item-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleToggleBorder(border)}
              role="button"
              tabIndex={0}
              title={`คลิกเพื่อ${isSelected ? 'ยกเลิก' : 'เลือก'}ลาย ${border.name}`}
            >
              {/* Top Badges */}
              <div className="border-card-top-badges">
                <span className="badge-case-type">{border.caseType}</span>
                <span className="badge-product-code font-mono">{border.code}</span>
              </div>

              {/* Selection Check Indicator */}
              {isSelected && (
                <div className="card-selected-check-badge animate-scale-up">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              {/* Artwork Media Frame */}
              <div className="border-card-media">
                <img 
                  src={border.image} 
                  alt={border.name} 
                  className="border-card-thumb" 
                />
              </div>

              {/* Card Bottom Meta (Title & Code below image as requested) */}
              <div className="border-card-info">
                <span className="border-card-name">{border.name}</span>
                <div className="border-card-meta-row">
                  <span className="border-category-tag">{border.category}</span>
                  <span className="border-price-tag">เริ่มต้น {materials[0]?.price || 140}.-</span>
                </div>
              </div>

              {/* Material Selector Strip (appears when selected) */}
              {isSelected && (
                <div 
                  className="card-material-inline-selector"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="mat-select-label">เลือกวัสดุ:</span>
                  <div className="mat-chips-group">
                    {materials.map(mat => {
                      const isMatActive = selectedData?.materialId === mat.id;
                      return (
                        <button
                          key={mat.id}
                          type="button"
                          className={`mat-chip-btn ${isMatActive ? 'active' : ''}`}
                          onClick={() => handleChangeMaterial(border.id, mat)}
                        >
                          <span>{mat.name}</span>
                          <span className="mat-price-tag">{mat.price}.-</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quantity Controller */}
                  <div className="inline-qty-controller">
                    <span className="qty-label">จำนวน:</span>
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="btn-step-qty"
                        onClick={() => handleUpdateQuantity(border.id, -1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-display-val">{selectedData?.quantity || 1}</span>
                      <button
                        type="button"
                        className="btn-step-qty"
                        onClick={() => handleUpdateQuantity(border.id, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {filteredBorders.length === 0 && (
          <div className="borders-empty-state">
            <Layers size={48} className="text-muted" />
            <h3>ไม่พบลายขอบการ์ดที่ค้นหา</h3>
            <p>ลองเปลี่ยนคำค้นหา หรือเลือกประเภทเคสทั้งหมดดูครับ</p>
          </div>
        )}
      </div>

      {/* Floating Sticky Drawer / Selection Live Bar (เหมือนหน้ากระดานเป๊ะๆ) */}
      {selectedList.length > 0 && (
        <div className="borders-sticky-summary-drawer animate-slide-up">
          <div className="drawer-inner-container">
            
            {/* Left: Selected Items & Discount Hint */}
            <div className="drawer-summary-left">
              <div className="drawer-count-title">
                เลือกแล้ว <strong className="highlight-count">{totalItemsCount}</strong> ชิ้น ({selectedList.length} ลาย)
              </div>
              <div className="drawer-items-preview">
                {selectedList.map(it => (
                  <span key={`${it.borderId}-${it.materialId}`} className="drawer-item-pill">
                    {it.code} ({it.materialName}) x{it.quantity}
                  </span>
                ))}
              </div>

              {/* Free Shipping Dynamic Hint */}
              <div className={`drawer-shipping-tip ${isFreeShipping ? 'is-free' : ''}`}>
                <Truck size={14} />
                {isFreeShipping ? (
                  <span>🎉 <strong>สั่งครบ 10 ชิ้นขึ้นไป ส่งฟรีทั่วประเทศ!</strong> (ประหยัด {shippingConfig.fee} บาท)</span>
                ) : (
                  <span>ค่าส่ง <strong>{shippingConfig.fee}.-</strong> (เลือกอีก <strong>{remainingForFreeShipping}</strong> ชิ้น ส่งฟรีทันที!)</span>
                )}
              </div>
            </div>

            {/* Middle: Price Totals */}
            <div className="drawer-summary-right">
              <div className="drawer-price-group">
                <span className="drawer-price-label">ยอดที่ต้องชำระ (รวมค่าส่ง):</span>
                <span className="drawer-price-value text-gold">
                  {finalTotal.toLocaleString()} <span className="currency-unit">บาท</span>
                </span>
              </div>
            </div>

            {/* Right: 2 Action Buttons (เหมือนหน้ากระดานเป๊ะๆ) */}
            <div className="drawer-actions-row">
              <button
                type="button"
                className="btn-action-send-fb"
                onClick={handleOpenMessenger}
              >
                <MessageCircle size={18} />
                <span>ส่งแชทเฟส</span>
                <ExternalLink size={14} className="send-ext-icon" />
              </button>

              <button
                type="button"
                className="btn-action-pay-web"
                onClick={() => setIsCheckoutOpen(true)}
              >
                <CreditCard size={18} />
                <span>ชำระเงินผ่านเว็บ</span>
              </button>
            </div>

          </div>

          {copiedHint && (
            <div className="copy-hint-pill animate-fade-in">
              ✨ คัดลอกรายละเอียดคำสั่งซื้อให้อัตโนมัติแล้ว! สามารถกด "วาง (Paste)" ส่งให้แอดมินในแชทได้ทันที
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      <BorderCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedItems={selectedList}
        materials={materials}
        shippingConfig={shippingConfig}
        paymentConfig={paymentConfig}
        onCompleteOrder={async (orderData) => {
          if (onSaveOrder) {
            const saved = await onSaveOrder(orderData);
            setSelectedMap({});
            return saved;
          }
        }}
      />

    </div>
  );
}

export default CustomBordersPage;
