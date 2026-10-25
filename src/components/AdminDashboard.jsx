import React, { useState } from 'react';
import { 
  Layers, 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  ExternalLink, 
  Check, 
  X, 
  Save, 
  UserCheck, 
  AlertCircle, 
  Video, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Lock,
  KeyRound,
  Music,
  MessageCircle
} from 'lucide-react';
import { AdminMusicTab } from './AdminMusicTab';
import { getBoardTypeInfo, BOARD_TYPES } from '../utils/lotteryData';

export function AdminDashboard({
  rounds,
  onUpdateRounds,
  storeCards,
  onUpdateStoreCards,
  onExitAdmin
}) {
  // Admin Password Gate (รหัสผ่านเข้าสู่ระบบหลังบ้าน)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('fp_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('boards'); // 'boards' | 'cards'
  
  // Selected board for booking management (1.1 กระดานที่จะระบุเบอร์ที่จอง)
  const [selectedBoardId, setSelectedBoardId] = useState(rounds[0]?.id || null);

  // Modal states for Board Create/Edit
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null); // null = new, object = edit

  // Modal states for Card Create/Edit
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Form states for Board Edit/Create
  const [boardForm, setBoardForm] = useState({
    title: '',
    description: '',
    pricePerNumber: 50,
    totalNumbers: 100,
    status: 'open', // 'open' | 'closed' | 'drawn'
    winningNumber: '',
    coverImage: '',
    boardType: 'duck' // 'duck' (วิ่งเป็ด) | 'wheel' (วงล้อ) | 'lotto' (ทายหวย)
  });

  // Form states for Booking (1.1 ระบุเบอร์ที่จอง)
  const [bookingForm, setBookingForm] = useState({
    facebookName: '',
    numbersInput: '',
    status: 'booked' // 'booked' (รอยอด) | 'paid' (จ่ายแล้ว)
  });

  // Form states for Card Edit/Create (2 การ์ด)
  const [cardForm, setCardForm] = useState({
    title: '',
    subtitle: '',
    grade: 'PCG 10',
    price: 1500,
    status: 'available', // 'available' (มีสินค้า) | 'sold' (ขายแล้ว)
    coverImage: '',
    detailImagesText: '', // newline or comma separated
    videoUrl: '',
    description: ''
  });

  // Seller Facebook / Messenger Chat Link
  const [sellerFbLink, setSellerFbLink] = useState(() => {
    const saved = localStorage.getItem('seller_fb_link');
    return (saved && saved !== 'https://m.me') ? saved : 'https://m.me/filmxrux.khrzx';
  });

  const handleSaveSellerFbLink = (e) => {
    e?.preventDefault();
    if (!sellerFbLink.trim()) {
      alert('กรุณากรอกลิงก์แชทเฟสบุ๊ค');
      return;
    }
    let formatted = sellerFbLink.trim();
    if (!formatted.startsWith('http')) {
      if (formatted.includes('facebook.com') || formatted.includes('m.me')) {
        formatted = 'https://' + formatted;
      } else {
        formatted = `https://m.me/${formatted}`;
      }
    }
    setSellerFbLink(formatted);
    localStorage.setItem('seller_fb_link', formatted);
    showNotice('บันทึกลิงก์แชทเฟสบุ๊คสำเร็จเรียบร้อยแล้ว!');
  };

  const [notification, setNotification] = useState('');

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Find currently selected board
  const selectedBoard = rounds.find(r => r.id === selectedBoardId) || rounds[0];

  // Helper to calculate board stats
  const getBoardStats = (board) => {
    if (!board || !board.numbers) return { total: 100, available: 100, booked: 0, paid: 0 };
    const total = board.numbers.length;
    const available = board.numbers.filter(n => n.status === 'available').length;
    const booked = board.numbers.filter(n => n.status === 'booked').length;
    const paid = board.numbers.filter(n => n.status === 'paid').length;
    return { total, available, booked, paid };
  };

  // =========================================================================
  // 1. BOARD ACTIONS (จัดการกระดาน)
  // =========================================================================
  const openNewBoardModal = () => {
    setEditingBoard(null);
    setBoardForm({
      title: '',
      description: '',
      pricePerNumber: 50,
      totalNumbers: 100,
      status: 'open',
      winningNumber: '',
      coverImage: '',
      boardType: 'duck'
    });
    setIsBoardModalOpen(true);
  };

  const openEditBoardModal = (board) => {
    setEditingBoard(board);
    setBoardForm({
      title: board.title || '',
      description: board.description || '',
      pricePerNumber: board.pricePerNumber || 50,
      totalNumbers: board.numbers ? board.numbers.length : 100,
      status: board.status || 'open',
      winningNumber: board.winningNumber || '',
      coverImage: board.coverImage || '',
      boardType: board.boardType || 'duck'
    });
    setIsBoardModalOpen(true);
  };

  const handleSaveBoard = (e) => {
    e.preventDefault();
    if (!boardForm.title.trim()) {
      alert('กรุณาระบุข้อความที่การ์ด / ชื่อกระดาน');
      return;
    }

    if (editingBoard) {
      // Update existing board
      const updated = rounds.map(r => {
        if (r.id === editingBoard.id) {
          return {
            ...r,
            title: boardForm.title.trim(),
            description: boardForm.description.trim(),
            pricePerNumber: Number(boardForm.pricePerNumber) || 50,
            status: boardForm.status,
            winningNumber: boardForm.winningNumber.trim(),
            coverImage: boardForm.coverImage.trim() || null,
            boardType: boardForm.boardType || 'duck'
          };
        }
        return r;
      });
      onUpdateRounds(updated);
      showNotice(`บันทึกการแก้ไขกระดาน "${boardForm.title}" สำเร็จ!`);
    } else {
      // Create new board with 00-99 numbers
      const totalCount = Math.max(10, Math.min(200, Number(boardForm.totalNumbers) || 100));
      const generatedNumbers = Array.from({ length: totalCount }, (_, i) => ({
        number: String(i).padStart(2, '0'),
        status: 'available',
        customerName: '',
        bookingId: ''
      }));

      const newBoard = {
        id: `board-${Date.now()}`,
        title: boardForm.title.trim(),
        description: boardForm.description.trim(),
        pricePerNumber: Number(boardForm.pricePerNumber) || 50,
        status: boardForm.status,
        winningNumber: boardForm.winningNumber.trim(),
        coverImage: boardForm.coverImage.trim() || null,
        boardType: boardForm.boardType || 'duck',
        gradient: 'indigo',
        theme: 'neon',
        createdAt: Date.now(),
        numbers: generatedNumbers,
        bookings: []
      };

      onUpdateRounds([newBoard, ...rounds]);
      setSelectedBoardId(newBoard.id);
      showNotice(`สร้างกระดานใหม่ "${boardForm.title}" เรียบร้อย!`);
    }

    setIsBoardModalOpen(false);
  };

  const handleDeleteBoard = (boardId, boardTitle) => {
    if (confirm(`คุณต้องการลบกระดาน "${boardTitle}" ใช่หรือไม่?`)) {
      const filtered = rounds.filter(r => r.id !== boardId);
      onUpdateRounds(filtered);
      if (selectedBoardId === boardId) {
        setSelectedBoardId(filtered[0]?.id || null);
      }
      showNotice(`ลบกระดาน "${boardTitle}" สำเร็จ`);
    }
  };

  // =========================================================================
  // 1.1 BOOKING ACTIONS (ระบุเบอร์ที่จอง & ลบล้างเลขที่เหลือโดยอัตโนมัติ)
  // =========================================================================
  const handleAddBooking = (e) => {
    e.preventDefault();
    if (!selectedBoard) return;

    const fbName = bookingForm.facebookName.trim();
    if (!fbName) {
      alert('กรุณากรอกชื่อเฟสของลูกค้า');
      return;
    }

    // Parse entered numbers: "05, 12 99" -> ["05", "12", "99"]
    const rawNums = bookingForm.numbersInput
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (rawNums.length === 0) {
      alert('กรุณากรอกตัวเลขที่ต้องการจอง (เช่น 05, 12, 99)');
      return;
    }

    // Format 2 digits
    const formattedNums = rawNums.map(n => n.padStart(2, '0'));

    // Check which numbers exist in this board
    const currentNumbers = [...selectedBoard.numbers];
    const validNums = [];
    const unavailableNums = [];

    formattedNums.forEach(num => {
      const found = currentNumbers.find(item => item.number === num);
      if (found) {
        if (found.status === 'available') {
          validNums.push(num);
        } else {
          unavailableNums.push(`${num} (${found.customerName || 'มีผู้จองแล้ว'})`);
        }
      } else {
        unavailableNums.push(`${num} (ไม่มีเลขนี้ในกระดาน)`);
      }
    });

    if (unavailableNums.length > 0) {
      alert(`ไม่สามารถจองเบอร์เหล่านี้ได้:\n- ${unavailableNums.join('\n- ')}\n\nโปรดตรวจสอบเลขว่างอีกครั้ง`);
      return;
    }

    const bookingId = `bk-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      customerName: fbName,
      numbers: validNums,
      status: bookingForm.status, // 'booked' หรือ 'paid'
      createdAt: Date.now()
    };

    // Update numbers list: mark validNums as booked/paid (ลบล้างออกจากเบอร์ว่างทันที!)
    const updatedNumbers = currentNumbers.map(item => {
      if (validNums.includes(item.number)) {
        return {
          ...item,
          status: bookingForm.status,
          customerName: fbName,
          bookingId: bookingId
        };
      }
      return item;
    });

    const updatedBookings = [newBooking, ...(selectedBoard.bookings || [])];

    const updatedRounds = rounds.map(r => {
      if (r.id === selectedBoard.id) {
        return {
          ...r,
          numbers: updatedNumbers,
          bookings: updatedBookings
        };
      }
      return r;
    });

    onUpdateRounds(updatedRounds);

    // Reset booking inputs
    setBookingForm({
      facebookName: '',
      numbersInput: '',
      status: 'booked'
    });

    showNotice(`บันทึกการจอง ${validNums.length} เบอร์ ให้คุณ "${fbName}" และหักลบเลขว่างเรียบร้อย!`);
  };

  // Toggle booking status between 'booked' (รอยอด) and 'paid' (จ่ายแล้ว)
  const handleToggleBookingStatus = (bookingId) => {
    if (!selectedBoard) return;
    const booking = (selectedBoard.bookings || []).find(b => b.id === bookingId);
    if (!booking) return;

    const nextStatus = booking.status === 'paid' ? 'booked' : 'paid';

    const updatedBookings = selectedBoard.bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: nextStatus };
      }
      return b;
    });

    const updatedNumbers = selectedBoard.numbers.map(n => {
      if (n.bookingId === bookingId) {
        return { ...n, status: nextStatus };
      }
      return n;
    });

    const updatedRounds = rounds.map(r => {
      if (r.id === selectedBoard.id) {
        return {
          ...r,
          bookings: updatedBookings,
          numbers: updatedNumbers
        };
      }
      return r;
    });

    onUpdateRounds(updatedRounds);
    showNotice(`เปลี่ยนสถานะเป็น "${nextStatus === 'paid' ? 'จ่ายแล้ว' : 'รอยอด'}" สำเร็จ`);
  };

  // Delete booking -> Releases numbers back to available pool
  const handleDeleteBooking = (bookingId, custName, numsCount) => {
    if (!selectedBoard) return;
    if (confirm(`ยกเลิกการจองของคุณ "${custName}" (${numsCount} เบอร์) และคืนเบอร์กลับเป็นเลขว่าง?`)) {
      const updatedBookings = (selectedBoard.bookings || []).filter(b => b.id !== bookingId);

      // Restore numbers to available
      const updatedNumbers = selectedBoard.numbers.map(n => {
        if (n.bookingId === bookingId) {
          return {
            ...n,
            status: 'available',
            customerName: '',
            bookingId: ''
          };
        }
        return n;
      });

      const updatedRounds = rounds.map(r => {
        if (r.id === selectedBoard.id) {
          return {
            ...r,
            bookings: updatedBookings,
            numbers: updatedNumbers
          };
        }
        return r;
      });

      onUpdateRounds(updatedRounds);
      showNotice(`ยกเลิกการจอง และคืนเบอร์ว่าง ${numsCount} เบอร์ เรียบร้อย!`);
    }
  };

  // Click on visual grid number to quick-fill booking form
  const handleNumberGridClick = (numItem) => {
    if (numItem.status !== 'available') return;
    const current = bookingForm.numbersInput
      .split(/[\s,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    let updated;
    if (current.includes(numItem.number)) {
      updated = current.filter(n => n !== numItem.number);
    } else {
      updated = [...current, numItem.number].sort();
    }
    setBookingForm(prev => ({ ...prev, numbersInput: updated.join(', ') }));
  };

  // =========================================================================
  // 2. CARD ACTIONS (จัดการการ์ด: รูปปก, รูปดีเทล, วีดีโอ, ราคา, สถานะ)
  // =========================================================================
  const openNewCardModal = () => {
    setEditingCard(null);
    setCardForm({
      title: '',
      subtitle: '',
      grade: 'PCG 10',
      price: 1500,
      status: 'available',
      coverImage: '',
      detailImagesText: '',
      videoUrl: '',
      description: ''
    });
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (card) => {
    setEditingCard(card);
    setCardForm({
      title: card.title || '',
      subtitle: card.subtitle || '',
      grade: card.grade || 'PCG 10',
      price: card.price || 1500,
      status: card.status || 'available',
      coverImage: card.coverImage || '',
      detailImagesText: (card.detailImages || []).join('\n'),
      videoUrl: card.videoUrl || '',
      description: card.description || ''
    });
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (!cardForm.title.trim()) {
      alert('กรุณากรอกชื่อการ์ด');
      return;
    }

    const detailImgs = cardForm.detailImagesText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (editingCard) {
      // Update existing
      const updated = storeCards.map(c => {
        if (c.id === editingCard.id) {
          return {
            ...c,
            title: cardForm.title.trim(),
            subtitle: cardForm.subtitle.trim(),
            grade: cardForm.grade.trim(),
            price: Number(cardForm.price) || 0,
            status: cardForm.status, // 'available' | 'sold'
            coverImage: cardForm.coverImage.trim() || '/graded-cards/pikachu_promo.png',
            detailImages: detailImgs.length > 0 ? detailImgs : [cardForm.coverImage.trim() || '/graded-cards/pikachu_promo.png'],
            videoUrl: cardForm.videoUrl.trim(),
            description: cardForm.description.trim()
          };
        }
        return c;
      });
      onUpdateStoreCards(updated);
      showNotice(`แก้ไขการ์ด "${cardForm.title}" สำเร็จ!`);
    } else {
      // Create new
      const newCard = {
        id: `store-card-${Date.now()}`,
        title: cardForm.title.trim(),
        subtitle: cardForm.subtitle.trim(),
        grade: cardForm.grade.trim(),
        price: Number(cardForm.price) || 0,
        status: cardForm.status,
        coverImage: cardForm.coverImage.trim() || '/graded-cards/pikachu_promo.png',
        detailImages: detailImgs.length > 0 ? detailImgs : [cardForm.coverImage.trim() || '/graded-cards/pikachu_promo.png'],
        videoUrl: cardForm.videoUrl.trim(),
        description: cardForm.description.trim(),
        cert: `10${Math.floor(100000 + Math.random() * 900000)}`
      };
      onUpdateStoreCards([newCard, ...storeCards]);
      showNotice(`เพิ่มการ์ดใหม่ "${cardForm.title}" สำเร็จ!`);
    }

    setIsCardModalOpen(false);
  };

  const handleDeleteCard = (cardId, cardTitle) => {
    if (confirm(`คุณต้องการลบการ์ด "${cardTitle}" ใช่หรือไม่?`)) {
      const filtered = storeCards.filter(c => c.id !== cardId);
      onUpdateStoreCards(filtered);
      showNotice(`ลบการ์ด "${cardTitle}" สำเร็จ!`);
    }
  };

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    const clean = passwordInput.trim();
    if (clean === 'As@02030454') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fp_admin_authenticated', 'true');
      setLoginError('');
      showNotice('เข้าสู่ระบบหลังบ้านสำเร็จ ยินดีต้อนรับ!');
    } else {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('fp_admin_authenticated');
    showNotice('ออกจากระบบหลังบ้านแล้ว');
  };

  // If not authenticated, display Admin Password Gate
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen-wrap animate-fade-in">
        <div className="admin-login-card">
          <div className="login-badge-circle">
            <span>FP</span>
          </div>
          <h2 className="login-card-title">เข้าสู่ระบบหลังบ้าน</h2>
          <p className="login-card-sub">FP Zerofour Admin Portal</p>
          <form onSubmit={handlePasswordLogin} className="admin-login-form">
            <div className="form-group">
              <label className="form-lbl">กรอกรหัสผ่านผู้ดูแลระบบ</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon-left" />
                <input
                  type="password"
                  className="form-input login-pwd-input"
                  placeholder="กรอกรหัสผ่าน"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="login-error-msg">
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}
            <button type="submit" className="btn-admin-login-submit">
              <KeyRound size={16} />
              <span>เข้าสู่ระบบหลังบ้าน</span>
            </button>

            <button
              type="button"
              className="btn-admin-login-back"
              onClick={onExitAdmin}
            >
              <ArrowLeft size={15} />
              <span>กลับสู่หน้าร้าน</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal-wrapper">
      
      {/* Toast Notification */}
      {notification && (
        <div className="admin-toast-notice animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="admin-top-navbar">
        <div className="admin-brand-left">
          <button
            type="button"
            className="brand-logo-btn"
            onClick={onExitAdmin}
            title="กลับไปที่หน้าหลักร้านค้า"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <span className="brand-logo-futuristic">FP ZEROFOUR</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'boards' ? 'active' : ''}`}
            onClick={() => setActiveTab('boards')}
          >
            <Layers size={17} />
            <span>1. จัดการกระดานจองเลข</span>
          </button>

          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            <CreditCard size={17} />
            <span>2. จัดการการ์ด</span>
          </button>

          <button
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            <Music size={17} />
            <span>3. จัดการเพลงพื้นหลัง</span>
          </button>
        </div>

        {/* Exit & Logout Buttons */}
        <div className="admin-actions-right">
          <button
            type="button"
            className="btn-admin-exit-shop"
            onClick={onExitAdmin}
            title="กลับไปที่หน้าหลักร้านค้า"
          >
            <ArrowLeft size={16} />
            <span>กลับสู่หน้าร้าน</span>
          </button>

          <button
            type="button"
            className="btn-admin-logout"
            onClick={handleLogout}
            title="ออกจากระบบหลังบ้าน"
          >
            <Lock size={15} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          TAB 1: จัดการกระดานจองเลข (Lottery Boards & Bookings)
          ========================================================================= */}
      {activeTab === 'boards' && (
        <main className="admin-main-container">
          
          <div className="admin-section-header">
            <div>
              <h2 className="admin-heading-2">จัดการกระดานจองเลข</h2>
              <p className="admin-heading-desc">
                ตั้งค่ารูปปก, ข้อความการ์ด, รายละเอียด, ราคา, สถานะ, เลขรางวัล และระบุเบอร์ที่ลูกค้าจอง
              </p>
            </div>
            <button
              type="button"
              className="btn-admin-primary"
              onClick={openNewBoardModal}
            >
              <Plus size={16} />
              <span>+ เพิ่มกระดานใหม่</span>
            </button>
          </div>

          {/* Admin Seller FB Messenger Settings Box */}
          <div className="admin-seller-fb-bar">
            <div className="seller-fb-bar-left">
              <div className="seller-fb-icon-wrap">
                <MessageCircle size={20} className="seller-fb-icon" />
              </div>
              <div className="seller-fb-text-wrap">
                <span className="seller-fb-label">ตั้งค่าลิงก์แชทเฟสบุ๊คผู้ขาย (Facebook Messenger Link):</span>
                <span className="seller-fb-subtext">
                  เมื่อลูกค้ากด "ส่งเข้าแชทเฟส" จากหน้าเลือกเบอร์ ระบบจะพาเปิดแชทนี้โดยตรง (ลูกค้าไม่สามารถแก้ไขได้)
                </span>
              </div>
            </div>

            <div className="seller-fb-bar-right">
              <div className="seller-fb-input-wrap">
                <input
                  type="text"
                  className="seller-fb-input"
                  value={sellerFbLink}
                  onChange={(e) => setSellerFbLink(e.target.value)}
                  placeholder="https://m.me/filmxrux.khrzx"
                />
              </div>
              <button
                type="button"
                className="btn-save-fb-link"
                onClick={handleSaveSellerFbLink}
                title="บันทึกลิงก์แชทเฟสบุ๊ค"
              >
                <Save size={15} />
                <span>บันทึกลิงก์</span>
              </button>
              <a
                href={sellerFbLink.startsWith('http') ? sellerFbLink : `https://m.me/${sellerFbLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-test-fb-link"
                title="ทดสอบเปิดแชทในแท็บใหม่"
              >
                <ExternalLink size={15} />
                <span>ทดสอบเปิด</span>
              </a>
            </div>
          </div>

          {/* Boards List Horizontal Carousel/Selector */}
          <div className="admin-boards-selector-row">
            {rounds.map(board => {
              const stats = getBoardStats(board);
              const isSelected = board.id === selectedBoardId;

              return (
                <div
                  key={board.id}
                  className={`admin-board-card-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedBoardId(board.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="chip-cover-thumb">
                    {board.coverImage ? (
                      <img src={board.coverImage} alt={board.title} />
                    ) : (
                      <div className="chip-slab-mock" />
                    )}
                  </div>
                  <div className="chip-info">
                    <h4 className="chip-title">{board.title}</h4>
                    <div className="chip-meta">
                      <span className="chip-price">{board.pricePerNumber || 50}฿/เบอร์</span>
                      <span className={`chip-status-tag ${board.status}`}>
                        {board.status === 'open' ? 'เปิดจอง' : board.status === 'drawn' ? 'ออกผลแล้ว' : 'ปิดจอง'}
                      </span>
                      <span className="chip-type-tag">
                        {getBoardTypeInfo(board.boardType).promoBadge}
                      </span>
                    </div>
                    <div className="chip-remain-row">
                      <span className="chip-remain">เหลือ {stats.available}/{stats.total} เบอร์</span>
                      <div className="chip-progress-track">
                        <div 
                          className="chip-progress-fill" 
                          style={{ width: `${Math.round((stats.available / (stats.total || 1)) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="chip-actions">
                    <button
                      type="button"
                      className="btn-icon-tiny edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditBoardModal(board);
                      }}
                      title="แก้ไขข้อมูลกระดาน"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-tiny delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(board.id, board.title);
                      }}
                      title="ลบกระดานนี้"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-Panel: 1.1 กระดานที่จะระบุเบอร์ที่จอง */}
          {selectedBoard && (
            <div className="admin-board-management-panel animate-fade-in">
              
              {/* Selected Board Summary Banner */}
              <div className="selected-board-banner">
                <div className="banner-left">
                  <span className="board-active-badge">
                    <Sparkles size={14} className="banner-badge-icon" />
                    <span>กำลังจัดการ:</span> <strong>{selectedBoard.title}</strong>
                  </span>
                  <span className="banner-stat">
                    ราคาเบอร์ละ <strong>{selectedBoard.pricePerNumber || 50} บาท</strong>
                  </span>
                  <span className="banner-stat">
                    สถานะ: <strong className={`status-${selectedBoard.status}`}>
                      {selectedBoard.status === 'open' ? 'เปิดให้บริการจอง' : 'ปิดให้บริการจอง'}
                    </strong>
                  </span>
                  {selectedBoard.winningNumber && (
                    <span className="banner-win-num">
                      🎉 เลขรางวัลที่ออก: <strong>{selectedBoard.winningNumber}</strong>
                    </span>
                  )}
                </div>
                <div className="banner-right">
                  <button
                    type="button"
                    className="btn-banner-edit"
                    onClick={() => openEditBoardModal(selectedBoard)}
                  >
                    <Edit3 size={14} />
                    <span>แก้ไขข้อมูลกระดาน</span>
                  </button>
                </div>
              </div>

              {/* Grid: Left = Form to Add Booking, Right = Visual 00-99 Grid */}
              <div className="admin-booking-split-grid">
                
                {/* Form 1.1: ระบุเบอร์ที่จอง */}
                <div className="admin-booking-box">
                  <h3 className="box-title">
                    <UserCheck size={18} className="title-icon" />
                    <span>1.1 ระบุเบอร์ที่จอง (บันทึกเข้าระบบ)</span>
                  </h3>
                  <p className="box-sub">
                    ใส่ชื่อเฟสและเบอร์ ระบบจะตัดยอดและลบล้างเลขว่างโดยอัตโนมัติทันที
                  </p>

                  <form onSubmit={handleAddBooking} className="admin-booking-form">
                    <div className="form-group">
                      <label className="form-lbl">ชื่อเฟสลูกค้า <span className="req">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="เช่น สมชาย ใจดี / Mewie FP"
                        value={bookingForm.facebookName}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, facebookName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-lbl">
                        เลขที่จอง <span className="req">*</span> 
                        <span className="lbl-hint">(คั่นด้วยจุลภาค เช่น 05, 12, 99 หรือคลิกเลือกที่ตารางขวา)</span>
                      </label>
                      <input
                        type="text"
                        className="form-input numbers-input"
                        placeholder="เช่น 05, 12, 99"
                        value={bookingForm.numbersInput}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, numbersInput: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-lbl">สถานะการชำระเงิน</label>
                      <div className="status-radio-group">
                        <label className={`radio-pill ${bookingForm.status === 'booked' ? 'active-booked' : ''}`}>
                          <input
                            type="radio"
                            name="bookingStatus"
                            value="booked"
                            checked={bookingForm.status === 'booked'}
                            onChange={() => setBookingForm(prev => ({ ...prev, status: 'booked' }))}
                          />
                          <Clock size={14} />
                          <span>รอยอด (ยังไม่ชำระ)</span>
                        </label>

                        <label className={`radio-pill ${bookingForm.status === 'paid' ? 'active-paid' : ''}`}>
                          <input
                            type="radio"
                            name="bookingStatus"
                            value="paid"
                            checked={bookingForm.status === 'paid'}
                            onChange={() => setBookingForm(prev => ({ ...prev, status: 'paid' }))}
                          />
                          <CheckCircle2 size={14} />
                          <span>จ่ายแล้ว (ชำระแล้ว)</span>
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="btn-submit-booking">
                      <Check size={16} />
                      <span>บันทึกการจอง & หักลบเลขว่างทันที</span>
                    </button>
                  </form>

                  {/* Summary of Bookings Table */}
                  <div className="bookings-summary-table-section">
                    <h4 className="table-heading-title">
                      รายการผู้จองในกระดานนี้ ({(selectedBoard.bookings || []).length} รายการ)
                    </h4>

                    {(!selectedBoard.bookings || selectedBoard.bookings.length === 0) ? (
                      <div className="empty-bookings-box">
                        ยังไม่มีรายการจองในกระดานนี้ สามารถระบุเบอร์ที่ช่องด้านบนได้ทันที
                      </div>
                    ) : (
                      <div className="admin-table-container">
                        <table className="admin-data-table">
                          <thead>
                            <tr>
                              <th>ชื่อเฟส</th>
                              <th>เลขที่จอง</th>
                              <th>ยอดเงิน</th>
                              <th>สถานะ</th>
                              <th>จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBoard.bookings.map(b => (
                              <tr key={b.id}>
                                <td className="td-name">{b.customerName}</td>
                                <td className="td-nums">
                                  <div className="nums-tags-wrap">
                                    {b.numbers.map(num => (
                                      <span key={num} className="mini-num-tag">{num}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="td-amount">
                                  {(b.numbers.length * (selectedBoard.pricePerNumber || 50)).toLocaleString()} ฿
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className={`btn-table-status ${b.status}`}
                                    onClick={() => handleToggleBookingStatus(b.id)}
                                    title="คลิกเพื่อสลับ รอยอด / จ่ายแล้ว"
                                  >
                                    {b.status === 'paid' ? '✅ จ่ายแล้ว' : '⏳ รอยอด'}
                                  </button>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-table-del"
                                    onClick={() => handleDeleteBooking(b.id, b.customerName, b.numbers.length)}
                                    title="ยกเลิกการจองและคืนเบอร์ว่าง"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Number Grid (ตารางตัวเลข 00-99 สำหรับคลิกเลือก / ตรวจสอบ) */}
                <div className="admin-visual-grid-box">
                  <div className="visual-grid-header">
                    <h3 className="box-title">ตารางเลข 00-99 (คลิกเลขว่างเพื่อเลือก)</h3>
                    <div className="grid-legend">
                      <span className="legend-item"><span className="legend-dot available" /> ว่าง ({getBoardStats(selectedBoard).available})</span>
                      <span className="legend-item"><span className="legend-dot booked" /> รอยอด ({getBoardStats(selectedBoard).booked})</span>
                      <span className="legend-item"><span className="legend-dot paid" /> จ่ายแล้ว ({getBoardStats(selectedBoard).paid})</span>
                    </div>
                  </div>

                  <div className="interactive-numbers-grid">
                    {(selectedBoard.numbers || []).map(item => {
                      const isWinning = Boolean(selectedBoard.winningNumber) && String(selectedBoard.winningNumber).padStart(2, '0') === item.number;
                      return (
                        <button
                          key={item.number}
                          type="button"
                          className={`interactive-num-btn ${item.status} ${isWinning ? 'winning' : ''}`}
                          onClick={() => handleNumberGridClick(item)}
                          disabled={item.status !== 'available'}
                          title={
                            isWinning 
                              ? `🎉 เลข ${item.number} (เลขรางวัลที่ออก!)` 
                              : item.status === 'available' 
                                ? `เลข ${item.number} (ว่าง) - คลิกเพื่อเลือก` 
                                : `เลข ${item.number} (${item.customerName || item.status})`
                          }
                        >
                          <span className="num-text">{item.number}</span>
                          {isWinning && <span className="win-crown-icon">👑</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      )}

      {/* =========================================================================
          TAB 2: จัดการการ์ด (Cards Store & Showcase Catalog)
          ========================================================================= */}
      {activeTab === 'cards' && (
        <main className="admin-main-container">
          
          <div className="admin-section-header">
            <div>
              <h2 className="admin-heading-2">จัดการการ์ด</h2>
              <p className="admin-heading-desc">
                ตั้งค่ารูปปก, รูปดีเทลย่อย, วีดีโอ, ราคา, สถานะ (มีสินค้า / ขายแล้ว) สำหรับหน้าแสดงผลงานการ์ด
              </p>
            </div>
            <button
              type="button"
              className="btn-admin-primary"
              onClick={openNewCardModal}
            >
              <Plus size={16} />
              <span>+ เพิ่มการ์ดใหม่</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="admin-cards-catalog-grid">
            {storeCards.map(card => (
              <div key={card.id} className="admin-card-item-box">
                <div className="admin-card-thumb-wrap">
                  <img src={card.coverImage} alt={card.title} className="admin-card-img" />
                  <span className={`admin-card-status-badge ${card.status}`}>
                    {card.status === 'available' ? 'มีสินค้า' : 'ขายแล้ว'}
                  </span>
                  <span className="admin-card-grade-badge">{card.grade || 'PCG 10'}</span>
                </div>

                <div className="admin-card-info-col">
                  <h3 className="admin-card-title">{card.title}</h3>
                  <span className="admin-card-sub">{card.subtitle}</span>
                  <div className="admin-card-price-row">
                    <span className="price-label">ราคา:</span>
                    <span className="price-val">{Number(card.price || 0).toLocaleString()} ฿</span>
                  </div>

                  <div className="admin-card-meta-chips">
                    <span className="meta-chip">
                      <ImageIcon size={12} />
                      <span>{card.detailImages ? card.detailImages.length : 1} รูปดีเทล</span>
                    </span>
                    {card.videoUrl && (
                      <span className="meta-chip video">
                        <Video size={12} />
                        <span>มีวีดีโอ</span>
                      </span>
                    )}
                  </div>

                  <div className="admin-card-actions-row">
                    <button
                      type="button"
                      className="btn-card-edit"
                      onClick={() => openEditCardModal(card)}
                    >
                      <Edit3 size={14} />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      type="button"
                      className="btn-card-del"
                      onClick={() => handleDeleteCard(card.id, card.title)}
                    >
                      <Trash2 size={14} />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      )}

      {/* =========================================================================
          TAB 3: จัดการเพลงพื้นหลัง (Background Music)
          ========================================================================= */}
      {activeTab === 'music' && (
        <main className="admin-main-container">
          <AdminMusicTab />
        </main>
      )}

      {/* =========================================================================
          MODAL: สร้าง / แก้ไขข้อมูลกระดาน (Board Modal)
          ========================================================================= */}
      {isBoardModalOpen && (
        <div className="admin-modal-backdrop animate-fade-in" onClick={() => setIsBoardModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingBoard ? `แก้ไขข้อมูลกระดาน: ${editingBoard.title}` : 'เพิ่มกระดานจองเลขใหม่'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsBoardModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBoard} className="admin-modal-form">
              
              {/* Board Type & Discount Promotion Options */}
              <div className="form-group">
                <label className="form-lbl">ประเภทกระดาน (เลือกโปรโมชั่นส่วนลด) <span className="req">*</span></label>
                <div className="board-type-radio-options">
                  <label className={`board-type-opt ${boardForm.boardType === 'duck' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="boardType"
                      value="duck"
                      checked={boardForm.boardType === 'duck'}
                      onChange={(e) => setBoardForm(prev => ({ ...prev, boardType: e.target.value }))}
                    />
                    <div className="board-type-info-wrap">
                      <div className="type-head">
                        <span className="type-icon">🦆</span>
                        <span className="type-title">1. วิ่งเป็ด</span>
                      </div>
                      <span className="type-badge-pill">3 เบอร์ ลด 10</span>
                    </div>
                  </label>

                  <label className={`board-type-opt ${boardForm.boardType === 'wheel' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="boardType"
                      value="wheel"
                      checked={boardForm.boardType === 'wheel'}
                      onChange={(e) => setBoardForm(prev => ({ ...prev, boardType: e.target.value }))}
                    />
                    <div className="board-type-info-wrap">
                      <div className="type-head">
                        <span className="type-icon">🎡</span>
                        <span className="type-title">2. วงล้อ</span>
                      </div>
                      <span className="type-badge-pill">3 เบอร์ ลด 10</span>
                    </div>
                  </label>

                  <label className={`board-type-opt ${boardForm.boardType === 'lotto' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="boardType"
                      value="lotto"
                      checked={boardForm.boardType === 'lotto'}
                      onChange={(e) => setBoardForm(prev => ({ ...prev, boardType: e.target.value }))}
                    />
                    <div className="board-type-info-wrap">
                      <div className="type-head">
                        <span className="type-icon">🎟️</span>
                        <span className="type-title">3. ทายหวย</span>
                      </div>
                      <span className="type-badge-pill">4 เบอร์ ลด 10 / 8 เบอร์ ลด 20</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">ข้อความที่การ์ด / ชื่อกระดาน <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น รางวัลเลขท้าย PSA 10 (ตัวอย่าง)"
                  value={boardForm.title}
                  onChange={(e) => setBoardForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">เพิ่มรูป (URL รูปภาพ หรือปล่อยว่างเพื่อใช้สไตล์ Slab โทนม่วง)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น /graded-cards/pikachu_promo.png หรือลิงก์รูปภาพ"
                  value={boardForm.coverImage}
                  onChange={(e) => setBoardForm(prev => ({ ...prev, coverImage: e.target.value }))}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-lbl">ราคาต่อเบอร์ (บาท) <span className="req">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="เช่น 50, 75, 100"
                    value={boardForm.pricePerNumber}
                    onChange={(e) => setBoardForm(prev => ({ ...prev, pricePerNumber: e.target.value }))}
                    required
                  />
                </div>

                {!editingBoard && (
                  <div className="form-group">
                    <label className="form-lbl">จำนวนเลขทั้งหมด (เบอร์)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="100"
                      value={boardForm.totalNumbers}
                      onChange={(e) => setBoardForm(prev => ({ ...prev, totalNumbers: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-lbl">สถานะกระดาน</label>
                  <select
                    className="form-input"
                    value={boardForm.status}
                    onChange={(e) => setBoardForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="open">เปิดจอง</option>
                    <option value="closed">ปิดจอง (ปิดให้บริการ)</option>
                    <option value="drawn">ออกรางวัลแล้ว</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-lbl">เลขรางวัลที่ออก (ถ้ามี)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="เช่น 42, 94"
                    value={boardForm.winningNumber}
                    onChange={(e) => setBoardForm(prev => ({ ...prev, winningNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">รายละเอียดด้านใน / กติกา</label>
                <textarea
                  className="form-input textarea"
                  rows="3"
                  placeholder="รายละเอียดรางวัล สภาพการ์ด การจัดส่ง และกติกาการออกรางวัล..."
                  value={boardForm.description}
                  onChange={(e) => setBoardForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsBoardModalOpen(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-modal-save">
                  <Save size={16} />
                  <span>บันทึกข้อมูลกระดาน</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: สร้าง / แก้ไขข้อมูลการ์ด (Card Modal)
          ========================================================================= */}
      {isCardModalOpen && (
        <div className="admin-modal-backdrop animate-fade-in" onClick={() => setIsCardModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="modal-title">
                {editingCard ? `แก้ไขข้อมูลการ์ด: ${editingCard.title}` : 'เพิ่มการ์ดใหม่'}
              </h3>
              <button type="button" className="btn-modal-close" onClick={() => setIsCardModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="admin-modal-form">
              
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-lbl">ชื่อการ์ด <span className="req">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="เช่น Pikachu Promo"
                    value={cardForm.title}
                    onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-lbl">ชุด / ข้อมูลการ์ด</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="เช่น Pokémon JPN 2025"
                    value={cardForm.subtitle}
                    onChange={(e) => setCardForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">รูปปก (URL รูปภาพหลัก) <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น /graded-cards/pikachu_promo.png หรือลิงก์รูป"
                  value={cardForm.coverImage}
                  onChange={(e) => setCardForm(prev => ({ ...prev, coverImage: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">
                  รูปดีเทลยิบย่อย (รูปภาพเพิ่มเติมหลายๆ มุม)
                  <span className="lbl-hint">(ใส่ลิงก์รูปภาพ คั่นด้วยการขึ้นบรรทัดใหม่ หรือจุลภาค)</span>
                </label>
                <textarea
                  className="form-input textarea"
                  rows="3"
                  placeholder="เช่น:&#10;/graded-cards/pikachu_promo.png&#10;https://example.com/back.jpg"
                  value={cardForm.detailImagesText}
                  onChange={(e) => setCardForm(prev => ({ ...prev, detailImagesText: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-lbl">วีดีโอ (URL ไฟล์วีดีโอ mp4 หรือ YouTube)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น https://www.youtube.com/watch?v=... หรือลิงก์ mp4"
                  value={cardForm.videoUrl}
                  onChange={(e) => setCardForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-lbl">ราคา (บาท) <span className="req">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="เช่น 2900"
                    value={cardForm.price}
                    onChange={(e) => setCardForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-lbl">เกรด</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="เช่น PCG 10, PCG 10+, PSA 10"
                    value={cardForm.grade}
                    onChange={(e) => setCardForm(prev => ({ ...prev, grade: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">สถานะสินค้า</label>
                <div className="status-radio-group">
                  <label className={`radio-pill ${cardForm.status === 'available' ? 'active-avail' : ''}`}>
                    <input
                      type="radio"
                      name="cardStatus"
                      value="available"
                      checked={cardForm.status === 'available'}
                      onChange={() => setCardForm(prev => ({ ...prev, status: 'available' }))}
                    />
                    <span>มีสินค้า (พร้อมส่ง)</span>
                  </label>

                  <label className={`radio-pill ${cardForm.status === 'sold' ? 'active-sold' : ''}`}>
                    <input
                      type="radio"
                      name="cardStatus"
                      value="sold"
                      checked={cardForm.status === 'sold'}
                      onChange={() => setCardForm(prev => ({ ...prev, status: 'sold' }))}
                    />
                    <span>ขายแล้ว</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-lbl">รายละเอียดการ์ด</label>
                <textarea
                  className="form-input textarea"
                  rows="2"
                  placeholder="รายละเอียดสภาพการ์ด และเงื่อนไขการส่ง..."
                  value={cardForm.description}
                  onChange={(e) => setCardForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsCardModalOpen(false)}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-modal-save">
                  <Save size={16} />
                  <span>บันทึกข้อมูลการ์ด</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
