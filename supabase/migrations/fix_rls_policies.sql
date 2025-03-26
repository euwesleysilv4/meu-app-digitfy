-- Script para corrigir políticas RLS e garantir visibilidade dos produtos

-- Remover políticas existentes
DROP POLICY IF EXISTS "Produtos de afiliados visíveis para todos" ON public.affiliate_products;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos de afiliados" ON public.affiliate_products;

-- Adicionar política para leitura pública
CREATE POLICY "Produtos de afiliados visíveis para todos"
ON public.affiliate_products
FOR SELECT
USING (true);  -- Permitir que todos possam visualizar todos os produtos

-- Adicionar política para administradores
CREATE POLICY "Apenas administradores podem gerenciar produtos de afiliados"
ON public.affiliate_products
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
); 