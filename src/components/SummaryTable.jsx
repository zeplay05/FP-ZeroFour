import React, { useState } from 'react';
import { Search, CheckCircle, Clock, Copy, Phone, User, Check, X, Filter } from 'lucide-react';
import { formatBookingTime } from '../utils/timeUtils';

export function SummaryTable({
  numbers,
  pricePerNumber,
  onTogglePaid,
  onEditNumber,
  roundName
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('booked'); // 'booked', 'available', 'paid', 'all'
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Statistics
  const total = 100;
  const bookedList = numbers.filter(n => n.status === 'booked');
  const paidList = numbers.filter(n => n.status === 'paid');
  const availableList = numbers.filter(n => n.status === 'available');

  const totalCollected = paidList.length * pricePerNumber;
  const totalPending = bookedList.length * pricePerNumber;
  const totalExpected = (paidList.length + bookedList.length) * pricePerNumber;

  // Filtered ledger rows
  const displayRows = numbers.filter(n => {
    // Type filter
    if (filterType === 'available' && n.status !== 'available') return false;
    if (filterType === 'booked' && n.status !== 'booked') return false;
    if (filterType === 'paid' && n.status !== 'paid') return false;
    if (filterType === 'taken' && n.status === 'available') return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchNum = n.number.includes(q);
      const matchName = (n.customerName || '').toLowerCase().includes(q);
      const matchPhone = (n.customerPhone || '').includes(q);
      const matchNote = (n.note || '').toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchNote;
    }
    return true;
  });

  const handleCopyLedger = () => {
    const taken = numbers.filter(n => n.status !== 'available');
    let text = `📋 บันทึกรายชื่อคนจอง (${roundName})\n`;
    text += `ยอดรวมจองแล้ว ${taken.length}/100 เบอร์ | ชำระแล้ว ${paidList.length} | รอชำระ ${bookedList.length}\n`;
    text += `--------------------------------\n`;
    taken.forEach(item => {
      const payStatus = item.status === 'paid' ? 'โอนแล้ว' : 'รอชำระ';
      text += `เบอร์ ${item.number}: ${item.customerName || 'ไม่ระบุชื่อ'} [${payStatus}] ${item.customerPhone ? `(${item.customerPhone})` : ''}\n`;
    });
    text += `--------------------------------\n`;
    text += `เหลือเบอร์ว่าง ${availableList.length} เบอร์`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="summary-table-section">
      
      {/* Top Stat Counters */}
      <div className="summary-stats-cards">
        <div className="stat-card stat-available">
          <div className="stat-value">{availableList.length}</div>
          <div className="stat-label">🟢 เบอร์ที่ยังว่าง (ยังไม่ออก)</div>
          <div className="stat-sub">ลูกค้ายังเลือกได้</div>
        </div>

        <div className="stat-card stat-booked">
          <div className="stat-value">{bookedList.length}</div>
          <div className="stat-label">🟡 ติดจอง (รอชำระเงิน)</div>
          <div className="stat-sub">ค้างชำระ: {totalPending.toLocaleString()} ฿</div>
        </div>

        <div className="stat-card stat-paid">
          <div className="stat-value">{paidList.length}</div>
          <div className="stat-label">🔵 ชำระเงินเรียบร้อย</div>
          <div className="stat-sub">รับเงินแล้ว: {totalCollected.toLocaleString()} ฿</div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-value">{totalExpected.toLocaleString()} ฿</div>
          <div className="stat-label">💰 ยอดเงินรวมทั้งสิ้น</div>
          <div className="stat-sub">จาก 100 เบอร์ ({((paidList.length + bookedList.length) / 100 * 100).toFixed(0)}% เต็ม)</div>
        </div>
      </div>

      {/* Available Numbers Quick Preview Bar */}
      <div className="available-numbers-pill-box">
        <div className="pill-box-header">
          <span className="pill-title">🔥 รายการเบอร์ที่ยังว่างอยู่ ({availableList.length} เบอร์):</span>
          <span className="pill-hint">กดคลิกที่เบอร์บนกระดานด้านบนเพื่อจองได้ทันที</span>
        </div>
        <div className="available-pill-list">
          {availableList.length === 0 ? (
            <div className="empty-pill-text">🎉 เต็มทุกเบอร์แล้ว! ยินดีด้วยครับ/ค่ะ</div>
          ) : (
            availableList.map(n => (
              <span
                key={n.number}
                className="available-num-tag"
                onClick={() => onEditNumber(n)}
                title={`คลิกเพื่อจองเบอร์ ${n.number}`}
              >
                {n.number}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Table & Ledger Controls */}
      <div className="ledger-card">
        <div className="ledger-header">
          <div className="ledger-title-group">
            <h3>สมุดจดรายชื่อผู้จอง (Ledger)</h3>
            <span className="ledger-count">แสดง {displayRows.length} รายการ</span>
          </div>

          <div className="ledger-header-actions">
            <button
              type="button"
              className="btn btn-outline-copy"
              onClick={handleCopyLedger}
            >
              {copiedNotice ? <Check size={16} /> : <Copy size={16} />}
              {copiedNotice ? 'คัดลอกรายชื่อแล้ว!' : 'คัดลอกรายชื่อทั้งหมด'}
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="ledger-filters-bar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="ค้นหาตามเบอร์, ชื่อลูกค้า, เบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ledger-search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'booked' ? 'active' : ''}`}
              onClick={() => setFilterType('booked')}
            >
              รอชำระ ({bookedList.length})
            </button>
            <button
              className={`filter-tab ${filterType === 'paid' ? 'active' : ''}`}
              onClick={() => setFilterType('paid')}
            >
              ชำระแล้ว ({paidList.length})
            </button>
            <button
              className={`filter-tab ${filterType === 'taken' ? 'active' : ''}`}
              onClick={() => setFilterType('taken')}
            >
              จองทั้งหมด ({bookedList.length + paidList.length})
            </button>
            <button
              className={`filter-tab ${filterType === 'available' ? 'active' : ''}`}
              onClick={() => setFilterType('available')}
            >
              เบอร์ว่าง ({availableList.length})
            </button>
            <button
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              ทั้งหมด (100)
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-responsive">
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>เบอร์</th>
                <th>ชื่อผู้จอง</th>
                <th>เบอร์ติดต่อ / LINE</th>
                <th>สถานะชำระ</th>
                <th>เวลาที่จอง</th>
                <th>หมายเหตุ</th>
                <th style={{ width: '120px' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted">
                    ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                displayRows.map((item) => {
                  const isAvailable = item.status === 'available';
                  const isPaid = item.status === 'paid';

                  return (
                    <tr
                      key={item.number}
                      className={`table-row-status-${item.status}`}
                    >
                      <td>
                        <span className="ledger-num-badge">{item.number}</span>
                      </td>
                      <td>
                        {isAvailable ? (
                          <span className="text-available">-- เบอร์ว่าง --</span>
                        ) : (
                          <span className="customer-name-text">
                            <User size={14} className="inline-icon" /> {item.customerName || 'ไม่ระบุชื่อ'}
                          </span>
                        )}
                      </td>
                      <td>
                        {item.customerPhone ? (
                          <span className="customer-phone-text">
                            <Phone size={14} className="inline-icon" /> {item.customerPhone}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {isAvailable ? (
                          <span className="status-pill pill-available">ว่าง</span>
                        ) : isPaid ? (
                          <button
                            type="button"
                            className="status-toggle-btn pill-paid"
                            onClick={() => onTogglePaid(item.number)}
                            title="คลิกเพื่อเปลี่ยนกลับเป็นรอชำระ"
                          >
                            <CheckCircle size={14} /> ชำระแล้ว
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="status-toggle-btn pill-booked"
                            onClick={() => onTogglePaid(item.number)}
                            title="คลิกเพื่อเปลี่ยนเป็นชำระแล้วทันที"
                          >
                            <Clock size={14} /> รอชำระ (คลิกเพื่อติ๊กจ่าย)
                          </button>
                        )}
                      </td>
                      <td className="text-muted text-sm">
                        {formatBookingTime(item.bookedAt || item.createdAt) || '-'}
                      </td>
                      <td className="note-text">
                        {item.note || '-'}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => onEditNumber(item)}
                        >
                          {isAvailable ? 'จองเบอร์นี้' : 'แก้ไข'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
