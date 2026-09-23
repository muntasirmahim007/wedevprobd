import {
  Product,
  Course,
  Lesson,
  Order,
  Purchase,
  User,
  Settings,
  NotificationLog,
  OrderStatus
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_COURSES,
  INITIAL_LESSONS,
  INITIAL_ORDERS,
  INITIAL_PURCHASES,
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import {
  getSupabaseClient,
  productToDb,
  courseToDb,
  lessonToDb,
  orderToDb,
  purchaseToDb,
  fetchProductsFromSupabase,
  fetchCoursesFromSupabase,
  fetchLessonsFromSupabase
} from './supabase';

const safeSupabaseSync = async (fn: () => PromiseLike<any>) => {
  try {
    await fn();
  } catch (err) {
    // Gracefully ignore network or schema errors in background sync
  }
};

const STORAGE_KEYS = {
  PRODUCTS: 'dsa_products',
  COURSES: 'dsa_courses',
  LESSONS: 'dsa_lessons',
  ORDERS: 'dsa_orders',
  PURCHASES: 'dsa_purchases',
  USERS: 'dsa_users',
  SETTINGS: 'dsa_settings',
  NOTIFICATIONS: 'dsa_notifications',
  CURRENT_USER: 'dsa_current_user',
  THEME: 'dsa_theme'
};

const notifySubscribers = (key: string) => {
  window.dispatchEvent(new CustomEvent('dsa_store_change', { detail: { key } }));
};

// Initialize Storage and sync from Supabase if connected
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LESSONS)) {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(INITIAL_PURCHASES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }

  // Background fetch from Supabase
  syncRemoteSupabaseToLocal();
};

export const syncRemoteSupabaseToLocal = async () => {
  try {
    const remoteProducts = await fetchProductsFromSupabase();
    if (remoteProducts && remoteProducts.length > 0) {
      setItem(STORAGE_KEYS.PRODUCTS, remoteProducts);
    }
    const remoteCourses = await fetchCoursesFromSupabase();
    if (remoteCourses && remoteCourses.length > 0) {
      setItem(STORAGE_KEYS.COURSES, remoteCourses);
    }
    const remoteLessons = await fetchLessonsFromSupabase();
    if (remoteLessons && remoteLessons.length > 0) {
      setItem(STORAGE_KEYS.LESSONS, remoteLessons);
    }
  } catch (err) {
    // Ignore offline errors
  }
};

// Safe retrieval
function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    notifySubscribers(key);
  } catch (e) {
    console.error(`Error writing ${key}:`, e);
  }
}

// ================== SETTINGS ==================
export const getSettings = (): Settings => getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
export const saveSettings = (newSettings: Settings): void => {
  setItem(STORAGE_KEYS.SETTINGS, newSettings);
};

// ================== PRODUCTS ==================
export const getProducts = (): Product[] => getItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.unshift(product);
  }
  setItem(STORAGE_KEYS.PRODUCTS, products);

  // Sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('products').upsert(productToDb(product)));
  }
};
export const deleteProduct = (id: string): void => {
  const products = getProducts().filter((p) => p.id !== id);
  setItem(STORAGE_KEYS.PRODUCTS, products);

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('products').delete().eq('id', id));
  }
};

// ================== COURSES ==================
export const getCourses = (): Course[] => getItem(STORAGE_KEYS.COURSES, INITIAL_COURSES);
export const saveCourse = (course: Course): void => {
  const courses = getCourses();
  const index = courses.findIndex((c) => c.id === course.id);
  if (index >= 0) {
    courses[index] = course;
  } else {
    courses.unshift(course);
  }
  setItem(STORAGE_KEYS.COURSES, courses);

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('courses').upsert(courseToDb(course)));
  }
};
export const deleteCourse = (id: string): void => {
  const courses = getCourses().filter((c) => c.id !== id);
  setItem(STORAGE_KEYS.COURSES, courses);
  // Also delete associated lessons
  const lessons = getLessons().filter((l) => l.courseId !== id);
  setItem(STORAGE_KEYS.LESSONS, lessons);

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('courses').delete().eq('id', id));
    safeSupabaseSync(() => supabase.from('lessons').delete().eq('course_id', id));
  }
};

