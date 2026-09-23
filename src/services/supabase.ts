import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Course, Lesson, Order, Purchase, Settings } from '../types';

// User provided Supabase project credentials
const DEFAULT_URL = 'https://yablzflpgahtidyjhgzj.supabase.co';
const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYmx6ZmxwZ2FodGlkeWpoZ3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNDU0MjcsImV4cCI6MjEwNTcyMTQyN30.qB0dQnKeTosFAjYgGQOcmVnDWO1uCAhUqHU6RpnF5nY';

// Retrieve from Vite environment variables or process.env safely
const envUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) ||
  ''
).trim();

const envKey = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  ''
).trim();

// Local storage override option for quick UI testing or dynamic input
const STORAGE_KEY_URL = 'digitalshop_supabase_url';
const STORAGE_KEY_KEY = 'digitalshop_supabase_key';

const getLocalStorageItem = (key: string): string => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }
  return '';
};

const setLocalStorageItem = (key: string, val: string): void => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, val);
    } catch {
      // ignore
    }
  }
};

const removeLocalStorageItem = (key: string): void => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

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
  const localUrl = getLocalStorageItem(STORAGE_KEY_URL);
  const localKey = getLocalStorageItem(STORAGE_KEY_KEY);
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
    setLocalStorageItem(STORAGE_KEY_URL, formattedUrl);
  } else {
    removeLocalStorageItem(STORAGE_KEY_URL);
  }

  if (anonKey.trim()) {
    setLocalStorageItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    removeLocalStorageItem(STORAGE_KEY_KEY);
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

// ================== DATA MAPPERS (camelCase <-> snake_case) ==================

export const productToDb = (p: Product) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  price: p.price,
  original_price: p.originalPrice || null,
  type: p.type || 'product',
  category: p.category,
  image: p.image,
  featured: !!p.featured,
  delivery_time: p.deliveryTime || null,
  features: p.features || [],
  created_at: p.createdAt || new Date().toISOString()
});

export const productFromDb = (d: any): Product => ({
  id: d.id,
  title: d.title,
  description: d.description || '',
  price: Number(d.price),
  originalPrice: d.original_price ? Number(d.original_price) : undefined,
  type: d.type || 'product',
  category: d.category,
  image: d.image,
  featured: !!d.featured,
  deliveryTime: d.delivery_time || undefined,
  features: Array.isArray(d.features) ? d.features : [],
  createdAt: d.created_at || new Date().toISOString()
});

export const courseToDb = (c: Course) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  price: c.price,
  original_price: c.originalPrice || null,
  thumbnail: c.thumbnail,
  category: c.category,
  instructor: c.instructor,
  total_duration: c.totalDuration || null,
  total_lessons: c.totalLessons || 0,
  level: c.level || 'বিগিনার',
  skills_learned: c.skillsLearned || [],
  created_at: c.createdAt || new Date().toISOString()
});

export const courseFromDb = (d: any): Course => ({
  id: d.id,
  title: d.title,
  description: d.description || '',
  price: Number(d.price),
  originalPrice: d.original_price ? Number(d.original_price) : undefined,
  thumbnail: d.thumbnail,
  category: d.category,
  instructor: d.instructor,
  totalDuration: d.total_duration || '',
  totalLessons: Number(d.total_lessons || 0),
  level: d.level || 'বিগিনার',
  skillsLearned: Array.isArray(d.skills_learned) ? d.skills_learned : [],
  createdAt: d.created_at || new Date().toISOString()
});

export const lessonToDb = (l: Lesson) => ({
  id: l.id,
  course_id: l.courseId,
  title: l.title,
  cloudflare_video_id: l.cloudflareVideoId,
  duration: l.duration,
  order_index: l.orderIndex,
  is_free_preview: !!l.isFreePreview,
  notes: l.notes || null
});

export const lessonFromDb = (d: any): Lesson => ({
  id: d.id,
  courseId: d.course_id,
  title: d.title,
  cloudflareVideoId: d.cloudflare_video_id,
  duration: d.duration,
  orderIndex: Number(d.order_index || 1),
  isFreePreview: !!d.is_free_preview,
  notes: d.notes || undefined
});

export const orderToDb = (o: Order) => ({
  id: o.id,
  customer_name: o.customerName,
  phone: o.phone,
  address: o.address,
  product_id: o.productId,
  product_title: o.productTitle,
  price: o.price,
  status: o.status,
  notes: o.notes || null,
  created_at: o.createdAt,
  updated_at: o.updatedAt
});

export const orderFromDb = (d: any): Order => ({
  id: d.id,
  customerName: d.customer_name,
  phone: d.phone,
  address: d.address,
  productId: d.product_id,
  productTitle: d.product_title,
  productType: 'product',
  price: Number(d.price),
  status: d.status,
  notes: d.notes || undefined,
  createdAt: d.created_at,
  updatedAt: d.updated_at
});

export const purchaseToDb = (p: Purchase) => ({
  id: p.id,
  user_id: p.userId,
  user_name: p.userName,
  user_email: p.userEmail,
  course_id: p.courseId,
  course_title: p.courseTitle,
  price: p.price,
  payment_method: p.paymentMethod,
  status: p.status,
  purchased_at: p.purchasedAt
});

export const purchaseFromDb = (d: any): Purchase => ({
  id: d.id,
  userId: d.user_id,
  userName: d.user_name,
  userEmail: d.user_email,
  courseId: d.course_id,
  courseTitle: d.course_title,
  price: Number(d.price),
  paymentMethod: d.payment_method,
  status: d.status,
  purchasedAt: d.purchased_at
});

// ================== DATA SYNCING & FETCHING ==================

/**
 * Fetch all products from Supabase
 */
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(productFromDb);
  } catch (err) {
    return null;
  }
};

/**
 * Fetch all courses from Supabase
 */
export const fetchCoursesFromSupabase = async (): Promise<Course[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map(courseFromDb);
  } catch (err) {
    return null;
  }
};

/**
 * Fetch all lessons from Supabase
 */
export const fetchLessonsFromSupabase = async (): Promise<Lesson[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('lessons').select('*').order('order_index', { ascending: true });
    if (error || !data) return null;
    return data.map(lessonFromDb);
  } catch (err) {
    return null;
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
    let syncedCount = 0;

    // 1. Sync Products
    if (products.length > 0) {
      const dbProducts = products.map(productToDb);
      const { error: prodErr } = await supabase
        .from('products')
        .upsert(dbProducts, { onConflict: 'id' });
      if (prodErr && prodErr.code !== '42P01') {
        console.warn('Sync products warning:', prodErr);
      } else {
        syncedCount += products.length;
      }
    }

    // 2. Sync Courses
    if (courses.length > 0) {
      const dbCourses = courses.map(courseToDb);
      const { error: crsErr } = await supabase
        .from('courses')
        .upsert(dbCourses, { onConflict: 'id' });
      if (crsErr && crsErr.code !== '42P01') {
        console.warn('Sync courses warning:', crsErr);
      } else {
        syncedCount += courses.length;
      }
    }

    // 3. Sync Lessons
    if (lessons.length > 0) {
      const dbLessons = lessons.map(lessonToDb);
      const { error: lesErr } = await supabase
        .from('lessons')
        .upsert(dbLessons, { onConflict: 'id' });
      if (lesErr && lesErr.code !== '42P01') {
        console.warn('Sync lessons warning:', lesErr);
      } else {
        syncedCount += lessons.length;
      }
    }

    return { success: true, count: syncedCount };
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
