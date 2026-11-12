import { fetchSettingFromSupabase, saveSettingToSupabase } from './supabaseClient';

export const CASE_TYPES = ['PSA', 'CGC', 'PCG', 'BGS'];

export const DEFAULT_MATERIALS = [
  { id: 'matte', name: 'กระดาษด้าน', price: 140 },
  { id: 'glossy', name: 'กระดาษมันวาว', price: 150 },
  { id: 'hologram', name: 'โฮโลแกรม', price: 160 }
];

export const DEFAULT_SHIPPING = {
  fee: 80,
  freeThreshold: 10
};

export const DEFAULT_BORDERS = [
  {
    id: 'border-01',
    code: 'FP-B01',
    name: 'ลูฟี่ เกียร์ 5 ซันก็อด (Sun God Nika)',
    caseType: 'PSA',
    category: 'One Piece',
    image: '/graded-cards/luffy_tarou.png',
    description: 'ลายลิขสิทธิ์พิเศษขอบ PSA การ์ดลูฟี่เกียร์ 5 เรืองแสงนีออน',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'border-02',
    code: 'FP-B02',
    name: 'น้องช็อปเปอร์ สำลีสายรุ้ง (Cotton Candy)',
    caseType: 'PCG',
    category: 'One Piece',
    image: '/graded-cards/pikachu_promo.png',
    description: 'ขอบเคส PCG 10 สำหรับการ์ดน้องช็อปเปอร์สุดน่ารัก',
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'border-03',
    code: 'FP-B03',
    name: 'เบจิต้า ร่างอีโก้เพลิงม่วง (Ultra Ego Vegeta)',
    caseType: 'BGS',
    category: 'Dragon Ball',
    image: '/graded-cards/vegeta.png',
    description: 'ขอบเคส BGS สีม่วงเมทัลลิก พลังทำลายล้าง',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'border-04',
    code: 'FP-B04',
    name: 'เบจิตโต้ ฟิวชั่นบลู (Vegetto Super Saiyan Blue)',
    caseType: 'CGC',
    category: 'Dragon Ball',
    image: '/graded-cards/vegetto.png',
    description: 'ขอบเคส CGC พลังไซย่าบลูประกายแสงสีฟ้า',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'border-05',
    code: 'FP-B05',
    name: 'ลูคาริโอ้ วีสตาร์ ออร่า (Lucario VSTAR)',
    caseType: 'PSA',
    category: 'Pokemon',
    image: '/graded-cards/lucario_vstar.png',
    description: 'ขอบเคส PSA ออร่าสีฟ้า-เหลืองคมชัดระดับพรีเมียม',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'border-06',
    code: 'FP-B06',
    name: 'นารูโตะ เซียนหกวิถี (Sage of Six Paths)',
    caseType: 'PCG',
    category: 'Naruto',
    image: '/graded-cards/uzumaki_naruto.png',
    description: 'ขอบเคส PCG ลายนารูโตะลูกแก้วหกวิถีสีทองประกาย',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'border-07',
    code: 'FP-B07',
    name: 'อิจิโกะ บังไค มังกรขาว (Ichigo Bankai)',
    caseType: 'BGS',
    category: 'Bleach',
    image: '/graded-cards/ichigo_kurosaki.png',
    description: 'ขอบเคส BGS ลายยมทูตดำแดงพลังเก็ตสึกะเทนโช',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'border-08',
    code: 'FP-B08',
    name: 'เกรทไซย่าแมน ฮีโร่ยุติธรรม (Great Saiyaman)',
    caseType: 'CGC',
    category: 'Dragon Ball',
    image: '/graded-cards/great_saiyaman.png',
    description: 'ขอบเคส CGC ลายเกรทไซย่าแมนสุดกวน',
    createdAt: Date.now()
  }
];

export const formatOrderCode = (seq) => {
  const num = Number(seq) || 1;
  return `FP-${String(num).padStart(4, '0')}`;
};

