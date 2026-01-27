import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Footer } from './Footer';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <SidebarProvider>
      {/* 
        ============================================
        RTL-SAFE APP SHELL - LOCKED FOR STABILITY
        - dir attribute controls text direction
        - Sidebar fixed positioning handled by CSS
        - Main content uses margin offset via .app-main-content class
        ============================================
      */}
      <div 
        className="min-h-screen w-full bg-background"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Sidebar - Fixed position, side determined by RTL */}
        <AppSidebar />
        
        {/* 
          Main content wrapper with app-main-content class
          CSS handles margin-left (LTR) or margin-right (RTL) automatically
        */}
        <div className="app-main-content flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-lg px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              
              {/* Search Bar */}
              <div className="relative hidden md:flex">
                <Search className={cn(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )} />
                <Input
                  placeholder={t('search')}
                  className={cn(
                    "w-64 lg:w-80 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary",
                    isRTL ? "pr-10 text-right" : "pl-10"
                  )}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Language Switcher */}
              <div className="md:hidden">
                <LanguageSwitcher />
              </div>
              
              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Profile */}
              <ProfileDropdown />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};
