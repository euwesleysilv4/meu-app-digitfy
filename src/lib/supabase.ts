import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
// Obter as variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas corretamente');
  console.error('URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
  console.error('KEY:', supabaseKey ? 'Configurada' : 'Não configurada');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      // Usar cookies em vez de localStorage
      getItem: (key) => {
        // Acessa os cookies diretamente, pois HTTP-only cookies não são acessíveis via JavaScript
        return document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1] || null;
      },
      setItem: (key, value) => {
        // Define um cookie com atributos de segurança
        document.cookie = `${key}=${value}; path=/; max-age=2592000; SameSite=Strict; Secure`;
      },
      removeItem: (key) => {
        // Remove o cookie definindo uma data de expiração no passado
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
      }
    }
  }
});

// Função para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

// Tipos para os usuários
export type UserRole = 'user' | 'admin' | 'moderator';
export type UserPlan = 'gratuito' | 'member' | 'pro' | 'elite';
export type UserStatus = 'online' | 'offline' | 'away' | 'banned';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  cover_url?: string;
  data_criacao: string;
  data_modificacao: string;
  status: UserStatus;
  plano: UserPlan;
  ultimo_login: string;
  verificado: boolean;
  role: UserRole;
  tentativas_login: number;
  banido: boolean;
  notificacoes_ativas: boolean;
  whatsapp?: string;
}

// Interface para perfis públicos (contém apenas dados seguros para exibição pública)
export interface PublicUserProfile {
  id: string;
  nome: string;
  avatar_url?: string;
  data_criacao: string;
  plano: UserPlan;
  role: UserRole;
}

// Funções de autenticação
export const auth = {
  // Registrar um novo usuário
  signUp: async (email: string, password: string, nome: string, whatsapp?: string) => {
    try {
      console.log('Supabase: Iniciando cadastro de usuário', { email, nome });
      
      // 1. Criar o usuário na autenticação do Supabase com confirmação de email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            whatsapp
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (authError) {
        console.error('Supabase: Erro ao criar usuário:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('Supabase: Usuário não retornado após cadastro');
        throw new Error('Falha ao criar usuário');
      }

      console.log('Supabase: Usuário cadastrado com sucesso, ID:', authData.user.id);
      
      // 2. Criar o perfil do usuário
      try {
        await createUserProfile(authData.user.id, email, nome, whatsapp);
      } catch (profileError) {
        console.error('Supabase: Erro ao criar perfil do usuário:', profileError);
        // Não falhar o cadastro se o perfil não for criado
      }
      
      console.log('Supabase: Cadastro completo, aguardando confirmação de email');
      
      // Não retornar a sessão para evitar login automático
      return { 
        data: {
          ...authData,
          session: null // Forçar null para evitar login automático
        }, 
        error: null 
      };
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      return { data: null, error };
    }
  },

  // Login com email e senha
  signIn: async (email: string, password: string) => {
    try {
      console.log('Supabase: Iniciando login com email e senha');
      
      // Verificar se o email existe antes de tentar fazer login
      const { data: userExists, error: userExistsError } = await supabase
        .from('profiles')
        .select('email, verificado')
        .eq('email', email)
        .maybeSingle();
        
      if (userExistsError) {
        console.error('Supabase: Erro ao verificar se o usuário existe:', userExistsError);
      }
      
      if (!userExists) {
        console.warn('Supabase: Email não encontrado na base de dados');
        return { 
          data: null, 
          error: { message: 'Invalid login credentials', status: 400 } 
        };
      }
      
      // Fazer login
      console.log('Supabase: Tentando autenticar com o Supabase');
      
      // Limpar qualquer sessão existente antes de fazer login
      try {
        await supabase.auth.signOut({ scope: 'local' });
        console.log('Supabase: Sessão local limpa antes do login');
      } catch (signOutError) {
        console.error('Supabase: Erro ao limpar sessão local:', signOutError);
        // Continuar mesmo se falhar a limpeza da sessão
      }
      
      // Fazer login com email e senha
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase: Erro de autenticação:', error);
        return { data: null, error };
      }

      console.log('Supabase: Login bem-sucedido, atualizando perfil');
      
      // Atualizar último login e status
      if (data.user) {
        try {
          const updateData: any = {
            ultimo_login: new Date().toISOString(),
            status: 'online',
            tentativas_login: 0, // Resetar tentativas de login
          };
          
          // Se o usuário não estiver verificado, marcar como verificado
          // (isso é necessário porque o Supabase só permite login após confirmação de email)
          if (userExists && !userExists.verificado) {
            updateData.verificado = true;
          }
          
          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', data.user.id);
            
          console.log('Supabase: Perfil atualizado com sucesso');
        } catch (updateError) {
          console.error('Supabase: Erro ao atualizar perfil:', updateError);
          // Continuar mesmo se falhar a atualização do perfil
        }
      }

      // Verificar se a sessão foi criada corretamente
      if (!data.session) {
        console.error('Supabase: Login bem-sucedido, mas sem sessão criada');
        return { 
          data: null, 
          error: { message: 'Login successful but no session created', status: 500 } 
        };
      }
      
      console.log('Supabase: Login completo com sessão válida');
      return { data, error: null };
    } catch (error: any) {
      console.error('Supabase: Exceção no login:', error);
      
      // Incrementar tentativas de login falhas
      try {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, tentativas_login')
          .eq('email', email)
          .single();

        if (userProfile) {
          await supabase
            .from('profiles')
            .update({
              tentativas_login: (userProfile.tentativas_login || 0) + 1,
            })
            .eq('id', userProfile.id);
        }
      } catch (profileError) {
        console.error('Supabase: Erro ao atualizar tentativas de login:', profileError);
      }

      return { data: null, error };
    }
  },

  // Logout
  signOut: async () => {
    try {
      console.log('Supabase: Iniciando logout');
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Atualizar status para offline
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({
              status: 'offline',
            })
            .eq('id', user.id);
          console.log('Supabase: Status do usuário atualizado para offline');
        } catch (profileError) {
          console.error('Supabase: Erro ao atualizar status do perfil:', profileError);
          // Continuar com o logout mesmo se falhar a atualização do perfil
        }
      }

      // Fazer logout global (de todas as sessões)
      console.log('Supabase: Executando logout global');
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) {
        console.error('Supabase: Erro no logout:', error);
        throw error;
      }
      
      console.log('Supabase: Logout bem-sucedido');

      // Cookies e sessão são gerenciados pelo Supabase, não precisamos limpar manualmente
      // Os cookies serão limpos pelo mecanismo de storage que configuramos

      return { error: null };
    } catch (error) {
      console.error('Supabase: Erro ao fazer logout:', error);
      return { error };
    }
  },

  // Recuperar senha
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      return { error };
    }
  },

  // Atualizar senha
  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { error };
    }
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        // Buscar dados do perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, nome, email, avatar_url, cover_url, data_criacao, data_modificacao, status, plano, ultimo_login, verificado, role, tentativas_login, banido, notificacoes_ativas, whatsapp')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        return { user: { ...user, profile }, error: null };
      }
      
      return { user: null, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return { user: null, error };
    }
  },
};

