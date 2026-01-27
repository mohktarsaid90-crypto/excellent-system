import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

// Core translations for the sales system
export const translations: Translations = {
  // App - Keep Mano ERP in English always
  appName: { en: 'Mano ERP', ar: 'Mano ERP' },
  
  // Navigation
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  inventory: { en: 'Inventory', ar: 'المخزون' },
  products: { en: 'Products', ar: 'المنتجات' },
  sales: { en: 'Sales', ar: 'المبيعات' },
  customers: { en: 'Customers', ar: 'العملاء' },
  representatives: { en: 'Representatives', ar: 'المندوبين' },
  reports: { en: 'Reports', ar: 'التقارير' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  users: { en: 'Users', ar: 'المستخدمين' },
  permissions: { en: 'Permissions', ar: 'الصلاحيات' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  login: { en: 'Login', ar: 'تسجيل الدخول' },
  
  // New ERP Navigation
  agents: { en: 'Agents', ar: 'المندوبين' },
  loadManagement: { en: 'Load Management', ar: 'إدارة التحميل' },
  reconciliation: { en: 'Reconciliation', ar: 'التفريغ' },
  invoices: { en: 'Invoices', ar: 'الفواتير' },
  liveMap: { en: 'Live Map', ar: 'الخريطة الحية' },
  journeyPlans: { en: 'Journey Plans', ar: 'خطط الرحلات' },
  
  // Menu Groups
  mainMenu: { en: 'Main Menu', ar: 'القائمة الرئيسية' },
  operations: { en: 'Operations', ar: 'العمليات' },
  fieldOps: { en: 'Field Operations', ar: 'العمليات الميدانية' },
  finance: { en: 'Finance', ar: 'المالية' },
  administration: { en: 'Administration', ar: 'الإدارة' },
  
  // Dashboard
  totalSales: { en: 'Total Sales', ar: 'إجمالي المبيعات' },
  totalRevenue: { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
  totalCustomers: { en: 'Total Customers', ar: 'إجمالي العملاء' },
  totalProducts: { en: 'Total Products', ar: 'إجمالي المنتجات' },
  activeReps: { en: 'Active Representatives', ar: 'المندوبين النشطين' },
  lowStock: { en: 'Low Stock Items', ar: 'منتجات منخفضة المخزون' },
  todaySales: { en: "Today's Sales", ar: 'مبيعات اليوم' },
  thisMonth: { en: 'This Month', ar: 'هذا الشهر' },
  salesOverview: { en: 'Sales Overview', ar: 'نظرة عامة على المبيعات' },
  recentOrders: { en: 'Recent Orders', ar: 'الطلبات الأخيرة' },
  topProducts: { en: 'Top Products', ar: 'أفضل المنتجات' },
  repPerformance: { en: 'Rep Performance', ar: 'أداء المندوبين' },
  
  // Common actions
  add: { en: 'Add', ar: 'إضافة' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  search: { en: 'Search', ar: 'بحث' },
  filter: { en: 'Filter', ar: 'تصفية' },
  export: { en: 'Export', ar: 'تصدير' },
  import: { en: 'Import', ar: 'استيراد' },
  view: { en: 'View', ar: 'عرض' },
  viewAll: { en: 'View All', ar: 'عرض الكل' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  approve: { en: 'Approve', ar: 'موافقة' },
  reject: { en: 'Reject', ar: 'رفض' },
  release: { en: 'Release', ar: 'إطلاق' },
  submit: { en: 'Submit', ar: 'إرسال' },
  
  // Status
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
  approved: { en: 'Approved', ar: 'تمت الموافقة' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  released: { en: 'Released', ar: 'تم الإطلاق' },
  requested: { en: 'Requested', ar: 'مطلوب' },
  submitted: { en: 'Submitted', ar: 'تم الإرسال' },
  disputed: { en: 'Disputed', ar: 'متنازع عليه' },
  paid: { en: 'Paid', ar: 'مدفوع' },
  overdue: { en: 'Overdue', ar: 'متأخر' },
  partial: { en: 'Partial', ar: 'جزئي' },
  synced: { en: 'Synced', ar: 'متزامن' },
  offline: { en: 'Offline', ar: 'غير متصل' },
  online: { en: 'Online', ar: 'متصل' },
  
  // Products
  productName: { en: 'Product Name', ar: 'اسم المنتج' },
  price: { en: 'Price', ar: 'السعر' },
  quantity: { en: 'Quantity', ar: 'الكمية' },
  category: { en: 'Category', ar: 'الفئة' },
  sku: { en: 'SKU', ar: 'رمز المنتج' },
  discount: { en: 'Discount', ar: 'الخصم' },
  vat: { en: 'VAT', ar: 'ضريبة القيمة المضافة' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  total: { en: 'Total', ar: 'الإجمالي' },
  
  // Customers
  customerName: { en: 'Customer Name', ar: 'اسم العميل' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  address: { en: 'Address', ar: 'العنوان' },
  
  // Representatives/Agents
  repName: { en: 'Representative Name', ar: 'اسم المندوب' },
  agentName: { en: 'Agent Name', ar: 'اسم المندوب' },
  territory: { en: 'Territory', ar: 'المنطقة' },
  salesTarget: { en: 'Sales Target', ar: 'هدف المبيعات' },
  monthlyTarget: { en: 'Monthly Target', ar: 'الهدف الشهري' },
  achieved: { en: 'Achieved', ar: 'المحقق' },
  performance: { en: 'Performance', ar: 'الأداء' },
  
  // Load Management
  stockLoad: { en: 'Stock Load', ar: 'تحميل المخزون' },
  loadRequest: { en: 'Load Request', ar: 'طلب التحميل' },
  requestedQty: { en: 'Requested Qty', ar: 'الكمية المطلوبة' },
  approvedQty: { en: 'Approved Qty', ar: 'الكمية المعتمدة' },
  releasedQty: { en: 'Released Qty', ar: 'الكمية المصدرة' },
  
  // Reconciliation
  tafreegh: { en: 'Reconciliation (Tafreegh)', ar: 'التفريغ' },
  totalLoaded: { en: 'Total Loaded', ar: 'إجمالي المحمل' },
  totalSold: { en: 'Total Sold', ar: 'إجمالي المباع' },
  totalReturned: { en: 'Total Returned', ar: 'إجمالي المرتجع' },
  cashCollected: { en: 'Cash Collected', ar: 'النقد المحصل' },
  expectedCash: { en: 'Expected Cash', ar: 'النقد المتوقع' },
  variance: { en: 'Variance', ar: 'الفرق' },
  
  // Invoices
  invoiceNumber: { en: 'Invoice Number', ar: 'رقم الفاتورة' },
  invoiceDate: { en: 'Invoice Date', ar: 'تاريخ الفاتورة' },
  paymentStatus: { en: 'Payment Status', ar: 'حالة الدفع' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  cash: { en: 'Cash', ar: 'نقداً' },
  credit: { en: 'Credit', ar: 'ائتمان' },
  bankTransfer: { en: 'Bank Transfer', ar: 'تحويل بنكي' },
  cheque: { en: 'Cheque', ar: 'شيك' },
  
  // Time
  today: { en: 'Today', ar: 'اليوم' },
  yesterday: { en: 'Yesterday', ar: 'أمس' },
  thisWeek: { en: 'This Week', ar: 'هذا الأسبوع' },
  lastWeek: { en: 'Last Week', ar: 'الأسبوع الماضي' },
  lastMonth: { en: 'Last Month', ar: 'الشهر الماضي' },
  thisYear: { en: 'This Year', ar: 'هذه السنة' },
  date: { en: 'Date', ar: 'التاريخ' },
  
  // Units
  units: { en: 'Units', ar: 'وحدات' },
  items: { en: 'Items', ar: 'عناصر' },
  
  // Auth
  welcomeBack: { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  signInToContinue: { en: 'Sign in to continue to Mano ERP', ar: 'سجل الدخول للمتابعة' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  rememberMe: { en: 'Remember me', ar: 'تذكرني' },
  forgotPassword: { en: 'Forgot password?', ar: 'نسيت كلمة المرور؟' },
  noAccount: { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  signUp: { en: 'Sign up', ar: 'إنشاء حساب' },
  createAccount: { en: 'Create Account', ar: 'إنشاء حساب' },
  
  // Messages
  noData: { en: 'No data available', ar: 'لا توجد بيانات' },
  loading: { en: 'Loading...', ar: 'جار التحميل...' },
  error: { en: 'An error occurred', ar: 'حدث خطأ' },
  success: { en: 'Success', ar: 'تم بنجاح' },
  
  // Export
  exportExcel: { en: 'Export to Excel', ar: 'تصدير إلى Excel' },
  exportPdf: { en: 'Export to PDF', ar: 'تصدير إلى PDF' },
  
  // Currency
  sar: { en: 'EGP', ar: 'ج.م' },
  
  // Language
  language: { en: 'Language', ar: 'اللغة' },
  english: { en: 'English', ar: 'الإنجليزية' },
  arabic: { en: 'Arabic', ar: 'العربية' },
  
  // Permissions
  canGiveDiscounts: { en: 'Can Give Discounts', ar: 'يمكنه منح خصومات' },
  canAddClients: { en: 'Can Add Clients', ar: 'يمكنه إضافة عملاء' },
  canProcessReturns: { en: 'Can Process Returns', ar: 'يمكنه معالجة المرتجعات' },
  killSwitch: { en: 'Kill Switch', ar: 'إيقاف الحساب' },
  
  // Roles
  itAdmin: { en: 'IT Admin', ar: 'مدير تقنية المعلومات' },
  salesManager: { en: 'Sales Manager', ar: 'مدير المبيعات' },
  accountant: { en: 'Accountant', ar: 'محاسب' },
  
  // Misc
  notes: { en: 'Notes', ar: 'ملاحظات' },
  agent: { en: 'Agent', ar: 'المندوب' },
  customer: { en: 'Customer', ar: 'العميل' },
  product: { en: 'Product', ar: 'المنتج' },
  salesManagement: { en: 'Sales Management', ar: 'إدارة المبيعات' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('manoErp_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('manoErp_language', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    // SECURITY: Only log missing translations in development
    if (import.meta.env.DEV) {
      console.warn(`Translation missing for key: ${key}`);
    }
    return key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    // Update body class for RTL-specific styling
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language, dir, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
