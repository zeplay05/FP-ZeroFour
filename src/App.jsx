import React, { useState, useEffect } from 'react';
import { AppNavbar } from './components/AppNavbar';
import { CardHomePage } from './components/CardHomePage';
import { CardsPage } from './components/CardsPage';
import { RoundDetailPage } from './components/RoundDetailPage';
import { CreateRoundModal } from './components/CreateRoundModal';
import { ContactModal } from './components/ContactModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactPage } from './components/ContactPage';
import { AppFooter } from './components/AppFooter';
import { FloatingMusicPlayer } from './components/FloatingMusicPlayer';
import { 
  initialLotteryRounds, 
  generateNumbersWithPreset 
} from './utils/lotteryData';
import { initialStoreCards } from './utils/storeCardsData';
import {
  isSupabaseConfigured,
  fetchRoundsFromSupabase,
  fetchStoreCardsFromSupabase,
  syncRoundsWithSupabase,
  syncStoreCardsWithSupabase,
  fetchSettingFromSupabase,
  subscribeToRealtimeRounds,
  subscribeToRealtimeStoreCards
} from './utils/supabaseClient';
import confetti from 'canvas-confetti';
import './App.css';

// Helper to inspect URL query params or hash for card ID
function getCardIdFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const cardQuery = params.get('card');
  if (cardQuery) return cardQuery;

  // Fallback hash e.g. #card=xxx or #/card/xxx
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/card[=/]([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
  }
  return null;
}

// Helper to check if user visited /admin
function checkIsAdminUrl() {
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.endsWith('/admin') ||
    path.endsWith('/admin/') ||
    path === '/admin' ||
    search.includes('admin') ||
    hash.includes('admin')
  );
}

export const normalizeAndMigrateRounds = (roundsList) => {
  if (!Array.isArray(roundsList)) return { rounds: roundsList, changed: false };
  let globalChanged = false;

  const migrated = roundsList.map(round => {
    let roundChanged = false;
    let newBookings = Array.isArray(round.bookings) ? [...round.bookings] : [];
    let newNumbers = Array.isArray(round.numbers) ? [...round.numbers] : [];

    // 1. Check if customer "บัง" has '00' or 0 -> change to '30'
    newBookings = newBookings.map(b => {
      const isBang = b.customerName === 'บัง' || b.facebookName === 'บัง' || 
                     b.customerName?.includes('บัง') || b.facebookName?.includes('บัง') ||
                     b.id === 'bk-1793018794797';
      const has00 = Array.isArray(b.numbers) && b.numbers.some(n => n === '00' || n === '0' || n === 0);
      if (isBang && has00) {
        roundChanged = true;
        globalChanged = true;
        return {
          ...b,
          numbers: b.numbers.map(n => (n === '00' || n === '0' || n === 0) ? '30' : String(n).padStart(2, '0'))
        };
      }
      return b;
    });

    // 2. In numbers array: change '00' to '30' if it belongs to บัง or if it's a 30-number wheel/duck board
    const item00Index = newNumbers.findIndex(n => n.number === '00' || n.number === '0');
    if (item00Index !== -1) {
      const item00 = newNumbers[item00Index];
      const isBang = item00.customerName === 'บัง' || item00.facebookName === 'บัง' || 
                     item00.customerName?.includes('บัง') || item00.facebookName?.includes('บัง') ||
                     item00.bookingId === 'bk-1793018794797';
      const isDuckOrWheel = round.boardType === 'wheel' || round.boardType === 'duck' || 
                            round.title?.includes('วงล้อ') || round.title?.includes('เป็ด');
      const is30Board = newNumbers.length <= 30;

      if (isBang || (isDuckOrWheel && is30Board)) {
        roundChanged = true;
        globalChanged = true;
        newNumbers[item00Index] = {
          ...item00,
          number: '30',
          customerName: item00.customerName || (isBang ? 'บัง' : '')
        };
        newNumbers.sort((a, b) => Number(a.number) - Number(b.number));
      }
    }

    if (roundChanged) {
      return {
        ...round,
        bookings: newBookings,
        numbers: newNumbers
      };
    }
    return round;
  });

  return { rounds: migrated, changed: globalChanged };
};

