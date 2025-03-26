import { supabase } from '../lib/supabase';
import { RecommendedPlayer } from '../types/player';

const TABLE_NAME = 'recommended_players';

export const playerService = {
  // Obter todos os players recomendados ativos
  async getActivePlayers(): Promise<{ players: RecommendedPlayer[], error: any }> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });
        
      return { players: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar players:', error);
      return { players: [], error };
    }
  },

  // Obter todos os players (incluindo inativos) - para administração
  async getAllPlayers(): Promise<{ players: RecommendedPlayer[], error: any }> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('order_index', { ascending: true });
        
      return { players: data || [], error };
    } catch (error) {
      console.error('Erro ao buscar players:', error);
      return { players: [], error };
    }
  },

  // Obter um player específico pelo ID
  async getPlayerById(id: string): Promise<{ player: RecommendedPlayer | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();
        
      return { player: data || null, error };
    } catch (error) {
      console.error('Erro ao buscar player:', error);
      return { player: null, error };
    }
  },

  // Criar um novo player
  async createPlayer(player: RecommendedPlayer): Promise<{ player: RecommendedPlayer | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([player])
        .select()
        .single();
        
      return { player: data || null, error };
    } catch (error) {
      console.error('Erro ao criar player:', error);
      return { player: null, error };
    }
  },

  // Atualizar um player existente
  async updatePlayer(id: string, player: RecommendedPlayer): Promise<{ player: RecommendedPlayer | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(player)
        .eq('id', id)
        .select()
        .single();
        
      return { player: data || null, error };
    } catch (error) {
      console.error('Erro ao atualizar player:', error);
      return { player: null, error };
    }
  },

  // Excluir um player
  async deletePlayer(id: string): Promise<{ success: boolean, error: any }> {
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);
        
      return { success: !error, error };
    } catch (error) {
      console.error('Erro ao excluir player:', error);
      return { success: false, error };
    }
  },

  // Reordenar players (atualizar order_index)
  async reorderPlayers(playerIds: string[]): Promise<{ success: boolean, error: any }> {
    try {
      // Criar um array de atualizações em lote
      const updates = playerIds.map((id, index) => ({
        id,
        order_index: index + 1
      }));
      
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(updates);
        
      return { success: !error, error };
    } catch (error) {
      console.error('Erro ao reordenar players:', error);
      return { success: false, error };
    }
  }
}; 