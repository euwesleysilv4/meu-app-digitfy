-- Script para excluir políticas existentes antes de recriá-las
-- Executar este script no SQL Editor do Supabase

-- Remover políticas da tabela recommended_products
DROP POLICY IF EXISTS "Produtos recomendados visíveis para todos" ON recommended_products;
DROP POLICY IF EXISTS "Apenas administradores podem gerenciar produtos recomendados" ON recommended_products;

-- Remover políticas da tabela submitted_products
DROP POLICY IF EXISTS "Usuários podem ver seus próprios produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem ver todos os produtos enviados" ON submitted_products;
DROP POLICY IF EXISTS "Usuários podem enviar novos produtos" ON submitted_products;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios produtos pendentes" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem atualizar qualquer produto enviado" ON submitted_products;
DROP POLICY IF EXISTS "Administradores podem excluir qualquer produto enviado" ON submitted_products;

-- Agora, execute o script original 20250322_create_products_tables.sql para recriar as tabelas,
-- políticas e inserir os dados de exemplo.