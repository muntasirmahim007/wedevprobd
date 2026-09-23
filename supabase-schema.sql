-- ==========================================
-- ডিজিটাল শপ ও লার্নিং একাডেমি (Supabase SQL Schema)
-- 
-- Instructions:
-- 1. Go to your Supabase Project Dashboard (https://app.supabase.com)
-- 2. Open "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "Run"
-- ==========================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  type TEXT DEFAULT 'product',
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  delivery_time TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  thumbnail TEXT NOT NULL,
  category TEXT NOT NULL,
  instructor TEXT NOT NULL,
  total_duration TEXT,
  total_lessons INTEGER DEFAULT 0,
  level TEXT DEFAULT 'বিগিনার',
  skills_learned JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. LESSONS TABLE (Cloudflare Stream)
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cloudflare_video_id TEXT NOT NULL,
  duration TEXT,
  order_index INTEGER DEFAULT 1,
  is_free_preview BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. ORDERS TABLE (Live Order Tracking)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. PURCHASES TABLE (Student Course Access)
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- DROP OLD POLICIES IF THEY EXIST (Safe for re-running)
DROP POLICY IF EXISTS "Public products viewable" ON public.products;
DROP POLICY IF EXISTS "Public products full access" ON public.products;
DROP POLICY IF EXISTS "Public courses viewable" ON public.courses;
DROP POLICY IF EXISTS "Public courses full access" ON public.courses;
DROP POLICY IF EXISTS "Public lessons viewable" ON public.lessons;
DROP POLICY IF EXISTS "Public lessons full access" ON public.lessons;
DROP POLICY IF EXISTS "Public can place orders" ON public.orders;
DROP POLICY IF EXISTS "Public can track orders" ON public.orders;
DROP POLICY IF EXISTS "Public orders full access" ON public.orders;
DROP POLICY IF EXISTS "Public purchases read" ON public.purchases;
DROP POLICY IF EXISTS "Public purchases insert" ON public.purchases;
DROP POLICY IF EXISTS "Public purchases full access" ON public.purchases;

-- CREATE ROBUST POLICIES (Allows viewing, adding, syncing, and updating)
CREATE POLICY "Public products full access" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public courses full access" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public lessons full access" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public orders full access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public purchases full access" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
