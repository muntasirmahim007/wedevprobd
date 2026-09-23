import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertCircle,
  MessageCircle,
  Phone,
  MapPin,
  Calendar,
  XCircle,
  FileText
} from 'lucide-react';
import { Order, Settings, OrderStatus } from '../types';
import { getOrders, useStoreSubscription } from '../services/storage';

interface OrderTrackingProps {
  settings: Settings;
  initialOrderId?: string;
  onSelectProduct?: (productId: string) => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  settings,
  initialOrderId = '',
  onSelectProduct
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Load orders & listen to live updates from admin
  const refreshOrders = () => {
    const all = getOrders();
    setOrders(all);

    if (searchInput.trim()) {
      filterMatching(searchInput.trim(), all);
    }
  };

  useEffect(() => {
    refreshOrders();
    const unsubscribe = useStoreSubscription(refreshOrders);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialOrderId) {
      setSearchInput(initialOrderId);
      filterMatching(initialOrderId, getOrders());
      setHasSearched(true);
    }
  }, [initialOrderId]);

  const filterMatching = (query: string, sourceOrders: Order[]) => {
    const q = query.trim().toLowerCase();
    const matches = sourceOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''))
    );
    setMatchedOrders(matches);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setHasSearched(true);
    filterMatching(searchInput, orders);
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'অপেক্ষমাণ', desc: 'অর্ডার জমা হয়েছে', icon: Clock },
    { label: 'নিশ্চিত', desc: 'অর্ডার অনুমোদিত', icon: CheckCircle2 },
    { label: 'প্রক্রিয়াধীন', desc: 'প্রস্তুত করা হচ্ছে', icon: FileText },
    { label: 'ডেলিভার্ড', desc: 'সফলভাবে সম্পন্ন', icon: PackageCheck }
  ];

  const openWhatsAppForOrder = (order: Order) => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম! আমার অর্ডার নং #${order.id} (${order.productTitle}) এর বিষয়ে আপডেট জানতে চাচ্ছি।`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          অর্ডার ট্র্যাকিং সিস্টেম
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          আপনার অর্ডার আইডি (যেমন: <span className="font-mono text-emerald-500 font-bold">ORD-89210</span>) অথবা অর্ডার করার সময় ব্যবহৃত মোবাইল নম্বরটি লিখুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="অর্ডার আইডি বা মোবাইল নম্বর লিখুন..."
            className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            ট্র্যাক করুন
          </button>
        </div>
      </form>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          {matchedOrders.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                কোনো অর্ডার পাওয়া যায়নি
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর প্রদান করুন। প্রয়োজনে আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করতে পারেন।
              </p>
              <button
                onClick={() => {
                  const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
                  window.open(`https://wa.me/${cleanNumber}`, '_blank');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে সাহায্য নিন</span>
              </button>
            </div>
          ) : (
            matchedOrders.map((order) => {
              const currentStep = getStatusStepIndex(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-6"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">অর্ডার নম্বর:</span>
                        <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          #{order.id}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {order.productTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">মোট মূল্য</span>
                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {settings.currencySymbol}{order.price.toLocaleString('bn-BD')}
                        </span>
                      </div>

                      <button
                        onClick={() => openWhatsAppForOrder(order)}
                        title="এই অর্ডার সম্পর্কে হোয়াটসঅ্যাপে কথা বলুন"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-xl transition-all"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-500" />
                        <span className="hidden sm:inline">হোয়াটসঅ্যাপ সাপোর্ট</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Tracker Bar */}
                  {isCancelled ? (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-800 dark:text-rose-300">
                      <XCircle className="w-6 h-6 shrink-0 text-rose-500" />
                      <div>
                        <h4 className="text-sm font-bold">অর্ডারটি বাতিল করা হয়েছে</h4>
                        <p className="text-xs text-rose-600 dark:text-rose-400">
                          যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন।
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="grid grid-cols-4 gap-2 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
                        <div
                          className="absolute top-5 left-8 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                          style={{
                            width: `${(Math.min(currentStep, 3) / 3) * 85}%`
                          }}
                        />

                        {steps.map((step, idx) => {
                          const Icon = step.icon;
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={idx} className="flex flex-col items-center text-center z-10">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <span
                                className={`mt-2 text-xs font-bold ${
                                  isCurrent
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : isDone
                                    ? 'text-slate-800 dark:text-slate-200'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Customer & Order Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 block">গ্রাহকের নাম ও ফোন:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {order.customerName} ({order.phone})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 block">ঠিকানা:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {order.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 block">অর্ডারের সময়:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold">বিশেষ নোট:</span> {order.notes}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Suggested Demo Tracking IDs */}
      {!hasSearched && (
        <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-center space-y-2">
          <p className="text-slate-600 dark:text-slate-400">
            ডেমো ট্র্যাকিং টেস্ট করতে যেকোনো একটি আইডি ক্লিক করুন:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['ORD-89210', 'ORD-89209', 'ORD-89211'].map((id) => (
              <button
                key={id}
                onClick={() => {
                  setSearchInput(id);
                  setHasSearched(true);
                  filterMatching(id, orders);
                }}
                className="px-3 py-1 font-mono font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400 hover:border-emerald-500"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
