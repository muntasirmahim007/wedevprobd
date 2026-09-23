import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Video,
  Key,
  Mail,
  Smartphone,
  Save,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Database,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';
import {
  Product,
  Course,
  Lesson,
  Order,
  Purchase,
  User,
  Settings,
  OrderStatus,
  NotificationLog
} from '../../types';
import {
  getProducts,
  saveProduct,
  deleteProduct,
  getCourses,
  saveCourse,
  deleteCourse,
  getLessons,
  getLessonsByCourse,
  saveLesson,
  deleteLesson,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getPurchases,
  enrollUserInCourse,
  revokeCourseAccess,
  getUsers,
  getSettings,
  saveSettings,
  getNotificationLogs,
  useStoreSubscription
} from '../../services/storage';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  testSupabaseConnection,
  syncAllToSupabase,
  SUPABASE_SQL_SCHEMA,
  isSupabaseConfigured
} from '../../services/supabase';
import { useToast } from '../Toast';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'courses' | 'orders' | 'customers' | 'settings'
  >('overview');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettingsState] = useState<Settings>(getSettings());
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);

  // Selection states for CRUD
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // Supabase Integration States
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  // Manual Course Enrollment Form
  const [enrollUserId, setEnrollUserId] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [enrollPaymentMethod, setEnrollPaymentMethod] = useState('ম্যানুয়াল বিকাশ / ক্যাশ');

  // Reload data
  const loadAll = () => {
    setProducts(getProducts());
    setCourses(getCourses());
    setOrders(getOrders());
    setPurchases(getPurchases());
    setUsers(getUsers());
    setSettingsState(getSettings());
    setNotificationLogs(getNotificationLogs());
  };

  useEffect(() => {
    loadAll();
    const unsub = useStoreSubscription(loadAll);
    return () => unsub();
  }, []);

  // Sync lessons when selected course changes
  useEffect(() => {
    if (selectedCourseForLessons) {
      setCourseLessons(getLessonsByCourse(selectedCourseForLessons.id));
    }
  }, [selectedCourseForLessons, products, courses]);

  // Calculations for Overview
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.price, 0) +
    purchases
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.price, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  };

  // Supabase Configuration Handlers
  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseConfig(supabaseUrl, supabaseKey);
    showToast('সুপাবেস ক্রেডেনশিয়াল সংরক্ষিত হয়েছে!', 'success');
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestStatus(null);
    setSupabaseConfig(supabaseUrl, supabaseKey);
    const result = await testSupabaseConnection();
    setIsTestingSupabase(false);
    setSupabaseTestStatus({
      tested: true,
      success: result.success,
      message: result.message
    });
    if (result.success) {
      showToast('সুপাবেস ডাটাবেজ সংযোগ সফল হয়েছে!', 'success');
    } else {
      showToast('সুপাবেস সংযোগ ব্যর্থ হয়েছে। তথ্য যাচাই করুন।', 'error');
    }
  };

  const handleSyncSupabase = async () => {
    if (!supabaseUrl || !supabaseKey) {
      showToast('প্রথমে Supabase URL এবং Anon Key প্রদান করুন।', 'error');
      return;
    }
    setIsSyncingSupabase(true);
    setSupabaseConfig(supabaseUrl, supabaseKey);
    const allLessons = getLessons();
    const result = await syncAllToSupabase(products, courses, allLessons);
    setIsSyncingSupabase(false);
    if (result.success) {
      showToast(`সফলভাবে ${result.count}টি রেকর্ড Supabase-এ সিঙ্ক হয়েছে!`, 'success');
    } else {
      showToast(`সিঙ্ক ব্যর্থ: ${result.error || 'টেবিল উপস্থিত নেই। স্কিমা স্ক্রিপ্ট রান করুন।'}`, 'error');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setHasCopiedSql(true);
    showToast('Supabase SQL স্কিমা ক্লিপবোর্ডে কপি হয়েছে!', 'success');
    setTimeout(() => setHasCopiedSql(false), 2500);
  };

  // Product CRUD Handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    saveProduct(editingProduct);
    showToast('প্রোডাক্ট সফলভাবে সংরক্ষণ করা হয়েছে!', 'success');
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleCreateNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      title: '',
      description: '',
      price: 1000,
      originalPrice: 1500,
      type: 'product',
      category: 'ওয়েবসাইট ডেভেলপমেন্ট',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      featured: false,
      deliveryTime: '৩-৫ দিন',
      features: ['রিস্পন্সিভ ডিজাইন', '১ বছর সাপোর্ট'],
      createdAt: new Date().toISOString()
    });
    setShowProductModal(true);
  };

  // Course CRUD Handlers
  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    saveCourse(editingCourse);
    showToast('কোর্স সফলভাবে সংরক্ষণ করা হয়েছে!', 'success');
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleCreateNewCourse = () => {
    setEditingCourse({
      id: `course-${Date.now()}`,
      title: '',
      description: '',
      price: 2500,
      originalPrice: 4000,
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      category: 'ওয়েব ডেভেলপমেন্ট',
      instructor: 'ইঞ্জিনিয়ার মোর্শেদ আলম',
      totalDuration: '২০ ঘণ্টা',
      totalLessons: 0,
      level: 'বিগিনার',
      skillsLearned: ['HTML, CSS, JavaScript', 'React ও Tailwind CSS'],
      createdAt: new Date().toISOString()
    });
    setShowCourseModal(true);
  };

  // Lesson CRUD Handlers
  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !selectedCourseForLessons) return;
    saveLesson(editingLesson);
    showToast('লেসন ও ভিডিও আইডি সংরক্ষণ করা হয়েছে!', 'success');
    setShowLessonModal(false);
    setEditingLesson(null);
    setCourseLessons(getLessonsByCourse(selectedCourseForLessons.id));
  };

  const handleCreateNewLesson = () => {
    if (!selectedCourseForLessons) return;
    setEditingLesson({
      id: `les-${Date.now()}`,
      courseId: selectedCourseForLessons.id,
      title: `${courseLessons.length + 1}. নতুন লেসন`,
      cloudflareVideoId: '5d5bc37ffcf54c9b82e996832fb36fb1',
      duration: '১৫:০০',
      orderIndex: courseLessons.length + 1,
      isFreePreview: false,
      notes: ''
    });
    setShowLessonModal(true);
  };

  // Manual Purchase / Course Enrollment
  const handleEnrollUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollUserId || !enrollCourseId) {
      showToast('শিক্ষার্থী এবং কোর্স সিলেক্ট করুন।', 'error');
      return;
    }
    const student = users.find((u) => u.id === enrollUserId);
    const course = courses.find((c) => c.id === enrollCourseId);
    if (!student || !course) return;

    enrollUserInCourse(
      student.id,
      student.name,
      student.email,
      course.id,
      course.title,
      course.price,
      enrollPaymentMethod
    );
    showToast(`${student.name}-কে "${course.title}" কোর্সে অ্যাক্সেস দেওয়া হয়েছে!`, 'success');
    setEnrollUserId('');
    setEnrollCourseId('');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* Admin Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
              <span>অ্যাডমিন কন্ট্রোল সেন্টার</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-slate-950">
                ADMIN
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {settings.siteTitle} · প্রোডাক্ট, কোর্স, অর্ডার ও ক্লাউডফ্লেয়ার স্ট্রিমিং ম্যানেজমেন্ট
            </p>
          </div>
        </div>

        <button
          onClick={onBackToSite}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>ওয়েবসাইট প্রিভিউ</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible shrink-0">
          {[
            { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: LayoutDashboard },
            { id: 'products', label: 'প্রোডাক্ট ও সার্ভিস', icon: Package, count: products.length },
            { id: 'courses', label: 'কোর্স ও লেসনসমূহ', icon: BookOpen, count: courses.length },
            { id: 'orders', label: 'অর্ডার ম্যানেজমেন্ট', icon: ShoppingBag, count: pendingOrdersCount ? `${pendingOrdersCount} নতুন` : orders.length },
            { id: 'customers', label: 'কাস্টমার ও এনরোলমেন্ট', icon: Users, count: purchases.length },
            { id: 'settings', label: 'সিস্টেম সেটিংস ও লগ', icon: SettingsIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">সারসংক্ষেপ ও মেট্রিক্স</h2>
                  <p className="text-xs text-slate-500">আপনার প্ল্যাটফর্মের রিয়েল-টাইম সেলস এবং অর্ডার স্ট্যাটাস</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>মোট বিক্রয়</span>
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {settings.currencySymbol}{totalRevenue.toLocaleString('bn-BD')}
                  </div>
                  <p className="text-[11px] text-emerald-500 font-semibold">অর্ডার ও কোর্স বিক্রয় মিলিয়ে</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    <span>মোট অর্ডার</span>
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {orders.length} টি
                  </div>
                  <p className="text-[11px] text-amber-500 font-semibold">{pendingOrdersCount} টি অপেক্ষমাণ (Pending)</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span>কোর্স ও শিক্ষার্থী</span>
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {courses.length} কোর্স / {purchases.length} এনরোল
                  </div>
                  <p className="text-[11px] text-slate-400">ক্লাউডফ্লেয়ার স্ট্রিমিং সহ</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>অ্যাডমিন হোয়াটসঅ্যাপ</span>
                  </span>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white truncate">
                    {settings.whatsappNumber}
                  </div>
                  <p className="text-[11px] text-slate-400">১-ক্লিক wa.me লিঙ্ক একটিভ</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">সাম্প্রতিক অর্ডারসমূহ</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>সকল অর্ডার দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">অর্ডার আইডি</th>
                        <th className="py-2.5 px-3">গ্রাহক</th>
                        <th className="py-2.5 px-3">আইটেম</th>
                        <th className="py-2.5 px-3">মূল্য</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {ord.id}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold block">{ord.customerName}</span>
                            <span className="text-slate-400 text-[10px]">{ord.phone}</span>
                          </td>
                          <td className="py-2.5 px-3 font-medium">{ord.productTitle}</td>
                          <td className="py-2.5 px-3 font-bold">
                            {settings.currencySymbol}{ord.price.toLocaleString('bn-BD')}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : ord.status === 'Confirmed'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : ord.status === 'Processing'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : ord.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">প্রোডাক্ট ও সার্ভিসেস ম্যানেজমেন্ট</h2>
                  <p className="text-xs text-slate-500">ডিজিটাল সার্ভিস ও প্রোডাক্ট যোগ, এডিট বা ডিলিট করুন</p>
                </div>
                <button
                  onClick={handleCreateNewProduct}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রোডাক্ট যোগ করুন</span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{prod.category}</span>
                        <span>{prod.deliveryTime}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {settings.currencySymbol}{prod.price.toLocaleString('bn-BD')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...prod });
                            setShowProductModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`আপনি কি "${prod.title}" মুছে ফেলতে চান?`)) {
                              deleteProduct(prod.id);
                              showToast('প্রোডাক্ট মুছে ফেলা হয়েছে।', 'info');
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COURSES & LESSONS (CLOUDFLARE STREAM) */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">কোর্স ও ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও লেসন</h2>
                  <p className="text-xs text-slate-500">
                    কোর্স তৈরি করুন এবং ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও আইডি যুক্ত করে প্রতিটি লেসন নিয়ন্ত্রণ করুন
                  </p>
                </div>
                <button
                  onClick={handleCreateNewCourse}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন কোর্স তৈরি করুন</span>
                </button>
              </div>

              {/* Course Selector & Lesson Manager */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Courses List */}
                <div className="space-y-3 lg:col-span-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    কোর্স সিলেক্ট করুন ({courses.length}টি)
                  </span>
                  {courses.map((crs) => {
                    const isSelected = selectedCourseForLessons?.id === crs.id;
                    return (
                      <div
                        key={crs.id}
                        onClick={() => setSelectedCourseForLessons(crs)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={crs.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold truncate">{crs.title}</h4>
                            <p className="text-[11px] text-slate-500">
                              {crs.totalLessons}টি ক্লাস · ৳{crs.price.toLocaleString('bn-BD')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCourse({ ...crs });
                                setShowCourseModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-500"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`"${crs.title}" কোর্সটি ডিলিট করবেন? এর সমস্ত লেসনও ডিলিট হয়ে যাবে।`)) {
                                  deleteCourse(crs.id);
                                  if (selectedCourseForLessons?.id === crs.id) {
                                    setSelectedCourseForLessons(null);
                                  }
                                  showToast('কোর্স ডিলিট করা হয়েছে।', 'info');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lessons of Selected Course */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                  {selectedCourseForLessons ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-base font-bold">{selectedCourseForLessons.title}</h3>
                          </div>
                          <p className="text-xs text-slate-500">
                            ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও প্লেলিস্ট ({courseLessons.length}টি লেসন)
                          </p>
                        </div>
                        <button
                          onClick={handleCreateNewLesson}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>নতুন লেসন যোগ করুন</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {courseLessons.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs">
                            এই কোর্সে এখনও কোনো লেসন যোগ করা হয়নি। উপরের &quot;নতুন লেসন যোগ করুন&quot; বাটনে ক্লিক করুন।
                          </div>
                        ) : (
                          courseLessons.map((les, index) => (
                            <div
                              key={les.id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold truncate">{les.title}</h5>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <span className="font-mono text-emerald-500">
                                      CF ID: {les.cloudflareVideoId.substring(0, 16)}...
                                    </span>
                                    <span>·</span>
                                    <span>{les.duration}</span>
                                    {les.isFreePreview && (
                                      <span className="text-emerald-400 font-bold">(ফ্রি প্রিভিউ)</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingLesson({ ...les });
                                    setShowLessonModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`লেসন "${les.title}" ডিলিট করবেন?`)) {
                                      deleteLesson(les.id, selectedCourseForLessons.id);
                                      setCourseLessons(getLessonsByCourse(selectedCourseForLessons.id));
                                      showToast('লেসন মুছে ফেলা হয়েছে।', 'info');
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      বাম পাশের তালিকা থেকে একটি কোর্স সিলেক্ট করে তার ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও ও সিলেবাস পরিচালনা করুন।
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: ORDERS & STATUS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">অর্ডার ও লাইভ ট্র্যাকিং ম্যানেজমেন্ট</h2>
                  <p className="text-xs text-slate-500">
                    অর্ডারের স্ট্যাটাস পরিবর্তন করলে কাস্টমারের &quot;Track My Order&quot; পেজে সাথে সাথে আপডেট প্রতিফলিত হবে
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="py-3 px-3">অর্ডার আইডি</th>
                      <th className="py-3 px-3">কাস্টমার ও মোবাইল</th>
                      <th className="py-3 px-3">ঠিকানা</th>
                      <th className="py-3 px-3">প্রোডাক্ট / কোর্স</th>
                      <th className="py-3 px-3">মূল্য</th>
                      <th className="py-3 px-3">স্ট্যাটাস পরিবর্তন</th>
                      <th className="py-3 px-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.map((ord) => {
                      const cleanPhone = ord.phone.replace(/[^0-9]/g, '');
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            #{ord.id}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold block text-slate-900 dark:text-white">{ord.customerName}</span>
                            <span className="text-slate-400 text-[11px] font-mono">{ord.phone}</span>
                          </td>
                          <td className="py-3 px-3 max-w-xs text-slate-500 truncate" title={ord.address}>
                            {ord.address}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {ord.productTitle}
                          </td>
                          <td className="py-3 px-3 font-bold">
                            {settings.currencySymbol}{ord.price.toLocaleString('bn-BD')}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={ord.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as OrderStatus;
                                updateOrderStatus(ord.id, newStatus);
                                showToast(`অর্ডার #${ord.id} এর স্ট্যাটাস '${newStatus}'-এ আপডেট হয়েছে!`, 'success');
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="Pending">অপেক্ষমাণ (Pending)</option>
                              <option value="Confirmed">নিশ্চিত (Confirmed)</option>
                              <option value="Processing">প্রক্রিয়াধীন (Processing)</option>
                              <option value="Delivered">ডেলিভার্ড (Delivered)</option>
                              <option value="Cancelled">বাতিল (Cancelled)</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  const text = encodeURIComponent(
                                    `আসসালামু আলাইকুম ${ord.customerName}! ${settings.siteTitle} থেকে আপনার অর্ডার #${ord.id} (${ord.productTitle}) এর বিষয়ে যোগাযোগ করছি। বর্তমান অবস্থা: ${ord.status}`
                                  );
                                  window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
                                }}
                                title="কাস্টমারকে হোয়াটসঅ্যাপ করুন"
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`অর্ডার #${ord.id} ডিলিট করতে চান?`)) {
                                    deleteOrder(ord.id);
                                    showToast('অর্ডার ডিলিট করা হয়েছে।', 'info');
                                  }
                                }}
                                title="অর্ডার মুছুন"
                                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS & ENROLLMENT (PURCHASE CONTROL) */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">কাস্টমার ও কোর্স এনরোলমেন্ট</h2>
                  <p className="text-xs text-slate-500">
                    এখানে কাস্টমারদের কোর্স পারচেজ রেকর্ড যুক্ত করা যায় এবং ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও অ্যাক্সেস নিয়ন্ত্রণ করা যায়
                  </p>
                </div>
              </div>

              {/* Manual Course Enrollment Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>অ্যাডমিন প্যানেল থেকে কোর্স এনরোল / সেলস অ্যাড করুন</span>
                </h3>
                <form onSubmit={handleEnrollUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">শিক্ষার্থী সিলেক্ট করুন</label>
                    <select
                      value={enrollUserId}
                      onChange={(e) => setEnrollUserId(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    >
                      <option value="">শিক্ষার্থী বেছে নিন</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">কোর্স সিলেক্ট করুন</label>
                    <select
                      value={enrollCourseId}
                      onChange={(e) => setEnrollCourseId(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      required
                    >
                      <option value="">কোর্স বেছে নিন</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} (৳{c.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">পেমেন্ট মেথড</label>
                    <input
                      type="text"
                      value={enrollPaymentMethod}
                      onChange={(e) => setEnrollPaymentMethod(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      কোর্সে এনরোল করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Purchases Table */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold">সক্রিয় পারচেজ ও অ্যাক্সেস প্রাপ্ত শিক্ষার্থী</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">শিক্ষার্থীর নাম</th>
                        <th className="py-2.5 px-3">ইমেইল</th>
                        <th className="py-2.5 px-3">কোর্সের নাম</th>
                        <th className="py-2.5 px-3">মূল্য</th>
                        <th className="py-2.5 px-3">পেমেন্ট মেথড</th>
                        <th className="py-2.5 px-3">ভিডিও অ্যাক্সেস স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {purchases.map((pur) => (
                        <tr key={pur.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold">{pur.userName}</td>
                          <td className="py-2.5 px-3 text-slate-400">{pur.userEmail}</td>
                          <td className="py-2.5 px-3 font-medium">{pur.courseTitle}</td>
                          <td className="py-2.5 px-3 font-bold">
                            {settings.currencySymbol}{pur.price.toLocaleString('bn-BD')}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{pur.paymentMethod}</td>
                          <td className="py-2.5 px-3">
                            {pur.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                অ্যাক্সেস চালু (Active)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                                স্থগিত (Revoked)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & NOTIFICATION LOGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black">সিস্টেম সেটিংস ও ক্রেডেনশিয়াল</h2>
                <p className="text-xs text-slate-500">
                  হোয়াটসঅ্যাপ নম্বর, অ্যাডমিন ইমেইল, এসএমএস গেটওয়ে, ক্লাউডফ্লেয়ার স্ট্রিম এবং Supabase ডাটাবেজ
                </p>
              </div>

              {/* SUPABASE DATABASE INTEGRATION CARD */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-emerald-500/30 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                        <span>Supabase ডাটাবেজ ইন্টিগ্রেশন</span>
                        {isSupabaseConfigured() ? (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>কানেক্টেড (Active)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>কানেক্ট করা হয়নি</span>
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">
                        আপনার Supabase PostgreSQL ক্লাউড ডাটাবেজে প্রোডাক্ট, কোর্স, অর্ডার ও ইউজার ডাটা রিয়েলটাইম সিঙ্ক রাখুন
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSqlModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SQL স্কিমা স্ক্রিপ্ট</span>
                    </button>
                  </div>
                </div>

                {/* Form fields for Supabase URL and Key */}
                <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://your-project-id.supabase.co"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Supabase ড্যাশবোর্ডের Settings ➔ API ➔ Project URL থেকে কপি করুন
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Supabase Anon Public API Key
                      </label>
                      <input
                        type="password"
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Project Settings ➔ API ➔ Project API Keys (anon public)
                      </p>
                    </div>
                  </div>

                  {/* Test feedback banner if any */}
                  {supabaseTestStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        supabaseTestStatus.success
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {supabaseTestStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      )}
                      <span>{supabaseTestStatus.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>সংরক্ষণ করুন</span>
                    </button>

                    <button
                      type="button"
                      disabled={isTestingSupabase}
                      onClick={handleTestSupabase}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                      <span>{isTestingSupabase ? 'কানেকশন টেস্ট হচ্ছে...' : 'কানেকশন টেস্ট করুন'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSyncingSupabase || (!supabaseUrl && !supabaseKey)}
                      onClick={handleSyncSupabase}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{isSyncingSupabase ? 'সিঙ্ক হচ্ছে...' : 'ডাটাবেজে প্রোডাক্ট ও কোর্স সিঙ্ক করুন'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Settings Form */}
              <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      অ্যাডমিন হোয়াটসঅ্যাপ নম্বর (wa.me লিঙ্কের জন্য)
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <input
                        type="text"
                        required
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettingsState({ ...settings, whatsappNumber: e.target.value })}
                        placeholder="8801812345678"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      কাস্টমাররা &quot;Buy Now&quot; বাটনে ক্লিক করলে এই নম্বরে প্রি-ফিল মেসেজ যাবে।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      অ্যাডমিন জিমেইল / ইমেইল (নতুন অর্ডার অ্যালার্টের জন্য)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={settings.adminEmail}
                        onChange={(e) => setSettingsState({ ...settings, adminEmail: e.target.value })}
                        placeholder="admin@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      নতুন অর্ডার আসার সাথে সাথে এই ইমেইলে স্বয়ংক্রিয় নোটিফিকেশন পাঠানো হবে।
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      এসএমএস গেটওয়ে সার্ভিস (SMS Gateway)
                    </label>
                    <select
                      value={settings.smsGateway}
                      onChange={(e) => setSettingsState({ ...settings, smsGateway: e.target.value as any })}
                      className="w-full p-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="BulkSMSBD">BulkSMSBD (Bangladeshi Gateway)</option>
                      <option value="AlphaSMS">Alpha SMS (Bangladeshi Gateway)</option>
                      <option value="Twilio">Twilio International SMS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      এসএমএস এপিআই কী (SMS API Key / Token)
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={settings.smsApiKey}
                        onChange={(e) => setSettingsState({ ...settings, smsApiKey: e.target.value })}
                        placeholder="sms-gateway-api-key"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      ইমেইল সার্ভিস প্রোভাইডার
                    </label>
                    <select
                      value={settings.emailService}
                      onChange={(e) => setSettingsState({ ...settings, emailService: e.target.value as any })}
                      className="w-full p-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Gmail SMTP">Nodemailer (Gmail SMTP)</option>
                      <option value="Resend">Resend API</option>
                      <option value="SendGrid">SendGrid API</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      ক্লাউডফ্লেয়ার স্ট্রিম সাবডোমেইন
                    </label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={settings.cloudflareStreamSubdomain || ''}
                        onChange={(e) => setSettingsState({ ...settings, cloudflareStreamSubdomain: e.target.value })}
                        placeholder="customer-xxxx.cloudflarestream.com"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>সেটিংস পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>

              {/* Real-Time Notification Logs */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>লাইভ নোটিফিকেশন লগ (Email & SMS Dispatches)</span>
                  </h3>
                  <span className="text-xs text-slate-400">মোট {notificationLogs.length}টি লগ</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notificationLogs.map((log) => (
                    <div key={log.id} className="pt-2 pb-2 text-xs flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.type === 'email' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {log.type.toUpperCase()}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{log.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({log.recipient})</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{log.content}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('bn-BD')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* PRODUCT MODAL */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">
              {editingProduct.id.startsWith('prod-') ? 'প্রোডাক্ট তথ্য সম্পাদনা' : 'নতুন প্রোডাক্ট'}
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">প্রোডাক্ট বা সার্ভিসের নাম</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">বিক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">পূর্বের মূল্য (৳)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ক্যাটাগরি</label>
                <input
                  type="text"
                  required
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ছবি URL</label>
                <input
                  type="url"
                  required
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">ডেলিভারি সময়কাল</label>
                <input
                  type="text"
                  value={editingProduct.deliveryTime || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, deliveryTime: e.target.value })}
                  placeholder="যেমন: ৩-৫ কার্যদিবস"
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE MODAL */}
      {showCourseModal && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">কোর্স তথ্য</h3>
            <form onSubmit={handleCourseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">কোর্সের শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">কোর্স ফি (৳)</label>
                  <input
                    type="number"
                    required
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">ইন্সট্রাক্টর</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.instructor}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">থাম্বনেইল ইমেজ URL</label>
                <input
                  type="url"
                  required
                  value={editingCourse.thumbnail}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">কোর্সের বিবরণ</label>
                <textarea
                  rows={3}
                  required
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LESSON MODAL (CLOUDFLARE STREAM VIDEO ID) */}
      {showLessonModal && editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-500" />
              <span>ক্লাউডফ্লেয়ার স্ট্রিম লেসন এডিট</span>
            </h3>

            <form onSubmit={handleLessonSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">লেসনের নাম / শিরোনাম</label>
                <input
                  type="text"
                  required
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও আই ডি (Cloudflare Video ID)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    required
                    value={editingLesson.cloudflareVideoId}
                    onChange={(e) => setEditingLesson({ ...editingLesson, cloudflareVideoId: e.target.value })}
                    placeholder="5d5bc37ffcf54c9b82e996832fb36fb1"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Cloudflare Stream ড্যাশবোর্ড থেকে পাওয়া ভিডিও আইডি বা এম্বেড কোড দিন।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">সময়সীমা</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.duration}
                    onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                    placeholder="২০:৪৫"
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">সিরিয়াল ইন্ডেক্স</label>
                  <input
                    type="number"
                    required
                    value={editingLesson.orderIndex}
                    onChange={(e) => setEditingLesson({ ...editingLesson, orderIndex: Number(e.target.value) })}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="previewCheckbox"
                  checked={editingLesson.isFreePreview || false}
                  onChange={(e) => setEditingLesson({ ...editingLesson, isFreePreview: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="previewCheckbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ফ্রি প্রিভিউ হিসেবে উন্মুক্ত রাখুন (কোর্স না কিনেও দেখতে পারবে)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                >
                  লেসন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPABASE SQL SCHEMA MODAL */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Supabase SQL স্ক্রিপ্ট (Database Tables & Policies)</h3>
                  <p className="text-[11px] text-slate-400">
                    এটি আপনার Supabase ড্যাশবোর্ডের SQL Editor-এ একবার পেস্ট করে Run করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
              <span className="text-xs text-slate-400">
                Products, Courses, Lessons, Orders ও Purchases টেবিল অন্তর্ভুক্ত।
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{hasCopiedSql ? 'কপি হয়েছে!' : 'স্ক্রিপ্ট কপি করুন'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
