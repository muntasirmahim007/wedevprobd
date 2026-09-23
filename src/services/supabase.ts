import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Course, Lesson, Order, Purchase, Settings } from '../types';

// User provided Supabase project credentials
const DEFAULT_URL = 'https://yablzflpgahtidyjhgzj.supabase.co';
const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYmx6ZmxwZ2FodGlkeWpoZ3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNDU0MjcsImV4cCI6MjEwNTcyMTQyN30.qB0dQnKeTosFAjYgGQOcmVnDWO1uCAhUqHU6RpnF5nY';

// Retrieve from Vite environment variables
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Local storage override option for quick UI testing or dynamic input
const STORAGE_KEY_URL = 'digitalshop_supabase_url';
const STORAGE_KEY_KEY = 'digitalshop_supabase_key';

/**
 * Parses dashboard URLs or raw project IDs into the correct API URL
 * e.g. https://supabase.com/dashboard/project/yablzflpgahtidyjhgzj -> https://yablzflpgahtidyjhgzj.supabase.co
 */
export const formatSupabaseUrl = (input: string): string => {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\/project\/([a-z0-9]+)/i);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  if (/^[a-z0-9]{20}$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return trimmed;
};

export const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);
  const url = formatSupabaseUrl(localUrl || envUrl || DEFAULT_URL);
  const anonKey = (localKey || envKey || DEFAULT_KEY).trim();
  return {
    url,
    anonKey,
    isCustom: !!localUrl
  };
};

export const setSupabaseConfig = (url: string, anonKey: string) => {
  clientInstance = null; // Invalidate previous client instance
  const formattedUrl = formatSupabaseUrl(url);
  if (formattedUrl) {
    localStorage.setItem(STORAGE_KEY_URL, formattedUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (anonKey.trim()) {
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || url === 'https://your-project-id.supabase.co') {
    return null;
  }

  try {
    if (!clientInstance) {
      clientInstance = createClient(url, anonKey);
    }
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  return !!getSupabaseClient();
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase URL এবং Anon Key পাওয়া যায়নি। সেটিংস বা .env ফাইল চেক করুন।'
    };
  }

  try {
    // Attempt a lightweight ping query
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, it's still connected to the project!
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Supabase প্রকল্পের সাথে সফলভাবে কানেক্ট হয়েছে! তবে টেবিল তৈরি করতে SQL স্ক্রিপ্ট রান করুন।'
        };
      }
      return {
        success: false,
        message: `Supabase ত্রুটি: ${error.message} (${error.code || 'Code unknown'})`
      };
    }
    return {
      success: true,
      message: 'Supabase ডাটাবেজের সাথে সফলভাবে সংযোগ স্থাপিত হয়েছে!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `সংযোগ ব্যর্থ হয়েছে: ${err.message || 'নেটওয়ার্ক এরর'}`
    };
  }
};

/**
 * Sync local products and courses to Supabase
 */
export const syncAllToSupabase = async (
  products: Product[],
  courses: Course[],
  lessons: Lesson[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, count: 0, error: 'Supabase নট কানেক্টেড' };
  }

  try {
    // 1. Sync Products
    if (products.length > 0) {
      const { error: prodErr } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });
      if (prodErr && prodErr.code !== '42P01') {
        console.warn('Sync products warning:', prodErr);
      }
    }

    // 2. Sync Courses
    if (courses.length > 0) {
      const { error: crsErr } = await supabase
        .from('courses')
        .upsert(courses, { onConflict: 'id' });
      if (crsErr && crsErr.code !== '42P01') {
        console.warn('Sync courses warning:', crsErr);
      }
    }

    // 3. Sync Lessons
    if (lessons.length > 0) {
      const { error: lesErr } = await supabase
        .from('lessons')
        .upsert(lessons, { onConflict: 'id' });
      if (lesErr && lesErr.code !== '42P01') {
        console.warn('Sync lessons warning:', lesErr);
      }
    }

    return { success: true, count: products.length + courses.length + lessons.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message };
  }
};

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- ডিজিটাল শপ ও লার্নিং একাডেমি (Supabase Schema)
-- Run this script in your Supabase SQL Editor:
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

-- 4. ORDERS TABLE (Tracking)
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

-- 5. PURCHASES TABLE (Course Access)
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

-- ROW LEVEL SECURITY (RLS) POLICIES
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

-- CREATE FULL ACCESS POLICIES
CREATE POLICY "Public products full access" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public courses full access" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public lessons full access" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public orders full access" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public purchases full access" ON public.purchases FOR ALL USING (true) WITH CHECK (true);
`;
