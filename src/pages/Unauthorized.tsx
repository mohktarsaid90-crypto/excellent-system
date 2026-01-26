import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'en' ? 'Access Denied' : 'الوصول مرفوض'}
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {language === 'en'
              ? "You don't have permission to access this page. Please contact your administrator."
              : 'ليس لديك صلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول.'
            }
          </p>
        </div>

        <Button onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {language === 'en' ? 'Go to Dashboard' : 'العودة للوحة التحكم'}
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
