import { supabase } from '../lib/supabase';
import { funnelService, SavedFunnelTemplate } from './funnelService';

// Interface para token de compartilhamento
export interface FunnelShareToken {
  id: string;
  token: string;
  funnelId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

// Interface para metadados de token
export interface TokenData {
  tokenId: string;
  funnelId: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
  funnelData: SavedFunnelTemplate;
}

// Interface para estatísticas de uso
export interface TokenUsageStats {
  totalViews: number;
  totalCopies: number;
  usageByUser: {
    userId: string;
    views: number;
    copies: number;
  }[];
}

// Interface para resultado de validação de token
export interface TokenValidationResult {
  valid: boolean;
  message?: string;
  data?: TokenData;
}

// Interface para resultado de cópia de funil
export interface FunnelCopyResult {
  success: boolean;
  message: string;
  funnelId?: string;
  needsRefresh?: boolean;
}

// Interface para resultado de reparo de funil
export interface FunnelRepairResult {
  success: boolean;
  message: string;
  stepsCount?: number;
}

// Classe para gerenciar compartilhamento de funis
export class FunnelSharingService {
  // Gerar um novo token de compartilhamento para um funil
  public async generateShareToken(
    funnelId: string, 
    daysValid: number | null = 30
  ): Promise<string | null> {
    try {
      console.log(`Iniciando geração de token para funil ${funnelId} com validade de ${daysValid} dias`);
      
      // Validar parâmetros
      if (!funnelId) {
        throw new Error('ID do funil não fornecido');
      }
      
      if (daysValid !== null && (isNaN(daysValid) || daysValid < 1)) {
        throw new Error('Período de validade inválido');
      }
      
      // Gerar um token simples usando a função do servidor
      const { data, error } = await supabase.rpc(
        'generate_simple_token',
        { 
          p_funnel_id: funnelId,
          p_days_valid: daysValid
        }
      );
      
      console.log('Resposta da geração de token:', { data, error });
      
      if (error) {
        console.error('Erro ao gerar token:', error);
        throw new Error(`Erro ao gerar token: ${error.message}`);
      }
      
      if (!data) {
        console.error('Nenhum token retornado');
        throw new Error('Nenhum token retornado pelo servidor');
      }
      
      // Criar entrada na tabela de tokens
      try {
        const { data: funnelData, error: funnelError } = await supabase
          .from('user_funnels')
          .select('*')
          .eq('id', funnelId)
          .single();
          
        if (funnelError || !funnelData) {
          console.error('Erro ao buscar dados do funil:', funnelError);
          throw new Error('Funil não encontrado');
        }
        
        const token = data;
        
        const { error: insertError } = await supabase
          .from('funnel_share_tokens')
          .insert({
            token,
            funnel_id: funnelId,
            created_by: (await supabase.auth.getUser()).data.user?.id,
            expires_at: daysValid ? new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString() : null,
            funnel_data: {
              id: funnelData.id,
              title: funnelData.title,
              description: funnelData.description,
              type: funnelData.type,
              icon: funnelData.icon,
              steps: funnelData.steps
            },
            is_active: true
          });
          
        if (insertError) {
          console.warn('Aviso: Erro ao salvar token no banco:', insertError);
          // Continuamos mesmo com erro, pois o token já foi gerado
        }
      } catch (insertError) {
        console.warn('Aviso: Erro ao preparar dados para o token:', insertError);
        // Continuamos mesmo com erro, pois o token já foi gerado
      }
      
      console.log('Token gerado com sucesso:', data);
      return data;
    } catch (error: any) {
      console.error('Exceção ao gerar token de compartilhamento:', error);
      throw error;
    }
  }
  
  // Validar um token de compartilhamento
  public async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      console.log('Validando token:', token);
      
      if (!token || token.trim() === '') {
        return { valid: false, message: 'Token não fornecido' };
      }
      
