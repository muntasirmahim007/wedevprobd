import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Package,
  ShieldCheck,
  Video,
  Clock,
  Sparkles,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { Settings } from '../types';

interface HeroProps {
  settings: Settings;
  onExploreCourses: () => void;
  onExploreProducts: () => void;
  onTrackOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreCourses,
  onExploreProducts,
  onTrackOrder
}) => {
  const openWhatsApp = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent('আসসালামু আলাইকুম! আমি আপনাদের সার্ভিস ও কোর্স সম্পর্কে জানতে আগ্রহী।');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-16 md:pb-20 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Subtle Top Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>প্রফেশনাল ডিজিটাল সলিউশন এবং ক্যারিয়ারমুখী লার্নিং</span>
          </div>

          {/* Main Headline in Bangla */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.25]">
            আধুনিক ওয়েব সার্ভিস ও প্র্যাকটিক্যাল{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
              অনলাইন কোর্স
            </span>
          </h1>

          {/* Bengali Subheading */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            আপনার ব্যবসা প্রসারের জন্য রেডিমেড ই-কমার্স ওয়েবসাইট, এসইও ও ব্র্যান্ডিং সার্ভিস নিন। পাশাপাশি টপ-রেটেড মেন্টরদের পরিচালিত লাইভ প্রজেক্ট ভিত্তিক কোর্স থেকে স্কিল অর্জন করুন।
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onExploreCourses}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>কোর্সসমূহ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreProducts}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Package className="w-4 h-4 text-emerald-500" />
              <span>ওয়েব ও ডিজিটাল সার্ভিস</span>
            </button>

            <button
              onClick={openWhatsApp}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>হোয়াটসঅ্যাপে কথা বলুন</span>
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">১-ক্লিক হোয়াটসঅ্যাপ বাই</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">সরাসরি অ্যাডমিনের সাথে যোগাযোগ</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5">
              <Video className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">সিকিউরড হাই-স্পিড ভিডিও প্লেয়ার</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">লাইভ অর্ডার ট্র্যাকিং</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">রিয়েলটাইম স্ট্যাটাস আপডেট</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">অ্যাডমিন এসএমএস ও ইমেইল</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">অটোমেটিক ইন্সট্যান্ট নোটিফিকেশন</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
