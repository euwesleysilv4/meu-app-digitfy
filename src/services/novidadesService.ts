import { supabase } from '../lib/supabase';
import { Novidade, CategoriaNovidade, FormNovidade } from '../types/novidades';

export const novidadesService = {
    // Buscar novidades ativas para a página principal
    async getNovidadesAtivas() {
        const { data, error } = await supabase
            .from('novidades')
            .select(`
                *,
                categoria:categorias_novidades(*)
            `)
            .eq('status', 'ativo')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;
        return data as Novidade[];
    },

    // Buscar todas as novidades (para o painel admin)
    async getNovidades() {
        const { data, error } = await supabase
            .from('novidades')
            .select(`
                *,
                categoria:categorias_novidades(*)
            `)
            .order('data_publicacao', { ascending: false });

        if (error) {
            console.error('Erro ao buscar novidades:', error);
            throw error;
        }
        return data as Novidade[];
    },

    // Buscar uma novidade específica
    async getNovidade(id: number) {
        const { data, error } = await supabase
            .from('novidades')
            .select(`
                *,
                categoria:categorias_novidades(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Erro ao buscar novidade:', error);
            throw error;
        }
        return data as Novidade;
    },

    // Criar nova novidade
    async createNovidade(novidade: Omit<Novidade, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('novidades')
            .insert([novidade])
            .select(`
                *,
                categoria:categorias_novidades(*)
            `)
            .single();

        if (error) {
            console.error('Erro ao criar novidade:', error);
            throw error;
        }
        return data as Novidade;
    },

    // Atualizar novidade
    async updateNovidade(id: number, novidade: Partial<Novidade>) {
        const { data, error } = await supabase
            .from('novidades')
            .update(novidade)
            .eq('id', id)
            .select(`
                *,
                categoria:categorias_novidades(*)
            `)
            .single();

        if (error) {
            console.error('Erro ao atualizar novidade:', error);
            throw error;
        }
        return data as Novidade;
    },

    // Deletar novidade
    async deleteNovidade(id: number) {
        const { error } = await supabase
            .from('novidades')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar novidade:', error);
            throw error;
        }
    },

    // Buscar categorias
    async getCategorias() {
        const { data, error } = await supabase
            .from('categorias_novidades')
            .select('*')
            .order('nome');

        if (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
        return data as CategoriaNovidade[];
    }
}; 