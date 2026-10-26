-- ==============================================================================
-- FP ZERO FOUR - SUPABASE DATABASE SCHEMA
-- วิธีใช้: คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู SQL Editor ของ Supabase Dashboard แล้วกด Run
-- ==============================================================================

-- 1. ตารางเก็บข้อมูลกระดาน / รอบหวย (Lottery Rounds)
CREATE TABLE IF NOT EXISTS public.lottery_rounds (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    round_name TEXT,
    price_per_number NUMERIC DEFAULT 0,
    cover_image TEXT,
    gradient TEXT DEFAULT 'indigo',
    theme TEXT DEFAULT 'neon',
    status TEXT DEFAULT 'open',
    winning_number TEXT DEFAULT '',
    numbers JSONB DEFAULT '[]'::jsonb,
    bookings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ตารางเก็บข้อมูลการ์ด Graded (Store Cards)
CREATE TABLE IF NOT EXISTS public.store_cards (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    grade TEXT DEFAULT 'PCG 10',
    price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'available',
    cover_image TEXT DEFAULT '',
    detail_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT DEFAULT '',
    cert TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ตารางเก็บการตั้งค่าของระบบ (App Settings เช่น ลิงก์ติดต่อ, ข้อมูลเพลง)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. เปิดใช้งาน Row Level Security (RLS) เพื่อความปลอดภัย
ALTER TABLE public.lottery_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy ให้ผู้เข้าชมและระบบสามารถ อ่าน/เขียน ได้ (สำหรับใช้งาน Anon Key)
DROP POLICY IF EXISTS "Public full access to lottery_rounds" ON public.lottery_rounds;
CREATE POLICY "Public full access to lottery_rounds" 
ON public.lottery_rounds FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to store_cards" ON public.store_cards;
CREATE POLICY "Public full access to store_cards" 
ON public.store_cards FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to app_settings" ON public.app_settings;
CREATE POLICY "Public full access to app_settings" 
ON public.app_settings FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. เปิดใช้งาน Realtime Replication เพื่อให้หน้าจอของทุกคนอัปเดตทันทีแบบ Real-time
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lottery_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