      // Verificar diretamente na tabela primeiro (antes de usar a função)
      const { data: directQuery, error: directError } = await supabase
        .from('funnel_share_tokens')
        .select('*')
        .eq('token', token.trim())
        .eq('is_active', true)
        .single();
      
      if (directQuery) {
        console.log('Token encontrado diretamente na tabela:', directQuery);
        
        // Verificar se está expirado
        if (directQuery.expires_at && new Date(directQuery.expires_at) < new Date()) {
          console.log('Token expirado:', directQuery.expires_at);
          return { valid: false, message: 'Token expirado' };
        }
        
        // Registrar visualização
        try {
          await supabase
            .from('funnel_share_token_usage')
            .insert({
              token_id: directQuery.id,
              used_by: (await supabase.auth.getUser()).data.user?.id,
              action: 'view'
            });
        } catch (e) {
          console.warn('Erro ao registrar visualização:', e);
          // Continuar mesmo com erro no registro
        }
        
        // Construir objeto de resposta
        return {
          valid: true,
          message: 'Token validado com sucesso',
          data: {
            tokenId: directQuery.id,
            funnelId: directQuery.funnel_id,
            createdBy: directQuery.created_by,
            createdAt: directQuery.created_at,
            expiresAt: directQuery.expires_at,
            funnelData: directQuery.funnel_data
          }
        };
      }
      
      // Se não encontrar diretamente, tentar usar a função SQL de validação de token
      const { data, error } = await supabase.rpc(
        'validate_funnel_token',
        { p_token: token.trim() }
      );
      
      console.log('Resposta da validação de token via RPC:', { data, error });
      
      if (error) {
        console.error('Erro ao validar token via RPC:', error);
        
        // Se falhar no RPC e não encontramos diretamente, o token é inválido
        if (!directQuery) {
          return { valid: false, message: `Token inválido ou expirado` };
        }
      }
      
      // Verificações extras para compatibilidade
      if (!data) {
        console.warn('Sem dados retornados da validação do token');
        
        // Se não encontrou via RPC mas encontrou diretamente, considerar válido
        if (directQuery) {
          return {
            valid: true,
            message: 'Token validado (via consulta direta)',
            data: {
              tokenId: directQuery.id,
              funnelId: directQuery.funnel_id,
              createdBy: directQuery.created_by,
              createdAt: directQuery.created_at,
              expiresAt: directQuery.expires_at,
              funnelData: directQuery.funnel_data
            }
          };
        }
        
        return { valid: false, message: 'Token inválido ou expirado' };
      }
      
      // Verificar se é um objeto e possui a propriedade 'valid'
      if (typeof data === 'object' && 'valid' in data) {
        // Este é o caso esperado - o formato correto retornado pela função
        return data as TokenValidationResult;
      }
      
      // Verificar se é uma string contendo JSON
      if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
        try {
          const parsedData = JSON.parse(data);
          console.log('Resposta em string JSON analisada:', parsedData);
          
          if (typeof parsedData === 'object' && 'valid' in parsedData) {
            return parsedData as TokenValidationResult;
          }
          
          // JSON sem o formato esperado - tratar como sucesso com mensagem
          return { 
            valid: true, 
            message: 'Token validado com sucesso',
            data: parsedData 
          };
        } catch (e) {
          // Falha ao analisar o JSON - tratar como erro
          console.error('Erro ao analisar JSON da resposta:', e);
        }
      }
      
      // Em último caso, para tipos de dados não esperados, 
      // fazer uma verificação simples baseada na presença de uma resposta
      console.log('Usando verificação pragmática para o valor:', data);
      
      // Se temos algum valor e não contém mensagens de erro, considerar válido
      const stringData = String(data).toLowerCase();
      const containsErrorTerms = [
        'invalid', 'inválido', 'error', 'erro', 'expirado', 'expired', 'fail', 'falha'
      ].some(term => stringData.includes(term));
      
