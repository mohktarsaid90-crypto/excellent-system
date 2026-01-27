import { ReactNode } from 'react';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AgentMobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export const AgentMobileLayout = ({ children, title, showBack = false }: AgentMobileLayoutProps) => {
  const { agent, signOut } = useAgentAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent-login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary-foreground hover:bg-primary/80"
                onClick={() => navigate('/agent')}
              >
                <span className="text-xl">→</span>
              </Button>
            )}
            <div>
              <h1 className="text-lg font-bold">
                {title || 'Mano ERP'}
              </h1>
              {agent && !title && (
                <p className="text-xs opacity-80">مرحباً، {agent.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-3 py-1.5">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{agent?.name?.split(' ')[0]}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary/80"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1.5 shadow-lg border">
          <div className={`h-2 w-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {navigator.onLine ? 'متصل' : 'غير متصل'}
          </span>
        </div>
      </div>
    </div>
  );
};
