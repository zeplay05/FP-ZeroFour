import React, { useState, useMemo, useEffect } from 'react';
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
  MessageCircle,
  Table as TableIcon,
  LayoutGrid,
  Search,
  Filter,
  CheckCircle,
  TrendingUp,
  Package,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Database,
  FileText
} from 'lucide-react';
import { AdminMusicTab } from './AdminMusicTab';
import { getBoardTypeInfo, BOARD_TYPES } from '../utils/lotteryData';
import { 
  isSupabaseConfigured, 
  syncRoundsWithSupabase, 
  syncStoreCardsWithSupabase, 
  saveSettingToSupabase,
  deleteRoundFromSupabase
} from '../utils/supabaseClient';

// Compress and convert selected file to base64 Data URL (optimizes size for localStorage & fast loading)
function processImageFile(file, maxWidth = 720, quality = 0.72) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (canvasErr) {
          console.warn('Canvas compression error, using raw data url', canvasErr);
          resolve(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Helper to calculate page numbers list (max 5 buttons)
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }
  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
}

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

  const [activeTab, setActiveTab] = useState('boards'); // 'boards' | 'cards' | 'music'
  
  // View mode states: 'table' (List รายการตาราง) | 'cards' (มุมมองการ์ด)
  const [boardViewMode, setBoardViewMode] = useState('table');
  const [cardViewMode, setCardViewMode] = useState('table');

  // Selected board for booking management (1.1 กระดานที่จะระบุเบอร์ที่จอง - null เพื่อแสดงเฉพาะตาราง)
  const [selectedBoardId, setSelectedBoardId] = useState(null);

  // Search & Filter states for Boards
  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [boardStatusFilter, setBoardStatusFilter] = useState('all'); // 'all' | 'open' | 'closed' | 'drawn'

  // Search & Filter states for Cards
  const [cardSearchQuery, setCardSearchQuery] = useState('');
  const [cardStatusFilter, setCardStatusFilter] = useState('all'); // 'all' | 'available' | 'sold'

  // Pagination states
  const [boardPage, setBoardPage] = useState(1);
  const [boardPageSize, setBoardPageSize] = useState(8);

  const [cardPage, setCardPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(8);

  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);

  // Reset page to 1 when filters or active selection changes
  useEffect(() => {
    setBoardPage(1);
  }, [boardSearchQuery, boardStatusFilter]);

  useEffect(() => {
    setCardPage(1);
  }, [cardSearchQuery, cardStatusFilter]);

  useEffect(() => {
    setBookingPage(1);
  }, [selectedBoardId]);

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
    if (isSupabaseConfigured()) {
      saveSettingToSupabase('seller_fb_link', formatted).catch(console.error);
    }
    showNotice('บันทึกลิงก์แชทเฟสบุ๊คสำเร็จเรียบร้อยแล้ว!');
  };

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleManualCloudSync = async () => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseModalOpen(true);
      return;
    }
    try {
      setIsSyncingCloud(true);
      const [roundsOk, cardsOk, fbOk] = await Promise.all([
        syncRoundsWithSupabase(rounds),
        syncStoreCardsWithSupabase(storeCards),
        saveSettingToSupabase('seller_fb_link', sellerFbLink)
      ]);
      if (roundsOk && cardsOk) {
        showNotice('ซิงค์ข้อมูลกระดานและการ์ดทั้งหมดขึ้น Supabase เรียบร้อยแล้ว!');
      } else {
        showNotice('ซิงค์ข้อมูลเรียบร้อย (บางรายการบันทึกแล้ว)');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการซิงค์: ' + err.message);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const [notification, setNotification] = useState('');

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Find currently selected board (null = อยู่หน้ารายการตาราง)
  const selectedBoard = selectedBoardId ? rounds.find(r => r.id === selectedBoardId) : null;
  const isCurrentBoardDrawn = selectedBoard?.status === 'drawn';
  const isCurrentBoardClosed = selectedBoard?.status === 'closed' || isCurrentBoardDrawn;

  // Helper to calculate board stats
  const getBoardStats = (board) => {
    if (!board || !board.numbers) return { total: 100, available: 100, booked: 0, paid: 0 };
    const total = board.numbers.length;
    const available = board.numbers.filter(n => n.status === 'available').length;
    const booked = board.numbers.filter(n => n.status === 'booked').length;
    const paid = board.numbers.filter(n => n.status === 'paid').length;
    return { total, available, booked, paid };
  };

  // Filtered boards for List Table / Cards view
  const filteredBoards = useMemo(() => {
    return rounds.filter(b => {
      const q = boardSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q));
      const matchesStatus = boardStatusFilter === 'all' || b.status === boardStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rounds, boardSearchQuery, boardStatusFilter]);

  // Overall boards KPI stats
  const totalBoards = rounds.length;
  const openBoards = rounds.filter(r => r.status === 'open').length;
  const drawnBoards = rounds.filter(r => r.status === 'drawn').length;
  const totalBookedNumbersCount = rounds.reduce((sum, r) => {
    const s = getBoardStats(r);
    return sum + (s.booked + s.paid);
  }, 0);

  // Filtered cards for List Table / Grid view
  const filteredCards = useMemo(() => {
    return storeCards.filter(c => {
      const q = cardSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        (c.grade && c.grade.toLowerCase().includes(q)) ||
        (c.cert && c.cert.toLowerCase().includes(q));
      const matchesStatus = cardStatusFilter === 'all' || c.status === cardStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [storeCards, cardSearchQuery, cardStatusFilter]);

  // Overall cards KPI stats
  const totalCards = storeCards.length;
  const availableCards = storeCards.filter(c => c.status === 'available').length;
  const soldCards = storeCards.filter(c => c.status === 'sold').length;
  const totalCardsInventoryValue = storeCards.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

  // Boards Pagination calculations
  const totalBoardPages = Math.max(1, Math.ceil(filteredBoards.length / boardPageSize));
  const safeBoardPage = Math.min(boardPage, totalBoardPages);
  const paginatedBoards = useMemo(() => {
    const start = (safeBoardPage - 1) * boardPageSize;
    return filteredBoards.slice(start, start + boardPageSize);
  }, [filteredBoards, safeBoardPage, boardPageSize]);

  // Cards Pagination calculations
  const totalCardPages = Math.max(1, Math.ceil(filteredCards.length / cardPageSize));
  const safeCardPage = Math.min(cardPage, totalCardPages);
  const paginatedCards = useMemo(() => {
    const start = (safeCardPage - 1) * cardPageSize;
    return filteredCards.slice(start, start + cardPageSize);
  }, [filteredCards, safeCardPage, cardPageSize]);

  // Bookings Pagination calculations (in selected board)
  const currentBoardBookings = selectedBoard?.bookings || [];
  const totalBookingPages = Math.max(1, Math.ceil(currentBoardBookings.length / bookingPageSize));
  const safeBookingPage = Math.min(bookingPage, totalBookingPages);
  const paginatedBookings = useMemo(() => {
    const start = (safeBookingPage - 1) * bookingPageSize;
    return currentBoardBookings.slice(start, start + bookingPageSize);
  }, [currentBoardBookings, safeBookingPage, bookingPageSize]);

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
    if (board.status === 'drawn') {
      showNotice('กระดานนี้ออกผลรางวัลแล้ว ไม่สามารถแก้ไขได้');
      return;
    }
    setEditingBoard(board);
    setBoardForm({
      title: board.title || '',
      description: board.description || '',
      pricePerNumber: board.pricePerNumber || 50,
      totalNumbers: board.numbers ? board.numbers.length : 100,
      status: board.status || 'open',
      winningNumber: board.winningNumber || '',
      coverImage: board.coverImage || board.image || '',
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

    const finalCover = (boardForm.coverImage && typeof boardForm.coverImage === 'string') 
      ? boardForm.coverImage.trim() 
      : (boardForm.coverImage || null);

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
            coverImage: finalCover,
            image: finalCover,
            boardType: boardForm.boardType || 'duck'
          };
        }
        return r;
      });
      onUpdateRounds(updated);
      showNotice(`บันทึกการแก้ไขกระดาน "${boardForm.title}" สำเร็จ!`);
    } else {
      // Create new board with numbers (01 for duck/wheel, 00 for lotto)
      const isDuckOrWheel = boardForm.boardType === 'duck' || boardForm.boardType === 'wheel';
      const startFrom = isDuckOrWheel ? 1 : 0;
      const totalCount = Math.max(5, Math.min(200, Number(boardForm.totalNumbers) || (isDuckOrWheel ? 30 : 100)));
      const generatedNumbers = Array.from({ length: totalCount }, (_, i) => ({
        number: String(startFrom + i).padStart(2, '0'),
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
        coverImage: finalCover,
        image: finalCover,
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

  const handleDeleteBoard = async (boardId, boardTitle) => {
    if (confirm(`คุณต้องการลบกระดาน "${boardTitle}" ใช่หรือไม่?`)) {
      if (isSupabaseConfigured()) {
        await deleteRoundFromSupabase(boardId).catch(console.error);
      }
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
    if (selectedBoard.status === 'drawn') {
      alert('กระดานนี้ออกผลรางวัลแล้ว ไม่สามารถเพิ่มหรือแก้ไขข้อมูลการจองได้');
      return;
    }

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
      facebookName: fbName,
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
          facebookName: fbName,
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
    if (!selectedBoard || selectedBoard.status === 'drawn') return;
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
    if (!selectedBoard || selectedBoard.status === 'drawn') return;
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
    if (!selectedBoard || selectedBoard.status === 'drawn') return;
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

  // Image Upload Handlers (เลือกจากเครื่อง หรือมือถือ)
  const handleBoardFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await processImageFile(file);
      if (base64) {
        setBoardForm(prev => ({ ...prev, coverImage: base64 }));
        showNotice('เลือกรูปภาพกระดานจากเครื่องสำเร็จ!');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ');
    }
    e.target.value = '';
  };

  const handleCardCoverFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await processImageFile(file);
      if (base64) {
        setCardForm(prev => ({ ...prev, coverImage: base64 }));
        showNotice('เลือกรูปภาพการ์ดจากเครื่องสำเร็จ!');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ');
    }
    e.target.value = '';
  };

  const handleCardDetailFilesSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const promises = files.map(f => processImageFile(f));
      const base64List = await Promise.all(promises);
      const valid = base64List.filter(Boolean);
      if (valid.length > 0) {
        const existing = cardForm.detailImagesText.trim();
        const combined = existing ? `${existing}\n${valid.join('\n')}` : valid.join('\n');
        setCardForm(prev => ({ ...prev, detailImagesText: combined }));
        showNotice(`เลือกรูปเพิ่มเติม ${valid.length} รูปสำเร็จ!`);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ');
    }
    e.target.value = '';
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
            <img src="/logo-icon.jpg" alt="FP Zerofour" className="login-badge-logo-img" />
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
        <div className="admin-navbar-main-row">
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

          {/* Exit & Logout Buttons */}
          <div className="admin-actions-right">
            {/* Supabase Cloud Connection & Sync Status */}
            {isSupabaseConfigured() ? (
              <button
                type="button"
                className="btn-supabase-status connected"
                onClick={handleManualCloudSync}
                disabled={isSyncingCloud}
                title="เชื่อมต่อ Supabase สำเร็จ (กดเพื่อบังคับซิงค์ข้อมูลทั้งหมดขึ้น Cloud)"
              >
                <Database size={15} />
                <span>{isSyncingCloud ? 'กำลังซิงค์...' : 'Supabase Cloud'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-supabase-status offline"
                onClick={() => setIsSupabaseModalOpen(true)}
                title="กดเพื่อดูวิธีตั้งค่าเชื่อมต่อ Supabase ฟรี"
              >
                <Database size={15} />
                <span>ใช้ Supabase</span>
              </button>
            )}

            <button
              type="button"
              className="btn-admin-exit-shop"
              onClick={onExitAdmin}
              title="กลับไปที่หน้าหลักร้านค้า"
            >
              <ArrowLeft size={16} />
              <span>หน้าร้าน</span>
            </button>

            <button
              type="button"
              className="btn-admin-logout"
              onClick={handleLogout}
              title="ออกจากระบบหลังบ้าน"
            >
              <Lock size={15} />
              <span>ออก</span>
            </button>
          </div>
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
      </header>

      {/* =========================================================================
          TAB 1: จัดการกระดานจองเลข (Lottery Boards & Bookings)
          ========================================================================= */}
      {activeTab === 'boards' && (
        <main className="admin-main-container">
          {!selectedBoard ? (
            /* ========================================================
               VIEW A: มีเเค่ตารางรายการกระดานเท่านั้น (Boards Table List View)
               ======================================================== */
            <div className="admin-boards-main-view animate-fade-in">
              <div className="admin-section-header">
                <div>
                  <h2 className="admin-heading-2">จัดการกระดานจองเลข</h2>
                  <p className="admin-heading-desc">
                    คลิกที่แถวกระดานหรือกดปุ่ม "🎯 จัดการเบอร์" เพื่อเข้าไประบุเบอร์ที่ลูกค้าจอง ตรวจสอบตาราง 00-99 และสรุปยอด
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

          {/* KPI Summary Cards Bar */}
          <div className="admin-stats-kpi-grid">
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap purple">
                <Layers size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">กระดานทั้งหมด</span>
                <span className="kpi-val">{totalBoards} <small>กระดาน</small></span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap green">
                <CheckCircle2 size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">เปิดรับจองอยู่</span>
                <span className="kpi-val text-green">{openBoards} <small>กระดาน</small></span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap amber">
                <UserCheck size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">เบอร์ที่จองแล้วรวม</span>
                <span className="kpi-val text-amber">{totalBookedNumbersCount} <small>เบอร์</small></span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap cyan">
                <Sparkles size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">ออกรางวัลแล้ว</span>
                <span className="kpi-val text-cyan">{drawnBoards} <small>กระดาน</small></span>
              </div>
            </div>
          </div>

          {/* Search, Filter & View Mode Toolbar */}
          <div className="admin-toolbar-row">
            <div className="admin-search-filter-wrap">
              <div className="admin-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="ค้นหากระดาน..."
                  value={boardSearchQuery}
                  onChange={(e) => setBoardSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
                {boardSearchQuery && (
                  <button type="button" className="btn-clear-search" onClick={() => setBoardSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="admin-filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${boardStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setBoardStatusFilter('all')}
                >
                  ทั้งหมด ({rounds.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${boardStatusFilter === 'open' ? 'active' : ''}`}
                  onClick={() => setBoardStatusFilter('open')}
                >
                  🟢 เปิดจอง ({openBoards})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${boardStatusFilter === 'closed' ? 'active' : ''}`}
                  onClick={() => setBoardStatusFilter('closed')}
                >
                  🔴 ปิดจอง ({rounds.filter(r => r.status === 'closed').length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${boardStatusFilter === 'drawn' ? 'active' : ''}`}
                  onClick={() => setBoardStatusFilter('drawn')}
                >
                  🟣 ออกผลแล้ว ({drawnBoards})
                </button>
              </div>
            </div>

            <div className="admin-view-switcher">
              <button
                type="button"
                className={`btn-view-toggle ${boardViewMode === 'table' ? 'active' : ''}`}
                onClick={() => setBoardViewMode('table')}
                title="มุมมองตารางรายการ (List Table)"
              >
                <TableIcon size={15} />
                <span>ตารางรายการ</span>
              </button>
              <button
                type="button"
                className={`btn-view-toggle ${boardViewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setBoardViewMode('cards')}
                title="มุมมองการ์ด (Grid)"
              >
                <LayoutGrid size={15} />
                <span>การ์ด</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: List Table View (ตารางรายการกระดาน - ค่าเริ่มต้น) */}
          {boardViewMode === 'table' && (
            <div className="admin-table-card animate-fade-in">
              <div className="admin-table-container">
                <table className="admin-list-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>รูปปก</th>
                      <th>ชื่อกระดาน / รายละเอียด</th>
                      <th>ราคา/เบอร์</th>
                      <th>สถานะ</th>
                      <th>เบอร์ว่าง / ความคืบหน้า</th>
                      <th>เลขรางวัล</th>
                      <th style={{ width: '190px', textAlign: 'center' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBoards.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-table-cell">
                          ไม่พบกระดานที่ตรงกับเงื่อนไขการค้นหา
                        </td>
                      </tr>
                    ) : (
                      paginatedBoards.map(board => {
                        const stats = getBoardStats(board);
                        const isSelected = board.id === selectedBoardId;
                        const typeInfo = getBoardTypeInfo(board.boardType);
                        const isBoardDrawn = board.status === 'drawn';
                        const isBoardClosed = board.status === 'closed';

                        return (
                          <tr 
                            key={board.id} 
                            className="admin-table-row"
                            onClick={() => setSelectedBoardId(board.id)}
                            title={isBoardDrawn ? "คลิกเพื่อดูข้อมูลกระดานนี้ (โหมดดูข้อมูล)" : "คลิกเพื่อเข้าหน้าจัดการเบอร์และบันทึกยอดของกระดานนี้"}
                          >
                            {/* 1. Cover Thumbnail */}
                            <td className="td-thumb">
                              <div className="table-thumb-wrap">
                                {board.coverImage ? (
                                  <img src={board.coverImage} alt={board.title} />
                                ) : (
                                  <div className="table-slab-placeholder">
                                    <span>FP</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 2. Board Title & Description */}
                            <td className="td-title-info">
                              <div className="table-title-wrap">
                                <div className="title-top-row">
                                  <span className="table-item-title">{board.title}</span>
                                  {isSelected && (
                                    <span className="active-selected-tag">
                                      <CheckCircle size={12} />
                                      <span>{isBoardClosed ? 'กำลังดูข้อมูล' : 'กำลังจัดการ'}</span>
                                    </span>
                                  )}
                                </div>
                                {board.description && (
                                  <p className="table-item-desc">{board.description}</p>
                                )}
                              </div>
                            </td>

                            {/* 4. Price */}
                            <td className="td-price">
                              <span className="table-price-badge">{board.pricePerNumber || 50} ฿</span>
                            </td>

                            {/* 5. Status */}
                            <td className="td-status">
                              <span className={`chip-status-tag ${board.status}`}>
                                {board.status === 'open' ? '🟢 เปิดจอง' : board.status === 'drawn' ? '🟣 ออกผลแล้ว' : '🔴 ปิดจอง'}
                              </span>
                            </td>

                            {/* 6. Remaining Numbers & Progress */}
                            <td className="td-progress">
                              <div className="table-progress-box">
                                <div className="progress-labels">
                                  <span className="remain-txt">ว่าง <strong>{stats.available}</strong>/{stats.total}</span>
                                  <span className="percent-txt">{Math.round((stats.available / (stats.total || 1)) * 100)}%</span>
                                </div>
                                <div className="table-progress-track">
                                  <div 
                                    className="table-progress-bar"
                                    style={{ width: `${Math.round((stats.available / (stats.total || 1)) * 100)}%` }}
                                  />
                                </div>
                                <span className="booked-txt">จองแล้ว {stats.booked + stats.paid} เบอร์</span>
                              </div>
                            </td>

                            {/* 7. Winning Number */}
                            <td className="td-win">
                              {board.winningNumber ? (
                                <span className="table-win-badge">
                                  👑 {board.winningNumber}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>

                            {/* 8. Actions */}
                            <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                              <div className="table-actions-group">
                                <button
                                  type="button"
                                  className={`btn-table-action ${isBoardDrawn ? 'view-mode' : 'select'}`}
                                  onClick={() => setSelectedBoardId(board.id)}
                                  title={isBoardDrawn ? "คลิกเพื่อดูข้อมูลกระดานนี้ (โหมดดูข้อมูล)" : "คลิกเพื่อเข้าหน้าจัดการเบอร์และบันทึกยอดของกระดานนี้"}
                                >
                                  {isBoardDrawn ? (
                                    <>
                                      <Eye size={13} />
                                      <span>ดูข้อมูล</span>
                                    </>
                                  ) : (
                                    <span>🎯 จัดการเบอร์</span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className={`btn-table-action edit ${isBoardDrawn ? 'disabled' : ''}`}
                                  disabled={isBoardDrawn}
                                  onClick={() => !isBoardDrawn && openEditBoardModal(board)}
                                  title={isBoardDrawn ? "กระดานนี้ออกรางวัลแล้ว ไม่สามารถแก้ไขได้" : "แก้ไขข้อมูลกระดาน"}
                                >
                                  {isBoardDrawn ? <Lock size={12} /> : <Edit3 size={13} />}
                                </button>
                                <button
                                  type="button"
                                  className="btn-table-action delete"
                                  onClick={() => handleDeleteBoard(board.id, board.title)}
                                  title="ลบกระดาน"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Boards Pagination Bar */}
              {filteredBoards.length > 0 && (
                <div className="admin-table-pagination-bar">
                  <div className="pagination-info">
                    <span>
                      แสดง <strong>{((safeBoardPage - 1) * boardPageSize) + 1} - {Math.min(safeBoardPage * boardPageSize, filteredBoards.length)}</strong> จากทั้งหมด <strong>{filteredBoards.length}</strong> รายการ
                    </span>
                    <div className="page-size-wrap">
                      <span>แสดงหน้าละ:</span>
                      <select 
                        className="page-size-select"
                        value={boardPageSize}
                        onChange={(e) => {
                          setBoardPageSize(Number(e.target.value));
                          setBoardPage(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                      </select>
                    </div>
                  </div>

                  {totalBoardPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeBoardPage <= 1}
                        onClick={() => setBoardPage(1)}
                        title="หน้าแรกสุด"
                      >
                        <ChevronsLeft size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeBoardPage <= 1}
                        onClick={() => setBoardPage(p => Math.max(1, p - 1))}
                        title="หน้าก่อนหน้า"
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <div className="pagination-numbers">
                        {getPageNumbers(safeBoardPage, totalBoardPages).map(pageNum => (
                          <button
                            key={pageNum}
                            type="button"
                            className={`btn-page-num ${pageNum === safeBoardPage ? 'active' : ''}`}
                            onClick={() => setBoardPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeBoardPage >= totalBoardPages}
                        onClick={() => setBoardPage(p => Math.min(totalBoardPages, p + 1))}
                        title="หน้าถัดไป"
                      >
                        <ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeBoardPage >= totalBoardPages}
                        onClick={() => setBoardPage(totalBoardPages)}
                        title="หน้าสุดท้าย"
                      >
                        <ChevronsRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Cards Grid View */}
          {boardViewMode === 'cards' && (
            <div className="admin-boards-selector-row animate-fade-in">
              {filteredBoards.map(board => {
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
                      {board.description && (
                        <p className="chip-desc-line">{board.description}</p>
                      )}
                      <div className="chip-meta">
                        <span className="chip-price">{board.pricePerNumber || 50}฿/เบอร์</span>
                        <span className={`chip-status-tag ${board.status}`}>
                          {board.status === 'open' ? 'เปิดจอง' : board.status === 'drawn' ? 'ออกผลแล้ว' : 'ปิดจอง'}
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
                      {board.status !== 'drawn' && (
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
                      )}
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
          )}
          </div>
          ) : (
            <div className="admin-board-management-panel animate-fade-in">
                  {/* Top Navigation Back Bar */}
                  <div className="admin-subview-nav-bar">
                    <button
                      type="button"
                      className="btn-admin-back-table"
                      onClick={() => setSelectedBoardId(null)}
                      title="ย้อนกลับไปตารางรายการกระดาน"
                    >
                      <ArrowLeft size={16} />
                      <span>← กลับไปตารางรายการกระดาน</span>
                    </button>
                    
                    <div className="subview-breadcrumb">
                      <span className="crumb-parent" onClick={() => setSelectedBoardId(null)} role="button">
                        กระดานจองเลข
                      </span>
                      <span className="crumb-sep">/</span>
                      <span className="crumb-current">{selectedBoard.title}</span>
                      {isCurrentBoardClosed && (
                        <span className="crumb-tag-locked">
                          <Lock size={12} />
                          <span>ดูข้อมูลเท่านั้น</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected Board Summary Banner */}
                  <div className={`selected-board-banner ${isCurrentBoardClosed ? 'is-closed-banner' : ''}`}>
                    <div className="banner-left">
                      <span className="board-active-badge">
                        <Sparkles size={14} className="banner-badge-icon" />
                        <span>{isCurrentBoardClosed ? 'กำลังดูข้อมูล:' : 'กำลังจัดการ:'}</span> <strong>{selectedBoard.title}</strong>
                      </span>
                      <span className="banner-stat">
                        ราคาเบอร์ละ <strong>{selectedBoard.pricePerNumber || 50} บาท</strong>
                      </span>
                      <span className="banner-stat">
                        สถานะ: <strong className={`status-${selectedBoard.status}`}>
                          {selectedBoard.status === 'open' ? '🟢 เปิดให้บริการจอง' : selectedBoard.status === 'drawn' ? '🟣 ออกผลรางวัลแล้ว' : '🔴 ปิดให้บริการจอง'}
                        </strong>
                      </span>
                      {selectedBoard.winningNumber && (
                        <span className="banner-win-num">
                          👑 เลขรางวัลที่ออก: <strong>{selectedBoard.winningNumber}</strong>
                        </span>
                      )}
                    </div>
                    <div className="banner-right">
                      {!isCurrentBoardDrawn ? (
                        <button
                          type="button"
                          className="btn-banner-edit"
                          onClick={() => openEditBoardModal(selectedBoard)}
                        >
                          <Edit3 size={14} />
                          <span>แก้ไขข้อมูลกระดาน</span>
                        </button>
                      ) : (
                        <span className="banner-locked-tag">
                          <Lock size={13} />
                          <span>ออกผลรางวัลแล้ว (ข้อมูลถูกล็อค)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Board Rules & Description Card */}
                  <div className="admin-board-desc-card animate-fade-in">
                    <div className="desc-card-header">
                      <div className="desc-header-left">
                        <FileText size={15} className="desc-icon-cyan" />
                        <span className="desc-label">รายละเอียดด้านใน / กติกา:</span>
                      </div>
                      {!isCurrentBoardDrawn && (
                        <button
                          type="button"
                          className="btn-edit-desc-mini"
                          onClick={() => openEditBoardModal(selectedBoard)}
                          title="แก้ไขรายละเอียดและกติกา"
                        >
                          <Edit3 size={12} />
                          <span>แก้ไขกติกา</span>
                        </button>
                      )}
                    </div>
                    {selectedBoard.description ? (
                      <p className="desc-card-text">{selectedBoard.description}</p>
                    ) : (
                      <p className="desc-card-empty-text">
                        ยังไม่ได้ระบุรายละเอียดด้านใน / กติกา (กดปุ่ม "แก้ไขข้อมูลกระดาน" หรือ "แก้ไขกติกา" เพื่อระบุรายละเอียดรางวัล สภาพการ์ด หรือกติกา)
                      </p>
                    )}
                  </div>

                  {/* Grid: Left = Form/Notice, Right = Visual 00-99 Grid */}
                  <div className="admin-booking-split-grid">
                    
                    {/* Form 1.1 / Locked Notice: ระบุเบอร์ที่จอง */}
                    <div className="admin-booking-box">
                      <h3 className="box-title">
                        <UserCheck size={18} className="title-icon" />
                        <span>1.1 ข้อมูลการจอง {!isCurrentBoardDrawn ? '(ระบุเบอร์ที่จอง)' : '(ออกผลรางวัลแล้ว)'}</span>
                      </h3>

                      {!isCurrentBoardDrawn ? (
                        <>
                          <p className="box-sub">
                            {selectedBoard.status === 'closed'
                              ? 'กระดานปิดรับจองหน้าร้านแล้ว (แต่แอดมินยังสามารถจัดการเบอร์และบันทึกยอดได้)'
                              : 'ใส่ชื่อเฟสและเบอร์ ระบบจะตัดยอดและลบล้างเลขว่างโดยอัตโนมัติทันที'}
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
                        </>
                      ) : (
                        <div className="admin-booking-locked-box animate-fade-in">
                          <div className="locked-badge-row">
                            <Lock size={18} className="locked-icon" />
                            <h4>กระดานนี้ปิดให้บริการจองแล้ว (โหมดดูข้อมูลเท่านั้น)</h4>
                          </div>
                          <p className="locked-subtext">
                            {selectedBoard.status === 'drawn'
                              ? `กระดานนี้ออกผลรางวัลแล้ว (เลขที่ออก: 👑 ${selectedBoard.winningNumber || '-'}) ข้อมูลทั้งหมดถูกล็อค ไม่สามารถแก้ไขหรือเพิ่มการจองได้`
                              : 'กระดานนี้ปิดรอบการจองแล้ว ข้อมูลทั้งหมดถูกล็อค ไม่สามารถแก้ไข เพิ่มรายการจอง หรือยกเลิกเบอร์ได้'}
                          </p>
                          <div className="locked-stats-summary">
                            <div className="locked-stat-item">
                              <span className="lbl">ยอดเบอร์ที่จอง:</span>
                              <strong className="val text-amber">{(selectedBoard.numbers || []).filter(n => n.status !== 'available').length} เบอร์</strong>
                            </div>
                            <div className="locked-stat-item">
                              <span className="lbl">ยอดเงินรวม:</span>
                              <strong className="val text-emerald">{((selectedBoard.numbers || []).filter(n => n.status !== 'available').length * (selectedBoard.pricePerNumber || 50)).toLocaleString()} บาท</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary of Bookings Table */}
                      <div className="bookings-summary-table-section">
                        <h4 className="table-heading-title">
                          รายการผู้จองในกระดานนี้ ({(selectedBoard.bookings || []).length} รายการ)
                        </h4>

                        {(!selectedBoard.bookings || selectedBoard.bookings.length === 0) ? (
                          <div className="empty-bookings-box">
                            ยังไม่มีรายการจองในกระดานนี้
                          </div>
                        ) : (
                          <>
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
                                  {paginatedBookings.map(b => (
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
                                        {!isCurrentBoardClosed ? (
                                          <button
                                            type="button"
                                            className={`btn-table-status ${b.status}`}
                                            onClick={() => handleToggleBookingStatus(b.id)}
                                            title="คลิกเพื่อสลับ รอยอด / จ่ายแล้ว"
                                          >
                                            {b.status === 'paid' ? '✅ จ่ายแล้ว' : '⏳ รอยอด'}
                                          </button>
                                        ) : (
                                          <span className={`chip-status-tag ${b.status === 'paid' ? 'open' : 'closed'}`}>
                                            {b.status === 'paid' ? '✅ จ่ายแล้ว' : '⏳ รอยอด'}
                                          </span>
                                        )}
                                      </td>
                                      <td>
                                        {!isCurrentBoardClosed ? (
                                          <button
                                            type="button"
                                            className="btn-table-del"
                                            onClick={() => handleDeleteBooking(b.id, b.customerName, b.numbers.length)}
                                            title="ยกเลิกการจองและคืนเบอร์ว่าง"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        ) : (
                                          <span className="text-muted" title="กระดานปิดจองแล้ว ไม่สามารถแก้ไขได้">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Bookings Pagination Bar */}
                            {currentBoardBookings.length > 0 && (
                              <div className="admin-table-pagination-bar mini">
                                <div className="pagination-info">
                                  <span>
                                    แสดง <strong>{((safeBookingPage - 1) * bookingPageSize) + 1} - {Math.min(safeBookingPage * bookingPageSize, currentBoardBookings.length)}</strong> จาก <strong>{currentBoardBookings.length}</strong> รายการ
                                  </span>
                                </div>

                                {totalBookingPages > 1 && (
                                  <div className="pagination-controls">
                                    <button
                                      type="button"
                                      className="btn-page-nav"
                                      disabled={safeBookingPage <= 1}
                                      onClick={() => setBookingPage(1)}
                                      title="หน้าแรก"
                                    >
                                      <ChevronsLeft size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-page-nav"
                                      disabled={safeBookingPage <= 1}
                                      onClick={() => setBookingPage(p => Math.max(1, p - 1))}
                                      title="ก่อนหน้า"
                                    >
                                      <ChevronLeft size={13} />
                                    </button>

                                    <div className="pagination-numbers">
                                      {getPageNumbers(safeBookingPage, totalBookingPages).map(pageNum => (
                                        <button
                                          key={pageNum}
                                          type="button"
                                          className={`btn-page-num ${pageNum === safeBookingPage ? 'active' : ''}`}
                                          onClick={() => setBookingPage(pageNum)}
                                        >
                                          {pageNum}
                                        </button>
                                      ))}
                                    </div>

                                    <button
                                      type="button"
                                      className="btn-page-nav"
                                      disabled={safeBookingPage >= totalBookingPages}
                                      onClick={() => setBookingPage(p => Math.min(totalBookingPages, p + 1))}
                                      title="ถัดไป"
                                    >
                                      <ChevronRight size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-page-nav"
                                      disabled={safeBookingPage >= totalBookingPages}
                                      onClick={() => setBookingPage(totalBookingPages)}
                                      title="หน้าสุดท้าย"
                                    >
                                      <ChevronsRight size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Visual Number Grid (ตารางตัวเลข 00-99 สำหรับคลิกเลือก / ตรวจสอบ) */}
                    <div className="admin-visual-grid-box">
                      <div className="visual-grid-header">
                        <h3 className="box-title">
                          {isCurrentBoardDrawn 
                            ? 'ตารางเลข 00-99 (โหมดดูข้อมูล)' 
                            : 'ตารางเลข 00-99 (คลิกเลขว่างเพื่อเลือก)'}
                        </h3>
                        <div className="grid-legend">
                          <span className="legend-item"><span className="legend-dot available" /> ว่าง ({getBoardStats(selectedBoard).available})</span>
                          <span className="legend-item"><span className="legend-dot booked" /> รอยอด ({getBoardStats(selectedBoard).booked})</span>
                          <span className="legend-item"><span className="legend-dot paid" /> จ่ายแล้ว ({getBoardStats(selectedBoard).paid})</span>
                        </div>
                      </div>

                      <div className={`interactive-numbers-grid ${isCurrentBoardDrawn ? 'read-only' : ''}`}>
                        {(selectedBoard.numbers || []).map(item => {
                          const isWinning = Boolean(selectedBoard.winningNumber) && String(selectedBoard.winningNumber).padStart(2, '0') === item.number;
                          return (
                            <button
                              key={item.number}
                              type="button"
                              className={`interactive-num-btn ${item.status} ${isWinning ? 'winning' : ''} ${isCurrentBoardDrawn ? 'read-only' : ''}`}
                              onClick={() => !isCurrentBoardDrawn && handleNumberGridClick(item)}
                              disabled={isCurrentBoardDrawn || item.status !== 'available'}
                              title={
                                isWinning 
                                  ? `🎉 เลข ${item.number} (เลขรางวัลที่ออก!)` 
                                  : isCurrentBoardDrawn
                                    ? `เลข ${item.number} (${item.status === 'available' ? 'ว่าง' : item.customerName || item.status}) - ออกผลรางวัลแล้ว`
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

                  {/* Bottom Back Navigation Button */}
                  <div className="subview-bottom-nav">
                    <button
                      type="button"
                      className="btn-admin-back-table"
                      onClick={() => setSelectedBoardId(null)}
                    >
                      <ArrowLeft size={16} />
                      <span>← กลับไปตารางรายการกระดาน</span>
                    </button>
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

          {/* KPI Summary Cards Bar for Cards */}
          <div className="admin-stats-kpi-grid">
            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap purple">
                <CreditCard size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">การ์ดทั้งหมด</span>
                <span className="kpi-val">{totalCards} <small>ใบ</small></span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap green">
                <Package size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">พร้อมจำหน่าย</span>
                <span className="kpi-val text-green">{availableCards} <small>ใบ</small></span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap rose">
                <Award size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">ขายแล้ว</span>
                <span className="kpi-val text-rose">{soldCards} <small>ใบ</small></span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-icon-wrap amber">
                <TrendingUp size={18} />
              </div>
              <div className="kpi-info-col">
                <span className="kpi-lbl">มูลค่าคลังสินค้ารวม</span>
                <span className="kpi-val text-amber">{totalCardsInventoryValue.toLocaleString()} <small>฿</small></span>
              </div>
            </div>
          </div>

          {/* Search, Filter & View Mode Toolbar for Cards */}
          <div className="admin-toolbar-row">
            <div className="admin-search-filter-wrap">
              <div className="admin-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อการ์ด, รหัส Cert, เกรด..."
                  value={cardSearchQuery}
                  onChange={(e) => setCardSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
                {cardSearchQuery && (
                  <button type="button" className="btn-clear-search" onClick={() => setCardSearchQuery('')}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="admin-filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${cardStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCardStatusFilter('all')}
                >
                  ทั้งหมด ({storeCards.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${cardStatusFilter === 'available' ? 'active' : ''}`}
                  onClick={() => setCardStatusFilter('available')}
                >
                  🟢 มีสินค้า ({availableCards})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${cardStatusFilter === 'sold' ? 'active' : ''}`}
                  onClick={() => setCardStatusFilter('sold')}
                >
                  🔴 ขายแล้ว ({soldCards})
                </button>
              </div>
            </div>

            <div className="admin-view-switcher">
              <button
                type="button"
                className={`btn-view-toggle ${cardViewMode === 'table' ? 'active' : ''}`}
                onClick={() => setCardViewMode('table')}
                title="มุมมองตารางรายการ (List Table)"
              >
                <TableIcon size={15} />
                <span>ตารางรายการ</span>
              </button>
              <button
                type="button"
                className={`btn-view-toggle ${cardViewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setCardViewMode('cards')}
                title="มุมมองการ์ด (Grid)"
              >
                <LayoutGrid size={15} />
                <span>การ์ด</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: Cards Table List (ตารางรายการการ์ด - ค่าเริ่มต้น) */}
          {cardViewMode === 'table' && (
            <div className="admin-table-card animate-fade-in">
              <div className="admin-table-container">
                <table className="admin-list-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>รูปภาพ</th>
                      <th>ชื่อการ์ด / รายละเอียด</th>
                      <th>เกรด (Grade)</th>
                      <th>ราคา</th>
                      <th>สถานะ</th>
                      <th>รูปดีเทล & สื่อ</th>
                      <th style={{ width: '150px', textAlign: 'center' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCards.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-table-cell">
                          ไม่พบการ์ดที่ตรงกับเงื่อนไขการค้นหา
                        </td>
                      </tr>
                    ) : (
                      paginatedCards.map(card => (
                        <tr key={card.id} className="admin-table-row">
                          {/* 1. Cover Thumbnail */}
                          <td className="td-thumb">
                            <div className="table-thumb-wrap card-thumb">
                              <img src={card.coverImage} alt={card.title} />
                            </div>
                          </td>

                          {/* 2. Card Title & Info */}
                          <td className="td-title-info">
                            <div className="table-title-wrap">
                              <span className="table-item-title">{card.title}</span>
                              <div className="table-item-sub-row">
                                <span className="table-item-desc">{card.subtitle}</span>
                                {card.cert && (
                                  <span className="table-cert-tag">Cert #{card.cert}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 3. Grade */}
                          <td className="td-grade">
                            <span className="table-grade-badge">{card.grade || 'PCG 10'}</span>
                          </td>

                          {/* 4. Price */}
                          <td className="td-price">
                            <span className="table-price-badge">{Number(card.price || 0).toLocaleString()} ฿</span>
                          </td>

                          {/* 5. Status */}
                          <td className="td-status">
                            <span className={`chip-status-tag ${card.status === 'available' ? 'open' : 'closed'}`}>
                              {card.status === 'available' ? '🟢 มีสินค้า' : '🔴 ขายแล้ว'}
                            </span>
                          </td>

                          {/* 6. Media */}
                          <td className="td-media">
                            <div className="table-media-tags">
                              <span className="meta-chip">
                                <ImageIcon size={12} />
                                <span>{card.detailImages ? card.detailImages.length : 1} รูป</span>
                              </span>
                              {card.videoUrl && (
                                <span className="meta-chip video">
                                  <Video size={12} />
                                  <span>วิดีโอ</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 7. Actions */}
                          <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                            <div className="table-actions-group">
                              <button
                                type="button"
                                className="btn-table-action edit"
                                onClick={() => openEditCardModal(card)}
                                title="แก้ไขข้อมูลการ์ด"
                              >
                                <Edit3 size={13} />
                                <span>แก้ไข</span>
                              </button>
                              <button
                                type="button"
                                className="btn-table-action delete"
                                onClick={() => handleDeleteCard(card.id, card.title)}
                                title="ลบการ์ด"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards Pagination Bar */}
              {filteredCards.length > 0 && (
                <div className="admin-table-pagination-bar">
                  <div className="pagination-info">
                    <span>
                      แสดง <strong>{((safeCardPage - 1) * cardPageSize) + 1} - {Math.min(safeCardPage * cardPageSize, filteredCards.length)}</strong> จากทั้งหมด <strong>{filteredCards.length}</strong> รายการ
                    </span>
                    <div className="page-size-wrap">
                      <span>แสดงหน้าละ:</span>
                      <select 
                        className="page-size-select"
                        value={cardPageSize}
                        onChange={(e) => {
                          setCardPageSize(Number(e.target.value));
                          setCardPage(1);
                        }}
                      >
                        <option value={4}>4</option>
                        <option value={8}>8</option>
                        <option value={16}>16</option>
                        <option value={32}>32</option>
                      </select>
                    </div>
                  </div>

                  {totalCardPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeCardPage <= 1}
                        onClick={() => setCardPage(1)}
                        title="หน้าแรกสุด"
                      >
                        <ChevronsLeft size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeCardPage <= 1}
                        onClick={() => setCardPage(p => Math.max(1, p - 1))}
                        title="หน้าก่อนหน้า"
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <div className="pagination-numbers">
                        {getPageNumbers(safeCardPage, totalCardPages).map(pageNum => (
                          <button
                            key={pageNum}
                            type="button"
                            className={`btn-page-num ${pageNum === safeCardPage ? 'active' : ''}`}
                            onClick={() => setCardPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeCardPage >= totalCardPages}
                        onClick={() => setCardPage(p => Math.min(totalCardPages, p + 1))}
                        title="หน้าถัดไป"
                      >
                        <ChevronRight size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-page-nav"
                        disabled={safeCardPage >= totalCardPages}
                        onClick={() => setCardPage(totalCardPages)}
                        title="หน้าสุดท้าย"
                      >
                        <ChevronsRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Cards Catalog Grid */}
          {cardViewMode === 'cards' && (
            <div className="admin-cards-catalog-grid animate-fade-in">
              {filteredCards.map(card => (
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
          )}

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

              {/* Cover Image Upload (เลือกจากไฟล์ในเครื่องหรือมือถือ) */}
              <div className="form-group">
                <label className="form-lbl">
                  แนบรูปภาพกระดาน (เลือกจากเครื่อง / มือถือ หรือใส่ลิงก์)
                </label>

                <div className="file-uploader-box">
                  <input
                    type="file"
                    id="board-cover-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBoardFileSelect}
                  />

                  {boardForm.coverImage ? (
                    <div className="uploaded-image-preview-card">
                      <div className="preview-thumb-wrap">
                        <img src={boardForm.coverImage} alt="Cover Preview" className="preview-img" />
                      </div>
                      <div className="preview-details">
                        <span className="preview-success-txt">
                          <CheckCircle size={14} /> เลือกรูปภาพเรียบร้อย
                        </span>
                        <div className="preview-actions-row">
                          <label htmlFor="board-cover-file-input" className="btn-change-file">
                            <Upload size={13} />
                            <span>เปลี่ยนรูปใหม่</span>
                          </label>
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={() => setBoardForm(prev => ({ ...prev, coverImage: '' }))}
                          >
                            <Trash2 size={13} />
                            <span>ลบรูป</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="board-cover-file-input" className="dropzone-file-label">
                      <div className="dropzone-inner">
                        <div className="dropzone-icon-circle">
                          <Upload size={22} />
                        </div>
                        <div className="dropzone-texts">
                          <span className="dropzone-title">📁 คลิกเลือกรูปจากเครื่อง หรือถ่ายรูป/เลือกจากมือถือ</span>
                          <span className="dropzone-sub">รองรับ JPG, PNG, WEBP (บีบอัดขนาดให้คมชัดอัตโนมัติ)</span>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                <div className="image-url-fallback-row">
                  <span className="fallback-lbl">หรือใส่ลิงก์รูปภาพ:</span>
                  <input
                    type="text"
                    className="form-input mini"
                    placeholder="เช่น /graded-cards/pikachu_promo.png หรือ https://..."
                    value={boardForm.coverImage}
                    onChange={(e) => setBoardForm(prev => ({ ...prev, coverImage: e.target.value }))}
                  />
                </div>
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
                    <label className="form-lbl">
                      จำนวนเลขทั้งหมด (เบอร์)
                      <span className="lbl-hint" style={{ color: '#06b6d4', marginLeft: '6px' }}>
                        {(boardForm.boardType === 'duck' || boardForm.boardType === 'wheel') ? '(เริ่มที่ 01)' : '(เริ่มที่ 00)'}
                      </span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={(boardForm.boardType === 'duck' || boardForm.boardType === 'wheel') ? '30' : '100'}
                      value={boardForm.totalNumbers}
                      onChange={(e) => setBoardForm(prev => ({ ...prev, totalNumbers: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Board Type Selection (ระบบประเภทกระดาน & ส่วนลด) */}
              <div className="form-group">
                <label className="form-lbl">🎯 ประเภทกระดาน (โปรโมชั่นส่วนลด)</label>
                <div className="board-type-select-grid admin-compact">
                  {Object.values(BOARD_TYPES).map((bt) => (
                    <button
                      key={bt.id}
                      type="button"
                      className={`board-type-pill-btn ${boardForm.boardType === bt.id ? 'active' : ''}`}
                      onClick={() => setBoardForm(prev => ({
                        ...prev,
                        boardType: bt.id,
                        totalNumbers: (!editingBoard && (bt.id === 'duck' || bt.id === 'wheel') && (!prev.totalNumbers || prev.totalNumbers == 100)) ? 30 : prev.totalNumbers
                      }))}
                    >
                      <span className="bt-icon">{bt.icon}</span>
                      <div className="bt-text-wrap">
                        <span className="bt-name">{bt.name}</span>
                        <span className="bt-promo">{bt.promoText}</span>
                      </div>
                    </button>
                  ))}
                </div>
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

              {/* Card Cover Image Upload */}
              <div className="form-group">
                <label className="form-lbl">รูปปกการ์ด <span className="req">*</span></label>
                <div className="file-uploader-box">
                  <input
                    type="file"
                    id="card-cover-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleCardCoverFileSelect}
                  />

                  {cardForm.coverImage ? (
                    <div className="uploaded-image-preview-card">
                      <div className="preview-thumb-wrap">
                        <img src={cardForm.coverImage} alt="Card Cover Preview" className="preview-img" />
                      </div>
                      <div className="preview-details">
                        <span className="preview-success-txt">
                          <CheckCircle size={14} /> เลือกรูปภาพปกเรียบร้อย
                        </span>
                        <div className="preview-actions-row">
                          <label htmlFor="card-cover-file-input" className="btn-change-file">
                            <Upload size={13} />
                            <span>เปลี่ยนรูปใหม่</span>
                          </label>
                          <button
                            type="button"
                            className="btn-remove-file"
                            onClick={() => setCardForm(prev => ({ ...prev, coverImage: '' }))}
                          >
                            <Trash2 size={13} />
                            <span>ลบรูป</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="card-cover-file-input" className="dropzone-file-label">
                      <div className="dropzone-inner">
                        <div className="dropzone-icon-circle">
                          <Upload size={22} />
                        </div>
                        <div className="dropzone-texts">
                          <span className="dropzone-title">📁 คลิกเลือกรูปปกจากเครื่อง หรือเลือกจากมือถือ</span>
                          <span className="dropzone-sub">รองรับ JPG, PNG, WEBP</span>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                <div className="image-url-fallback-row">
                  <span className="fallback-lbl">หรือใส่ลิงก์รูปภาพ:</span>
                  <input
                    type="text"
                    className="form-input mini"
                    placeholder="เช่น /graded-cards/pikachu_promo.png หรือ https://..."
                    value={cardForm.coverImage}
                    onChange={(e) => setCardForm(prev => ({ ...prev, coverImage: e.target.value }))}
                  />
                </div>
              </div>

              {/* Card Detail Images Upload */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <label className="form-lbl" style={{ margin: 0 }}>
                    รูปดีเทลยิบย่อย (รูปภาพเพิ่มเติมหลายๆ มุม)
                  </label>
                  <label htmlFor="card-details-files-input" className="btn-upload-more-files">
                    <Upload size={13} />
                    <span>+ เลือกรูปเพิ่มจากเครื่อง/มือถือ</span>
                  </label>
                  <input
                    type="file"
                    id="card-details-files-input"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleCardDetailFilesSelect}
                  />
                </div>
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

      {/* =========================================================================
          SUPABASE SETUP GUIDE MODAL
          ========================================================================= */}
      {isSupabaseModalOpen && (
        <div className="admin-modal-overlay animate-fade-in" onClick={() => setIsSupabaseModalOpen(false)}>
          <div className="admin-modal-content supabase-setup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-with-icon">
                <Database className="title-icon-purple" size={20} />
                <h3 className="admin-modal-title">ตั้งค่าเชื่อมต่อ Supabase Cloud Database</h3>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setIsSupabaseModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="supabase-guide-body">
              <p className="supabase-guide-intro">
                เมื่อเชื่อมต่อ Supabase แล้ว ข้อมูลการจองเบอร์ การ์ด และการตั้งค่าทั้งหมดจะถูกบันทึกขึ้น Cloud และซิงค์ข้ามเครื่อง (มือถือ/คอมพิวเตอร์/ลูกค้าทุกคน) แบบ <strong>Real-time ทันที</strong>
              </p>

              <div className="setup-steps-list">
                <div className="setup-step-item">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <h4>สร้างโปรเจกต์ Supabase ฟรี</h4>
                    <p>ไปที่ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="supabase-link">supabase.com</a> ล็อกอินแล้วกด <strong>"New Project"</strong> ตั้งชื่อโปรเจกต์และรหัสผ่านฐานข้อมูล</p>
                  </div>
                </div>

                <div className="setup-step-item">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <h4>รันคำสั่งสร้างตาราง (SQL Script)</h4>
                    <p>เปิดเมนู <strong>SQL Editor</strong> ใน Supabase แล้วเปิดไฟล์ <code className="code-pill">supabase_schema.sql</code> ที่เตรียมไว้ในโฟลเดอร์โปรเจกต์นี้ คัดลอกข้อความทั้งหมดไปวางแล้วกด <strong>"Run"</strong></p>
                  </div>
                </div>

                <div className="setup-step-item">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <h4>ใส่ค่าเชื่อมต่อ (API Keys)</h4>
                    <p>ไปที่ <strong>Project Settings → API</strong> แล้วคัดลอกค่า <strong>Project URL</strong> และ <strong>anon public key</strong> มาใส่ใน:</p>
                    <ul className="setup-sub-list">
                      <li>ไฟล์ <code className="code-pill">.env</code> ในโปรเจกต์ (สำหรับรันบนเครื่อง)</li>
                      <li>หรือใน <strong>Vercel Dashboard → Settings → Environment Variables</strong> (สำหรับเว็บที่ขึ้นออนไลน์)</li>
                    </ul>
                    <div className="env-sample-box">
                      <code>VITE_SUPABASE_URL=https://your-id.supabase.co<br />VITE_SUPABASE_ANON_KEY=your-anon-key</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions-bar" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-modal-save" onClick={() => setIsSupabaseModalOpen(false)}>
                  <Check size={16} />
                  <span>เข้าใจแล้ว</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
