'use client';

import React, { useState } from 'react';
import { supabase } from '../../../src/lib/supabase';
import { Check, Database, XCircle, ArrowLeft } from 'lucide-react';

// Script SQL para criar a tabela de submissões
const SQL_MIGRATION = `
-- Tabela para armazenar submissões de produtos de afiliados
CREATE TABLE IF NOT EXISTS public.affiliate_product_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  benefits TEXT[] DEFAULT '{}',
  price NUMERIC(10,2),
  price_display TEXT,
  category TEXT,
  sales_url TEXT,
  commission_rate INTEGER DEFAULT 50,
  affiliate_link TEXT,
  vendor_name TEXT,
  platform TEXT DEFAULT 'Hotmart',
  image TEXT,
  
  -- Campos adicionais de submissão
  submitted_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  submitter_email TEXT,
  submitter_instagram TEXT,
  submitter_message TEXT
);

-- Habilitar Row Level Security
ALTER TABLE public.affiliate_product_submissions ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer usuário autenticado possa enviar produtos
CREATE POLICY "Usuários autenticados podem enviar produtos"
ON public.affiliate_product_submissions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir que usuários vejam apenas suas próprias submissões
CREATE POLICY "Usuários podem ver apenas suas próprias submissões"
ON public.affiliate_product_submissions
FOR SELECT
TO authenticated
USING (
  auth.uid() = submitted_by
);

-- Políticas para permitir que administradores gerenciem todas as submissões
-- Política para SELECT
CREATE POLICY "Administradores podem ver todas as submissões"
ON public.affiliate_product_submissions
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Política para UPDATE
CREATE POLICY "Administradores podem atualizar todas as submissões"
ON public.affiliate_product_submissions
FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Política para DELETE
CREATE POLICY "Administradores podem excluir todas as submissões"
ON public.affiliate_product_submissions
FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Trigger para atualizar o campo de data/hora ao alterar o status
CREATE OR REPLACE FUNCTION update_affiliate_submission_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    NEW.reviewed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_review_timestamp
BEFORE UPDATE ON public.affiliate_product_submissions
FOR EACH ROW
EXECUTE FUNCTION update_affiliate_submission_review_timestamp();
`;

export default function ExecuteMigration() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: any;
  } | null>(null);

  const handleExecuteMigration = async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: SQL_MIGRATION });
      
      if (error) {
        setResult({
          success: false,
          message: `Erro ao executar a migração: ${error.message}`,
          error
        });
      } else {
        setResult({
          success: true,
          message: 'Migração executada com sucesso! A tabela de submissões de afiliados foi criada.'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Exceção ao executar a migração: ${error.message}`,
        error
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center">
          <a 
            href="/dashboard/admin/affiliate-submissions"
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </a>
          <h1 className="text-2xl font-bold flex items-center">
            <Database className="h-6 w-6 text-indigo-600 mr-2" />
            Executar Migração da Tabela de Submissões
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Esta página irá criar a tabela para armazenar as submissões de produtos de afiliados
            e configurar todas as permissões de segurança necessárias.
          </p>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">O script irá:</h3>
            <ul className="list-disc ml-6 space-y-1 text-gray-600">
              <li>Criar a tabela <code>affiliate_product_submissions</code></li>
              <li>Configurar Row Level Security (RLS)</li>
              <li>Criar políticas de acesso para usuários e administradores</li>
              <li>Configurar triggers para atualização automática de timestamps</li>
            </ul>
          </div>
          
          {result && (
            <div className={`p-4 rounded-lg mb-6 ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'Sucesso!' : 'Erro'}
                  </p>
                  <p className={`mt-1 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {!result.success && result.error && (
                    <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto text-red-900">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <a
              href="/dashboard/admin/affiliate-submissions"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voltar
            </a>
            
            <button
              onClick={handleExecuteMigration}
              disabled={isExecuting || Boolean(result?.success)}
              className={`px-4 py-2 rounded-lg flex items-center ${
                isExecuting 
                  ? 'bg-indigo-400 text-white cursor-not-allowed' 
                  : (result && result.success)
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Executando...
                </>
              ) : (result && result.success) ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Concluído
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-2" />
                  Executar Migração
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Scripts SQL</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-96">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {SQL_MIGRATION}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 