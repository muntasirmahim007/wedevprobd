export type ItemType = 'product' | 'course';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  type: ItemType;
  image: string;
  category: string;
  featured?: boolean;
  deliveryTime?: string;
  features?: string[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  cloudflareVideoId: string;
  duration: string;
  orderIndex: number;
  isFreePreview?: boolean;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  featured?: boolean;
  instructor: string;
  totalDuration: string;
  totalLessons: number;
  level: 'বিগিনার' | 'ইন্টারমিডিয়েট' | 'অ্যাডভান্সড';
  skillsLearned: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  productId: string;
  productTitle: string;
  productType: ItemType;
  price: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  price: number;
  purchasedAt: string;
  paymentMethod: string;
  status: 'active' | 'revoked';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  password?: string;
  avatar?: string;
  createdAt: string;
}

export interface Settings {
  whatsappNumber: string; // e.g. 8801812345678
  adminEmail: string;     // e.g. admin@digitalbd.com
  smsApiKey: string;
  smsGateway: 'BulkSMSBD' | 'AlphaSMS' | 'Twilio';
  emailService: 'Gmail SMTP' | 'Resend' | 'SendGrid';
  siteTitle: string;
  currencySymbol: string;
  supportPhone: string;
  cloudflareStreamSubdomain?: string;
}

export interface NotificationLog {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  title: string;
  content: string;
  status: 'sent' | 'failed';
  timestamp: string;
  orderId?: string;
}
