import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, auth, UserProfile, createUserProfile, profiles, UserPlan, UserRole, UserStatus } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { planService } from '../services/planService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: any }>;
  signUp: (email: string, password: string, nome: string, whatsapp?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual ao carregar
    const checkSession = async () => {
      try {
        console.log('AuthContext: Verificando sessão inicial...');
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error('AuthContext: Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`AuthContext: Evento de autenticação: ${event}`);
        
        if (event === 'SIGNED_IN') {
          console.log('AuthContext: Usuário autenticado (evento):', newSession?.user?.email);
          setSession(newSession);
          setUser(newSession?.user || null);
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: Usuário desconectado');
          setSession(null);
          setUser(null);
        }
      }
    );

    checkSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Obter perfil do usuário
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          console.log('AuthContext: Buscando perfil do usuário', { userId: user.id });
          
          // Log mais detalhado da consulta que será executada
          console.log('AuthContext: Consulta SQL que será executada:', 
            `SELECT * FROM profiles WHERE id = '${user.id}'`);
          
          // Primeiro tentar usando o método seguro que contorna RLS
          let profileData = null;
          let error = null;
          
          // Tentar o método seguro primeiro
          const { data: secureData, error: secureError } = await supabase.rpc('get_own_profile');
          
          if (secureError) {
            console.warn('AuthContext: Falha ao obter perfil via RPC segura:', secureError);
            console.log('AuthContext: Tentando método padrão como fallback...');
            
            // Se falhar, tentar o método padrão
            const { data: standardData, error: standardError } = await supabase
              .from('profiles')
              .select('id, nome, email, avatar_url, cover_url, data_criacao, data_modificacao, status, plano, ultimo_login, verificado, role, tentativas_login, banido, notificacoes_ativas, whatsapp')
              .eq('id', user.id)
              .single();
              
            profileData = standardData;
            error = standardError;
          } else {
            // A função RPC retorna um conjunto de registros, então pegamos o primeiro
            if (Array.isArray(secureData) && secureData.length > 0) {
              profileData = secureData[0];
            }
          }
          
          if (error) {
            console.error('AuthContext: Erro ao buscar perfil:', error);
            
            // Se ambos os métodos falharem, tentar uma terceira opção - chamar a função RPC específica para plano
            try {
              const { plan, error: planError } = await profiles.getCurrentUserPlan();
              
              if (!planError && plan) {
                console.log('AuthContext: Conseguiu obter plano via RPC específica:', plan);
                
                // Criar um perfil mínimo apenas com o plano obtido para evitar erro na UI
                profileData = {
                  id: user.id,
                  plano: plan as UserPlan,
                  role: 'user' as UserRole,
                  nome: user.user_metadata?.nome || 'Usuário',
                  email: user.email || '',
                  data_criacao: new Date().toISOString(),
                  data_modificacao: new Date().toISOString(),
                  status: 'online' as UserStatus,
                  verificado: true,
                  tentativas_login: 0,
                  banido: false,
                  notificacoes_ativas: true
                };
              }
            } catch (fallbackError) {
              console.error('AuthContext: Todas as tentativas de obter perfil falharam:', fallbackError);
              return;
            }
          }
          
          if (profileData) {
            console.log('AuthContext: Perfil do usuário carregado:', {
              id: profileData.id,
              plano: profileData.plano,
              role: profileData.role,
              dataRecebida: JSON.stringify(profileData)
            });
            setProfile(profileData);
          } else {
            console.warn('AuthContext: Perfil do usuário não encontrado');
          }
        } catch (error) {
          console.error('AuthContext: Exceção ao buscar perfil:', error);
        }
      } else {
        // Limpar o perfil quando não houver usuário
        setProfile(null);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Função para pegar o perfil completo e sincronizar na sessão
  const refreshProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setProfile(null);
        setSession(null);
        setLoading(false);
        console.log('AuthContext: Sem sessão ativa para atualizar');
        return;
      }
      
      console.log('AuthContext: Atualizando perfil para o usuário', session.user.id);
      
      // Buscar dados do perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, avatar_url, cover_url, data_criacao, data_modificacao, status, plano, ultimo_login, verificado, role, tentativas_login, banido, notificacoes_ativas, whatsapp')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        console.error('AuthContext: Erro ao pegar o perfil', error);
        toast.error('Erro ao atualizar seu perfil');
        setLoading(false);
        return;
      }
      
      if (data) {
        setProfile(data);
        
        // Verificar se o plano no perfil é o mesmo nos metadados do usuário
        const authPlano = session.user.user_metadata?.plano;
        const profilePlano = data.plano;
        
        console.log('AuthContext: Comparando planos', { authPlano, profilePlano });
        
        // Se os planos forem diferentes, sincronizar
        if (authPlano !== profilePlano) {
          console.log('AuthContext: Planos diferentes, sincronizando');
          
          try {
            // Sincronizar o plano nos metadados do usuário
            await planService.syncUserPlan(session.user.id);
            
            // Atualizar o session.user com o novo plano
            await supabase.auth.updateUser({
              data: { 
                plano: profilePlano,
                plano_updated_at: new Date().toISOString()
              }
            });
            
            console.log('AuthContext: Plano sincronizado com sucesso');
          } catch (syncError) {
            console.error('AuthContext: Erro ao sincronizar plano', syncError);
          }
        }
      } else {
        console.warn('AuthContext: Perfil não encontrado para o usuário', session.user.id);
        setProfile(null);
      }
      
      setSession(session);
    } catch (error: any) {
      console.error('AuthContext: Erro ao atualizar perfil', error);
      toast.error('Erro ao atualizar seu perfil');
    } finally {
      setLoading(false);
    }
  };

  // Função de login simplificada
  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando processo de login');
      
      // Limpar qualquer sessão existente antes de tentar login
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthContext: Erro no login:', error);
        return { success: false, error: error.message };
      }

      if (!data || !data.session) {
        console.error('AuthContext: Login sem sessão retornada');
        return { success: false, error: 'Falha ao criar sessão. Tente novamente.' };
      }

      setSession(data.session);
      setUser(data.session.user);
      
      console.log('AuthContext: Login bem-sucedido:', { email: data.session.user.email });
      
      // Redirecionar para o dashboard após login bem-sucedido
      window.location.href = '/dashboard';
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('AuthContext: Exceção durante login:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, nome: string, whatsapp?: string) => {
    try {
      console.log('AuthContext: Iniciando processo de cadastro', { email, nome, whatsapp });
      
      // Verificar se o email já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (checkError) {
        console.error('AuthContext: Erro ao verificar email existente:', checkError);
      }
      
      if (existingUser) {
        console.error('AuthContext: Email já cadastrado:', email);
        return { error: 'Este email já está cadastrado' };
      }
      
      // Tentar criar o usuário
      console.log('AuthContext: Criando usuário no Supabase Auth');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            whatsapp,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        console.error('AuthContext: Erro no cadastro:', error);
        
        // Mensagens de erro mais amigáveis
        if (error.message?.includes('already registered')) {
          return { error: 'Este email já está cadastrado' };
        } else if (error.message?.includes('password')) {
          return { error: 'A senha deve ter pelo menos 6 caracteres' };
        } else if (error.message?.includes('email')) {
          return { error: 'Email inválido' };
        }
        
        return { error: error.message || 'Erro ao criar conta' };
      }

      if (!data.user) {
        console.error('AuthContext: Cadastro sem usuário retornado');
        return { error: 'Falha ao criar usuário' };
      }
      
      console.log('AuthContext: Usuário criado com sucesso, ID:', data.user.id);

      // Criar perfil do usuário usando a função dedicada
      try {
        const profileResult = await createUserProfile(data.user.id, email, nome, whatsapp);
        if (profileResult.warning) {
          console.warn('AuthContext: Aviso ao criar perfil:', profileResult.warning);
        }
      } catch (profileError: any) {
        console.error('AuthContext: Erro ao criar perfil:', profileError);
        // Não retornar erro aqui, pois o usuário já foi criado
      }

      console.log('AuthContext: Cadastro bem-sucedido');
      return { error: null };
    } catch (error: any) {
      console.error('AuthContext: Exceção durante cadastro:', error);
      return { error: error.message || 'Erro desconhecido durante o cadastro' };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Iniciando processo de logout');
      
      // Atualizar status do usuário para offline
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ status: 'offline' })
            .eq('id', user.id);
        } catch (error) {
          console.error('AuthContext: Erro ao atualizar status do usuário:', error);
        }
      }
      
      await supabase.auth.signOut();
      console.log('AuthContext: Logout bem-sucedido');
    } catch (error) {
      console.error('AuthContext: Erro durante logout:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('AuthContext: Iniciando processo de recuperação de senha');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('AuthContext: Erro na recuperação de senha:', error);
        return { error: error.message };
      }

      console.log('AuthContext: Email de recuperação enviado com sucesso');
      return { error: null };
    } catch (error: any) {
      console.error('AuthContext: Exceção durante recuperação de senha:', error);
      return { error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      // Mostrar um indicador de carregamento temporário
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      loadingToast.textContent = 'Saindo...';
      document.body.appendChild(loadingToast);
      
      // Executar o logout
      await signOut();
      
      // Remover o toast de carregamento
      try {
        document.body.removeChild(loadingToast);
      } catch (e) {
        console.error('Erro ao remover toast:', e);
      }
      
      // Forçar redirecionamento para a página de login
      console.log('Redirecionando para a página de login após logout');
      
      // Limpar qualquer estado local que possa estar causando problemas
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Usar uma abordagem mais direta para o redirecionamento
      setTimeout(() => {
        window.location.replace('/auth');
      }, 100);
    } catch (error) {
      console.error('Exceção ao fazer logout:', error);
      // Garantir que o usuário seja redirecionado mesmo em caso de erro
      window.location.replace('/auth');
    }
  };

  useEffect(() => {
    // Ao iniciar, tentar sincronizar planos se houver sessão
    const syncPlansOnStart = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        try {
          console.log('AuthContext: Verificando sincronização de plano na inicialização');
          planService.syncUserPlan(session.user.id)
            .then(() => console.log('AuthContext: Plano sincronizado na inicialização'))
            .catch(err => console.warn('AuthContext: Erro ao sincronizar plano na inicialização', err));
        } catch (err) {
          console.warn('AuthContext: Erro ao verificar sincronização de plano', err);
        }
      }
    };
    
    syncPlansOnStart();
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 