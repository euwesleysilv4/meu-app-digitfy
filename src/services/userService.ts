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
      // Usar a função RPC para atualizar o plano do usuário
      const { data, error } = await supabase.rpc('update_user_plan_v2', {
        user_id: userId,
        new_plan: newPlan
      });

      if (error) throw error;
      return { success: !!data, error: null };
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
      console.log('UserService: Iniciando atualização forçada de plano', { userId, newPlan });
      
      // Usar o método direto do profiles para atualizar o plano
      const { success, error } = await profiles.forceUpdateUserPlan(userId, newPlan);
      
      if (error) throw error;
      return { success, error: null };
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
      const { data, error } = await supabase.rpc('is_specific_admin');
      
      if (error) throw error;
      return { isAdmin: !!data, error: null };
    } catch (error: any) {
      console.error('Erro ao verificar se é o administrador específico:', error);
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
  }
}; 