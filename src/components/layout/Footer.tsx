import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { isRTL } = useLanguage();

  return (
    <footer className={cn(
      "border-t border-border bg-background py-4 px-6 text-center text-sm text-muted-foreground",
      isRTL && "text-right"
    )}>
      © 2026 Mano ERP - All Rights Reserved
    </footer>
  );
};
