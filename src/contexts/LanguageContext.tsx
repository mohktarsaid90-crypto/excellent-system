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
  // App
  appName: { en: 'SalesPro', ar: 'سيلز برو' },
  
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
  
  // Status
  active: { en: 'Active', ar: 'نشط' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
  
  // Products
  productName: { en: 'Product Name', ar: 'اسم المنتج' },
  price: { en: 'Price', ar: 'السعر' },
  quantity: { en: 'Quantity', ar: 'الكمية' },
  category: { en: 'Category', ar: 'الفئة' },
  sku: { en: 'SKU', ar: 'رمز المنتج' },
  discount: { en: 'Discount', ar: 'الخصم' },
  
  // Customers
  customerName: { en: 'Customer Name', ar: 'اسم العميل' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  address: { en: 'Address', ar: 'العنوان' },
  
  // Representatives
  repName: { en: 'Representative Name', ar: 'اسم المندوب' },
  territory: { en: 'Territory', ar: 'المنطقة' },
  salesTarget: { en: 'Sales Target', ar: 'هدف المبيعات' },
  achieved: { en: 'Achieved', ar: 'المحقق' },
  performance: { en: 'Performance', ar: 'الأداء' },
  
  // Time
  today: { en: 'Today', ar: 'اليوم' },
  yesterday: { en: 'Yesterday', ar: 'أمس' },
  thisWeek: { en: 'This Week', ar: 'هذا الأسبوع' },
  lastWeek: { en: 'Last Week', ar: 'الأسبوع الماضي' },
  lastMonth: { en: 'Last Month', ar: 'الشهر الماضي' },
  thisYear: { en: 'This Year', ar: 'هذه السنة' },
  
  // Units
  units: { en: 'Units', ar: 'وحدات' },
  items: { en: 'Items', ar: 'عناصر' },
  
  // Auth
  welcomeBack: { en: 'Welcome back', ar: 'مرحباً بعودتك' },
  signInToContinue: { en: 'Sign in to continue to SalesPro', ar: 'سجل الدخول للمتابعة' },
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
  
  // Currency
  sar: { en: 'SAR', ar: 'ر.س' },
  
  // Language
  language: { en: 'Language', ar: 'اللغة' },
  english: { en: 'English', ar: 'الإنجليزية' },
  arabic: { en: 'Arabic', ar: 'العربية' },
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
    const saved = localStorage.getItem('salesPro_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('salesPro_language', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    console.warn(`Translation missing for key: ${key}`);
    return key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language, dir]);

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
