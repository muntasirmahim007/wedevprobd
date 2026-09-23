import { Product, Course, Lesson, Order, User, Settings, Purchase, NotificationLog } from '../types';

export const INITIAL_SETTINGS: Settings = {
  whatsappNumber: '8801812345678', // editable in Admin settings
  adminEmail: 'admin@digitalshop.com',
  smsApiKey: 'demo-bulksmsbd-key-928471',
  smsGateway: 'BulkSMSBD',
  emailService: 'Gmail SMTP',
  siteTitle: 'ডিজিটাল শপ ও একাডেমি',
  currencySymbol: '৳',
  supportPhone: '+880 1812-345678',
  cloudflareStreamSubdomain: 'customer-f33zs165nr7gyfy4.cloudflarestream.com'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'মুনতাসির মাহিম (অ্যাডমিন)',
    email: 'admin@platform.com',
    phone: '01812345678',
    role: 'admin',
    password: 'admin',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'user-student-1',
    name: 'তানভীর হাসান',
    email: 'tanvir@gmail.com',
    phone: '01711223344',
    role: 'customer',
    password: 'user123',
    createdAt: '2026-02-15T12:00:00Z'
  },
  {
    id: 'user-student-2',
    name: 'ফারহানা ইসলাম',
    email: 'farhana@gmail.com',
    phone: '01922334455',
    role: 'customer',
    password: 'user123',
    createdAt: '2026-03-01T14:30:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'ফুল-স্ট্যাক ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট',
    description: 'সম্পূর্ণ আধুনিক ই-কমার্স ওয়েবসাইট। বিকাশ/নগদ পেমেন্ট গেটওয়ে, কাস্টমার ড্যাশবোর্ড, ইনভয়েস জেনারেটর এবং দ্রুত গতির সুপারফাস্ট লোডিং সহ রেডিমেড বা কাস্টম সল্যুশন।',
    price: 15000,
    originalPrice: 22000,
    type: 'product',
    category: 'ওয়েবসাইট ডেভেলপমেন্ট',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    featured: true,
    deliveryTime: '৫-৭ কার্যদিবস',
    features: [
      'রিস্পন্সিভ মোবাইল ফ্রেন্ডলি ডিজাইন',
      'বিকাশ, নগদ, রকেট পেমেন্ট গেটওয়ে ইন্টিগ্রেশন',
      'প্রোডাক্ট ও ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম',
      '১ বছরের ফ্রি ডোমেইন ও হোস্টিং সাপোর্ট',
      'অর্ডার ট্র্যাকিং ও এসএমএস নোটিফিকেশন'
    ],
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-2',
    title: 'কাস্টম বিজনেস ও কর্পোরেট পোর্টফোলিও ওয়েবসাইট',
    description: 'আপনার কোম্পানি, এজেন্সি বা পার্সোনাল ব্র্যান্ডের জন্য আন্তর্জাতিক মানের প্রফেশনাল পোর্টফোলিও ওয়েবসাইট। এসইও অপ্টিমাইজড ও আল্ট্রা ফাস্ট পারফর্ম্যান্স।',
    price: 8500,
    originalPrice: 12000,
    type: 'product',
    category: 'ওয়েবসাইট ডেভেলপমেন্ট',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    featured: true,
    deliveryTime: '৩-৫ কার্যদিবস',
    features: [
      'প্রিমিয়াম মডার্ন ইউআই/ইউএক্স',
      'সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO)',
      'কাস্টম কন্টাক্ট ফর্ম ও গুগল ম্যাপস',
      'হোয়াটসঅ্যাপ চ্যাট ইন্টিগ্রেশন',
      'আনলিমিটেড রিভিশন'
    ],
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-3',
    title: 'কমপ্লিট ব্র্যান্ডিং ও সোশ্যাল মিডিয়া গ্রাফিক্স কিট',
    description: 'হাই-কনভার্টিং ফেসবুক বিজ্ঞাপন ব্যানার, লোগো ডিজাইন, বিজনেস কার্ড, ইনস্টাগ্রাম ক্যারোজেল ও ব্র্যান্ড গাইডলাইনের সম্পূর্ণ অল-ইন-ওয়ান প্যাকেজ।',
    price: 3500,
    originalPrice: 5000,
    type: 'product',
    category: 'গ্রাফিক্স ডিজাইন',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    featured: false,
    deliveryTime: '২ কার্যদিবস',
    features: [
      '১০টি প্রিমিয়াম ফেসবুক অ্যাড ব্যানার',
      'ভেক্টর লোগো সোর্স ফাইল (AI, EPS, PNG)',
      'লেটারহেড ও বিজনেস কার্ড ডিজাইন',
      'ক্যানভা এডিটেবল টেমপ্লেট অ্যাক্সেস'
    ],
    createdAt: '2026-02-05'
  },
  {
    id: 'prod-4',
    title: 'লোকাল এসইও ও গুগল মাই বিজনেস র‍্যাংকিং সার্ভিস',
    description: 'গুগল ম্যাপে আপনার ব্যবসাকে ১ নম্বরে নিয়ে আসার জন্য সম্পূর্ণ এসইও অপ্টিমাইজেশন। স্থানীয় কাস্টমারদের সরাসরি কল ও ভিজিট বৃদ্ধির সেরা সার্ভিস।',
    price: 4500,
    originalPrice: 7000,
    type: 'product',
    category: 'ডিজিটাল মার্কেটিং',
    image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=800&q=80',
    featured: false,
    deliveryTime: '৭ কার্যদিবস',
    features: [
      'গুগল প্রোফাইল অডিট ও অপ্টিমাইজেশন',
      '৫০+ হাই পিআর লোকাল সাইটেশন',
      'কি-ওয়ার্ড রিসার্চ ও জিও-ট্যাগ ইমেজ',
      'মাসিক র‍্যাংকিং রিপোর্ট'
    ],
    createdAt: '2026-02-12'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট (React, Node.js ও PostgreSQL)',
    description: 'শূন্য থেকে শুরু করে আধুনিক ফুল-স্ট্যাক ওয়েব ডেভেলপার হওয়ার পূর্ণাঙ্গ বাংলা কোর্স। রিয়েল-লাইফ প্রজেক্ট, এপিআই ইন্টিগ্রেশন এবং ক্লাউডে লাইভ ডিপ্লয়মেন্ট শিখুন।',
    price: 3500,
    originalPrice: 6000,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    category: 'ওয়েব ডেভেলপমেন্ট',
    featured: true,
    instructor: 'ইঞ্জিনিয়ার মোর্শেদ আলম',
    totalDuration: '৩৫ ঘণ্টা',
    totalLessons: 48,
    level: 'বিগিনার',
    skillsLearned: [
      'HTML5, CSS3, Tailwind CSS মাস্টারি',
      'মডার্ন JavaScript (ES6+) ও TypeScript',
      'React ও Next.js কম্পোনেন্ট আর্কিটেকচার',
      'Node.js ও Express এপিআই ব্যাকএন্ড',
      'ডাটাবেস ডিজাইন ও ক্লাউড ডেপ্লয়মেন্ট'
    ],
    createdAt: '2026-01-05'
  },
  {
    id: 'course-2',
    title: 'মাস্টারিং ফ্রিল্যান্সিং ও ক্লায়েন্ট হান্টিং ব্লুপ্রিন্ট',
    description: 'Upwork, Fiverr এবং লিঙ্কডইন থেকে সরাসরি হাই-টিকিট ইন্টারন্যাশনাল ক্লায়েন্ট পাওয়ার সিক্রেট স্ট্র্যাটেজি ও লাইভ বিডিং টেকনিক।',
    price: 1800,
    originalPrice: 3000,
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    category: 'ফ্রিল্যান্সিং',
    featured: true,
    instructor: 'আরিফুল ইসলাম (টপ রেটেড ফ্রিল্যান্সার)',
    totalDuration: '১৮ ঘণ্টা',
    totalLessons: 24,
    level: 'ইন্টারমিডিয়েট',
    skillsLearned: [
      'প্রফেশনাল আপওয়ার্ক প্রোফাইল ক্রিয়েশন',
      'উইনিং প্রপোজাল রাইটিং ফর্মুলা',
      'কোল্ড ইমেইলিং ও লিঙ্কডইন ক্লায়েন্ট আউটরিচ',
      'ইন্টারন্যাশনাল পেমেন্ট উইথড্রয়াল মেথড',
      'ক্লায়েন্ট কমিউনিকেশন ও রেটিং রক্ষা'
    ],
    createdAt: '2026-01-28'
  },
  {
    id: 'course-3',
    title: 'ফেসবুক ও ইনস্টাগ্রাম অ্যাডভার্টাইজিং মাস্টারক্লাস',
    description: 'ই-কমার্স ও ড্রপশিপিং ব্যবসার জন্য আরও বেশি সেলস আনার জন্য মেটা অ্যাডস ম্যানেজারের এ টু জেড প্র্যাকটিক্যাল গাইডলাইন।',
    price: 2200,
    originalPrice: 4000,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80',
    category: 'ডিজিটাল মার্কেটিং',
    featured: false,
    instructor: 'রাকিব আহমেদ',
    totalDuration: '২০ ঘণ্টা',
    totalLessons: 30,
    level: 'বিগিনার',
    skillsLearned: [
      'মেটা বিজনেস ম্যানেজার সেটআপ ও ভেরিফিকেশন',
      'পিক্সেল ও কনভার্সন এপিআই ট্র্যাকিং',
      'কাস্টম ও লুকঅ্যালাইক অডিয়েন্স ক্রিয়েশন',
      'কম খরচে সর্বোচ্চ সেলস আনার স্ট্র্যাটেজি',
      'ROAS ও ক্যাম্পেইন অপ্টিমাইজেশন'
    ],
    createdAt: '2026-02-10'
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  // Lessons for Course 1
  {
    id: 'les-101',
    courseId: 'course-1',
    title: '০১. কোর্সের পরিচিতি এবং লার্নিং রোডম্যাপ',
    cloudflareVideoId: '5d5bc37ffcf54c9b82e996832fb36fb1',
    duration: '১৫:২০',
    orderIndex: 1,
    isFreePreview: true,
    notes: 'কোর্সের সম্পূর্ণ সিলেবাস ও স্টাডি গাইডলাইন ফাইল ডাউনলোড করুন।'
  },
  {
    id: 'les-102',
    courseId: 'course-1',
    title: '০২. ডেভেলপমেন্ট এনভায়রনমেন্ট সেটআপ (VS Code, Git & Node)',
    cloudflareVideoId: 'c64ef5f082e6462bbcb64936dca8e5c2',
    duration: '২২:৪৫',
    orderIndex: 2,
    isFreePreview: true,
    notes: 'VS Code এক্সটেনশন এবং কনফিগারেশন সেটিংস।'
  },
  {
    id: 'les-103',
    courseId: 'course-1',
    title: '০৩. এইচটিএমএল৫ ও সেমান্টিক মার্কআপ আর্কিটেকচার',
    cloudflareVideoId: '8f7d92a14e6b4cf88291a1045b736b01',
    duration: '২৮:১০',
    orderIndex: 3,
    isFreePreview: false,
    notes: 'মডার্ন সেমান্টিক ট্যাগস এবং এসইও ফ্রেন্ডলি কাঠামো।'
  },
  {
    id: 'les-104',
    courseId: 'course-1',
    title: '০৪. আধুনিক টেইলউইন্ড সিএসএস (Tailwind CSS) প্রজেক্ট',
    cloudflareVideoId: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    duration: '৩৪:১৫',
    orderIndex: 4,
    isFreePreview: false,
    notes: 'ফ্লেক্সবক্স, গ্রিড এবং ডার্ক মোড রেসপন্সিভ ডিজাইন।'
  },
  {
    id: 'les-105',
    courseId: 'course-1',
    title: '০৫. রিয়্যাক্ট কম্পোনেন্ট ও হুকস ডিপ ডাইভ',
    cloudflareVideoId: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    duration: '৪৫:৫০',
    orderIndex: 5,
    isFreePreview: false,
    notes: 'useState, useEffect, useMemo এবং কাস্টম হুকস প্র্যাকটিস।'
  },

  // Lessons for Course 2
  {
    id: 'les-201',
    courseId: 'course-2',
    title: '০১. ফ্রিল্যান্সিং ক্যারিয়ার শুরুর মানসিক প্রস্তুতি ও মার্কেট রিসার্চ',
    cloudflareVideoId: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a',
    duration: '১৮:৩০',
    orderIndex: 1,
    isFreePreview: true,
    notes: 'হাই ডিমান্ড স্কিল সিলেকশন ম্যাট্রিক্স।'
  },
  {
    id: 'les-202',
    courseId: 'course-2',
    title: '০২. আপওয়ার্ক প্রোফাইল ১০০% অপটিমাইজেশন টেকনিক',
    cloudflareVideoId: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    duration: '২৫:১৫',
    orderIndex: 2,
    isFreePreview: false,
    notes: 'বায়ো ও পোর্টফোলিও সাজানোর চেকলিস্ট।'
  },
  {
    id: 'les-203',
    courseId: 'course-2',
    title: '০৩. ক্লায়েন্টকে আকর্ষিত করার কভার লেটার ও প্রপোজাল সিক্রেট',
    cloudflareVideoId: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    duration: '৩১:০০',
    orderIndex: 3,
    isFreePreview: false,
    notes: '১০টি টেস্টেড প্রপোজাল টেমপ্লেট।'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-89210',
    customerName: 'তানভীর হাসান',
    phone: '01711223344',
    address: 'বাড়ি ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা',
    productId: 'prod-1',
    productTitle: 'ফুল-স্ট্যাক ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট',
    productType: 'product',
    price: 15000,
    status: 'Processing',
    notes: 'অনলাইন পেমেন্ট গেটওয়ে হিসেবে বিকাশ ও নগদ চাই।',
    createdAt: '2026-09-20T14:15:00Z',
    updatedAt: '2026-09-21T09:30:00Z'
  },
  {
    id: 'ORD-89209',
    customerName: 'ফারহানা ইসলাম',
    phone: '01922334455',
    address: 'হাউজ ২১, নাসিরাবাদ, চট্টগ্রাম',
    productId: 'prod-3',
    productTitle: 'কমপ্লিট ব্র্যান্ডিং ও সোশ্যাল মিডিয়া গ্রাফিক্স কিট',
    productType: 'product',
    price: 3500,
    status: 'Delivered',
    notes: 'ক্লাউড ড্রাইভে পিএসডি ও এআই ফাইল ডেলিভারি দেওয়া হয়েছে।',
    createdAt: '2026-09-18T11:00:00Z',
    updatedAt: '2026-09-19T16:20:00Z'
  },
  {
    id: 'ORD-89211',
    customerName: 'মো. রিয়াজ উদ্দিন',
    phone: '01844556677',
    address: 'গ্রাম: কাঞ্চনপুর, ডাকঘর: ফেনী সদর, ফেনী',
    productId: 'prod-2',
    productTitle: 'কাস্টম বিজনেস ও কর্পোরেট পোর্টফোলিও ওয়েবসাইট',
    productType: 'product',
    price: 8500,
    status: 'Confirmed',
    notes: 'লোগো এবং কন্টেন্ট ইমেইলে পাঠিয়েছি।',
    createdAt: '2026-09-22T08:20:00Z',
    updatedAt: '2026-09-22T10:00:00Z'
  }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur-101',
    userId: 'user-student-1',
    userName: 'তানভীর হাসান',
    userEmail: 'tanvir@gmail.com',
    courseId: 'course-1',
    courseTitle: 'ফুল-স্ট্যাক ওয়েব ডেভেলপমেন্ট (React, Node.js ও PostgreSQL)',
    price: 3500,
    purchasedAt: '2026-09-15T10:00:00Z',
    paymentMethod: 'বিকাশ (bKash)',
    status: 'active'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-1',
    type: 'email',
    recipient: 'admin@digitalshop.com',
    title: 'নতুন অর্ডার এসেছে: ORD-89210',
    content: 'গ্রাহক তানভীর হাসান "ফুল-স্ট্যাক ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট" এর জন্য ১৫,০০০৳ মূল্যের অর্ডার দিয়েছেন।',
    status: 'sent',
    timestamp: '2026-09-20T14:15:05Z',
    orderId: 'ORD-89210'
  },
  {
    id: 'notif-2',
    type: 'sms',
    recipient: '+8801812345678',
    title: 'অ্যাডমিন এসএমএস অ্যালার্ট',
    content: 'নতুন অর্ডার #ORD-89210 (15,000 BDT) এসেছে। কাস্টমার: তানভীর হাসান (01711223344)',
    status: 'sent',
    timestamp: '2026-09-20T14:15:08Z',
    orderId: 'ORD-89210'
  }
];
