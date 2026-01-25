import { useLanguage } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Building2, Globe, Bell, Shield, Palette, Database, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {t('settings')}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Manage your application settings and preferences'
              : 'إدارة إعدادات التطبيق والتفضيلات'
            }
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Company Information */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'en' ? 'Company Information' : 'معلومات الشركة'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Basic company details and branding' : 'تفاصيل الشركة الأساسية والعلامة التجارية'}
                </p>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {language === 'en' ? 'Company Name' : 'اسم الشركة'}
                </label>
                <Input placeholder={language === 'en' ? 'Enter company name' : 'أدخل اسم الشركة'} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('email')}
                </label>
                <Input placeholder="company@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('phone')}
                </label>
                <Input placeholder="+966 XX XXX XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {language === 'en' ? 'Tax Number' : 'الرقم الضريبي'}
                </label>
                <Input placeholder={language === 'en' ? 'Enter tax number' : 'أدخل الرقم الضريبي'} />
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Globe className="h-5 w-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {t('language')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Select your preferred language' : 'اختر لغتك المفضلة'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className="flex-1"
              >
                English
              </Button>
              <Button
                variant={language === 'ar' ? 'default' : 'outline'}
                onClick={() => setLanguage('ar')}
                className="flex-1"
              >
                العربية
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'en' ? 'Notifications' : 'الإشعارات'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Manage notification preferences' : 'إدارة تفضيلات الإشعارات'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'New Order Notifications' : 'إشعارات الطلبات الجديدة'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Get notified when a new order is placed' : 'احصل على إشعار عند وضع طلب جديد'}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'Low Stock Alerts' : 'تنبيهات المخزون المنخفض'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Get notified when stock is running low' : 'احصل على إشعار عند انخفاض المخزون'}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'Rep Activity Updates' : 'تحديثات نشاط المندوبين'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Daily summary of rep activities' : 'ملخص يومي لأنشطة المندوبين'}
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {language === 'en' ? 'Security' : 'الأمان'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Manage security settings' : 'إدارة إعدادات الأمان'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                {language === 'en' ? 'Change Password' : 'تغيير كلمة المرور'}
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'en' ? 'Two-Factor Authentication' : 'المصادقة الثنائية'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Add an extra layer of security' : 'أضف طبقة أمان إضافية'}
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            {t('save')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