// ================== LESSONS ==================
export const getLessons = (): Lesson[] => getItem(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
export const getLessonsByCourse = (courseId: string): Lesson[] => {
  return getLessons()
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
};
export const saveLesson = (lesson: Lesson): void => {
  const lessons = getLessons();
  const index = lessons.findIndex((l) => l.id === lesson.id);
  if (index >= 0) {
    lessons[index] = lesson;
  } else {
    lessons.push(lesson);
  }
  setItem(STORAGE_KEYS.LESSONS, lessons);

  // Update course lesson count
  const courses = getCourses();
  const course = courses.find((c) => c.id === lesson.courseId);
  if (course) {
    const courseLessons = lessons.filter((l) => l.courseId === lesson.courseId);
    course.totalLessons = courseLessons.length;
    saveCourse(course);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('lessons').upsert({
      id: lesson.id,
      course_id: lesson.courseId,
      title: lesson.title,
      cloudflare_video_id: lesson.cloudflareVideoId,
      duration: lesson.duration,
      order_index: lesson.orderIndex,
      is_free_preview: lesson.isFreePreview,
      notes: lesson.notes
    }));
  }
};
export const deleteLesson = (id: string, courseId: string): void => {
  const lessons = getLessons().filter((l) => l.id !== id);
  setItem(STORAGE_KEYS.LESSONS, lessons);

  const courses = getCourses();
  const course = courses.find((c) => c.id === courseId);
  if (course) {
    const courseLessons = lessons.filter((l) => l.courseId === courseId);
    course.totalLessons = courseLessons.length;
    saveCourse(course);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('lessons').delete().eq('id', id));
  }
};


// ================== ORDERS ==================
export const getOrders = (): Order[] => getItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

export const createOrder = (orderData: {
  customerName: string;
  phone: string;
  address: string;
  productId: string;
  productTitle: string;
  productType: 'product' | 'course';
  price: number;
  notes?: string;
}): Order => {
  const settings = getSettings();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderId = `ORD-${randomSuffix}`;

  const newOrder: Order = {
    id: orderId,
    customerName: orderData.customerName,
    phone: orderData.phone,
    address: orderData.address,
    productId: orderData.productId,
    productTitle: orderData.productTitle,
    productType: orderData.productType,
    price: orderData.price,
    status: 'Pending',
    notes: orderData.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const orders = getOrders();
  orders.unshift(newOrder);
  setItem(STORAGE_KEYS.ORDERS, orders);

  // Sync order to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('orders').upsert({
      id: newOrder.id,
      customer_name: newOrder.customerName,
      phone: newOrder.phone,
      address: newOrder.address,
      product_id: newOrder.productId,
      product_title: newOrder.productTitle,
      price: newOrder.price,
      status: newOrder.status,
      notes: newOrder.notes,
      created_at: newOrder.createdAt,
      updated_at: newOrder.updatedAt
    }));
  }

  // Trigger Notifications
  sendAdminEmailNotification(newOrder, settings);
  sendAdminSMSNotification(newOrder, settings);

  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.ORDERS, orders);

    const supabase = getSupabaseClient();
    if (supabase) {
      safeSupabaseSync(() => supabase.from('orders').update({
        status,
        updated_at: order.updatedAt
      }).eq('id', orderId));
    }
  }
};

export const deleteOrder = (orderId: string): void => {
  const orders = getOrders().filter((o) => o.id !== orderId);
  setItem(STORAGE_KEYS.ORDERS, orders);

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('orders').delete().eq('id', orderId));
  }
};


// ================== NOTIFICATIONS ==================
export const getNotificationLogs = (): NotificationLog[] =>
  getItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

