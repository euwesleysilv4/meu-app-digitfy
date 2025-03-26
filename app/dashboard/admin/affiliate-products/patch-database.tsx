'use client';

import React, { useState } from 'react';
import { supabase } from '../../../src/lib/supabase';

export default function PatchDatabase() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const runMigration = async () => {
    setStatus('loading');
    setMessage('Executando migração para adicionar colunas...');

    try {
      // Adicionar coluna platform
      const platformResult = await supabase.rpc('execute_sql', { 
        sql_query: `
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'affiliate_products'
                  AND column_name = 'platform'
              ) THEN
                  ALTER TABLE public.affiliate_products ADD COLUMN platform TEXT DEFAULT 'Hotmart';
              END IF;
          END
          $$;
        `
      });

      if (platformResult.error) {
        throw new Error(`Erro ao adicionar coluna platform: ${platformResult.error.message}`);
      }

      // Adicionar coluna commission_rate
      const commissionResult = await supabase.rpc('execute_sql', { 
        sql_query: `
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'affiliate_products'
                  AND column_name = 'commission_rate'
              ) THEN
                  ALTER TABLE public.affiliate_products ADD COLUMN commission_rate INTEGER DEFAULT 50;
              END IF;
          END
          $$;
        `
      });

      if (commissionResult.error) {
        throw new Error(`Erro ao adicionar coluna commission_rate: ${commissionResult.error.message}`);
      }

      // Adicionar coluna affiliate_link
      const affiliateLinkResult = await supabase.rpc('execute_sql', { 
        sql_query: `
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'affiliate_products'
                  AND column_name = 'affiliate_link'
              ) THEN
                  ALTER TABLE public.affiliate_products ADD COLUMN affiliate_link TEXT DEFAULT '';
              END IF;
          END
          $$;
        `
      });

      if (affiliateLinkResult.error) {
        throw new Error(`Erro ao adicionar coluna affiliate_link: ${affiliateLinkResult.error.message}`);
      }

      // Adicionar coluna vendor_name
      const vendorNameResult = await supabase.rpc('execute_sql', { 
        sql_query: `
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'affiliate_products'
                  AND column_name = 'vendor_name'
              ) THEN
                  ALTER TABLE public.affiliate_products ADD COLUMN vendor_name TEXT DEFAULT '';
              END IF;
          END
          $$;
        `
      });

      if (vendorNameResult.error) {
        throw new Error(`Erro ao adicionar coluna vendor_name: ${vendorNameResult.error.message}`);
      }

      // Adicionar coluna image
      const imageResult = await supabase.rpc('execute_sql', { 
        sql_query: `
          DO $$
          BEGIN
              IF NOT EXISTS (
                  SELECT 1
                  FROM information_schema.columns
                  WHERE table_schema = 'public'
                  AND table_name = 'affiliate_products'
                  AND column_name = 'image'
              ) THEN
                  ALTER TABLE public.affiliate_products ADD COLUMN image TEXT DEFAULT '';
              END IF;
          END
          $$;
        `
      });

      if (imageResult.error) {
        throw new Error(`Erro ao adicionar coluna image: ${imageResult.error.message}`);
      }

      setStatus('success');
      setMessage('Migração concluída com sucesso! Todas as colunas foram adicionadas.');
    } catch (error: any) {
      console.error('Erro na migração:', error);
      setStatus('error');
      setMessage(`Erro na migração: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Correção do Banco de Dados</h1>
        <p className="text-gray-600 mb-6">
          Esta página adiciona colunas necessárias à tabela de produtos de afiliados. 
          Use esta ferramenta se você estiver encontrando erros relacionados a colunas ausentes.
        </p>

        <button
          onClick={runMigration}
          disabled={status === 'loading'}
          className={`px-4 py-2 rounded-lg flex items-center justify-center ${
            status === 'loading' 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {status === 'loading' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Executando migração...
            </>
          ) : (
            'Executar Migração'
          )}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            status === 'success' ? 'bg-green-100 text-green-800' :
            status === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4">
            <a 
              href="/admin/affiliate-products" 
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Voltar para Gestão de Produtos de Afiliados
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 