import { supabase, profiles } from '../lib/supabase';
import type { UserPlan, UserRole, UserProfile } from '../lib/supabase';

/**
 * Serviço para gerenciar usuários e permissões
 */
export const userService = {
  /**
   * Listar todos os usuários (apenas para o administrador específico)
   */
  async listAllUsers(searchTerm?: string, filterPlan?: UserPlan) {
    try {
      // Usar a função RPC para listar todos os usuários
      const { data, error } = await supabase.rpc('list_all_users', {
        search_term: searchTerm || null,
        filter_plan: filterPlan || null
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      return { data: null, error };
    }
  },

  /**
   * Atualizar o plano de um usuário (apenas para o administrador específico)
   */
  async updateUserPlan(userId: string, newPlan: UserPlan) {
    try {
      console.log('Tentando atualização direta devido a erros recorrentes...');
      // Neste ponto vamos ignorar todas as funções RPC e fazer uma atualização direta
      // para evitar qualquer referência à coluna data_expiracao_plano
      
      // Verificar se o usuário atual é admin
      const { isAdmin, error: adminError } = await this.isAdmin();
      if (!isAdmin) {
        throw new Error('Apenas administradores podem atualizar planos');
      }
      
      // Fazer atualização direta na tabela
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          plano: newPlan,
          data_modificacao: new Date().toISOString() 
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Erro na atualização direta do plano:', error);
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar plano do usuário:', error);
      return { success: false, error };
    }
  },

  /**
   * Força a atualização do plano do usuário diretamente na tabela de perfis
   * Método alternativo para resolver problemas de sincronização
   */
  async forceUpdateUserPlan(userId: string, newPlan: UserPlan) {
    try {
      console.log('Aplicando atualização direta na tabela sem usar funções RPC...');
      
      // Atualização direta na tabela
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          plano: newPlan,
          data_modificacao: new Date().toISOString() 
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Erro na atualização direta do plano:', error);
        throw error;
      }
      
      console.log('Plano atualizado com sucesso para:', newPlan);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('UserService: Erro ao forçar atualização do plano do usuário:', error);
      return { success: false, error };
    }
  },

  /**
   * Verificar se o usuário atual é o administrador específico
   */
  async isSpecificAdmin() {
    try {
      // Primeiro verificar se há uma sessão válida
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        return { isAdmin: false, error: sessionError || 'Sem sessão válida' };
      }

      // Verificar usando a função RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_specific_admin');
      
      if (rpcError) {
        console.error('Erro na verificação RPC:', rpcError);
        // Se houver erro na RPC, tenta verificar pelo perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (profileError) {
          return { isAdmin: false, error: profileError };
        }

        return { 
          isAdmin: profile?.role === 'admin',
          error: null 
        };
      }

      // Se a RPC retornou true, o usuário é admin
      if (rpcData === true) {
        return { isAdmin: true, error: null };
      }

      return { isAdmin: false, error: null };
    } catch (error: any) {
      console.error('Erro ao verificar admin:', error);
      return { isAdmin: false, error };
    }
  },

  /**
   * Verificar se o usuário atual é administrador (qualquer administrador)
   * @deprecated Use isSpecificAdmin() para verificar se é o administrador autorizado
   */
  async isAdmin() {
    try {
      // Primeiramente, tenta verificar se é o administrador específico
      const { isAdmin, error } = await this.isSpecificAdmin();
      if (!error && isAdmin) {
        return { isAdmin: true, error: null };
      }
      
      // Caso contrário, usa a verificação padrão
      const { data, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError) throw adminError;
      return { isAdmin: !!data, error: null };
    } catch (error: any) {
      console.error('Erro ao verificar se é administrador:', error);
      return { isAdmin: false, error };
    }
  },

  /**
   * Promover um usuário a administrador (apenas para administradores)
   */
  async promoteToAdmin(userId: string) {
    try {
      const { data, error } = await supabase.rpc('promote_to_admin', {
        user_id: userId
      });

      if (error) throw error;
      return { success: !!data, error: null };
    } catch (error: any) {
      console.error('Erro ao promover usuário a administrador:', error);
      return { success: false, error };
    }
  },

  /**
   * Atualizar o papel de um usuário (apenas para o administrador específico)
   */
  async updateUserRole(userId: string, newRole: UserRole) {
    try {
      const { data, error } = await supabase.rpc('update_user_role_v2', {
        user_id: userId,
        new_role: newRole
      });

      if (error) throw error;
      return { success: !!data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar papel do usuário:', error);
      return { success: false, error };
    }
  },

  /**
   * Obter detalhes de um usuário específico
   */
  async getUserDetails(userId: string) {
    try {
      // Primeiro verifica se o usuário é o administrador específico
      const { isAdmin } = await this.isSpecificAdmin();
      
      if (!isAdmin) {
        return { 
          data: null, 
          error: { message: 'Permissão negada: Apenas o administrador autorizado pode acessar detalhes de outros usuários' } 
        };
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao obter detalhes do usuário:', error);
      return { data: null, error };
    }
  },

  /**
   * Banir/desbanir um usuário (apenas para o administrador específico)
   */
  async toggleUserBan(userId: string, isBanned: boolean) {
    try {
      // Usar a função RPC para banir/desbanir o usuário
      const { data, error } = await supabase.rpc('toggle_user_ban', {
        user_id: userId,
        is_banned: isBanned
      });

      if (error) throw error;
      return { success: !!data, error: null };
    } catch (error: any) {
      console.error('Erro ao alterar status de banimento do usuário:', error);
      return { success: false, error };
    }
  },

  /**
   * Remove uma comunidade específica
   */
  async removeCommunity(communityId: string) {
    try {
      const { data, error } = await supabase.rpc('remove_community', {
        p_community_id: communityId
      });

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao remover comunidade:', error);
      return { success: false, error };
    }
  }
}; 