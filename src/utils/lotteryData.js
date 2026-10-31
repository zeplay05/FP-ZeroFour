// Helper utilities and initial card gallery items for 00-99 lottery

export const THEMES = {
  gold: { id: 'gold', name: '👑 มหาเศรษฐีทองคำ' },
  pirate: { id: 'pirate', name: '🏴‍☠️ โจรสลัดวันพีช' },
  neon: { id: 'neon', name: '⚡ ไซเบอร์นีออน' },
  emerald: { id: 'emerald', name: '🍀 เขียวมรกต' }
};

export const BOARD_TYPES = {
  duck: {
    id: 'duck',
    name: 'วิ่งเป็ด',
    promoText: '3 เบอร์ ลด 10',
    promoBadge: '🦆 วิ่งเป็ด (3 เบอร์ ลด 10)',
    promoDetail: 'ซื้อครบทุก 3 เลข ลด 10 บาท',
    icon: '🦆',
    discountPerStep: 10,
    numbersPerStep: 3,
    startNumber: 1, // วิ่งเป็ด เริ่มที่ 01
    defaultCount: 30,
    calculateDiscount: (count) => Math.floor(count / 3) * 10
  },
  wheel: {
    id: 'wheel',
    name: 'วงล้อ',
    promoText: '3 เบอร์ ลด 10',
    promoBadge: '🎡 วงล้อ (3 เบอร์ ลด 10)',
    promoDetail: 'ซื้อครบทุก 3 เลข ลด 10 บาท',
    icon: '🎡',
    discountPerStep: 10,
    numbersPerStep: 3,
    startNumber: 1, // วงล้อ เริ่มที่ 01
    defaultCount: 30,
    calculateDiscount: (count) => Math.floor(count / 3) * 10
  },
  lotto: {
    id: 'lotto',
    name: 'ทายหวย',
    promoText: '4 เบอร์ ลด 10 / 8 เบอร์ ลด 20',
    promoBadge: '🎟️ ทายหวย (4 เลข ลด 10 / 8 เลข ลด 20)',
    promoDetail: 'ซื้อ 4 เลข ลด 10.- / 8 เลข ลด 20.- (ทุก 4 เลข ลด 10 บาท)',
    icon: '🎟️',
    discountPerStep: 10,
    numbersPerStep: 4,
    startNumber: 0, // ทายหวย เริ่มที่ 00-99
    defaultCount: 100,
    calculateDiscount: (count) => Math.floor(count / 4) * 10
  }
};

export const getBoardTypeInfo = (boardType = 'lotto') => {
  return BOARD_TYPES[boardType] || BOARD_TYPES.lotto;
};

/**
 * Calculates raw price, promotional discount, and final price for a booking.
 */
export const calculateBookingPrice = (booking, board) => {
  if (!booking || !board) return { rawPrice: 0, discount: 0, finalPrice: 0 };
  const count = Array.isArray(booking.numbers) ? booking.numbers.length : 0;
  const pricePerNum = Number(board.pricePerNumber) || 50;
  const rawPrice = count * pricePerNum;

  // If booking has an explicitly saved finalPrice
  if (booking.finalPrice != null && typeof booking.finalPrice === 'number') {
    const discount = booking.discount != null ? booking.discount : Math.max(0, rawPrice - booking.finalPrice);
    return { rawPrice, discount, finalPrice: booking.finalPrice };
  }

  // Calculate promotional discount based on board type
  const typeInfo = getBoardTypeInfo(board.boardType);
  const discount = booking.discount != null
    ? Number(booking.discount)
    : (typeInfo?.calculateDiscount ? typeInfo.calculateDiscount(count) : 0);
  const finalPrice = Math.max(0, rawPrice - discount);

  return { rawPrice, discount, finalPrice };
};

export const formatThaiDate = (date = new Date()) => {
  const d = new Date(date);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${hours}:${minutes}`;
};

// Generate numbers list with configurable count and start number (00 or 01)
export const generateNumbersWithPreset = (presetBooked = {}, totalCount = 100, startFrom = 0) => {
  const list = [];
  for (let i = 0; i < totalCount; i++) {
    const numStr = (startFrom + i).toString().padStart(2, '0');
    if (presetBooked[numStr]) {
      list.push({
        number: numStr,
        status: presetBooked[numStr].status, // 'booked' (รอยอด) or 'paid' (จ่ายแล้ว)
        customerName: presetBooked[numStr].facebookName || presetBooked[numStr].customerName || '',
        bookingId: presetBooked[numStr].bookingId || ''
      });
    } else {
      list.push({
        number: numStr,
        status: 'available',
        customerName: '',
        bookingId: ''
      });
    }
  }
  return list;
};

export const generateInitialNumbers = (boardType = 'duck', customCount = null) => {
  const typeInfo = getBoardTypeInfo(boardType);
  const startFrom = typeInfo.startNumber ?? ((boardType === 'duck' || boardType === 'wheel') ? 1 : 0);
  const count = customCount || typeInfo.defaultCount || (startFrom === 1 ? 30 : 100);
  return generateNumbersWithPreset({}, count, startFrom);
};

// Exact preset matching user screenshot
const sampleBookedNumbers = {
  '05': { status: 'paid', facebookName: 'ลูกค้าตัวอย่าง' },
  '06': { status: 'paid', facebookName: 'ลูกค้าตัวอย่าง' },
  '28': { status: 'booked', facebookName: 'FP Zerofour' },
  '82': { status: 'booked', facebookName: 'FP Zerofour' },
  '38': { status: 'booked', facebookName: 'FP Zerofour' },
  '83': { status: 'booked', facebookName: 'FP Zerofour' }
};

const sampleBookingsList = [
  {
    id: 'b-1',
    facebookName: 'ลูกค้าตัวอย่าง',
    numbers: ['05', '06'],
    status: 'paid', // จ่ายแล้ว
    timeStr: '25 ต.ค. 13:33',
    createdAt: Date.now() - 1000 * 60 * 60
  },
  {
    id: 'b-2',
    facebookName: 'FP Zerofour',
    numbers: ['28', '82', '38', '83'],
    status: 'booked', // รอยอด
    timeStr: '25 ต.ค. 10:46',
    createdAt: Date.now() - 1000 * 60 * 180
  }
];

const now = Date.now();

export const initialLotteryRounds = [
  {
    id: 'board-1793018346203',
    title: 'วงล้อ นิกะ PSA10',
    roundName: 'วงล้อ นิกะ PSA10 (01-30)',
    pricePerNumber: 160,
    boardType: 'wheel',
    gradient: 'indigo',
    theme: 'neon',
    createdAt: 1793018346203,
    status: 'drawn',
    winningNumber: '23',
    numbers: [],
    bookings: []
  }
];