const BORDERS_STORAGE_KEY = 'fp_custom_borders_catalog';
const MATERIALS_STORAGE_KEY = 'fp_custom_borders_materials';
const SHIPPING_STORAGE_KEY = 'fp_custom_borders_shipping';
const ORDERS_STORAGE_KEY = 'fp_custom_borders_orders';
const ORDER_SEQ_KEY = 'fp_custom_borders_order_seq';

// Load borders catalog
export const loadBordersCatalog = async () => {
  try {
    const remote = await fetchSettingFromSupabase('custom_borders_catalog');
    if (Array.isArray(remote) && remote.length > 0) {
      localStorage.setItem(BORDERS_STORAGE_KEY, JSON.stringify(remote));
      return remote;
    }
  } catch (e) {
    console.warn('Load borders from Supabase failed, using local');
  }

  const local = localStorage.getItem(BORDERS_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return DEFAULT_BORDERS;
};

// Save borders catalog
export const saveBordersCatalog = async (borders) => {
  localStorage.setItem(BORDERS_STORAGE_KEY, JSON.stringify(borders));
  try {
    await saveSettingToSupabase('custom_borders_catalog', borders);
  } catch (e) {
    console.warn('Sync borders to Supabase failed');
  }
};

// Load materials
export const loadMaterialsConfig = async () => {
  try {
    const remote = await fetchSettingFromSupabase('custom_borders_materials');
    if (Array.isArray(remote) && remote.length > 0) {
      localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(remote));
      return remote;
    }
  } catch (e) {}

  const local = localStorage.getItem(MATERIALS_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return DEFAULT_MATERIALS;
};

// Save materials
export const saveMaterialsConfig = async (materials) => {
  localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materials));
  try {
    await saveSettingToSupabase('custom_borders_materials', materials);
  } catch (e) {}
};

// Load shipping
export const loadShippingConfig = async () => {
  try {
    const remote = await fetchSettingFromSupabase('custom_borders_shipping');
    if (remote && typeof remote.fee === 'number') {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(remote));
      return remote;
    }
  } catch (e) {}

  const local = localStorage.getItem(SHIPPING_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && typeof parsed.fee === 'number') return parsed;
    } catch (e) {}
  }
  return DEFAULT_SHIPPING;
};

// Save shipping
export const saveShippingConfig = async (shipping) => {
  localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
  try {
    await saveSettingToSupabase('custom_borders_shipping', shipping);
  } catch (e) {}
};

// Load orders
export const loadBorderOrders = async () => {
  try {
    const remote = await fetchSettingFromSupabase('custom_borders_orders');
    if (Array.isArray(remote)) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(remote));
      return remote;
    }
  } catch (e) {}

  const local = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

// Save orders
export const saveBorderOrders = async (orders) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  try {
    await saveSettingToSupabase('custom_borders_orders', orders);
  } catch (e) {}
};

// Get next sequential order code
export const getNextOrderCode = async () => {
  let nextSeq = 1;
  try {
    const remoteSeq = await fetchSettingFromSupabase('custom_borders_order_seq');
    if (typeof remoteSeq === 'number' && remoteSeq >= 1) {
      nextSeq = remoteSeq;
    } else {
      const localSeq = Number(localStorage.getItem(ORDER_SEQ_KEY)) || 1;
      nextSeq = localSeq;
    }
  } catch (e) {
    const localSeq = Number(localStorage.getItem(ORDER_SEQ_KEY)) || 1;
    nextSeq = localSeq;
  }

  const orderCode = formatOrderCode(nextSeq);
  const updatedSeq = nextSeq + 1;
  localStorage.setItem(ORDER_SEQ_KEY, String(updatedSeq));
  saveSettingToSupabase('custom_borders_order_seq', updatedSeq).catch(() => {});

  return { orderCode, seq: nextSeq };
};
