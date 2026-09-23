import React, { useState } from 'react';
import {
  Moon,
  Sun,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Search,
  BookOpen,
  Package,
  Compass,
  MessageCircle,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Settings } from '../types';

interface NavbarProps {
  settings: Settings;
  activeView: 'home' | 'courses' | 'products' | 'tracking' | 'my-courses' | 'admin';
  setActiveView: (view: 'home' | 'courses' | 'products' | 'tracking' | 'my-courses' | 'admin') => void;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeView,
  setActiveView,
  onOpenAuth,
  searchQuery,
  setSearchQuery
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openWhatsAppSupport = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`আসসালামু আলাইকুম! আমি ${settings.siteTitle} ওয়েবসাইট থেকে যোগাযোগ করছি।`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const navItems = [
    { id: 'home', label: 'হোম', icon: Compass },
    { id: 'courses', label: 'কোর্সসমূহ', icon: BookOpen },
    { id: 'products', label: 'প্রোডাক্ট ও সেবা', icon: Package },
    { id: 'tracking', label: 'অর্ডার ট্র্যাক', icon: Search }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors duration-200 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {settings.siteTitle}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  ই-কমার্স ও লার্নিং প্ল্যাটফর্ম
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="কোর্স বা প্রোডাক্ট খুঁজুন..."
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  মুছুন
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* If user logged in, show 'আমার কোর্স' */}
            {user && (
              <button
                onClick={() => setActiveView('my-courses')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  activeView === 'my-courses'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>আমার কোর্সসমূহ</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* WhatsApp Support Direct Button */}
            <button
              onClick={openWhatsAppSupport}
              title="সরাসরি হোয়াটসঅ্যাপে কথা বলুন"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              <span>হোয়াটসঅ্যাপ</span>
            </button>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              aria-label="ডার্ক/লাইট মোড পরিবর্তন করুন"
              title={theme === 'dark' ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              )}
            </button>

            {/* Admin Dashboard button - ONLY visible if user is admin */}
            {isAdmin && (
              <button
                onClick={() => setActiveView(activeView === 'admin' ? 'home' : 'admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  activeView === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {activeView === 'admin' ? 'ওয়েবসাইটে যান' : 'অ্যাডমিন প্যানেল'}
                </span>
                <span className="sm:hidden">অ্যাডমিন</span>
              </button>
            )}

            {/* User Account / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {user.role === 'admin' ? 'অ্যাডমিনিস্ট্রেটর' : 'শিক্ষার্থী'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="লগআউট করুন"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4" />
                <span>লগইন</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কোর্স বা প্রোডাক্ট খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 text-xs font-medium rounded-lg text-left ${
                    activeView === item.id
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user && (
              <button
                onClick={() => {
                  setActiveView('my-courses');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 text-xs font-medium rounded-lg text-left ${
                  activeView === 'my-courses'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>আমার কোর্সসমূহ</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 text-xs font-bold text-amber-500 bg-amber-500/10 rounded-lg text-left"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>অ্যাডমিন প্যানেল</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
            <button
              onClick={openWhatsAppSupport}
              className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপ সাপোর্ট: {settings.whatsappNumber}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
