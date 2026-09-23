import React from 'react';
import {
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  ArrowUpRight,
  BookOpen,
  Package,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Settings } from '../types';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  settings: Settings;
  onNavigate: (view: 'home' | 'courses' | 'products' | 'tracking' | 'admin') => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate, onOpenAuth }) => {
  const { user, isAdmin } = useAuth();

  const handleWhatsApp = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                {settings.siteTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              আধুনিক ওয়েব ডেভেলপমেন্ট, ব্র্যান্ডিং, ডিজিটাল মার্কেটিং সলিউশন এবং বাংলায় শীর্ষমানের প্র্যাকটিক্যাল অনলাইন কোর্স প্ল্যাটফর্ম।
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>১০০% বিশ্বস্ত বাংলা প্ল্যাটফর্ম</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>হোম পেজ</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>সকল অনলাইন কোর্স</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-teal-500" />
                  <span>প্রোডাক্ট ও ডিজিটাল সার্ভিস</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500" />
                  <span>লাইভ অর্ডার ট্র্যাকিং</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">যোগাযোগ ও সহায়তা</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হেল্পলাইন: {settings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ইমেইল: {settings.adminEmail}</span>
              </div>
              <div className="pt-1">
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span>হোয়াটসঅ্যাপ: {settings.whatsappNumber}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security & Admin Access */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">নিরাপত্তা ও অ্যাক্সেস</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ক্লাউডফ্লেয়ার স্ট্রিম এনক্রিপশন এবং নিরাপদ পেমেন্ট যাচাইকরণের মাধ্যমে ভিডিও ও অর্ডার পরিচালিত হয়।
            </p>

            <div className="pt-2 border-t border-slate-800">
              {isAdmin ? (
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  title="শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য"
                >
                  <Lock className="w-3 h-3" />
                  <span>অ্যাডমিন পোর্টাল</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.siteTitle}। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-4">
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>·</span>
            <span>বিকাশ ও নগদ</span>
            <span>·</span>
            <span>ক্লাউডফ্লেয়ার স্ট্রিম</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
