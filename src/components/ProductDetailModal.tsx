import React from 'react';
import {
  X,
  MessageCircle,
  ShoppingBag,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Copy,
  Share2,
  ShieldCheck,
  Award,
  Zap,
  User
} from 'lucide-react';
import { Product, Course, Settings } from '../types';
import { useToast } from './Toast';

interface ProductDetailModalProps {
  item: (Product & { isCourse?: false }) | (Course & { isCourse: true; type?: 'course' });
  settings: Settings;
  onClose: () => void;
  onDirectOrder: () => void;
  onOpenCourseVideo?: () => void;
  isPurchased?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  settings,
  onClose,
  onDirectOrder,
  onOpenCourseVideo,
  isPurchased = false
}) => {
  const { showToast } = useToast();
  const isCourse = 'instructor' in item;

  // WhatsApp Message Generator
  const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const itemTypeBangla = isCourse ? 'কোর্স' : 'সার্ভিস/প্রোডাক্ট';
  const waMessage = `আসসালামু আলাইকুম! আমি "${item.title}" (${itemTypeBangla}, মূল্য: ${settings.currencySymbol}${item.price.toLocaleString('bn-BD')}) কিনতে আগ্রহী। পেমেন্ট এবং ডেলিভারি সম্পর্কে জানতে চাই।`;
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleWhatsAppBuy = () => {
    window.open(waUrl, '_blank');
  };

  const copyWhatsAppLink = () => {
    navigator.clipboard.writeText(waUrl);
    showToast('হোয়াটসঅ্যাপ লিঙ্ক কপি করা হয়েছে!', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header with Close */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{item.category}</span>
            <span aria-hidden="true">·</span>
            <span>{isCourse ? 'অনলাইন একাডেমি' : 'ডিজিটাল সার্ভিস'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top Banner / Image & Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={isCourse ? (item as Course).thumbnail : (item as Product).image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-950/80 backdrop-blur-md text-white">
                  {isCourse ? 'ভিডিও কোর্স' : 'রেডি সার্ভিস'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {item.title}
              </h2>

              {isCourse ? (
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>ইন্সট্রাক্টর: <strong>{(item as Course).instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>মোট সময়সীমা: <strong>{(item as Course).totalDuration}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>মোট লেসন সংখ্যা: <strong>{(item as Course).totalLessons}টি ক্লাস</strong></span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>ডেলিভারি সময়: <strong>{(item as Product).deliveryTime || '৩-৫ কার্যদিবস'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>সাপোর্ট: <strong>১ বছর ফ্রি টেকনিক্যাল সাপোর্ট</strong></span>
                  </div>
                </div>
              )}

              {/* Price Tag */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">নির্ধারিত মূল্য:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {settings.currencySymbol}{item.price.toLocaleString('bn-BD')}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {settings.currencySymbol}{item.originalPrice.toLocaleString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>

                <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg">
                  {isCourse ? 'লাইফটাইম অ্যাক্সেস' : 'রেগুলার অফার'}
                </span>
              </div>

            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              বিস্তারিত বিবরণ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Feature list / Skills */}
          {isCourse && (item as Course).skillsLearned && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>এই কোর্সে যা যা শিখবেন</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(item as Course).skillsLearned.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isCourse && (item as Product).features && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>সার্ভিসের অন্তর্ভুক্ত সুবিধাসমূহ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(item as Product).features!.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Flow Explanation */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/70 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  হোয়াটসঅ্যাপ দ্রুত অর্ডার ও ইনস্ট্যান্ট সাপোর্ট
                </span>
              </div>
              <button
                onClick={copyWhatsAppLink}
                className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline"
              >
                <Copy className="w-3 h-3" />
                <span>লিঙ্ক কপি করুন</span>
              </button>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              &quot;হোয়াটসঅ্যাপে কিনুন&quot; বাটনে ক্লিক করলে সরাসরি আপনার হোয়াটসঅ্যাপ অ্যাপ ওপেন হবে এবং এই প্রোডাক্টের নাম ও মূল্য সহ মেসেজ তৈরি থাকবে। অ্যাডমিন নাম্বার: <strong>{settings.whatsappNumber}</strong>
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>১০০% নিরাপদ ও ভেরিফাইড লেনদেন</span>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Buy */}
            <button
              onClick={handleWhatsAppBuy}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              <span>হোয়াটসঅ্যাপে কিনুন</span>
            </button>

            {/* Direct Order or Watch Video */}
            {isCourse ? (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenCourseVideo) onOpenCourseVideo();
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isPurchased ? 'ক্লাস দেখুন' : 'কোর্স কারিকুলাম ও ভিডিও'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onDirectOrder();
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>সরাসরি অর্ডার করুন</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
