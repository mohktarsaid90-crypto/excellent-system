import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentAuth } from '@/contexts/AgentAuthContext';
import { Loader2 } from 'lucide-react';

interface AgentProtectedRouteProps {
  children: ReactNode;
}

export const AgentProtectedRoute = ({ children }: AgentProtectedRouteProps) => {
  const { agent, isLoading } = useAgentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !agent) {
      navigate('/agent-login');
    }
  }, [agent, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return <>{children}</>;
};