function App() {
  // Load rounds list from localStorage or fallback to preset rounds
  const [rounds, setRounds] = useState(() => {
    try {
      const saved = localStorage.getItem('lottery_rounds_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        const { rounds: migrated } = normalizeAndMigrateRounds(parsed);
        return migrated;
      }
    } catch (e) {
      console.error(e);
    }
    const { rounds: initialMigrated } = normalizeAndMigrateRounds(initialLotteryRounds);
    return initialMigrated;
  });

  // Load graded store cards list from localStorage or initial preset
  const [storeCards, setStoreCards] = useState(() => {
    try {
      const saved = localStorage.getItem('fp_store_cards_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialStoreCards;
  });

  // URL-driven navigation: 'home' (Cards Gallery) | 'board' (Round Detail) | 'cards' (Graded Cards) | 'admin' (Admin Backend)
  const [currentRoundId, setCurrentRoundId] = useState(() => {
    const fromUrl = getCardIdFromLocation();
    return fromUrl || initialLotteryRounds[0].id;
  });

  const [viewMode, setViewMode] = useState(() => {
    if (checkIsAdminUrl()) return 'admin';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'cards') return 'cards';
    if (urlParams.get('tab') === 'contact' || window.location.pathname.endsWith('/contact')) return 'contact';
    const fromUrl = getCardIdFromLocation();
    return fromUrl ? 'board' : 'home';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'cards') return 'cards';
    if (urlParams.get('tab') === 'contact' || window.location.pathname.endsWith('/contact')) return 'contact';
    const fromUrl = getCardIdFromLocation();
    return fromUrl ? 'cards' : 'home';
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // default false, login to unlock

  // Active round object
  const currentRound = rounds.find(r => r.id === currentRoundId) || rounds[0] || initialLotteryRounds[0];

  // Supabase Cloud Data Initial Load & Realtime Subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    async function loadCloudData() {
      try {
        const [cloudRounds, cloudCards, cloudFbLink] = await Promise.all([
          fetchRoundsFromSupabase(),
          fetchStoreCardsFromSupabase(),
          fetchSettingFromSupabase('seller_fb_link')
        ]);

        if (isMounted) {
          if (cloudRounds && cloudRounds.length > 0) {
            const { rounds: migratedCloud, changed } = normalizeAndMigrateRounds(cloudRounds);
            setRounds(migratedCloud);
            if (changed) {
              syncRoundsWithSupabase(migratedCloud).catch(console.error);
            }
          } else if (cloudRounds && cloudRounds.length === 0 && rounds.length > 0) {
            // First time setup on clean Supabase database: auto-seed existing rounds
            syncRoundsWithSupabase(rounds).catch(console.error);
          }

          if (cloudCards && cloudCards.length > 0) {
            setStoreCards(cloudCards);
          } else if (cloudCards && cloudCards.length === 0 && storeCards.length > 0) {
            // First time setup on clean Supabase database: auto-seed existing store cards
            syncStoreCardsWithSupabase(storeCards).catch(console.error);
          }

          if (cloudFbLink) {
            localStorage.setItem('seller_fb_link', cloudFbLink);
          }
        }
      } catch (err) {
        console.error('[Supabase] Initial load error:', err);
      }
    }

    loadCloudData();

    // Listen to real-time changes across devices
    const unsubRounds = subscribeToRealtimeRounds(async () => {
      const freshRounds = await fetchRoundsFromSupabase();
      if (freshRounds && isMounted) {
        setRounds(freshRounds);
      }
    });

    const unsubCards = subscribeToRealtimeStoreCards(async () => {
      const freshCards = await fetchStoreCardsFromSupabase();
      if (freshCards && isMounted) {
        setStoreCards(freshCards);
      }
    });

    return () => {
      isMounted = false;
      unsubRounds();
      unsubCards();
    };
  }, []);

  // Update rounds with Supabase Cloud Sync
  const handleUpdateRounds = (newRoundsOrUpdater) => {
    setRounds(prev => {
      const nextRounds = typeof newRoundsOrUpdater === 'function' ? newRoundsOrUpdater(prev) : newRoundsOrUpdater;
      if (isSupabaseConfigured()) {
        syncRoundsWithSupabase(nextRounds, prev).catch(console.error);
      }
      return nextRounds;
    });
  };

  // Update store cards with Supabase Cloud Sync
  const handleUpdateStoreCards = (newCardsOrUpdater) => {
    setStoreCards(prev => {
      const nextCards = typeof newCardsOrUpdater === 'function' ? newCardsOrUpdater(prev) : newCardsOrUpdater;
      if (isSupabaseConfigured()) {
        syncStoreCardsWithSupabase(nextCards, prev).catch(console.error);
      }
      return nextCards;
    });
  };

  // Persist rounds to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('lottery_rounds_v6', JSON.stringify(rounds));
    } catch (e) {
      console.error('Error saving rounds to localStorage, attempting cleanup...', e);
      try {
        localStorage.removeItem('lottery_rounds_v5');
        localStorage.removeItem('lottery_rounds_v4');
        localStorage.removeItem('lottery_rounds_v3');
        localStorage.setItem('lottery_rounds_v6', JSON.stringify(rounds));
      } catch (err2) {
        console.error('Fatal localStorage quota error:', err2);
      }
    }
  }, [rounds]);

  // Persist store cards to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('fp_store_cards_v1', JSON.stringify(storeCards));
    } catch (e) {
      console.error('Error saving storeCards to localStorage', e);
    }
  }, [storeCards]);

  // Sync with browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (checkIsAdminUrl()) {
        setViewMode('admin');
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'cards') {
        setViewMode('cards');
        setActiveTab('cards');
        return;
      }
      if (urlParams.get('tab') === 'contact' || window.location.pathname.endsWith('/contact')) {
        setViewMode('contact');
        setActiveTab('contact');
        return;
      }
      const cardFromUrl = getCardIdFromLocation();
      if (cardFromUrl) {
        const found = rounds.find(r => r.id === cardFromUrl);
        if (found) {
          setCurrentRoundId(found.id);
          setViewMode('board');
          setActiveTab('home');
          return;
        }
      }
      setViewMode('home');
      setActiveTab('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [rounds]);

  // Handle selecting a round from Home Cards -> Navigate to ?card=<round.id>
  const handleSelectRound = (round) => {
    setCurrentRoundId(round.id);
    setViewMode('board');
    setActiveTab('home');
    const newUrl = `${window.location.pathname}?card=${encodeURIComponent(round.id)}`;
    window.history.pushState({ cardId: round.id, view: 'board' }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Gallery -> Reset URL to base pathname
  const handleBackToGallery = () => {
    setViewMode('home');
    setActiveTab('home');
    window.history.pushState({ view: 'home' }, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavHome = () => {
    handleBackToGallery();
  };

  const handleNavCards = () => {
    setActiveTab('cards');
    setViewMode('cards');
    window.history.pushState({ view: 'cards' }, '', `${window.location.pathname}?tab=cards`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavContact = () => {
    setActiveTab('contact');
    setViewMode('contact');
    window.history.pushState({ view: 'contact' }, '', `${window.location.pathname}?tab=contact`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add a newly created round -> Navigate to ?card=<newRound.id>
  const handleCreateRound = (newRound) => {
    handleUpdateRounds(prev => [newRound, ...prev]); // Prepend so it is #1 (latest first)
    setCurrentRoundId(newRound.id);
    setViewMode('board');
    setActiveTab('cards');
    const newUrl = `${window.location.pathname}?card=${encodeURIComponent(newRound.id)}`;
    window.history.pushState({ cardId: newRound.id, view: 'board' }, '', newUrl);
    confetti({ particleCount: 70, spread: 60 });
  };

  // Delete a round
  const handleDeleteRound = (roundId) => {
    handleUpdateRounds(prev => prev.filter(r => r.id !== roundId));
    handleBackToGallery();
    setActiveTab('cards');
  };

  // Update round bookings and numbers
  const handleUpdateRoundBookings = (roundId, newNumbers, newBookings) => {
    handleUpdateRounds(prev => prev.map(r => {
      if (r.id === roundId) {
        return {
          ...r,
          numbers: newNumbers,
          bookings: newBookings
        };
      }
      return r;
    }));
  };

  // IF ADMIN URL/VIEW: Render dedicated Admin Dashboard Suite
  if (viewMode === 'admin') {
    return (
      <div className="lottery-app admin-portal-page">
        <AdminDashboard
          rounds={rounds}
          onUpdateRounds={handleUpdateRounds}
          storeCards={storeCards}
          onUpdateStoreCards={handleUpdateStoreCards}
          onExitAdmin={handleNavHome}
        />
      </div>
    );
  }

  return (
    <div className="lottery-app">
      
      {/* Top Navbar with FP Zerofour Branding & Menu Links */}
      <AppNavbar
        viewMode={viewMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNavigateHome={handleNavHome}
        onNavigateCards={handleNavCards}
        onOpenContact={handleNavContact}
        isAdmin={isAdmin}
      />

      {/* VIEW 1: HOME PAGE (หน้าหลัก: ตารางจองเลขท้าย & ประวัติตาราง) */}
      {viewMode === 'home' && (
        <CardHomePage
          rounds={rounds}
          onSelectRound={handleSelectRound}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onDeleteRound={handleDeleteRound}
          isAdmin={isAdmin}
        />
      )}

      {/* VIEW 2: CARDS SHOWCASE PAGE (หน้าการ์ดแยกออกมาเดี่ยวๆ: ผลงานการส่งเกรดของเรา) */}
      {viewMode === 'cards' && (
        <CardsPage
          cards={storeCards}
          onNavigateHome={handleNavHome}
        />
      )}

      {/* VIEW 3: ROUND DETAIL PAGE (หน้าเต็มจอสำหรับกระดานจองเลขท้าย 100 เบอร์) */}
      {viewMode === 'board' && currentRound && (
        <RoundDetailPage
          round={currentRound}
          onBackToGallery={handleBackToGallery}
          onDeleteRound={handleDeleteRound}
          onUpdateRoundBookings={handleUpdateRoundBookings}
        />
      )}

      {/* VIEW 4: CONTACT PAGE (หน้าติดต่อทีมงาน CardDiwa - แยกหน้าใหม่ตามที่ผู้ใช้สั่ง) */}
      {viewMode === 'contact' && (
        <ContactPage
          onNavigateHome={handleNavHome}
        />
      )}

      {/* Write to FP Zerofour Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setActiveTab(viewMode === 'board' ? 'cards' : 'home');
        }}
      />

      {/* Admin Login & Control Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={() => {
          setIsAdmin(true);
          confetti({ particleCount: 60, spread: 50 });
        }}
        onLogout={() => setIsAdmin(false)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Create New Card Modal */}
      <CreateRoundModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRound={handleCreateRound}
      />

      {/* Main App Footer (Matching CARD DI WA layout with FP Zerofour Branding) */}
      <AppFooter
        onNavigateHome={handleNavHome}
        onNavigateCards={handleNavCards}
        onOpenContact={handleNavContact}
        onOpenAdminLogin={() => {
          window.location.href = '/admin';
        }}
      />

      {/* Floating Background Music Player Widget (Bottom-Right) */}
      <FloatingMusicPlayer />

    </div>
  );
}

export default App;
