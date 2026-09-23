import React from 'react';
import { BookOpen, Play, CheckCircle2, Clock, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Course, Settings } from '../types';
import { useAuth } from '../context/AuthContext';
import { getUserPurchasedCourses, getPurchases, getLessonsByCourse } from '../services/storage';

interface MyCoursesViewProps {
  settings: Settings;
  onOpenCourseVideo: (course: Course) => void;
  onExploreCourses: () => void;
}

export const MyCoursesView: React.FC<MyCoursesViewProps> = ({
  settings,
  onOpenCourseVideo,
  onExploreCourses
}) => {
  const { user } = useAuth();
  const enrolledCourses = user ? getUserPurchasedCourses(user.id) : [];
  const userPurchases = user ? getPurchases().filter((p) => p.userId === user.id) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              আমার কোর্সসমূহ (My Learning)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            আপনার ক্রয়কৃত সকল কোর্স ও ক্লাউডফ্লেয়ার স্ট্রিম ভিডিও লেসন অ্যাক্সেস করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            মোট এনরোলমেন্ট: <strong className="text-emerald-500">{enrolledCourses.length}টি</strong>
          </span>
        </div>
      </div>

      {/* Courses List */}
      {enrolledCourses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              আপনার কোনো সক্রিয় কোর্স নেই
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              আপনি এখনও কোনো কোর্সে এনরোল করেননি। আমাদের প্র্যাকটিক্যাল কোর্সগুলো দেখুন এবং ক্যারিয়ারের নতুন স্কিল অর্জন করুন।
            </p>
          </div>
          <button
            onClick={onExploreCourses}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>কোর্সগুলো দেখুন</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => {
            const lessons = getLessonsByCourse(course.id);
            const purchaseInfo = userPurchases.find((p) => p.courseId === course.id);

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-emerald-600 text-white flex items-center gap-1 shadow">
                        <ShieldCheck className="w-3 h-3" />
                        <span>অ্যাক্সেস সক্রিয়</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{course.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.totalDuration}
                      </span>
                      <span>·</span>
                      <span>{lessons.length}টি লেসন</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      ইন্সট্রাক্টর: <strong>{course.instructor}</strong>
                    </p>

                    {purchaseInfo && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                        পেমেন্ট: {purchaseInfo.paymentMethod} · {new Date(purchaseInfo.purchasedAt).toLocaleDateString('bn-BD')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onOpenCourseVideo(course)}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ক্লাস দেখা শুরু করুন</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