const addNotificationLog = (log: Omit<NotificationLog, 'id' | 'timestamp'>): void => {
  const logs = getNotificationLogs();
  const newLog: NotificationLog = {
    ...log,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  setItem(STORAGE_KEYS.NOTIFICATIONS, logs);
};

export const sendAdminEmailNotification = (order: Order, settings: Settings): void => {
  // Simulates Gmail SMTP / Resend Email Dispatch
  const title = `🔔 নতুন অর্ডার এসেছে: ${order.id}`;
  const content = `সম্মানিত অ্যাডমিন, গ্রাহক "${order.customerName}" (ফোন: ${order.phone}) ${order.price}৳ মূল্যের "${order.productTitle}" এর জন্য নতুন অর্ডার দিয়েছেন। ডেলিভারি ঠিকানা: ${order.address}`;

  addNotificationLog({
    type: 'email',
    recipient: settings.adminEmail || 'admin@digitalshop.com',
    title,
    content,
    status: 'sent',
    orderId: order.id
  });
};

export const sendAdminSMSNotification = (order: Order, settings: Settings): void => {
  // Simulates Twilio / BulkSMSBD / Alpha SMS dispatch
  const title = `অ্যাডমিন এসএমএস অ্যালার্ট (${settings.smsGateway})`;
  const content = `নতুন অর্ডার #${order.id} | গ্রাহক: ${order.customerName} (${order.phone}) | আইটেম: ${order.productTitle} | মূল্য: ${order.price} BDT`;

  addNotificationLog({
    type: 'sms',
    recipient: `+${settings.whatsappNumber.replace(/[^0-9]/g, '')}`,
    title,
    content,
    status: 'sent',
    orderId: order.id
  });
};

// ================== PURCHASES & COURSE ACCESS ==================
export const getPurchases = (): Purchase[] => getItem(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);

export const enrollUserInCourse = (
  userId: string,
  userName: string,
  userEmail: string,
  courseId: string,
  courseTitle: string,
  price: number,
  paymentMethod: string = 'অ্যাডমিন এনরোল / অনলাইন'
): Purchase => {
  const purchases = getPurchases();
  // Check if already enrolled
  const existing = purchases.find((p) => p.userId === userId && p.courseId === courseId && p.status === 'active');
  if (existing) return existing;

  const newPurchase: Purchase = {
    id: `pur-${Date.now()}`,
    userId,
    userName,
    userEmail,
    courseId,
    courseTitle,
    price,
    purchasedAt: new Date().toISOString(),
    paymentMethod,
    status: 'active'
  };

  purchases.unshift(newPurchase);
  setItem(STORAGE_KEYS.PURCHASES, purchases);

  const supabase = getSupabaseClient();
  if (supabase) {
    safeSupabaseSync(() => supabase.from('purchases').upsert(purchaseToDb(newPurchase)));
  }

  return newPurchase;
};

export const revokeCourseAccess = (purchaseId: string): void => {
  const purchases = getPurchases();
  const item = purchases.find((p) => p.id === purchaseId);
  if (item) {
    item.status = 'revoked';
    setItem(STORAGE_KEYS.PURCHASES, purchases);

    const supabase = getSupabaseClient();
    if (supabase) {
      safeSupabaseSync(() => supabase.from('purchases').update({ status: 'revoked' }).eq('id', purchaseId));
    }
  }
};

export const hasUserPurchasedCourse = (userId: string | null | undefined, courseId: string): boolean => {
  if (!userId) return false;
  const purchases = getPurchases();
  return purchases.some((p) => p.userId === userId && p.courseId === courseId && p.status === 'active');
};

export const getUserPurchasedCourses = (userId: string): Course[] => {
  const purchases = getPurchases().filter((p) => p.userId === userId && p.status === 'active');
  const courses = getCourses();
  const courseIds = new Set(purchases.map((p) => p.courseId));
  return courses.filter((c) => courseIds.has(c.id));
};

// ================== USERS & AUTH ==================
export const getUsers = (): User[] => getItem(STORAGE_KEYS.USERS, INITIAL_USERS);

export const registerUser = (userData: {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: 'admin' | 'customer';
}): User => {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('এই ইমেইল দিয়ে ইতোমধ্যে একটি একাউন্ট তৈরি করা আছে।');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: userData.name,
    email: userData.email.toLowerCase(),
    phone: userData.phone,
    role: userData.role || 'customer',
    password: userData.password || '123456',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);
  return newUser;
};

// Hook/Event helper for React components
export const useStoreSubscription = (callback: () => void) => {
  const listener = () => callback();
  window.addEventListener('dsa_store_change', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('dsa_store_change', listener);
    window.removeEventListener('storage', listener);
  };
};