      return {
        valid: !!data && !containsErrorTerms,
        message: containsErrorTerms ? 'Token inválido ou expirado' : 'Token validado',
        data: directQuery ? {
          tokenId: directQuery.id,
          funnelId: directQuery.funnel_id,
          createdBy: directQuery.created_by,
          createdAt: directQuery.created_at,
          expiresAt: directQuery.expires_at,
          funnelData: directQuery.funnel_data
        } : undefined
      };
    } catch (error: any) {
      console.error('Exceção ao validar token:', error);
      return { 
        valid: false, 
        message: `Ocorreu um erro ao validar o token: ${error.message}` 
      };
    }
  }
  
  // Método para verificar e consertar um funil compartilhado que veio vazio
  public async fixEmptySharedFunnel(funnelId: string, token?: string): Promise<FunnelRepairResult> {
    try {
      console.log(`Tentando consertar funil vazio: ${funnelId}, token: ${token || 'não fornecido'}`);
      
      // Verificar se o funil existe
      const { data: funnel, error: funnelError } = await supabase
        .from('user_funnels')
        .select('*')
        .eq('id', funnelId)
        .single();
        
      if (funnelError || !funnel) {
        console.error('Funil não encontrado:', funnelError);
        return { 
          success: false, 
          message: 'Funil não encontrado' 
        };
      }
      
      // Verificar se o funil já tem elementos
      if (funnel.steps && Array.isArray(funnel.steps) && funnel.steps.length > 0) {
        console.log('Funil já possui elementos:', funnel.steps.length);
        return { 
          success: true, 
          message: 'Funil já possui elementos',
          stepsCount: funnel.steps.length
        };
      }
      
      // Chamar a função SQL de reparo
      const { data, error } = await supabase.rpc(
        'fix_empty_shared_funnel',
        { 
          p_funnel_id: funnelId,
          p_token: token
        }
      );
      
      console.log('Resposta do reparo:', { data, error });
      
      if (error) {
        console.error('Erro ao reparar funil:', error);
        return { 
          success: false, 
          message: `Erro: ${error.message}` 
        };
      }
      
      if (!data) {
        return { 
          success: false, 
          message: 'Não foi possível reparar o funil' 
        };
      }
      
      // Se a resposta é um objeto e tem a propriedade success
      if (typeof data === 'object' && 'success' in data) {
        if (data.success && 'steps_count' in data) {
          return {
            success: true,
            message: `Funil reparado com sucesso. Elementos recuperados: ${data.steps_count}`,
            stepsCount: data.steps_count
          };
        }
        
        return data as FunnelRepairResult;
      }
      
      // Resposta inesperada
      return { 
        success: false, 
        message: 'Resposta inesperada do servidor' 
      };
      
    } catch (error: any) {
      console.error('Exceção ao reparar funil:', error);
      return { 
        success: false, 
        message: `Erro: ${error.message}` 
      };
    }
  }
  
  // Método para verificar a consistência de todos os funis compartilhados
  public async checkFunnelsConsistency(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('check_shared_funnels_consistency');
      
      if (error) {
        console.error('Erro ao verificar consistência dos funis:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Exceção ao verificar consistência dos funis:', error);
      return [];
    }
  }
  
  // Copiar um funil compartilhado para a conta do usuário atual - MÉTODO REFORÇADO
  public async copySharedFunnel(token: string): Promise<FunnelCopyResult> {
    try {
      console.log('Copiando funil usando token:', token);
      
      if (!token || token.trim() === '') {
        return { success: false, message: 'Token não fornecido' };
      }
      
      // Usar a função SQL de cópia de funil reforçada
      const { data, error } = await supabase.rpc(
        'copy_shared_funnel',
        { p_token: token.trim() }
      );
      
      console.log('Resposta da cópia do funil via RPC:', { 
        data: data ? JSON.stringify(data) : 'null', 
        error: error ? JSON.stringify(error) : 'null' 
      });
      
      if (error) {
        console.error('Erro ao copiar funil compartilhado via RPC, tentando método alternativo');
        
        // Se falhar no RPC, tentar método alternativo criando manualmente
        try {
          // Primeiro, validar o token para obter os dados do funil
          const validationResult = await this.validateToken(token.trim());
          
          console.log('Resultado da validação para método alternativo:', JSON.stringify({
            valid: validationResult.valid,
            message: validationResult.message,
            hasData: !!validationResult.data,
            hasFunnelData: !!validationResult.data?.funnelData,
            stepsCount: validationResult.data?.funnelData?.steps?.length || 0
          }));
          
          if (!validationResult.valid || !validationResult.data) {
            console.error('Token inválido ou sem dados para cópia alternativa');
            return { 
              success: false, 
              message: validationResult.message || 'Token inválido ou expirado' 
            };
          }
          
          // Extrair dados do funil original e garantir que tipo e ícone estejam definidos
          let originalFunnelData = validationResult.data.funnelData;
          
          if (!originalFunnelData) {
            console.error('Dados do funil original não encontrados no método alternativo');
            return { 
              success: false, 
              message: 'O funil compartilhado não contém dados' 
            };
          }
          
          // Garantir que os passos estejam definidos e não vazios
          if (!originalFunnelData.steps || originalFunnelData.steps.length === 0) {
            // Como não temos os passos no token, tentar buscar diretamente do funil original
            try {
              console.log('Tentando buscar passos diretamente do funil original:', validationResult.data.funnelId);
              
              const { data: originalFunnel, error: originalError } = await supabase
                .from('user_funnels')
                .select('steps')
                .eq('id', validationResult.data.funnelId)
                .single();
                
              if (!originalError && originalFunnel && originalFunnel.steps && originalFunnel.steps.length > 0) {
                console.log('Passos encontrados no funil original:', originalFunnel.steps.length);
                originalFunnelData.steps = originalFunnel.steps;
              } else {
                console.error('Não foi possível obter passos do funil original:', originalError);
              }
            } catch (e) {
              console.warn('Erro ao buscar passos do funil original:', e);
            }
          }
          
          // Garantir tipo e ícone para o funil
          if (!originalFunnelData.type) {
            originalFunnelData.type = 'sales';
          }
          
          if (!originalFunnelData.icon) {
            originalFunnelData.icon = 'ShoppingCart';
          }
          
          // Verificar se temos os dados do usuário atual
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            throw new Error(`Erro ao obter usuário atual: ${userError?.message || 'Usuário não autenticado'}`);
          }
          
          // Inserir nova entrada de funil para o usuário atual
          const { data: newFunnel, error: insertError } = await supabase
            .from('user_funnels')
            .insert({
              user_id: userData.user.id,
              title: `${originalFunnelData.title} (Compartilhado)`,
              description: originalFunnelData.description || 'Funil compartilhado',
              type: originalFunnelData.type,
              icon: originalFunnelData.icon,
              steps: originalFunnelData.steps || [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id, steps')
            .single();
          
          if (insertError) {
            throw new Error(`Falha ao inserir funil: ${insertError.message}`);
          }
          
          console.log('Funil copiado manualmente com sucesso:', newFunnel);
          
          // Verificar se o funil foi criado com passos
          const stepsCount = newFunnel.steps?.length || 0;
          const needsRefresh = stepsCount === 0 && (originalFunnelData.steps?.length || 0) > 0;
          
          if (needsRefresh) {
            console.warn('AVISO: Funil criado sem passos, mas o original tinha passos.');
          }
          
          // Registrar uso do token (cópia)
          try {
            await supabase
              .from('funnel_share_token_usage')
              .insert({
                token_id: validationResult.data.tokenId,
                used_by: userData.user.id,
                action: 'copy'
              });
          } catch (e) {
            console.warn('Erro ao registrar uso do token:', e);
          }
          
          return {
            success: true,
            message: 'Funil copiado com sucesso' + (needsRefresh ? ' (recarregue a página para ver os elementos)' : ''),
            funnelId: newFunnel.id,
            needsRefresh
          };
        } catch (manualError: any) {
          console.error('Erro no método alternativo:', manualError);
          return { 
            success: false, 
            message: `Falha em todos os métodos de cópia: ${manualError.message}` 
          };
        }
      }
      
      // Se a resposta já está no formato esperado
      if (typeof data === 'object' && 'success' in data) {
        // Verificar se o funil foi criado com passos
        const needsRefresh = data.steps_count === 0 && data.original_steps_count > 0;
        
        if (needsRefresh) {
          return {
            ...data as FunnelCopyResult,
            needsRefresh: true,
            message: (data as any).message + ' (recarregue a página para ver os elementos)'
          };
        }
        
        return data as FunnelCopyResult;
      }
      
      // Resposta não está em formato reconhecido, mas não houve erro
      return { 
        success: true, 
        message: 'Funil copiado com sucesso',
        needsRefresh: false
      };
    } catch (error: any) {
      console.error('Exceção ao copiar funil compartilhado:', error);
      return { 
        success: false, 
        message: `Ocorreu um erro ao copiar o funil: ${error.message}` 
      };
    }
  }
  
  // Obter todos os tokens de compartilhamento criados pelo usuário atual
  public async getUserShareTokens(): Promise<FunnelShareToken[]> {
    try {
      const { data, error } = await supabase
        .from('funnel_share_tokens')
        .select(`
          id,
          token,
          funnel_id,
          created_by,
          created_at,
          expires_at,
          is_active
        `);
        
      if (error) {
        console.error('Erro ao buscar tokens de compartilhamento:', error);
        return [];
      }
      
      return data.map(token => ({
        id: token.id,
        token: token.token,
        funnelId: token.funnel_id,
        createdBy: token.created_by,
        createdAt: token.created_at,
        expiresAt: token.expires_at,
        isActive: token.is_active
      }));
    } catch (error) {
      console.error('Erro ao buscar tokens de compartilhamento:', error);
      return [];
    }
  }
  
  // Desativar um token de compartilhamento
  public async deactivateToken(tokenId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('funnel_share_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);
        
      if (error) {
        console.error('Erro ao desativar token:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao desativar token:', error);
      return false;
    }
  }
  
  // Obter estatísticas de uso de um token
  public async getTokenUsageStats(tokenId: string): Promise<TokenUsageStats | null> {
    try {
      const { data, error } = await supabase
        .from('funnel_share_token_usage')
        .select(`
          token_id,
          used_by,
          used_at,
          action
        `)
        .eq('token_id', tokenId);
        
      if (error) {
        console.error('Erro ao buscar estatísticas de uso do token:', error);
        return null;
      }
      
      // Contar visualizações e cópias
      const totalViews = data.filter(usage => usage.action === 'view').length;
      const totalCopies = data.filter(usage => usage.action === 'copy').length;
      
      // Agrupar por usuário
      const usageByUser: { [key: string]: { views: number, copies: number } } = {};
      
      data.forEach(usage => {
        if (!usageByUser[usage.used_by]) {
          usageByUser[usage.used_by] = { views: 0, copies: 0 };
        }
        
        if (usage.action === 'view') {
          usageByUser[usage.used_by].views++;
        } else if (usage.action === 'copy') {
          usageByUser[usage.used_by].copies++;
        }
      });
      
      // Formatar resultado
      return {
        totalViews,
        totalCopies,
        usageByUser: Object.entries(usageByUser).map(([userId, stats]) => ({
          userId,
          views: stats.views,
          copies: stats.copies
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de uso do token:', error);
      return null;
    }
  }
}

// Exportar instância única do serviço
export const funnelSharingService = new FunnelSharingService(); 