import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Package,
  Sparkles,
  Search,
  Filter,
  Layers,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Product, Course, Settings, ItemType } from './types';
import {
  initStorage,
  getProducts,
  getCourses,
  getSettings,
  getPurchases,
  useStoreSubscription,
  hasUserPurchasedCourse
} from './services/storage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DirectOrderModal } from './components/DirectOrderModal';
import { CoursePlayerModal } from './components/CoursePlayerModal';
import { OrderTracking } from './components/OrderTracking';
import { MyCoursesView } from './components/MyCoursesView';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';

// Initialize storage on load
initStorage();

function MainApp() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(getProducts());
  const [courses, setCourses] = useState<Course[]>(getCourses());
  const [settings, setSettings] = useState<Settings>(getSettings());

  const [activeView, setActiveView] = useState<
    'home' | 'courses' | 'products' | 'tracking' | 'my-courses' | 'admin'
  >('home');

  // Filter & Search
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trackingInitialId, setTrackingInitialId] = useState<string>('');

  // Modals state
  const [selectedItem, setSelectedItem] = useState<
    (Product & { isCourse?: false }) | (Course & { isCourse: true; type?: 'course' }) | null
  >(null);
  const [directOrderItem, setDirectOrderItem] = useState<
    (Product & { isCourse?: false }) | (Course & { isCourse: true; type?: 'course' }) | null
  >(null);
  const [activeCourseForPlayer, setActiveCourseForPlayer] = useState<Course | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync state from storage
  const syncStore = () => {
    setProducts(getProducts());
    setCourses(getCourses());
    setSettings(getSettings());
  };

  useEffect(() => {
    syncStore();
    const unsubscribe = useStoreSubscription(syncStore);
    return () => unsubscribe();
  }, []);

  // Filter items based on activeView, categoryFilter, and searchQuery
  const filteredItems = useMemo(() => {
    let combined: Array<
      (Product & { isCourse: false; sortDate: string }) | (Course & { isCourse: true; sortDate: string })
    > = [];

    // Filter by high-level view
    if (activeView === 'courses') {
      combined = courses.map((c) => ({ ...c, isCourse: true as const, sortDate: c.createdAt }));
    } else if (activeView === 'products') {
      combined = products.map((p) => ({ ...p, isCourse: false as const, sortDate: p.createdAt }));
    } else {
      // 'home' or general: show both
      const pList = products.map((p) => ({ ...p, isCourse: false as const, sortDate: p.createdAt }));
      const cList = courses.map((c) => ({ ...c, isCourse: true as const, sortDate: c.createdAt }));
      combined = [...cList, ...pList];
    }

    // Category Filter
    if (categoryFilter === 'courses') {
      combined = combined.filter((i) => i.isCourse);
    } else if (categoryFilter === 'products') {
      combined = combined.filter((i) => !i.isCourse);
    } else if (categoryFilter === 'web') {
      combined = combined.filter(
        (i) => i.category.includes('ওয়েব') || i.title.toLowerCase().includes('web')
      );
    } else if (categoryFilter === 'graphics') {
      combined = combined.filter(
        (i) => i.category.includes('গ্রাফিক্স') || i.category.includes('ডিজাইন')
      );
    } else if (categoryFilter === 'marketing') {
      combined = combined.filter(
        (i) => i.category.includes('মার্কেটিং') || i.category.includes('এসইও')
      );
    }

    // Text Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      combined = combined.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    return combined;
  }, [products, courses, activeView, categoryFilter, searchQuery]);

  // If activeView is 'admin' but user is not admin, redirect to 'home' and prompt login
  if (activeView === 'admin' && !isAdmin) {
    setActiveView('home');
    setShowAuthModal(true);
    showToast('অ্যাডমিন প্যানেলে প্রবেশ করতে অ্যাডমিন হিসেবে লগইন করুন।', 'error');
  }

  // Handle tracking redirect
  const handleGoToTracking = (orderId: string) => {
    setTrackingInitialId(orderId);
    setActiveView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WhatsApp Floating Quick Action
  const openWhatsAppFloating = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম! আমি ${settings.siteTitle} থেকে সরাসরি কাস্টমার সাপোর্টে যোগাযোগ করতে চাই।`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* If Admin view is active and user is admin, show Admin Dashboard */}
      {activeView === 'admin' && isAdmin ? (
        <AdminDashboard onBackToSite={() => setActiveView('home')} />
      ) : (
        <>
          {/* Main Website Navbar */}
          <Navbar
            settings={settings}
            activeView={activeView}
            setActiveView={setActiveView}
            onOpenAuth={() => setShowAuthModal(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <main className="flex-1">
            {/* View 1: Home View with Hero & Catalog */}
            {activeView === 'home' && (
              <>
                <Hero
                  settings={settings}
                  onExploreCourses={() => {
                    setCategoryFilter('courses');
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onExploreProducts={() => {
                    setCategoryFilter('products');
                    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onTrackOrder={() => setActiveView('tracking')}
                />

                {/* Main Catalog Section */}
                <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                  
                  {/* Category Filter & Segmented Control */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        ফিচার্ড কোর্স ও সার্ভিস ক্যাটালগ
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        আপনার পছন্দ অনুযায়ী কোর্স বা সার্ভিস বেছে নিন এবং সরাসরি হোয়াটসঅ্যাপ বা অনলাইনে অর্ডার করুন
                      </p>
                    </div>

                    {/* Filter Segmented Buttons (Anti-pill clean design) */}
                    <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-900 rounded-xl overflow-x-auto shrink-0">
                      {[
                        { id: 'all', label: 'সকল আইটেম' },
                        { id: 'courses', label: 'অনলাইন কোর্স' },
                        { id: 'products', label: 'ওয়েব সার্ভিস' },
                        { id: 'web', label: 'ওয়েব ডেভেলপমেন্ট' },
                        { id: 'graphics', label: 'গ্রাফিক্স' },
                        { id: 'marketing', label: 'মার্কেটিং ও এসইও' }
                      ].map((tab) => {
                        const isActive = categoryFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setCategoryFilter(tab.id)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                              isActive
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Filter / Search Indicator */}
                  {searchQuery && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
                      <span>&quot;<strong>{searchQuery}</strong>&quot; এর জন্য অনুসন্ধান ফলাফল ({filteredItems.length}টি পাওয়া গেছে):</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        অনুসন্ধান মুছুন
                      </button>
                    </div>
                  )}

                  {/* Products & Courses Grid */}
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-16 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        এই ক্যাটাগরিতে কোনো আইটেম পাওয়া যায়নি।
                      </p>
                      <button
                        onClick={() => {
                          setCategoryFilter('all');
                          setSearchQuery('');
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl"
                      >
                        সকল আইটেম দেখুন
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredItems.map((item) => {
                        const isCourse = item.isCourse;
                        const isPurchased = isCourse && hasUserPurchasedCourse(user?.id, item.id);

                        return (
                          <ProductCard
                            key={item.id}
                            item={item}
                            settings={settings}
                            onViewDetails={() => setSelectedItem(item)}
                            onDirectOrder={() => setDirectOrderItem(item)}
                            onOpenCourse={() => {
                              if (isCourse) {
                                setActiveCourseForPlayer(item as Course);
                              }
                            }}
                            isPurchased={isPurchased}
                          />
                        );
                      })}
                    </div>
                  )}

                </section>
              </>
            )}

            {/* View 2: Courses Dedicated Catalog */}
            {activeView === 'courses' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    সকল অনলাইন প্র্যাকটিক্যাল কোর্স
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    ক্লাউডফ্লেয়ার স্ট্রিম হাই-স্পিড ভিডিও ও প্রজেক্ট বেসড লার্নিং
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course) => (
                    <ProductCard
                      key={course.id}
                      item={{ ...course, isCourse: true as const }}
                      settings={settings}
                      onViewDetails={() => setSelectedItem({ ...course, isCourse: true as const })}
                      onDirectOrder={() => setDirectOrderItem({ ...course, isCourse: true as const })}
                      onOpenCourse={() => setActiveCourseForPlayer(course)}
                      isPurchased={hasUserPurchasedCourse(user?.id, course.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View 3: Products & Services Dedicated Catalog */}
            {activeView === 'products' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    ওয়েবসাইট ও ডিজিটাল সার্ভিসেস
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    রেডিমেড ই-কমার্স, পোর্টফোলিও, এসইও এবং প্রফেশনাল গ্রাফিক্স সলিউশন
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      item={{ ...prod, isCourse: false as const }}
                      settings={settings}
                      onViewDetails={() => setSelectedItem({ ...prod, isCourse: false as const })}
                      onDirectOrder={() => setDirectOrderItem({ ...prod, isCourse: false as const })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* View 4: Live Order Tracking */}
            {activeView === 'tracking' && (
              <OrderTracking
                settings={settings}
                initialOrderId={trackingInitialId}
                onSelectProduct={(pId) => {
                  const p = products.find((x) => x.id === pId);
                  if (p) setSelectedItem({ ...p, isCourse: false });
                }}
              />
            )}

            {/* View 5: My Courses (Enrolled Learning) */}
            {activeView === 'my-courses' && (
              <MyCoursesView
                settings={settings}
                onOpenCourseVideo={(course) => setActiveCourseForPlayer(course)}
                onExploreCourses={() => setActiveView('courses')}
              />
            )}

          </main>

          {/* Floating WhatsApp Quick Button */}
          <button
            onClick={openWhatsAppFloating}
            title="সরাসরি হোয়াটসঅ্যাপে কথা বলুন"
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-2xl shadow-emerald-600/50 hover:scale-105 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span className="hidden sm:inline">হোয়াটসঅ্যাপ চ্যাট</span>
          </button>

          {/* Website Footer */}
          <Footer
            settings={settings}
            onNavigate={(v) => {
              setActiveView(v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        </>
      )}

      {/* MODAL 1: Product / Course Details */}
      {selectedItem && (
        <ProductDetailModal
          item={selectedItem}
          settings={settings}
          onClose={() => setSelectedItem(null)}
          onDirectOrder={() => {
            setDirectOrderItem(selectedItem);
            setSelectedItem(null);
          }}
          onOpenCourseVideo={() => {
            if ('instructor' in selectedItem) {
              setActiveCourseForPlayer(selectedItem as Course);
              setSelectedItem(null);
            }
          }}
          isPurchased={'instructor' in selectedItem && hasUserPurchasedCourse(user?.id, selectedItem.id)}
        />
      )}

      {/* MODAL 2: Direct Order Checkout Modal */}
      {directOrderItem && (
        <DirectOrderModal
          item={directOrderItem}
          settings={settings}
          onClose={() => setDirectOrderItem(null)}
          onGoToTracking={(orderId) => {
            setDirectOrderItem(null);
            handleGoToTracking(orderId);
          }}
        />
      )}

      {/* MODAL 3: Course Player (Cloudflare Stream & Access Control) */}
      {activeCourseForPlayer && (
        <CoursePlayerModal
          course={activeCourseForPlayer}
          settings={settings}
          onClose={() => setActiveCourseForPlayer(null)}
          onDirectBuy={() => {
            setDirectOrderItem({ ...activeCourseForPlayer, isCourse: true as const });
            setActiveCourseForPlayer(null);
          }}
          onOpenAuth={() => {
            setActiveCourseForPlayer(null);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* MODAL 4: Auth Modal (Customer & Admin) */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