// Funções para gerenciamento de perfil
export const profiles = {
  // Obter perfil do usuário
  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, avatar_url, cover_url, data_criacao, data_modificacao, status, plano, ultimo_login, verificado, role, notificacoes_ativas, whatsapp')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return { data: null, error };
    }
  },
  
  // Método para contornar RLS e obter o próprio perfil
  getOwnProfileSecure: async () => {
    try {
      console.log('Supabase: Obtendo perfil próprio usando função RPC segura');
      const { data, error } = await supabase.rpc('get_own_profile');
      
      if (error) {
        console.error('Supabase: Erro ao obter perfil próprio via RPC:', error);
        throw error;
      }
      
      // A função RPC retorna um conjunto de registros, então pegamos o primeiro
      if (Array.isArray(data) && data.length > 0) {
        console.log('Supabase: Perfil obtido com sucesso via RPC:', {
          id: data[0].id,
          plano: data[0].plano,
          role: data[0].role
        });
        return { data: data[0], error: null };
      } else {
        console.warn('Supabase: Perfil não encontrado via RPC');
        return { data: null, error: null };
      }
    } catch (error) {
      console.error('Supabase: Exceção ao obter perfil próprio via RPC:', error);
      return { data: null, error };
    }
  },
  
  // Método para obter apenas o plano atual do usuário
  getCurrentUserPlan: async () => {
    try {
      console.log('Supabase: Obtendo plano do usuário via RPC');
      const { data, error } = await supabase.rpc('get_current_user_plan');
      
      if (error) {
        console.error('Supabase: Erro ao obter plano do usuário via RPC:', error);
        throw error;
      }
      
      console.log('Supabase: Plano obtido com sucesso:', data);
      return { plan: data as UserPlan, error: null };
    } catch (error) {
      console.error('Supabase: Exceção ao obter plano do usuário:', error);
      return { plan: null, error };
    }
  },
  
  // Método para sincronizar o plano do usuário
  syncUserPlan: async () => {
    try {
      console.log('Supabase: Sincronizando plano do usuário via RPC');
      const { data, error } = await supabase.rpc('sync_user_plan');
      
      if (error) {
        console.error('Supabase: Erro ao sincronizar plano do usuário:', error);
        throw error;
      }
      
      console.log('Supabase: Plano sincronizado com sucesso:', data);
      return { plan: data as UserPlan, error: null };
    } catch (error) {
      console.error('Supabase: Exceção ao sincronizar plano do usuário:', error);
      return { plan: null, error };
    }
  },

  // Atualizar perfil do usuário
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          data_modificacao: new Date().toISOString(),
        })
        .eq('id', userId)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  },
  
  // Atualizar o próprio perfil contornando RLS
  updateOwnProfileSecure: async (updates: Partial<UserProfile>) => {
    try {
      console.log('Supabase: Atualizando próprio perfil via RPC segura');
      
      // Converter as atualizações para JSONB (formato esperado pela função RPC)
      const updateData = {
        nome: updates.nome,
        avatar_url: updates.avatar_url,
        whatsapp: updates.whatsapp,
        notificacoes_ativas: updates.notificacoes_ativas
      };
      
      const { data, error } = await supabase.rpc('update_own_profile', {
        profile_updates: updateData
      });
      
      if (error) {
        console.error('Supabase: Erro ao atualizar próprio perfil via RPC:', error);
        throw error;
      }
      
      console.log('Supabase: Perfil atualizado com sucesso via RPC');
      return { data, error: null };
    } catch (error) {
      console.error('Supabase: Exceção ao atualizar próprio perfil via RPC:', error);
      return { data: null, error };
    }
  },
  
  // Função para forçar a atualização do plano do usuário
  // Útil para solucionar problemas de sincronização
  forceUpdateUserPlan: async (userId: string, newPlan: UserPlan) => {
    try {
      console.log('Supabase: Forçando atualização do plano do usuário', {userId, newPlan});
      
      // Usar a nova função RPC simplificada para atualizar o plano
      const { data, error } = await supabase.rpc('force_update_user_plan', {
        user_id: userId,
        new_plan: newPlan
      });
      
      if (error) throw error;
      
      console.log('Supabase: Plano atualizado com sucesso via RPC');
      return { data, success: true, error: null };
    } catch (error) {
      console.error('Supabase: Erro ao forçar atualização do plano:', error);
      return { data: null, success: false, error };
    }
  }
};

