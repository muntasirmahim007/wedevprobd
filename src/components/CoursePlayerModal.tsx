import React, { useState } from 'react';
import {
  X,
  Lock,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageCircle,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  Key
} from 'lucide-react';
import { Course, Lesson, Settings } from '../types';
import { useAuth } from '../context/AuthContext';
import { hasUserPurchasedCourse, getLessonsByCourse } from '../services/storage';

interface CoursePlayerModalProps {
  course: Course;
  settings: Settings;
  onClose: () => void;
  onDirectBuy: () => void;
  onOpenAuth: () => void;
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  course,
  settings,
  onClose,
  onDirectBuy,
  onOpenAuth
}) => {
  const { user, isAdmin } = useAuth();
  const lessons = getLessonsByCourse(course.id);
  const isEnrolled = isAdmin || hasUserPurchasedCourse(user?.id, course.id);

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const activeLesson: Lesson | undefined = lessons[activeLessonIndex];
  const canWatchActiveLesson = isEnrolled || (activeLesson && activeLesson.isFreePreview);

  // Toggle lesson complete checkmark
  const toggleCompleted = (lessonId: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleWhatsAppBuy = () => {
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম! আমি "${course.title}" কোর্সটিতে এনরোল করতে চাচ্ছি (মূল্য: ${settings.currencySymbol}${course.price.toLocaleString('bn-BD')})। আমাকে পেমেন্ট প্রক্রিয়াটি জানান।`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  // Cloudflare Stream URL generation
  const getStreamEmbedUrl = (videoId: string) => {
    // Standard Cloudflare Stream iframe player format with token simulation
    const cleanId = videoId.trim();
    if (cleanId.startsWith('http')) {
      return cleanId;
    }
    return `https://iframe.videodelivery.net/${cleanId}?autoplay=false&preload=auto&poster=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1517694712202-14dd9538aa97%3Fw%3D800`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh]">
        
        {/* Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>মাস্টার ট্রেইনার: {course.instructor}</span>
                <span>·</span>
                <span>{lessons.length}টি ক্লাস</span>
                <span>·</span>
                {isEnrolled ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>পূর্ণ অ্যাক্সেস অনুমোদিত</span>
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>এনরোলমেন্ট প্রয়োজন</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body: Video Area + Playlist */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left / Center: Video Player & Lesson Details */}
          <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {canWatchActiveLesson && activeLesson ? (
                /* Authenticated Cloudflare Stream Video Player */
                <div className="w-full h-full relative">
                  <iframe
                    src={getStreamEmbedUrl(activeLesson.cloudflareVideoId)}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                  {/* Watermark Security Badge */}
                  <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Key className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Cloudflare Stream · Verified</span>
                  </div>
                </div>
              ) : (
                /* Locked State with Access Control */
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-lg font-bold text-white">
                      🔒 ক্লাসটি শুধুমাত্র পেইড মেম্বারদের জন্য সংরক্ষিত
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      ক্লাউডফ্লেয়ার স্ট্রিম এনক্রিপ্টেড এই ভিডিওটি দেখতে আপনাকে প্রথমে কোর্সটি ক্রয় করতে হবে। একবার কিনলেই আজীবন অ্যাক্সেস পাবেন।
                    </p>
                  </div>

                  {/* Pricing and Action buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={onDirectBuy}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>এখনই কোর্স কিনুন (৳{course.price.toLocaleString('bn-BD')})</span>
                    </button>

                    <button
                      onClick={handleWhatsAppBuy}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-xl transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>হোয়াটসঅ্যাপে কিনুন</span>
                    </button>

                    {!user && (
                      <button
                        onClick={onOpenAuth}
                        className="text-xs text-slate-400 hover:text-white underline block w-full mt-1"
                      >
                        ইতোমধ্যে কিনেছেন? আপনার অ্যাকাউন্টে লগইন করুন
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Lesson Meta & Description */}
            <div className="p-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex-1 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>লেসন #{activeLessonIndex + 1}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeLesson?.duration || '২০ মিনিট'}
                    </span>
                    {activeLesson?.isFreePreview && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        ফ্রি প্রিভিউ
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mt-1">
                    {activeLesson?.title || 'লেসন লোড হচ্ছে...'}
                  </h2>
                </div>

                {isEnrolled && activeLesson && (
                  <button
                    onClick={() => toggleCompleted(activeLesson.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      completedLessonIds.includes(activeLesson.id)
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedLessonIds.includes(activeLesson.id) ? 'সম্পন্ন হয়েছে' : 'সম্পন্ন হিসেবে চিহ্নিত করুন'}
                    </span>
                  </button>
                )}
              </div>

              {/* Lesson Notes */}
              {activeLesson?.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold block text-slate-900 dark:text-white">লেসন রিসোর্স ও নোট:</span>
                  <p>{activeLesson.notes}</p>
                </div>
              )}

              {/* Course Skills Summary */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  এই কোর্স থেকে যা যা শিখবেন
                </span>
                <div className="flex flex-wrap gap-2">
                  {course.skillsLearned.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Sidebar: Lesson Playlist */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col h-64 lg:h-auto overflow-hidden">
            
            {/* Playlist Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  কোর্স কারিকুলাম ও লেসনসমূহ
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  মোট {lessons.length}টি ক্লাস ({course.totalDuration})
                </p>
              </div>

              {isEnrolled && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {completedLessonIds.length}/{lessons.length} সম্পন্ন
                </span>
              )}
            </div>

            {/* Playlist Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {lessons.map((lesson, index) => {
                const isActive = activeLessonIndex === index;
                const isCompleted = completedLessonIds.includes(lesson.id);
                const hasAccess = isEnrolled || lesson.isFreePreview;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(index)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : hasAccess ? (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                        </div>
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{lesson.duration}</span>
                        {lesson.isFreePreview && !isEnrolled && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            (ফ্রি প্রিভিউ)
                          </span>
                        )}
                        {!hasAccess && (
                          <span className="text-amber-500 font-medium">(লক করা)</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Buy CTA for non-enrolled students */}
            {!isEnrolled && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">কোর্সের সম্পূর্ণ ফি:</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {settings.currencySymbol}{course.price.toLocaleString('bn-BD')}
                  </span>
                </div>
                <button
                  onClick={onDirectBuy}
                  className="w-full py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>সম্পূর্ণ কোর্সটি আনলক করুন</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
