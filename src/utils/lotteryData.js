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
    calculateDiscount: (count) => Math.floor(count / 4) * 10
  }
};

export const getBoardTypeInfo = (boardType = 'lotto') => {
  return BOARD_TYPES[boardType] || BOARD_TYPES.lotto;
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

// Generate 100 numbers 00 to 99 with given preset booked map
export const generateNumbersWithPreset = (presetBooked = {}) => {
  const list = [];
  for (let i = 0; i <= 99; i++) {
    const numStr = i.toString().padStart(2, '0');
    if (presetBooked[numStr]) {
      list.push({
        number: numStr,
        status: presetBooked[numStr].status, // 'booked' (รอยอด) or 'paid' (จ่ายแล้ว)
        customerName: presetBooked[numStr].facebookName || '',
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

export const generateInitialNumbers = (density = 'standard') => generateNumbersWithPreset({});

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
    id: 'card-active-psa',
    title: 'รางวัลเลขท้าย PSA 10 (ตัวอย่าง)',
    roundName: 'รางวัลเลขท้าย PSA 10',
    pricePerNumber: 75,
    coverImage: null,
    gradient: 'indigo',
    theme: 'neon',
    createdAt: now,
    status: 'open',
    winningNumber: '',
    numbers: generateNumbersWithPreset(sampleBookedNumbers),
    bookings: sampleBookingsList
  },
  {
    id: 'card-closed-1',
    title: 'ภูเขายามเช้า',
    roundName: 'งวดเบอร์ทองภูเขายามเช้า 00-99',
    pricePerNumber: 50,
    coverImage: null,
    gradient: 'lime',
    theme: 'gold',
    createdAt: now - 1000 * 60 * 10,
    status: 'closed',
    winningNumber: '42',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-2',
    title: 'ทะเลสีฟ้า',
    roundName: 'งวดเบอร์นำโชคทะเลสีฟ้า 00-99',
    pricePerNumber: 50,
    coverImage: null,
    gradient: 'emerald',
    theme: 'emerald',
    createdAt: now - 1000 * 60 * 20,
    status: 'closed',
    winningNumber: '87',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-3',
    title: 'ตลาดน้ำ',
    roundName: 'งวดเบอร์เงินสดตลาดน้ำ 00-99',
    pricePerNumber: 50,
    coverImage: null,
    gradient: 'blue',
    theme: 'pirate',
    createdAt: now - 1000 * 60 * 30,
    status: 'closed',
    winningNumber: '19',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-4',
    title: 'ป่าฝนเขตร้อน',
    roundName: 'งวดเบอร์ทองป่าฝนเขตร้อน 00-99',
    pricePerNumber: 50,
    coverImage: null,
    gradient: 'teal',
    theme: 'emerald',
    createdAt: now - 1000 * 60 * 40,
    status: 'closed',
    winningNumber: '55',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-5',
    title: 'น้ำตกใหญ่',
    roundName: 'งวดเบอร์ทองน้ำตกใหญ่ 00-99',
    pricePerNumber: 100,
    coverImage: null,
    gradient: 'coral',
    theme: 'pirate',
    createdAt: now - 1000 * 60 * 50,
    status: 'closed',
    winningNumber: '03',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-6',
    title: 'เกาะมหาสมบัติ',
    roundName: 'งวดเบอร์ทองเกาะมหาสมบัติ 00-99',
    pricePerNumber: 50,
    coverImage: null,
    gradient: 'gold',
    theme: 'gold',
    createdAt: now - 1000 * 60 * 60,
    status: 'closed',
    winningNumber: '76',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-7',
    title: 'ค่ำคืนดวงดาว',
    roundName: 'งวดเบอร์นำโชคค่ำคืนดวงดาว 00-99',
    pricePerNumber: 50,
    coverImage: null,
    gradient: 'indigo',
    theme: 'neon',
    createdAt: now - 1000 * 60 * 70,
    status: 'closed',
    winningNumber: '88',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  },
  {
    id: 'card-closed-8',
    title: 'สายรุ้งตะวันตก',
    roundName: 'งวดเบอร์เงินสดสายรุ้งตะวันตก 00-99',
    pricePerNumber: 80,
    coverImage: null,
    gradient: 'pink',
    theme: 'gold',
    createdAt: now - 1000 * 60 * 80,
    status: 'closed',
    winningNumber: '34',
    numbers: generateNumbersWithPreset({}),
    bookings: []
  }
];