// Função para criar o perfil do usuário
export const createUserProfile = async (userId: string, email: string, nome: string, whatsapp?: string) => {
  console.log('Supabase: Criando perfil para usuário', { userId, email, nome });
  
  try {
    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (existingProfile) {
      console.log('Supabase: Perfil já existe para o usuário', userId);
      return { success: true };
    }
    
    // Criar o perfil
    const profileData = {
      id: userId,
      nome,
      email,
      whatsapp,
      data_criacao: new Date().toISOString(),
      data_modificacao: new Date().toISOString(),
      status: 'offline',
      plano: 'gratuito',
      verificado: false,
      role: 'user',
      tentativas_login: 0,
      banido: false,
      notificacoes_ativas: true,
    };
    
    console.log('Supabase: Inserindo perfil na tabela profiles', profileData);
    
    // Usar o cliente Supabase diretamente para inserir o perfil
    // Isso contorna as políticas de RLS
    const { error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();
      
    if (error) {
      console.error('Supabase: Erro ao inserir perfil:', error);
      
      // Se o erro for relacionado a RLS, podemos tentar uma abordagem alternativa
      if (error.code === '42501') { // Código de erro de violação de política RLS
        console.log('Supabase: Erro de RLS, tentando abordagem alternativa');
        
        // Aqui você pode implementar uma função serverless no Supabase Edge Functions
        // que usa o service_role key para inserir o perfil
        // Por enquanto, vamos apenas registrar o erro e continuar
        console.log('Supabase: Recomendação - Crie uma Edge Function para inserir perfis com service_role key');
        
        // Não vamos falhar o cadastro por causa disso
        return { success: true, warning: 'Perfil não foi criado devido a restrições de RLS' };
      }
      
      throw error;
    }
    
    console.log('Supabase: Perfil criado com sucesso para', userId);
    return { success: true };
  } catch (error) {
    console.error('Supabase: Exceção ao criar perfil:', error);
    // Não vamos falhar o cadastro por causa disso
    return { success: true, warning: 'Perfil não foi criado devido a um erro' };
  }
};

// Função para criar perfil automaticamente após registro
// Esta função é chamada pelo trigger SQL no Supabase
// CREATE OR REPLACE FUNCTION public.handle_new_user()
// RETURNS TRIGGER AS $$
// BEGIN
//   INSERT INTO public.profiles (id, nome, email, verificado)
//   VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email, FALSE);
//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql SECURITY DEFINER; 