import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Interface para modelo de funil
export interface SavedFunnelTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  steps: any[];
  icon: string;
  createdAt: string;
  lastModifiedAt: string;
}

// Classe para gerenciar funis com compatibilidade entre localStorage e Supabase
export class FunnelService {
  
  // Flag para indicar se o usuário está autenticado
  private isUserAuthenticated: boolean = false;
  private userId: string | null = null;
  
  constructor() {
    // Verificar autenticação inicial
    this.checkAuthentication();
    
    // Monitorar mudanças de autenticação
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Mudança de estado de autenticação:", event);
      this.isUserAuthenticated = !!session;
      this.userId = session?.user?.id || null;
      
      // Se acabou de fazer login, migrar funis do localStorage para o Supabase
      if (event === 'SIGNED_IN') {
        await this.migrateLocalFunnelsToSupabase();
      }
    });
  }
  
  // Verificar se o usuário está autenticado
  private async checkAuthentication(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar autenticação:', error);
        this.isUserAuthenticated = false;
        this.userId = null;
        return;
      }
      
      this.isUserAuthenticated = !!data.session;
      this.userId = data.session?.user?.id || null;
      
      console.log("Estado de autenticação verificado:", { 
        isAuthenticated: this.isUserAuthenticated, 
        userId: this.userId 
      });
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      this.isUserAuthenticated = false;
      this.userId = null;
    }
  }
  
  // Transformar dados do Supabase para o formato da aplicação
  private transformDbToAppFormat(dbFunnel: any): SavedFunnelTemplate {
    return {
      id: dbFunnel.id,
      type: dbFunnel.type || '',
      title: dbFunnel.title,
      description: dbFunnel.description || '',
      steps: dbFunnel.steps || [],
      icon: dbFunnel.icon || '',
      createdAt: dbFunnel.created_at,
      lastModifiedAt: dbFunnel.updated_at
    };
  }
  
  // Transformar dados da aplicação para o formato do banco
  private transformAppToDbFormat(funnel: SavedFunnelTemplate): any {
    return {
      id: funnel.id,
      user_id: this.userId,
      title: funnel.title,
      description: funnel.description,
      type: funnel.type,
      icon: funnel.icon,
      steps: funnel.steps
    };
  }
  
  // Buscar funis do localStorage
  private getLocalFunnels(): SavedFunnelTemplate[] {
    try {
      const savedTemplates = localStorage.getItem('userFunnelTemplates');
      if (savedTemplates) {
        return JSON.parse(savedTemplates);
      }
    } catch (error) {
      console.error('Erro ao carregar funis do localStorage:', error);
    }
    return [];
  }
  
  // Salvar funis no localStorage
  private saveLocalFunnels(funnels: SavedFunnelTemplate[]): void {
    try {
      localStorage.setItem('userFunnelTemplates', JSON.stringify(funnels));
    } catch (error) {
      console.error('Erro ao salvar funis no localStorage:', error);
    }
  }
  
  // Buscar funis do Supabase
  private async getSupabaseFunnels(): Promise<SavedFunnelTemplate[]> {
    if (!this.isUserAuthenticated || !this.userId) {
      console.log("Não é possível buscar funis do Supabase: usuário não autenticado ou sem ID");
      return [];
    }
    
    try {
      console.log("Buscando funis no Supabase para o usuário:", this.userId);
      const { data, error } = await supabase
        .from('user_funnels')
        .select('*')
        .eq('user_id', this.userId);
        
      if (error) {
        console.error("Erro na consulta Supabase:", error);
        throw error;
      }
      
      console.log(`Encontrados ${data?.length || 0} funis no Supabase`);
      return data.map(item => this.transformDbToAppFormat(item));
    } catch (error) {
      console.error('Erro ao buscar funis do Supabase:', error);
      return [];
    }
  }
  
  // Migrar funis do localStorage para o Supabase quando o usuário faz login
  private async migrateLocalFunnelsToSupabase(): Promise<void> {
    if (!this.isUserAuthenticated || !this.userId) {
      console.log("Migração não realizada: usuário não autenticado");
      return;
    }
    
    try {
      // Buscar funis do localStorage
      const localFunnels = this.getLocalFunnels();
      if (localFunnels.length === 0) {
        console.log("Sem funis locais para migrar");
        return;
      }
      
      console.log(`Migrando ${localFunnels.length} funis do localStorage para o Supabase...`);
      
      // Buscar funis existentes no Supabase para detectar duplicatas
      const dbFunnels = await this.getSupabaseFunnels();
      const existingIds = new Set(dbFunnels.map(f => f.id));
      
      // Filtrar apenas funis que não existem no Supabase
      const funnelsToMigrate = localFunnels.filter(f => !existingIds.has(f.id));
      
      if (funnelsToMigrate.length === 0) {
        console.log('Todos os funis já existem no Supabase, nada a migrar.');
        return;
      }
      
      console.log(`Migrando ${funnelsToMigrate.length} funis: `, funnelsToMigrate);
      
      // Preparar dados para inserção
      const dbFormattedFunnels = funnelsToMigrate.map(funnel => ({
        id: funnel.id,
        user_id: this.userId,
        title: funnel.title,
        description: funnel.description,
        type: funnel.type,
        icon: funnel.icon,
        steps: funnel.steps,
        created_at: new Date(funnel.createdAt).toISOString(),
        updated_at: new Date(funnel.lastModifiedAt).toISOString()
      }));
      
      // Inserir no Supabase
      const { error } = await supabase
        .from('user_funnels')
        .insert(dbFormattedFunnels);
        
      if (error) {
        throw error;
      }
      
      console.log(`${funnelsToMigrate.length} funis migrados com sucesso para o Supabase.`);
      
      // Opcional: limpar localStorage após migração bem-sucedida
      // localStorage.removeItem('userFunnelTemplates');
    } catch (error) {
      console.error('Erro ao migrar funis para o Supabase:', error);
    }
  }
  
  // API PÚBLICA
  
  // Buscar todos os funis disponíveis
  public async getAllFunnels(): Promise<SavedFunnelTemplate[]> {
    // Verificar autenticação novamente para garantir status atualizado
    await this.checkAuthentication();
    
    console.log("Buscando todos os funis. Estado de autenticação:", { 
      isAuthenticated: this.isUserAuthenticated, 
      userId: this.userId 
    });
    
    // Se o usuário estiver autenticado, buscar do Supabase
    if (this.isUserAuthenticated) {
      try {
        const funnels = await this.getSupabaseFunnels();
        console.log(`Retornando ${funnels.length} funis do Supabase`);
        return funnels;
      } catch (error) {
        console.error('Erro ao buscar funis do Supabase, usando localStorage como fallback:', error);
      }
    } else {
      console.log("Usuário não autenticado, buscando funis do localStorage");
    }
    
    // Se não estiver autenticado ou ocorrer erro, usar localStorage
    const localFunnels = this.getLocalFunnels();
    console.log(`Retornando ${localFunnels.length} funis do localStorage`);
    return localFunnels;
  }
  
  // Obter um funil específico por ID
  public async getFunnelById(id: string): Promise<SavedFunnelTemplate | null> {
    // Verificar autenticação novamente
    await this.checkAuthentication();
    
    // Se o usuário estiver autenticado, buscar do Supabase
    if (this.isUserAuthenticated) {
      try {
        console.log(`Buscando funil ${id} no Supabase`);
        const { data, error } = await supabase
          .from('user_funnels')
          .select('*')
          .eq('id', id)
          .eq('user_id', this.userId)
          .single();
          
        if (error) {
          console.error("Erro ao buscar funil específico:", error);
          throw error;
        }
        
        if (data) {
          console.log("Funil encontrado no Supabase");
          return this.transformDbToAppFormat(data);
        } else {
          console.log("Funil não encontrado no Supabase");
        }
      } catch (error) {
        console.error('Erro ao buscar funil do Supabase, tentando localStorage:', error);
      }
    }
    
    // Buscar do localStorage como fallback
    console.log(`Buscando funil ${id} no localStorage`);
    const localFunnels = this.getLocalFunnels();
    const localFunnel = localFunnels.find(f => f.id === id);
    console.log("Resultado da busca no localStorage:", localFunnel ? "Encontrado" : "Não encontrado");
    return localFunnel || null;
  }
  
  // Salvar um funil (criar novo ou atualizar existente)
  public async saveFunnel(funnel: SavedFunnelTemplate): Promise<SavedFunnelTemplate> {
    // Verificar autenticação novamente
    await this.checkAuthentication();
    
    console.log("Salvando funil:", funnel);
    console.log("Estado de autenticação:", { 
      isAuthenticated: this.isUserAuthenticated, 
      userId: this.userId 
    });
    
    // Garantir que o funil tenha um ID
    if (!funnel.id) {
      funnel.id = uuidv4();
      console.log("Novo ID gerado para o funil:", funnel.id);
    }
    
    // Atualizar timestamps
    const now = new Date().toISOString();
    if (!funnel.createdAt) {
      funnel.createdAt = now;
    }
    funnel.lastModifiedAt = now;
    
    // Se o usuário estiver autenticado, salvar no Supabase
    if (this.isUserAuthenticated && this.userId) {
      try {
        console.log("Tentando salvar no Supabase");
        const dbFormatted = this.transformAppToDbFormat(funnel);
        
        // Verificar se o funil já existe
        const { data: existingFunnel, error: checkError } = await supabase
          .from('user_funnels')
          .select('id')
          .eq('id', funnel.id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Erro ao verificar existência do funil:", checkError);
        }
        
        let error;
        
        if (existingFunnel) {
          console.log("Atualizando funil existente no Supabase");
          // Atualizar funil existente
          const { error: updateError } = await supabase
            .from('user_funnels')
            .update(dbFormatted)
            .eq('id', funnel.id)
            .eq('user_id', this.userId);
            
          error = updateError;
        } else {
          console.log("Inserindo novo funil no Supabase");
          // Inserir novo funil
          const { error: insertError } = await supabase
            .from('user_funnels')
            .insert(dbFormatted);
            
          error = insertError;
        }
        
        if (error) {
          console.error("Erro ao salvar no Supabase:", error);
          throw error;
        }
        
        console.log("Funil salvo com sucesso no Supabase");
        return funnel;
      } catch (error) {
        console.error('Erro ao salvar funil no Supabase, salvando no localStorage como fallback:', error);
      }
    } else {
      console.log("Usuário não autenticado ou ID não disponível. Salvando apenas no localStorage.");
    }
    
    // Salvar no localStorage (como backup ou para usuários não autenticados)
    console.log("Salvando funil no localStorage");
    const localFunnels = this.getLocalFunnels();
    const updatedFunnels = localFunnels.filter(f => f.id !== funnel.id);
    updatedFunnels.push(funnel);
    this.saveLocalFunnels(updatedFunnels);
    console.log("Funil salvo com sucesso no localStorage");
    
    return funnel;
  }
  
  // Excluir um funil
  public async deleteFunnel(id: string): Promise<boolean> {
    // Verificar autenticação novamente
    await this.checkAuthentication();
    
    console.log(`Excluindo funil ${id}`);
    
    // Se o usuário estiver autenticado, excluir do Supabase
    if (this.isUserAuthenticated && this.userId) {
      try {
        console.log("Excluindo do Supabase");
        const { error } = await supabase
          .from('user_funnels')
          .delete()
          .eq('id', id)
          .eq('user_id', this.userId);
          
        if (error) {
          console.error("Erro ao excluir do Supabase:", error);
          throw error;
        }
        
        console.log("Funil excluído com sucesso do Supabase");
      } catch (error) {
        console.error('Erro ao excluir funil do Supabase:', error);
      }
    }
    
    // Sempre excluir do localStorage também
    console.log("Excluindo do localStorage");
    const localFunnels = this.getLocalFunnels();
    const updatedFunnels = localFunnels.filter(f => f.id !== id);
    this.saveLocalFunnels(updatedFunnels);
    console.log("Funil excluído com sucesso do localStorage");
    
    return true;
  }
}

// Exportar instância única do serviço
export const funnelService = new FunnelService(); 