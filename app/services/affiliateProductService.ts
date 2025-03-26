import { supabase } from '../../src/lib/supabase';

export interface AffiliateProduct {
  id?: string;
  name: string;
  description: string;
  image_url: string;
  image?: string;
  benefits: string[];
  price: number;
  price_display: string;
  category: string;
  featured: boolean;
  active: boolean;
  order_index: number;
  sales_url?: string;
  commission_rate?: number;
  affiliate_link?: string;
  vendor_name?: string;
  vendor_id?: string;
  status?: string;
  platform?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  created_by?: string;
  approved_date?: string;
  approved_reason?: string;
  rejected_reason?: string;
  start_date?: string;
  end_date?: string;
}

class AffiliateProductService {
  // Listar todos os produtos de afiliados
  async listAllProducts(): Promise<{
    data: AffiliateProduct[] | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select('*')
        .order('order_index', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar produtos de afiliados:', error);
      return { data: null, error };
    }
  }

  // Listar apenas produtos ativos
  async listActiveProducts(): Promise<{
    data: AffiliateProduct[] | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar produtos ativos:', error);
      return { data: null, error };
    }
  }

  // Obter um produto por ID
  async getProductById(id: string): Promise<{
    data: AffiliateProduct | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      return { data: null, error };
    }
  }

  // Adicionar um novo produto
  async addProduct(product: Omit<AffiliateProduct, 'id' | 'created_at' | 'updated_at'>): Promise<{
    data: AffiliateProduct | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .insert(product)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return { data: null, error };
    }
  }

  // Atualizar um produto existente
  async updateProduct(id: string, updates: Partial<AffiliateProduct>): Promise<{
    data: AffiliateProduct | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      return { data: null, error };
    }
  }

  // Remover um produto
  async removeProduct(id: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      const { error } = await supabase
        .from('affiliate_products')
        .delete()
        .eq('id', id);

      return { success: !error, error };
    } catch (error) {
      console.error(`Erro ao remover produto ${id}:`, error);
      return { success: false, error };
    }
  }

  // Alternar o status de destaque de um produto
  async toggleFeaturedStatus(id: string, featured: boolean): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      const { error } = await supabase
        .from('affiliate_products')
        .update({ featured })
        .eq('id', id);

      return { success: !error, error };
    } catch (error) {
      console.error(`Erro ao atualizar destaque do produto ${id}:`, error);
      return { success: false, error };
    }
  }

  // Alternar o status ativo/inativo de um produto
  async toggleProductStatus(id: string, active: boolean): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      const { error } = await supabase
        .from('affiliate_products')
        .update({ active })
        .eq('id', id);

      return { success: !error, error };
    } catch (error) {
      console.error(`Erro ao atualizar status do produto ${id}:`, error);
      return { success: false, error };
    }
  }

  // Atualizar a ordem de exibição de um produto
  async updateProductOrder(id: string, order_index: number): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      const { error } = await supabase
        .from('affiliate_products')
        .update({ order_index })
        .eq('id', id);

      return { success: !error, error };
    } catch (error) {
      console.error(`Erro ao atualizar ordem do produto ${id}:`, error);
      return { success: false, error };
    }
  }
}

export const affiliateProductService = new AffiliateProductService(); 