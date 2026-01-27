import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  monthly_target: number;
  cartons_target: number;
  tons_target: number;
  current_sales: number;
  can_give_discounts: boolean;
  can_add_clients: boolean;
  can_process_returns: boolean;
  is_active: boolean;
  credit_balance: number;
}

interface AgentAuthContextType {
  user: User | null;
  session: Session | null;
  agent: Agent | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined);

export const AgentAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgentData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching agent data:', error);
        }
        return null;
      }
      
      return data as Agent | null;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching agent data:', error);
      }
      return null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const agentData = await fetchAgentData(session.user.id);
            setAgent(agentData);
            setIsLoading(false);
          }, 0);
        } else {
          setAgent(null);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchAgentData(session.user.id).then((agentData) => {
          setAgent(agentData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'فشل تسجيل الدخول',
          description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          variant: 'destructive',
        });
        return { error };
      }

      if (data.user) {
        const agentData = await fetchAgentData(data.user.id);
        if (!agentData) {
          await supabase.auth.signOut();
          const noAgentError = new Error('This account is not linked to an active agent');
          toast({
            title: 'الوصول مرفوض',
            description: 'هذا الحساب غير مرتبط بمندوب نشط',
            variant: 'destructive',
          });
          return { error: noAgentError };
        }
        setAgent(agentData);

        // Update last_seen_at
        await supabase
          .from('agents')
          .update({ 
            last_seen_at: new Date().toISOString(),
            is_online: true 
          })
          .eq('id', agentData.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (agent) {
      await supabase
        .from('agents')
        .update({ is_online: false })
        .eq('id', agent.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAgent(null);
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!agent) return;
    
    try {
      // Update agent's last location
      await supabase
        .from('agents')
        .update({ 
          last_location_lat: lat,
          last_location_lng: lng,
          last_seen_at: new Date().toISOString()
        })
        .eq('id', agent.id);

      // Log location history
      await supabase
        .from('agent_locations')
        .insert({
          agent_id: agent.id,
          latitude: lat,
          longitude: lng
        });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating location:', error);
      }
    }
  };

  return (
    <AgentAuthContext.Provider
      value={{
        user,
        session,
        agent,
        isLoading,
        signIn,
        signOut,
        updateLocation,
      }}
    >
      {children}
    </AgentAuthContext.Provider>
  );
};

export const useAgentAuth = () => {
  const context = useContext(AgentAuthContext);
  if (!context) {
    throw new Error('useAgentAuth must be used within an AgentAuthProvider');
  }
  return context;
};
