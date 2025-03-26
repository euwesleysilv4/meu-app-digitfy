import { supabase } from '../../src/lib/supabase';
import { AffiliateProduct } from './affiliateProductService';

export interface SubmittedProduct {
  id?: string;
  name: string;
  description: string;
  image: string;
  image_url?: string;
  benefits: string[];
  price: number;
  price_display: string;
  category: string;
  sales_url?: string;
  commission_rate?: number;
  affiliate_link?: string;
  vendor_name?: string;
  platform?: string;
  userId: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  submittedAt?: string;
  updatedAt?: string;
  reviewerId?: string;
  reviewerComments?: string;
  reviewedAt?: string;
}

class SubmittedProductService {
  // Listar todos os produtos enviados (para administradores)
  async listAllSubmittedProducts(): Promise<{
    data: SubmittedProduct[] | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('submitted_products')
        .select('*')
        .order('submittedAt', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar produtos enviados:', error);
      return { data: null, error };
    }
  }

  // Listar produtos pendentes (para administradores)
  async listPendingProducts(): Promise<{
    data: SubmittedProduct[] | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('submitted_products')
        .select('*')
        .eq('status', 'pendente')
        .order('submittedAt', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar produtos pendentes:', error);
      return { data: null, error };
    }
  }

  // Listar produtos do usuário atual
  async listUserSubmittedProducts(): Promise<{
    data: SubmittedProduct[] | null;
    error: any;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const userId = session.session.user.id;
      
      const { data, error } = await supabase
        .from('submitted_products')
        .select('*')
        .eq('userId', userId)
        .order('submittedAt', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Erro ao buscar produtos do usuário:', error);
      return { data: null, error };
    }
  }

  // Obter um produto específico
  async getSubmittedProductById(id: string): Promise<{
    data: SubmittedProduct | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('submitted_products')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      return { data: null, error };
    }
  }

  // Enviar um novo produto para aprovação
  async submitProduct(product: Omit<SubmittedProduct, 'id' | 'submittedAt' | 'updatedAt' | 'status'>): Promise<{
    data: SubmittedProduct | null;
    error: any;
  }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const userId = session.session.user.id;
      
      const submittedProduct = {
        ...product,
        userId,
        status: 'pendente' as const
      };
      
      const { data, error } = await supabase
        .from('submitted_products')
        .insert(submittedProduct)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Erro ao enviar produto:', error);
      return { data: null, error };
    }
  }

  // Aprovar um produto (apenas admin)
  async approveProduct(id: string, comments?: string): Promise<{
    success: boolean;
    data?: AffiliateProduct;
    error: any;
  }> {
    try {
      // Primeiro, obtém os dados do produto enviado
      const { data: productData, error: getError } = await this.getSubmittedProductById(id);
      
      if (getError || !productData) {
        return { success: false, error: getError || new Error('Produto não encontrado') };
      }
      
      // Obter o ID do administrador
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { success: false, error: new Error('Administrador não autenticado') };
      }
      
      const reviewerId = session.session.user.id;
      
      // Atualizar o status para aprovado
      const { error: updateError } = await supabase
        .from('submitted_products')
        .update({
          status: 'aprovado',
          reviewerId,
          reviewerComments: comments || null,
          reviewedAt: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) {
        return { success: false, error: updateError };
      }
      
      // Converter para o formato de AffiliateProduct e adicionar à tabela principal
      const affiliateProduct: Omit<AffiliateProduct, 'id' | 'created_at' | 'updated_at'> = {
        name: productData.name,
        description: productData.description,
        image_url: productData.image_url || productData.image || '',
        image: productData.image || productData.image_url || '',
        benefits: productData.benefits || [],
        price: productData.price || 0,
        price_display: productData.price_display || 'R$ 0,00',
        category: productData.category || 'Outros',
        featured: false,
        active: true,
        order_index: 0,
        sales_url: productData.sales_url || '',
        commission_rate: productData.commission_rate || 50,
        affiliate_link: productData.affiliate_link || '',
        vendor_name: productData.vendor_name || '',
        platform: productData.platform || 'Hotmart',
        status: 'aprovado'
      };
      
      // Adicionar à tabela de produtos de afiliados
      const { data: addedProduct, error: addError } = await supabase
        .from('affiliate_products')
        .insert(affiliateProduct)
        .select()
        .single();
      
      if (addError) {
        return { success: false, error: addError };
      }
      
      return { success: true, data: addedProduct, error: null };
    } catch (error) {
      console.error(`Erro ao aprovar produto ${id}:`, error);
      return { success: false, error };
    }
  }

  // Rejeitar um produto (apenas admin)
  async rejectProduct(id: string, comments: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      // Obter o ID do administrador
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { success: false, error: new Error('Administrador não autenticado') };
      }
      
      const reviewerId = session.session.user.id;
      
      // Atualizar o status para rejeitado
      const { error } = await supabase
        .from('submitted_products')
        .update({
          status: 'rejeitado',
          reviewerId,
          reviewerComments: comments,
          reviewedAt: new Date().toISOString()
        })
        .eq('id', id);
      
      return { success: !error, error };
    } catch (error) {
      console.error(`Erro ao rejeitar produto ${id}:`, error);
      return { success: false, error };
    }
  }
}

export const submittedProductService = new SubmittedProductService(); 