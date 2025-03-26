import { supabase } from '../lib/supabase';
import type { UserPlan } from '../lib/supabase';

/**
 * Serviço para gerenciar planos de usuários de forma simplificada
 * Implementação para resolver problemas com a coluna data_expiracao_plano
 */
export const planService = {
  /**
   * Atualiza o plano de um usuário usando diversos métodos para garantir sucesso
   * Esta é uma versão ultra-radical que tenta múltiplos caminhos
   */
  async updatePlan(userId: string, newPlan: UserPlan) {
    try {
      console.log(`PlanService: Iniciando abordagem combinada para atualização do plano para ${newPlan}`);
      
      // Método 1: Diretamente na tabela via SQL sem passar por funções RPC
      try {
        await this.updatePlanDirect(userId, newPlan);
        console.log('PlanService: Atualização direta concluída');
      } catch (error) {
        console.error('PlanService: Falha na atualização direta:', error);
      }
      
      // Método 2: Via RPC mas com alteração de todas as colunas relacionadas
      try {
        await this.updatePlanViaRPC(userId, newPlan);
        console.log('PlanService: Atualização via RPC concluída');
      } catch (error) {
        console.error('PlanService: Falha na atualização via RPC:', error);
      }
      
      // Método 3: Atualização radical com reset de perfil
      try {
        await this.radicalPlanReset(userId, newPlan);
        console.log('PlanService: Reset radical concluído');
      } catch (error) {
        console.error('PlanService: Falha no reset radical:', error);
      }
      
      // Método 4: Tentativa de atualização direta na sessão ativa do usuário
      try {
        await this.updateUserProfileInSession(userId, newPlan);
        console.log('PlanService: Atualização na sessão concluída');
      } catch (error) {
        console.error('PlanService: Falha na atualização da sessão:', error);
      }
      
      // Método 5: Forçar sincronização entre perfil e autenticação
      try {
        await this.syncUserPlan(userId);
        console.log('PlanService: Sincronização explícita concluída');
      } catch (error) {
        console.error('PlanService: Falha na sincronização explícita:', error);
      }
      
      // Verificar se a atualização foi bem-sucedida
      const verificationResult = await this.verifyPlanUpdate(userId, newPlan);
      
      if (verificationResult.success) {
        return { success: true, error: null };
      } else {
        return { 
          success: false, 
          error: new Error('Falha em todas as tentativas de atualização de plano')
        };
      }
    } catch (error: any) {
      console.error('PlanService: Exceção geral na atualização do plano:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Atualização direta na tabela sem usar funções RPC
   */
  async updatePlanDirect(userId: string, newPlan: UserPlan) {
    // Atualizar diretamente via SQL sem funções RPC
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plano: newPlan,
        data_modificacao: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    return { success: true };
  },
  
  /**
   * Atualização via RPC customizada
   */
  async updatePlanViaRPC(userId: string, newPlan: UserPlan) {
    // Tentativa com nossa função RPC personalizada
    const { error } = await supabase.rpc('update_plan_direct_v2', {
      user_id: userId,
      new_plan: newPlan
    });
    
    if (error) throw error;
    
    return { success: true };
  },
  
  /**
   * Reset radical do perfil
   */
  async radicalPlanReset(userId: string, newPlan: UserPlan) {
    // Reset radical com recriação do perfil
    const { error } = await supabase.rpc('reset_and_update_plan_v2', {
      user_id: userId,
      new_plan: newPlan
    });
    
    if (error) throw error;
    
    return { success: true };
  },
  
  /**
   * Atualiza o perfil diretamente na sessão do usuário
   * Isso é necessário quando a atualização no banco acontece mas o usuário não vê a mudança
   */
  async updateUserProfileInSession(userId: string, newPlan: UserPlan) {
    // Método para forçar a atualização na sessão atual (se a sessão for do usuário em questão)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user && session.user.id === userId) {
        // Estamos na sessão do usuário que está sendo atualizado
        // Atualizar os metadados do usuário para forçar sincronização
        await supabase.auth.updateUser({
          data: { 
            plano: newPlan,
            plano_updated_at: new Date().toISOString()
          }
        });
      }
      
      // Tentar atualizar via tabela de metadados de forma direta
      try {
        await supabase.rpc('execute_sql_safe', {
          sql_query: `
            UPDATE auth.users 
            SET raw_user_meta_data = 
              raw_user_meta_data || 
              '{"plano":"${newPlan}", "plano_updated_at":"${new Date().toISOString()}"}'::jsonb 
            WHERE id = '${userId}'
          `
        });
      } catch (err) {
        console.warn('PlanService: Falha ao atualizar metadados via SQL:', err);
      }
      
      return { success: true };
    } catch (error) {
      console.error('PlanService: Erro ao atualizar perfil na sessão:', error);
      throw error;
    }
  },
  
  /**
   * Sincroniza o plano entre a tabela profiles e auth.users
   */
  async syncUserPlan(userId: string) {
    try {
      // Chamar a função de sincronização
      const { data, error } = await supabase.rpc('sync_user_plan_v2', {
        user_id: userId
      });
      
      if (error) {
        console.error('PlanService: Erro ao sincronizar plano:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('PlanService: Erro ao sincronizar plano:', error);
      throw error;
    }
  },
  
  /**
   * Repara os planos de todos os usuários.
   * Sincroniza todos os planos entre a tabela profiles e auth.users
   */
  async repairAllUserPlans() {
    try {
      // Chamar a função de reparo
      const { data, error } = await supabase.rpc('repair_all_user_plans');
      
      if (error) {
        console.error('PlanService: Erro ao reparar todos os planos:', error);
        return { success: false, error, message: null };
      }
      
      console.log('PlanService: Reparo de todos os planos concluído:', data);
      return { success: true, error: null, message: data };
    } catch (error) {
      console.error('PlanService: Exceção ao reparar todos os planos:', error);
      return { success: false, error, message: null };
    }
  },
  
  /**
   * Verifica se a atualização do plano foi bem-sucedida
   */
  async verifyPlanUpdate(userId: string, expectedPlan: UserPlan) {
    try {
      // Verificar na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plano')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('PlanService: Erro ao verificar plano na tabela profiles:', profileError);
        return { success: false, error: profileError };
      }
      
      // Verificar nos metadados do usuário
      const { data: authData, error: authError } = await supabase.rpc('get_user_metadata', {
        p_user_id: userId
      });
      
      if (authError) {
        console.warn('PlanService: Erro ao verificar metadados do usuário:', authError);
        // Continua mesmo com erro aqui, pois o importante é a tabela profiles
      }
      
      const profilePlan = profileData?.plano;
      const authPlan = authData?.plano;
      
      console.log('PlanService: Verificação de plano:', {
        expectedPlan,
        profilePlan,
        authPlan
      });
      
      // Consideramos sucesso se pelo menos a tabela profiles foi atualizada
      return { 
        success: profilePlan === expectedPlan,
        profilePlan,
        authPlan
      };
    } catch (error) {
      console.error('PlanService: Erro ao verificar atualização de plano:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Verifica o plano atual de um usuário
   */
  async getCurrentPlan(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plano')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('PlanService: Erro ao verificar plano atual:', error);
        return { plan: null, error };
      }
      
      return { plan: data?.plano, error: null };
    } catch (error: any) {
      console.error('PlanService: Exceção ao verificar plano atual:', error);
      return { plan: null, error };
    }
  },
  
  /**
   * Registro de transição de plano - pode ser usado para auditar mudanças
   * @param method Método de atualização (admin, user_upgrade, etc)
   */
  async logPlanChange(userId: string, oldPlan: UserPlan, newPlan: UserPlan, method: string = 'api') {
    try {
      // Criar um registro na tabela de logs
      const { data, error } = await supabase
        .from('plan_change_logs')
        .insert({
          user_id: userId,
          old_plan: oldPlan,
          new_plan: newPlan,
          change_date: new Date().toISOString(),
          change_method: method
        });
        
      if (error) {
        // Log de erro, mas não falhar a operação principal
        console.warn('PlanService: Erro ao registrar log de mudança de plano:', error);
        
        // Se o erro for relacionado à tabela que não existe, é provável que ela precise ser criada
        if (error.message?.includes('relation "plan_change_logs" does not exist')) {
          console.warn('PlanService: Tabela de logs não existe. Execute o script SQL para criá-la.');
        }
      }
      
      return { success: !error, error };
    } catch (error: any) {
      console.warn('PlanService: Exceção ao registrar log de mudança de plano:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Obtém o histórico de alterações de plano de um usuário específico
   */
  async getPlanChangeHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('plan_change_logs')
        .select('*')
        .eq('user_id', userId)
        .order('change_date', { ascending: false });
        
      if (error) {
        console.error('PlanService: Erro ao obter histórico de planos:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('PlanService: Exceção ao obter histórico de planos:', error);
      return { data: null, error };
    }
  },
  
  /**
   * Executa SQL personalizado diretamente (apenas para emergências)
   */
  async execute_sql_safe(sql_query: string) {
    try {
      console.log('PlanService: Executando SQL direto (MODO EMERGÊNCIA!)');
      
      const { error } = await supabase.rpc('execute_sql_safe', {
        sql_query
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('PlanService: Erro ao executar SQL direto:', error);
      throw error;
    }
  },
  
  /**
   * Atualização de emergência extrema para casos em que nada mais funcionar
   * Esta função remove todas as referências problemáticas e tenta atualizar diretamente
   * Só deve ser usada como último recurso
   */
  async emergencyUpdatePlan(userId: string, newPlan: UserPlan) {
    try {
      console.log('PlanService: Iniciando atualização de EMERGÊNCIA EXTREMA');
      
      // Chamar a função de emergência especial
      const { data, error } = await supabase.rpc('emergency_update_plan', {
        user_id: userId,
        new_plan: newPlan
      });
      
      if (error) {
        console.error('PlanService: Erro na atualização de emergência:', error);
        
        // Se ainda falhar, tentar SQL direto como último recurso
        try {
          await this.execute_sql_safe(`
            UPDATE public.profiles 
            SET plano = '${newPlan}'::user_plan, 
                data_modificacao = NOW() 
            WHERE id = '${userId}'
          `);
          
          // Forçar atualização dos metadados também
          await this.execute_sql_safe(`
            UPDATE auth.users
            SET raw_user_meta_data = 
                raw_user_meta_data || 
                '{"plano":"${newPlan}", "plano_updated_at":"${new Date().toISOString()}"}'::jsonb 
            WHERE id = '${userId}'
          `);
          
          return { success: true, mode: 'sql_direto' };
        } catch (sqlError) {
          console.error('PlanService: Falha completa no SQL direto:', sqlError);
          throw error;
        }
      }
      
      return { success: true, mode: 'emergency_function' };
    } catch (error) {
      console.error('PlanService: Exceção na atualização de emergência:', error);
      throw error;
    }
  },
  
  /**
   * Atualiza o plano do usuário usando a nova função limpa sem referências problemáticas
   */
  async updatePlanClean(userId: string, newPlan: UserPlan) {
    try {
      console.log('PlanService: Atualizando plano com função limpa nova');
      
      // Usa a nova função limpa sem referências a data_expiracao_plano
      const { data, error } = await supabase.rpc('update_plan_clean', {
        user_id: userId,
        new_plan: newPlan
      });
      
      if (error) {
        console.error('PlanService: Erro na atualização limpa:', error);
        throw error;
      }
      
      return { success: true, mode: 'clean_function' };
    } catch (error) {
      console.error('PlanService: Exceção na atualização limpa:', error);
      throw error;
    }
  },
  
  /**
   * Sincroniza o plano do usuário usando a nova função limpa
   */
  async syncPlanClean(userId: string) {
    try {
      console.log('PlanService: Sincronizando plano com função limpa nova');
      
      // Usa a nova função limpa de sincronização
      const { data, error } = await supabase.rpc('sync_plan_clean', {
        user_id: userId
      });
      
      if (error) {
        console.error('PlanService: Erro na sincronização limpa:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('PlanService: Exceção na sincronização limpa:', error);
      throw error;
    }
  },
}; 