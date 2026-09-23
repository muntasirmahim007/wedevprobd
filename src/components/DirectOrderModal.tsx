import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  CheckCircle2,
  Copy,
  ArrowRight,
  Phone,
  User,
  MapPin,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Product, Course, Settings, Order } from '../types';
import { createOrder } from '../services/storage';
import { useToast } from './Toast';

interface DirectOrderModalProps {
  item: (Product & { isCourse?: false }) | (Course & { isCourse: true; type?: 'course' });
  settings: Settings;
  onClose: () => void;
  onGoToTracking: (orderId: string) => void;
}

export const DirectOrderModal: React.FC<DirectOrderModalProps> = ({
  item,
  settings,
  onClose,
  onGoToTracking
}) => {
  const { showToast } = useToast();
  const isCourse = 'instructor' in item;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('দয়া করে আপনার নাম লিখুন।', 'error');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      showToast('সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।', 'error');
      return;
    }
    if (!address.trim()) {
      showToast('দয়া করে আপনার যোগাযোগের পূর্ণ ঠিকানা লিখুন।', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        productId: item.id,
        productTitle: item.title,
        productType: isCourse ? 'course' : 'product',
        price: item.price,
        notes: notes.trim()
      });

      setCreatedOrder(order);
      showToast(`অর্ডার সফলভাবে গ্রহণ করা হয়েছে! অর্ডার আইডি: ${order.id}`, 'success');
    } catch (err: any) {
      showToast('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.id);
      showToast('অর্ডার আইডি কপি করা হয়েছে!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {createdOrder ? 'অর্ডার সফল হয়েছে' : 'সরাসরি অর্ডার ফর্ম'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdOrder ? 'আপনার অর্ডারটি প্রক্রিয়াকরণ শুরু হয়েছে' : 'ক্যাশ অন ডেলিভারি / অনলাইন পেমেন্ট'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {createdOrder ? (
            /* Order Success View */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  ধন্যবাদ, {createdOrder.customerName}!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  আপনার অর্ডারটি সফলভাবে জমা হয়েছে। অ্যাডমিন টিমের কাছে ইমেইল ও এসএমএস নোটিফিকেশন পাঠানো হয়েছে। দ্রুত আপনার সাথে যোগাযোগ করা হবে।
                </p>
              </div>

              {/* Order ID Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    আপনার অর্ডার ট্র্যাকিং আইডি
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {createdOrder.id}
                  </span>
                </div>
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি করুন</span>
                </button>
              </div>

              {/* Order Details Brief */}
              <div className="text-left text-xs space-y-2 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">আইটেম:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{createdOrder.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">মোট মূল্য:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {settings.currencySymbol}{createdOrder.price.toLocaleString('bn-BD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বর্তমান অবস্থা:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                    অপেক্ষমাণ (Pending)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onGoToTracking(createdOrder.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <span>অর্ডারের লাইভ স্ট্যাটাস ট্র্যাক করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          ) : (
            /* Order Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={isCourse ? (item as Course).thumbnail : (item as Product).image}
                  alt={item.title}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isCourse ? 'অনলাইন কোর্স' : 'ডিজিটাল সার্ভিস'} · {settings.currencySymbol}
                    {item.price.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {settings.currencySymbol}{item.price.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="উদা: তানভীর হাসান"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  এই নম্বরে অর্ডার কনফার্মেশন ও ট্র্যাকিং আপডেট পাঠানো হবে।
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  পূর্ণ ঠিকানা বা যোগাযোগের লোকেশন <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="বাড়ি/রোড নম্বর, এলাকা, থানা, জেলা"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Special Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিশেষ নির্দেশনা / নোট (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="সার্ভিস বা প্রোডাক্ট সম্পর্কিত কোনো বিশেষ রিকোয়ারমেন্ট থাকলে লিখুন"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/40 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>
                  অর্ডার প্লেস করার সাথে সাথে অ্যাডমিনের কাছে স্বয়ংক্রিয় এসএমএস ও ইমেইল নোটিফিকেশন পৌঁছে যাবে এবং আপনি একটি ট্র্যাকিং আইডি পাবেন।
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>অর্ডার প্রক্রিয়াকরণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>অর্ডার নিশ্চিত করুন (৳{item.price.toLocaleString('bn-BD')})</span>
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
