import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Bell, Search, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <SidebarProvider>
      <div 
        className="flex min-h-screen w-full bg-background"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <AppSidebar />
        
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-lg px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden">
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className={cn(
                  "absolute top-1 h-2 w-2 rounded-full bg-accent animate-pulse-soft",
                  isRTL ? "left-1" : "right-1"
                )} />
              </Button>

              {/* User Avatar */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
