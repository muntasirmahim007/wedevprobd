import React from 'react';
import {
  MessageCircle,
  BookOpen,
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles,
  ShoppingBag,
  Check
} from 'lucide-react';
import { Product, Course, Settings } from '../types';

interface ProductCardProps {
  item: (Product & { isCourse?: false }) | (Course & { isCourse: true; type?: 'course' });
  settings: Settings;
  onViewDetails: () => void;
  onDirectOrder?: () => void;
  onOpenCourse?: () => void;
  isPurchased?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  settings,
  onViewDetails,
  onDirectOrder,
  onOpenCourse,
  isPurchased = false
}) => {
  const isCourse = 'instructor' in item;

  // WhatsApp Buy Flow
  const handleWhatsAppBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const itemTypeBangla = isCourse ? 'অনলাইন কোর্স' : 'সার্ভিস/প্রোডাক্ট';
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম! আমি "${item.title}" (${itemTypeBangla}, মূল্য: ${settings.currencySymbol}${item.price.toLocaleString('bn-BD')}) কিনতে আগ্রহী। বিস্তারিত অর্ডার প্রক্রিয়াটি দয়া করে জানাবেন।`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div
      onClick={onViewDetails}
      className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={isCourse ? (item as Course).thumbnail : (item as Product).image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quiet Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-900/85 backdrop-blur-md text-white">
            {isCourse ? 'অনলাইন কোর্স' : 'ডিজিটাল সার্ভিস'}
          </span>
          {item.featured && (
            <span className="px-2 py-1 text-[11px] font-semibold rounded-md bg-amber-500/90 backdrop-blur-md text-slate-950 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>জনপ্রিয়</span>
            </span>
          )}
        </div>

        {/* Purchased tag if customer already enrolled */}
        {isCourse && isPurchased && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-600/95 text-white backdrop-blur-md flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>এনরোল করা আছে</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        
        {/* Unboxed Metadata Line with typographic separators */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{item.category}</span>
          {isCourse ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(item as Course).totalDuration}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {(item as Course).totalLessons} লেসন
              </span>
            </>
          ) : (
            <>
              <span aria-hidden="true">·</span>
              <span>{(item as Product).deliveryTime || 'দ্রুত ডেলিভারি'}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          {item.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Price Section */}
        <div className="pt-2 mt-auto border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {settings.currencySymbol}
              {item.price.toLocaleString('bn-BD')}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-slate-400 line-through">
                {settings.currencySymbol}
                {item.originalPrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {isCourse ? 'আজীবন অ্যাক্সেস' : '১০০% গ্যারান্টি'}
          </span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* WhatsApp Buy / Order */}
          <button
            onClick={handleWhatsAppBuy}
            title="হোয়াটসঅ্যাপে সরাসরি কিনুন"
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
            <span>হোয়াটসঅ্যাপে কিনুন</span>
          </button>

          {/* If course -> View/Play Course, if product -> Direct Order Form */}
          {isCourse ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCourse) onOpenCourse();
                else onViewDetails();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isPurchased ? 'ক্লাসে প্রবেশ' : 'কোর্স কারিকুলাম'}</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDirectOrder) onDirectOrder();
                else onViewDetails();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>সরাসরি অর্ডার</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
