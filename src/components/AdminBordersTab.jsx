import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Layers, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle2, 
  Clock, 
  Truck, 
  DollarSign, 
  ExternalLink, 
  Eye, 
  X, 
  Search, 
  FileText, 
  Upload, 
  TrendingUp, 
  Award,
  AlertCircle
} from 'lucide-react';
import { CASE_TYPES } from '../utils/customBordersData';
import { formatThaiDateTime } from '../utils/timeUtils';

export function AdminBordersTab({
  borders = [],
  materials = [],
  shippingConfig = { fee: 80, freeThreshold: 10 },
  orders = [],
  onUpdateBorders,
  onUpdateMaterials,
  onUpdateShipping,
  onUpdateOrders
}) {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'products' | 'materials'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [previewSlipImage, setPreviewSlipImage] = useState(null);

  // Border Product Form (Add / Edit)
  const [isEditingBorder, setIsEditingBorder] = useState(false);
  const [borderForm, setBorderForm] = useState({
    id: '',
    code: '',
    name: '',
    caseType: 'PSA',
    category: 'One Piece',
    image: '',
    description: ''
  });

  // Materials Form State
  const [editingMaterials, setEditingMaterials] = useState(materials);
  const [editingShipping, setEditingShipping] = useState(shippingConfig);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // 1. STATS CALCULATIONS
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.finalTotal || 0), 0);
  }, [orders]);

  const paidRevenue = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid' || o.status === 'shipped')
      .reduce((acc, o) => acc + (o.finalTotal || 0), 0);
  }, [orders]);

  const pendingRevenue = useMemo(() => {
    return orders
      .filter(o => o.status === 'pending_verification')
      .reduce((acc, o) => acc + (o.finalTotal || 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending_verification').length;
  }, [orders]);

  // 2. BEST SELLERS SUMMARY ("สรุปตัวไหนขายดี")
  const bestSellers = useMemo(() => {
    const map = {};
    orders.forEach(order => {
      (order.items || []).forEach(it => {
        const id = it.borderId || it.code || it.name;
        if (!map[id]) {
          map[id] = {
            id,
            code: it.code || '-',
            name: it.name || 'ไม่ระบุชื่อ',
            caseType: it.caseType || 'PSA',
            image: it.image || '/graded-cards/pikachu_promo.png',
            soldCount: 0,
            totalRevenue: 0
          };
        }
        const qty = it.quantity || 1;
        map[id].soldCount += qty;
        map[id].totalRevenue += (it.unitPrice || 140) * qty;
      });
    });

    return Object.values(map).sort((a, b) => b.soldCount - a.soldCount);
  }, [orders]);

  // 3. FILTERED ORDERS
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = orderSearchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        o.orderCode?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerContact?.toLowerCase().includes(q) ||
        o.shippingAddress?.toLowerCase().includes(q);

      const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // ORDER ACTIONS
  const handleApproveSlip = (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'paid', approvedAt: Date.now() };
      }
      return o;
    });
    if (onUpdateOrders) onUpdateOrders(updated);
  };

  const handleMarkShipped = (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: 'shipped', shippedAt: Date.now() };
      }
      return o;
    });
    if (onUpdateOrders) onUpdateOrders(updated);
  };

  const handleDeleteOrder = (orderId) => {
    if (!window.confirm('คุณต้องการลบรายการสั่งซื้อนี้ใช่หรือไม่?')) return;
    const updated = orders.filter(o => o.id !== orderId);
    if (onUpdateOrders) onUpdateOrders(updated);
  };

  // PRODUCT ACTIONS
  const handleOpenAddBorder = () => {
    const nextSeq = borders.length + 1;
    setBorderForm({
      id: `border-${Date.now()}`,
      code: `FP-B${String(nextSeq).padStart(2, '0')}`,
      name: '',
      caseType: 'PSA',
      category: 'One Piece',
      image: '/graded-cards/luffy_tarou.png',
      description: ''
    });
    setIsEditingBorder(true);
  };

  const handleOpenEditBorder = (b) => {
    setBorderForm({ ...b });
    setIsEditingBorder(true);
  };

  const handleSaveBorderForm = (e) => {
    e.preventDefault();
    if (!borderForm.code.trim() || !borderForm.name.trim()) {
      alert('กรุณากรอกรหัสและชื่อลายขอบการ์ดให้ครบถ้วน');
      return;
    }

    const exists = borders.find(b => b.id === borderForm.id);
    let updated = [];
    if (exists) {
      updated = borders.map(b => b.id === borderForm.id ? { ...borderForm } : b);
    } else {
      updated = [
        ...borders,
        {
          ...borderForm,
          createdAt: Date.now()
        }
      ];
    }

    if (onUpdateBorders) onUpdateBorders(updated);
    setIsEditingBorder(false);
  };

  const handleDeleteBorder = (borderId) => {
    if (!window.confirm('คุณต้องการลบลายขอบการ์ดนี้ใช่หรือไม่?')) return;
    const updated = borders.filter(b => b.id !== borderId);
    if (onUpdateBorders) onUpdateBorders(updated);
  };

  // Upload border image helper
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBorderForm(prev => ({ ...prev, image: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // SAVE MATERIALS & SHIPPING SETTINGS
  const handleSaveMaterialsAndShipping = () => {
    if (onUpdateMaterials) onUpdateMaterials(editingMaterials);
    if (onUpdateShipping) onUpdateShipping(editingShipping);
    setSaveSuccessMsg('บันทึกการตั้งค่าวัสดุและค่าจัดส่งเรียบร้อยแล้ว!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleAddMaterial = () => {
    const newId = `mat-${Date.now()}`;
    setEditingMaterials(prev => [
      ...prev,
      { id: newId, name: 'วัสดุใหม่', price: 170 }
    ]);
  };

  const handleRemoveMaterial = (id) => {
    if (editingMaterials.length <= 1) {
      alert('ต้องมีประเภทวัสดุอย่างน้อย 1 ประเภทครับ');
      return;
    }
    setEditingMaterials(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="admin-borders-tab-container animate-fade-in">
      
      {/* Sub Navigation Bar */}
      <div className="admin-subnav-bar">
        <div className="subnav-left">
          <button
            type="button"
            className={`admin-subtab-btn ${activeSubTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('orders')}
          >
            <ShoppingBag size={16} />
            <span>รายการออเดอร์ขอบการ์ด ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="subtab-badge-pulse">{pendingOrdersCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-subtab-btn ${activeSubTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('products')}
          >
            <Layers size={16} />
            <span>จัดการลายขอบการ์ด ({borders.length})</span>
          </button>

          <button
            type="button"
            className={`admin-subtab-btn ${activeSubTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('materials')}
          >
            <Settings size={16} />
            <span>ตั้งค่าวัสดุ & ค่าจัดส่ง</span>
          </button>
        </div>

        {activeSubTab === 'products' && (
          <button
            type="button"
            className="btn-admin-add-border"
            onClick={handleOpenAddBorder}
          >
            <Plus size={16} />
            <span>เพิ่มขอบใหม่</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          SUB-TAB 1: ORDERS & BEST SELLERS
          ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="orders-management-section">
          
          {/* Top 4 Stats Cards */}
          <div className="admin-orders-stats-grid">
            <div className="orders-stat-card card-cyan">
              <div className="stat-card-header">
                <span className="stat-title">ยอดขายรวมทั้งหมด</span>
                <DollarSign size={20} className="text-cyan" />
              </div>
              <strong className="stat-value">{totalRevenue.toLocaleString()} ฿</strong>
              <span className="stat-sub">จากคำสั่งซื้อทั้งหมด {orders.length} รายการ</span>
            </div>

            <div className="orders-stat-card card-emerald">
              <div className="stat-card-header">
                <span className="stat-title">รับชำระแล้ว (อนุมัติสลิป)</span>
                <CheckCircle2 size={20} className="text-emerald" />
              </div>
              <strong className="stat-value text-emerald">{paidRevenue.toLocaleString()} ฿</strong>
              <span className="stat-sub">
                {orders.filter(o => o.status === 'paid' || o.status === 'shipped').length} ออเดอร์
              </span>
            </div>

            <div className="orders-stat-card card-gold">
              <div className="stat-card-header">
                <span className="stat-title">รอยอดตรวจสอบสลิป</span>
                <Clock size={20} className="text-gold" />
              </div>
              <strong className="stat-value text-gold">{pendingRevenue.toLocaleString()} ฿</strong>
              <span className="stat-sub">{pendingOrdersCount} ออเดอร์รอแอดมินตรวจ</span>
            </div>

            <div className="orders-stat-card card-purple">
              <div className="stat-card-header">
                <span className="stat-title">จำนวนชิ้นที่ขายออก</span>
                <TrendingUp size={20} className="text-purple" />
              </div>
              <strong className="stat-value">
                {orders.reduce((acc, o) => acc + (o.totalItems || 0), 0)} ชิ้น
              </strong>
              <span className="stat-sub">จัดส่งฟรี 10 ชิ้นขึ้นไป</span>
            </div>
          </div>

          {/* BEST SELLERS LEADERBOARD ("สรุปตัวไหนขายดี") */}
          <div className="best-sellers-leaderboard-box">
            <div className="leaderboard-header">
              <div className="leaderboard-title-group">
                <Award size={18} className="text-gold" />
                <h3 className="leaderboard-title">สรุปขอบการ์ดตัวไหนขายดี (Best-Selling Rankings)</h3>
              </div>
              <span className="leaderboard-sub-info">เรียงตามจำนวนชิ้นที่ลูกค้าสั่งซื้อมากที่สุด</span>
            </div>

            {bestSellers.length > 0 ? (
              <div className="best-sellers-scroll-row">
                {bestSellers.map((item, index) => (
                  <div key={item.id} className="best-seller-chip-card">
                    <div className="rank-badge-pill">#{index + 1}</div>
                    <img src={item.image} alt={item.name} className="best-seller-thumb" />
                    <div className="best-seller-info">
                      <span className="best-seller-code font-mono">{item.code} ({item.caseType})</span>
                      <strong className="best-seller-name">{item.name}</strong>
                      <div className="best-seller-metrics">
                        <span className="sold-count-badge">ขายได้ {item.soldCount} ชิ้น</span>
                        <span className="sold-revenue-badge">{item.totalRevenue.toLocaleString()} ฿</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="leaderboard-empty-state">
                <span>ยังไม่มีข้อมูลยอดขายขอบการ์ด เมื่อมีลูกค้าสั่งซื้อจะสรุปอันดับตัวขายดีที่นี่</span>
              </div>
            )}
          </div>

          {/* Orders Filter Toolbar */}
          <div className="admin-orders-toolbar">
            <div className="orders-search-input-wrap">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="ค้นหาชื่อลูกค้า, รหัสออเดอร์ FP-xxxx, เบอร์โทร..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="admin-orders-search"
              />
            </div>

            <div className="orders-status-filter-pills">
              <button
                type="button"
                className={`filter-pill ${orderStatusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setOrderStatusFilter('ALL')}
              >
                ทั้งหมด ({orders.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${orderStatusFilter === 'pending_verification' ? 'active' : ''}`}
                onClick={() => setOrderStatusFilter('pending_verification')}
              >
                ⏳ รอตรวจสอบ ({orders.filter(o => o.status === 'pending_verification').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${orderStatusFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setOrderStatusFilter('paid')}
              >
                ✅ จ่ายแล้ว ({orders.filter(o => o.status === 'paid').length})
              </button>
              <button
                type="button"
                className={`filter-pill ${orderStatusFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setOrderStatusFilter('shipped')}
              >
                📦 จัดส่งแล้ว ({orders.filter(o => o.status === 'shipped').length})
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>รหัสออเดอร์</th>
                  <th>วันเวลา</th>
                  <th>ลูกค้า / ผู้สั่งซื้อ</th>
                  <th>ที่อยู่จัดส่งพัสดุ</th>
                  <th>รายการขอบการ์ด</th>
                  <th>ยอดรวม</th>
                  <th>สลิปโอน</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const isPaid = order.status === 'paid';
                  const isShipped = order.status === 'shipped';
                  const isPending = order.status === 'pending_verification';

                  return (
                    <tr key={order.id} className={`order-row ${isPending ? 'is-pending-row' : ''}`}>
                      <td className="font-mono font-bold text-gold">
                        {order.orderCode || 'FP-0001'}
                      </td>
                      <td className="text-xs text-muted">
                        {order.createdAt ? formatThaiDateTime(order.createdAt) : '-'}
                      </td>
                      <td>
                        <div className="customer-cell-wrap">
                          <strong className="text-cyan">{order.customerName}</strong>
                          <span className="text-xs text-muted">{order.customerContact}</span>
                        </div>
                      </td>
                      <td className="address-cell">
                        <span className="address-text">{order.shippingAddress || '-'}</span>
                      </td>
                      <td className="items-summary-cell">
                        <div className="order-items-mini-pills">
                          {(order.items || []).map((it, idx) => (
                            <span key={idx} className="item-order-pill">
                              {it.code} ({it.materialName}) x{it.quantity}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="font-bold text-gold whitespace-nowrap">
                        {(order.finalTotal || 0).toLocaleString()} ฿
                        {order.shippingFee === 0 && (
                          <span className="free-ship-tag">ส่งฟรี</span>
                        )}
                      </td>
                      <td>
                        {order.slipImage ? (
                          <button
                            type="button"
                            className="btn-view-slip-chip"
                            onClick={() => setPreviewSlipImage({
                              image: order.slipImage,
                              customer: order.customerName,
                              code: order.orderCode,
                              amount: order.finalTotal
                            })}
                          >
                            <Eye size={13} /> ดูสลิป
                            {isPending && <span className="slip-pending-dot" />}
                          </button>
                        ) : (
                          <span className="text-muted text-xs">ไม่มีสลิป</span>
                        )}
                      </td>
                      <td>
                        <span className={`order-status-badge ${order.status}`}>
                          {isPending && '⏳ รอตรวจสอบสลิป'}
                          {isPaid && '✅ ชำระแล้ว'}
                          {isShipped && '📦 จัดส่งแล้ว'}
                        </span>
                      </td>
                      <td>
                        <div className="order-actions-cell">
                          {isPending && (
                            <button
                              type="button"
                              className="btn-order-action approve"
                              title="อนุมัติสลิป & เปลี่ยนเป็นจ่ายแล้ว"
                              onClick={() => handleApproveSlip(order.id)}
                            >
                              <CheckCircle2 size={14} /> อนุมัติ
                            </button>
                          )}
                          {isPaid && (
                            <button
                              type="button"
                              className="btn-order-action ship"
                              title="เปลี่ยนเป็นจัดส่งแล้ว"
                              onClick={() => handleMarkShipped(order.id)}
                            >
                              <Truck size={14} /> ส่งแล้ว
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-order-action delete"
                            title="ลบออเดอร์"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="table-empty-row">
                      ไม่พบรายการคำสั่งซื้อตามที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: PRODUCTS CATALOG (จัดการลายขอบการ์ด)
          ========================================================================= */}
      {activeSubTab === 'products' && (
        <div className="products-management-section">
          
          <div className="admin-borders-grid">
            {borders.map(border => (
              <div key={border.id} className="admin-border-item-card">
                <div className="card-top-action-bar">
                  <span className="badge-case-type">{border.caseType}</span>
                  <span className="badge-product-code font-mono">{border.code}</span>
                  <div className="card-right-btn-group">
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={() => handleOpenEditBorder(border)}
                      title="แก้ไขลายนี้"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-card-delete"
                      onClick={() => handleDeleteBorder(border.id)}
                      title="ลบลายนี้"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="admin-border-thumb-wrap">
                  <img src={border.image} alt={border.name} className="admin-border-thumb" />
                </div>

                <div className="admin-border-meta">
                  <strong className="admin-border-name">{border.name}</strong>
                  <span className="admin-border-category text-muted text-xs">{border.category}</span>
                  {border.description && (
                    <p className="admin-border-desc text-muted text-xs">{border.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: MATERIALS & SHIPPING SETTINGS (ตั้งค่าประเภท วัสดุ ค่าจัดส่ง)
          ========================================================================= */}
      {activeSubTab === 'materials' && (
        <div className="materials-settings-section">
          
          {saveSuccessMsg && (
            <div className="settings-success-alert animate-fade-in">
              <CheckCircle2 size={16} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* 1. Materials & Pricing */}
          <div className="admin-settings-card-panel">
            <div className="panel-header-with-action">
              <div>
                <h3 className="panel-title">ตั้งค่าประเภทวัสดุและราคา (Materials & Pricing)</h3>
                <p className="panel-sub">
                  กำหนดราคาตามประเภทวัสดุขอบการ์ด เช่น กระดาษด้าน, กระดาษมันวาว, โฮโลแกรม
                </p>
              </div>
              <button
                type="button"
                className="btn-add-material-row"
                onClick={handleAddMaterial}
              >
                <Plus size={14} /> เพิ่มประเภทวัสดุใหม่
              </button>
            </div>

            <div className="materials-rows-list">
              {editingMaterials.map((mat, idx) => (
                <div key={mat.id || idx} className="material-setting-row">
                  <div className="mat-field-group flex-1">
                    <label className="mat-field-lbl">ชื่อประเภทวัสดุ:</label>
                    <input
                      type="text"
                      className="mat-input-field"
                      value={mat.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingMaterials(prev => prev.map((m, i) => i === idx ? { ...m, name: val } : m));
                      }}
                      placeholder="เช่น กระดาษด้าน"
                    />
                  </div>

                  <div className="mat-field-group price-field">
                    <label className="mat-field-lbl">ราคาต่อชิ้น (บาท):</label>
                    <input
                      type="number"
                      min={0}
                      className="mat-input-field font-mono font-bold"
                      value={mat.price}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setEditingMaterials(prev => prev.map((m, i) => i === idx ? { ...m, price: val } : m));
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-delete-mat-row"
                    onClick={() => handleRemoveMaterial(mat.id)}
                    title="ลบประเภทนี้"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Shipping Configuration */}
          <div className="admin-settings-card-panel">
            <h3 className="panel-title">ตั้งค่าค่าจัดส่งและโปรส่งฟรี (Shipping Settings)</h3>
            <p className="panel-sub">
              กำหนดอัตราค่าส่งพัสดุ และเงื่อนไขการส่งฟรีเมื่อลูกค้าสั่งครบตามจำนวนที่กำหนด
            </p>

            <div className="shipping-fields-grid">
              <div className="shipping-field-box">
                <label className="shipping-field-lbl">ค่าจัดส่งปกติ (บาท):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min={0}
                    className="mat-input-field font-mono"
                    value={editingShipping.fee}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setEditingShipping(prev => ({ ...prev, fee: val }));
                    }}
                  />
                  <span className="unit-label">บาท</span>
                </div>
                <span className="field-hint-txt">ค่าจัดส่งเมื่อสั่งซื้อน้อยกว่าเงื่อนไขส่งฟรี (ปกติ 80 บาท)</span>
              </div>

              <div className="shipping-field-box">
                <label className="shipping-field-lbl">จำนวนชิ้นที่ส่งฟรี (ชิ้น):</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min={1}
                    className="mat-input-field font-mono"
                    value={editingShipping.freeThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 10;
                      setEditingShipping(prev => ({ ...prev, freeThreshold: val }));
                    }}
                  />
                  <span className="unit-label">ชิ้นขึ้นไป</span>
                </div>
                <span className="field-hint-txt">เมื่อลูกค้าสั่งครบจำนวนนี้ จะคำนวณค่าส่งเป็น 0 บาททันที</span>
              </div>
            </div>
          </div>

          {/* Save Settings Action Button */}
          <div className="settings-footer-actions">
            <button
              type="button"
              className="btn-save-materials-settings"
              onClick={handleSaveMaterialsAndShipping}
            >
              <Check size={16} /> บันทึกการตั้งค่าทั้งหมด
            </button>
          </div>

        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT BORDER PRODUCT
          ========================================================================= */}
      {isEditingBorder && (
        <div className="admin-modal-backdrop animate-fade-in" onClick={() => setIsEditingBorder(false)}>
          <div className="admin-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{borders.some(b => b.id === borderForm.id) ? 'แก้ไขลายขอบการ์ด' : 'เพิ่มลายขอบการ์ดใหม่'}</h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsEditingBorder(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBorderForm} className="admin-border-form">
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-lbl">รหัสสินค้า (เช่น FP-B01) <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={borderForm.code}
                    onChange={(e) => setBorderForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="FP-B01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-lbl">ประเภทเคสการ์ดเกรด <span className="text-rose-400">*</span></label>
                  <select
                    className="form-input"
                    value={borderForm.caseType}
                    onChange={(e) => setBorderForm(prev => ({ ...prev, caseType: e.target.value }))}
                  >
                    {CASE_TYPES.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">ชื่อลายขอบการ์ด <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={borderForm.name}
                  onChange={(e) => setBorderForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="เช่น ลูฟี่ เกียร์ 5 ซันก็อด"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">หมวดหมู่ / เรื่อง</label>
                <input
                  type="text"
                  className="form-input"
                  value={borderForm.category}
                  onChange={(e) => setBorderForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="เช่น One Piece, Pokemon, Dragon Ball"
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">รูปภาพตัวอย่างลายขอบ</label>
                <div className="image-input-options">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={borderForm.image}
                    onChange={(e) => setBorderForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="URL รูปภาพ เช่น /graded-cards/luffy_tarou.png"
                  />
                  <label className="btn-upload-file-label">
                    <Upload size={14} /> อัปโหลดไฟล์
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden-file-input"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {borderForm.image && (
                  <div className="image-preview-box">
                    <img src={borderForm.image} alt="Preview" className="thumb-preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-lbl">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                <textarea
                  rows={2}
                  className="form-input"
                  value={borderForm.description}
                  onChange={(e) => setBorderForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ระบุจุดเด่น เช่น ลายเรืองแสงนีออน ขอบเงินประกาย ฯลฯ"
                />
              </div>

              <div className="form-actions-footer">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => setIsEditingBorder(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn-form-submit"
                >
                  <Check size={16} /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW SLIP FULL IMAGE
          ========================================================================= */}
      {previewSlipImage && (
        <div className="slip-viewer-backdrop animate-fade-in" onClick={() => setPreviewSlipImage(null)}>
          <div className="slip-viewer-card" onClick={(e) => e.stopPropagation()}>
            <div className="slip-viewer-header">
              <div>
                <h3 className="slip-viewer-title">🧾 ตรวจสอบสลิปสั่งทำขอบการ์ด</h3>
                <span className="slip-board-sub">
                  ออเดอร์: {previewSlipImage.code} | ลูกค้า: {previewSlipImage.customer} | ยอด: {previewSlipImage.amount?.toLocaleString()} บาท
                </span>
              </div>
              <button
                type="button"
                className="btn-slip-close"
                onClick={() => setPreviewSlipImage(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="slip-viewer-body single-col">
              <div className="slip-full-image-wrap">
                <img src={previewSlipImage.image} alt="Slip" className="slip-full-image" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminBordersTab;
