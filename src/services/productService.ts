import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

// Interface para os produtos pendentes (enviados pelos usuários)
export interface PendingProduct extends Product {
  id: string;
  userId: string;
  user_id?: string; // Alternativa para o campo userId
  userName: string;
  userEmail: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  submittedAt: string;
  submitted_at?: string; // Alternativa para o campo submittedAt
  updatedAt: string;
  updated_at?: string; // Alternativa para o campo updatedAt
  profiles?: {
    name?: string;
    email?: string;
  };
}

// Serviço para gerenciamento de produtos
export const productService = {
  // Listar todos os produtos recomendados
  async listAllProducts(): Promise<{ data: Product[] | null, error: any }> {
    try {
      console.log('Iniciando busca de produtos recomendados');
      const { data, error } = await supabase
        .from('recommended_products')
        .select('*');
      
      // Log detalhado para depuração
      console.log('Resultado da busca:', { data, error });
      
      // Se ocorreu um erro devido a tabela não existir, retorne array vazio
      if (error && (error.message.includes('does not exist') || error.code === '42P01')) {
        console.warn('Tabela recommended_products não existe ainda. Retornando array vazio.');
        return { data: [], error: null };
      }
      
      if (error) {
        console.error('Erro ao buscar produtos recomendados:', error);
        return { data: [], error };
      }
      
      // Mapear dados para garantir compatibilidade com as propriedades esperadas
      const formattedData = data?.map(product => ({
        ...product,
        salesUrl: product.sales_url // Mapear sales_url para salesUrl
      })) || [];
      
      // Log da quantidade de produtos encontrados
      console.log(`Encontrados ${formattedData.length || 0} produtos recomendados`);
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Exceção ao buscar produtos:', error);
      return { data: [], error };
    }
  },
  
  // Listar produtos pendentes (enviados pelos usuários)
  async listPendingProducts(): Promise<{ data: PendingProduct[] | null, error: any }> {
    try {
      console.log('Iniciando busca de produtos pendentes');
      
      // Primeiro, verificar se há produtos na tabela (debug)
      const { data: totalProds, error: countError } = await supabase
        .from('submitted_products')
        .select('id', { count: 'exact' });
        
      console.log('Total de produtos na tabela:', 
        totalProds ? totalProds.length : 0,
        countError ? `Erro: ${countError.message}` : 'Sem erro');
      
      // Verificar quantos produtos têm status pendente
      const { data: pendingCount, error: pendingCountError } = await supabase
        .from('submitted_products')
        .select('id')
        .eq('status', 'pendente');
        
      console.log('Produtos com status=pendente:', 
        pendingCount ? pendingCount.length : 0,
        pendingCountError ? `Erro: ${pendingCountError.message}` : 'Sem erro');
      
      // Buscar qualquer produto pendente mesmo se houver problemas com a consulta join
      const { data: simpleData, error: simpleError } = await supabase
        .from('submitted_products')
        .select('*')
        .or('status.eq.pendente,status.is.null');
      
      console.log('Produtos pendentes (consulta simplificada):', 
        simpleData ? `${simpleData.length} produtos encontrados` : 'Sem dados',
        simpleError ? `Erro: ${simpleError.message}` : 'Sem erro');
      
      if (simpleError) {
        console.error('Erro na consulta simplificada:', simpleError);
        return { data: [], error: simpleError };
      }
      
      if (!simpleData || simpleData.length === 0) {
        console.log('Nenhum produto pendente encontrado na consulta simplificada');
        return { data: [], error: null };
      }
      
      // Formatar os dados mesmo sem informações de perfil
      const formattedData = simpleData.map(item => ({
        ...item,
        id: item.id,
        userId: item.userId || item.user_id,
        submittedAt: item.submittedAt || item.submitted_at || new Date().toISOString(),
        updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
        userName: 'Usuário',
        userEmail: 'Sem email',
        status: item.status || 'pendente'
      }));
      
      console.log('Dados formatados da consulta simplificada:', 
        `${formattedData.length} produtos processados`);
      
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Erro ao buscar produtos pendentes:', error);
      return { data: [], error };
    }
  },
  
  // Aprovar um produto enviado por usuário
  async approveProduct(productId: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('Tentando aprovar produto:', productId);
      
      // Obter os dados do produto submetido
      const { data: submittedProduct, error: fetchError } = await supabase
        .from('submitted_products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (fetchError || !submittedProduct) {
        console.error('Erro ao buscar produto submetido:', fetchError);
        return { success: false, error: fetchError };
      }
      
      console.log('Produto submetido encontrado:', submittedProduct);
      
      // Inserir o produto na tabela de recomendados
      const { error: insertError } = await supabase
        .from('recommended_products')
        .insert({
          name: submittedProduct.name,
          description: submittedProduct.description,
          benefits: submittedProduct.benefits,
          price: submittedProduct.price,
          rating: 5.0, // Rating padrão inicial
          image: submittedProduct.image,
          category: submittedProduct.category,
          eliteBadge: submittedProduct.eliteBadge,
          topPick: submittedProduct.topPick,
          status: 'aprovado',
          addedByAdmin: false,
          addedAt: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          sales_url: submittedProduct.salesUrl || submittedProduct.sales_url
        });
      
      if (insertError) {
        console.error('Erro ao inserir produto na tabela de recomendados:', insertError);
        return { success: false, error: insertError };
      }
      
      // Remover da tabela de produtos pendentes
      const { error: deleteError } = await supabase
        .from('submitted_products')
        .delete()
        .eq('id', productId);
      
      if (deleteError) {
        console.error('Erro ao remover produto pendente:', deleteError);
        // Não falha a operação, pois o produto já foi aprovado
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao aprovar produto:', error);
      return { success: false, error };
    }
  },
  
  // Rejeitar um produto enviado por usuário
  async rejectProduct(productId: string): Promise<{ success: boolean, error: any }> {
    try {
      const { error } = await supabase
        .from('submitted_products')
        .update({ 
          status: 'rejeitado',
          updatedAt: new Date().toISOString()
        })
        .eq('id', productId);
      
      return { success: !error, error };
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      return { success: false, error };
    }
  },
  
  // Adicionar um novo produto recomendado (pelo admin)
  async addProduct(product: Omit<Product, 'rating'>): Promise<{ success: boolean, error: any }> {
    try {
      console.log('Tentando adicionar produto:', product);
      
      // Extrair salesUrl do produto
      const { salesUrl, ...productData } = product;
      
      const { error } = await supabase
        .from('recommended_products')
        .insert({
          ...productData,
          rating: 5.0, // Rating padrão para produtos adicionados pelo admin
          status: 'aprovado',
          addedByAdmin: true,
          addedAt: new Date().toISOString(),
          sales_url: salesUrl // Usar sales_url (snake_case) para o banco de dados
        });
      
      console.log('Resultado da inserção:', { error });
      
      // Se ocorreu um erro devido a tabela não existir, informe ao usuário
      if (error && (error.message.includes('does not exist') || error.code === '42P01')) {
        console.error('Tabela recommended_products não existe. Configure o banco de dados primeiro.');
        return { 
          success: false, 
          error: { 
            message: 'A tabela de produtos ainda não foi configurada. Execute o script SQL no Supabase.' 
          } 
        };
      }
      
      return { success: !error, error };
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return { success: false, error };
    }
  },
  
  // Remover um produto recomendado
  async removeProduct(productId: string): Promise<{ success: boolean, error: any }> {
    try {
      const { error } = await supabase
        .from('recommended_products')
        .delete()
        .eq('id', productId);
      
      return { success: !error, error };
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      return { success: false, error };
    }
  },

  // Verificar se as tabelas necessárias existem
  async checkTablesExist(): Promise<{ 
    recommendedProductsExists: boolean, 
    submittedProductsExists: boolean 
  }> {
    try {
      // Testar se a tabela recommended_products existe
      const { error: recommendedError } = await supabase
        .from('recommended_products')
        .select('id')
        .limit(1);
      
      // Testar se a tabela submitted_products existe
      const { error: submittedError } = await supabase
        .from('submitted_products')
        .select('id')
        .limit(1);
      
      return {
        recommendedProductsExists: !recommendedError || !recommendedError.message.includes('does not exist'),
        submittedProductsExists: !submittedError || !submittedError.message.includes('does not exist')
      };
    } catch (error) {
      console.error('Erro ao verificar existência das tabelas:', error);
      return { recommendedProductsExists: false, submittedProductsExists: false };
    }
  },

  // Função para depuração detalhada da estrutura e acesso às tabelas
  async debugProductsAccess(): Promise<any> {
    const diagnosticData: any = {
      timestamp: new Date().toISOString(),
      session: null,
      recommended: {
        exists: false,
        count: 0,
        error: null,
        firstProduct: null,
        columns: null
      },
      submitted: {
        exists: false,
        count: 0,
        error: null,
        firstProduct: null,
        columns: null
      }
    };
    
    try {
      // Verificar sessão atual
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      diagnosticData.session = { session, error: sessionError };
      
      // Verificar tabela recommended_products
      try {
        // Verificar se a tabela existe
        const { data: recommendedProducts, error: recommendedError } = await supabase
          .from('recommended_products')
          .select('*')
          .limit(1);
        
        if (recommendedError) {
          diagnosticData.recommended.error = recommendedError;
        } else {
          diagnosticData.recommended.exists = true;
          diagnosticData.recommended.firstProduct = recommendedProducts?.[0] || null;
          
          // Contar produtos na tabela
          const { count, error: countError } = await supabase
            .from('recommended_products')
            .select('*', { count: 'exact', head: true });
          
          diagnosticData.recommended.count = count || 0;
          
          // Verificar estrutura da tabela
          const { data: columns } = await supabase.rpc('get_table_info', { 
            input_table_name: 'recommended_products' 
          });
          
          diagnosticData.recommended.columns = columns;
        }
      } catch (e) {
        diagnosticData.recommended.error = e;
      }
      
      // Verificar tabela submitted_products
      try {
        // Verificar se a tabela existe
        const { data: submittedProducts, error: submittedError } = await supabase
          .from('submitted_products')
          .select('*')
          .limit(1);
        
        if (submittedError) {
          diagnosticData.submitted.error = submittedError;
        } else {
          diagnosticData.submitted.exists = true;
          diagnosticData.submitted.firstProduct = submittedProducts?.[0] || null;
          
          // Contar produtos na tabela
          const { count, error: countError } = await supabase
            .from('submitted_products')
            .select('*', { count: 'exact', head: true });
          
          diagnosticData.submitted.count = count || 0;
          
          // Verificar estrutura da tabela
          const { data: columns } = await supabase.rpc('get_table_info', { 
            input_table_name: 'submitted_products' 
          });
          
          diagnosticData.submitted.columns = columns;
        }
      } catch (e) {
        diagnosticData.submitted.error = e;
      }
    } catch (e) {
      diagnosticData.error = e;
    }
    
    return diagnosticData;
  },

  // Obter informações sobre a estrutura da tabela
  async getTableInfo(tableName: string): Promise<{ data: any, error: any }> {
    try {
      console.log(`Obtendo informações da tabela ${tableName}`);
      
      // Consultar estrutura da tabela
      const { data: columns, error: columnsError } = await supabase.rpc(
        'get_table_info',
        { table_name: tableName }
      );
      
      if (columnsError) {
        // Se a função RPC falhar, tente um método alternativo
        console.log('Função RPC falhou, tentando consulta direta');
        
        // Verificar se a tabela existe
        const { data: tableExists, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        // Buscar um registro para ver sua estrutura
        const sampleData = tableExists && tableExists.length > 0 
          ? tableExists[0] 
          : null;
        
        return {
          data: {
            exists: !tableError,
            sampleData: sampleData,
            columnNames: sampleData ? Object.keys(sampleData) : [],
            error: tableError
          },
          error: tableError
        };
      }
      
      return { data: columns, error: null };
    } catch (error) {
      console.error(`Erro ao obter informações da tabela ${tableName}:`, error);
      return { data: null, error };
    }
  },

  // Executar script de correção automática
  async runFixScript(): Promise<{ success: boolean, error: any }> {
    try {
      console.log('Executando script de correção automática...');
      
      // Executar RPC para corrigir problemas comuns
      const { data, error } = await supabase.rpc('fix_product_tables_issues');
      
      if (error) {
        console.error('Erro ao executar script de correção:', error);
        
        // Se a função RPC não existir, tentar criar o script diretamente
        const scriptContent = `
          DO $$
          DECLARE
              userId_exists BOOLEAN;
              user_id_exists BOOLEAN;
              submittedAt_exists BOOLEAN;
              submitted_at_exists BOOLEAN;
              updatedAt_exists BOOLEAN;
              updated_at_exists BOOLEAN;
          BEGIN
              -- Verificar se as tabelas existem
              CREATE TABLE IF NOT EXISTS recommended_products (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                benefits TEXT[] NOT NULL DEFAULT '{}',
                price TEXT NOT NULL,
                rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
                image TEXT NOT NULL,
                category TEXT NOT NULL,
                "eliteBadge" BOOLEAN DEFAULT FALSE,
                "topPick" BOOLEAN DEFAULT FALSE,
                status TEXT DEFAULT 'aprovado',
                "addedByAdmin" BOOLEAN DEFAULT FALSE,
                "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                "approvedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );

              CREATE TABLE IF NOT EXISTS submitted_products (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                benefits TEXT[] NOT NULL DEFAULT '{}',
                price TEXT NOT NULL,
                rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
                image TEXT NOT NULL,
                category TEXT NOT NULL,
                "eliteBadge" BOOLEAN DEFAULT FALSE,
                "topPick" BOOLEAN DEFAULT FALSE,
                "userId" UUID REFERENCES auth.users(id),
                user_id UUID REFERENCES auth.users(id),
                status TEXT NOT NULL DEFAULT 'pendente',
                "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
              );
              
              -- Verificar se as colunas userId existem e converter caso necessário
              SELECT EXISTS (
                 SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'submitted_products'
                   AND column_name = 'userId'
              ) INTO userId_exists;
              
              SELECT EXISTS (
                 SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'submitted_products'
                   AND column_name = 'user_id'
              ) INTO user_id_exists;
              
              -- Corrigir userId/user_id
              IF NOT userId_exists AND user_id_exists THEN
                  ALTER TABLE submitted_products RENAME COLUMN user_id TO "userId";
                  RAISE NOTICE 'Renomeada coluna user_id para userId';
              ELSIF NOT user_id_exists AND userId_exists THEN
                  ALTER TABLE submitted_products ADD COLUMN user_id UUID;
                  UPDATE submitted_products SET user_id = "userId";
                  RAISE NOTICE 'Adicionada coluna user_id espelhando userId';
              END IF;
              
              -- Corrigir submittedAt/submitted_at
              SELECT EXISTS (
                 SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'submitted_products'
                   AND column_name = 'submittedAt'
              ) INTO submittedAt_exists;
              
              SELECT EXISTS (
                 SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'submitted_products'
                   AND column_name = 'submitted_at'
              ) INTO submitted_at_exists;
              
              IF NOT submittedAt_exists AND submitted_at_exists THEN
                  ALTER TABLE submitted_products RENAME COLUMN submitted_at TO "submittedAt";
                  RAISE NOTICE 'Renomeada coluna submitted_at para submittedAt';
              ELSIF NOT submitted_at_exists AND submittedAt_exists THEN
                  ALTER TABLE submitted_products ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                  UPDATE submitted_products SET submitted_at = "submittedAt";
                  RAISE NOTICE 'Adicionada coluna submitted_at espelhando submittedAt';
              END IF;
              
              -- Corrigir updatedAt/updated_at
              SELECT EXISTS (
                 SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'submitted_products'
                   AND column_name = 'updatedAt'
              ) INTO updatedAt_exists;
              
              SELECT EXISTS (
                 SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                   AND table_name = 'submitted_products'
                   AND column_name = 'updated_at'
              ) INTO updated_at_exists;
              
              IF NOT updatedAt_exists AND updated_at_exists THEN
                  ALTER TABLE submitted_products RENAME COLUMN updated_at TO "updatedAt";
                  RAISE NOTICE 'Renomeada coluna updated_at para updatedAt';
              ELSIF NOT updated_at_exists AND updatedAt_exists THEN
                  ALTER TABLE submitted_products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                  UPDATE submitted_products SET updated_at = "updatedAt";
                  RAISE NOTICE 'Adicionada coluna updated_at espelhando updatedAt';
              END IF;
              
              -- Verificar e corrigir RLS policies
              ALTER TABLE recommended_products ENABLE ROW LEVEL SECURITY;
              ALTER TABLE submitted_products ENABLE ROW LEVEL SECURITY;
              
              -- Adicionar políticas
              DROP POLICY IF EXISTS "Produtos recomendados visíveis para todos" ON recommended_products;
              CREATE POLICY "Produtos recomendados visíveis para todos" 
              ON recommended_products FOR SELECT USING (true);
              
              DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos recomendados" ON recommended_products;
              CREATE POLICY "Apenas administradores podem gerenciar produtos recomendados" 
              ON recommended_products FOR ALL 
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid() 
                  AND profiles.role = 'admin'
                )
              );
              
              DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;
              CREATE POLICY "Usuários podem ver seus próprios produtos enviados" 
              ON submitted_products FOR SELECT 
              USING (
                auth.uid() = "userId" OR 
                auth.uid() = user_id OR
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid() 
                  AND profiles.role = 'admin'
                )
              );
              
              DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;
              CREATE POLICY "Administradores podem ver todos os produtos enviados" 
              ON submitted_products FOR SELECT 
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid() 
                  AND profiles.role = 'admin'
                )
              );
              
              DROP POLICY IF EXISTS "Usuários podem enviar novos produtos" ON submitted_products;
              CREATE POLICY "Usuários podem enviar novos produtos" 
              ON submitted_products FOR INSERT 
              WITH CHECK (
                auth.uid() = "userId" OR
                auth.uid() = user_id
              );
              
              DROP POLICY IF EXISTS "Administradores podem atualizar qualquer produto enviado" ON submitted_products;
              CREATE POLICY "Administradores podem atualizar qualquer produto enviado" 
              ON submitted_products FOR UPDATE 
              USING (
                EXISTS (
                  SELECT 1 FROM profiles 
                  WHERE profiles.id = auth.uid() 
                  AND profiles.role = 'admin'
                )
              );
          END $$;
        `;
        
        // Executar o script diretamente 
        const { error: sqlError } = await supabase.rpc('exec_sql', { 
          sql: scriptContent 
        });
        
        if (sqlError) {
          if (sqlError.message.includes('function "exec_sql" does not exist')) {
            console.log('A função exec_sql não existe. Usando método alternativo.');
            
            // Criar e executar scripts individualmente
            await this.executeFixCommands();
            return { success: true, error: null };
          }
          
          return { success: false, error: sqlError };
        }
        
        return { success: true, error: null };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao corrigir problemas:', error);
      return { success: false, error };
    }
  },
  
  // Executar comandos específicos para corrigir problemas comuns
  async executeFixCommands(): Promise<boolean> {
    try {
      // Verificar se a tabela submitted_products existe
      const { data: tableExists } = await supabase
        .from('submitted_products')
        .select('count(*)')
        .limit(1);
      
      if (!tableExists) {
        // Tentar criar a tabela
        await supabase.rpc('create_submitted_products_table');
        console.log('Tabela submitted_products criada.');
      }
      
      // Atualizar políticas de segurança
      await supabase.rpc('fix_submitted_products_policies');
      console.log('Políticas de segurança atualizadas.');
      
      return true;
    } catch (error) {
      console.error('Erro ao executar comandos de correção:', error);
      return false;
    }
  }
}; 