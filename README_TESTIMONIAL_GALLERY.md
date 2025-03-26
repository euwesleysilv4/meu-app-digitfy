# Sistema de Galeria de Depoimentos

Este documento explica como implementar e utilizar o sistema de galeria de depoimentos criado para o site DigitFy.

## Visão Geral

O sistema permite que os usuários:
1. Enviem prints de vendas ou depoimentos
2. Preencham informações como nome e produto
3. Enviem suas imagens para aprovação

Os administradores podem:
1. Visualizar todas as imagens enviadas
2. Aprovar ou rejeitar as imagens
3. Adicionar notas em caso de rejeição

Apenas as imagens aprovadas são exibidas na galeria pública.

## Nota Importante sobre a Rota

No Dashboard Administrativo, o link para a galeria de depoimentos foi configurado como:
`/dashboard/admin/testimonial-gallery`

Isso é importante para manter consistência com os outros links no painel administrativo. A rota no arquivo App.tsx está configurada como `admin/testimonial-gallery` porque já está dentro do contexto `/dashboard`.

## Implementação no Supabase

### 1. Criar a tabela e funções

Execute o script SQL abaixo no editor SQL do Supabase:

```sql
-- Criar a tabela de galeria de depoimentos para armazenar as imagens dos usuários
CREATE TABLE IF NOT EXISTS public.testimonial_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sale', 'testimonial')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    name TEXT,
    product TEXT,
    submission_message TEXT,
    notes TEXT
);

-- Criar índices para melhorar a performance nas consultas frequentes
CREATE INDEX IF NOT EXISTS testimonial_gallery_user_id_idx ON public.testimonial_gallery(user_id);
CREATE INDEX IF NOT EXISTS testimonial_gallery_status_idx ON public.testimonial_gallery(status);
CREATE INDEX IF NOT EXISTS testimonial_gallery_type_idx ON public.testimonial_gallery(type);
CREATE INDEX IF NOT EXISTS testimonial_gallery_submitted_at_idx ON public.testimonial_gallery(submitted_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.testimonial_gallery ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que usuários vejam apenas imagens aprovadas
CREATE POLICY "Usuários podem ver apenas imagens aprovadas"
ON public.testimonial_gallery
FOR SELECT
USING (status = 'approved');

-- Criar política para permitir que usuários enviem suas próprias imagens
CREATE POLICY "Usuários podem enviar suas próprias imagens"
ON public.testimonial_gallery
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Criar política para permitir que usuários vejam suas próprias imagens independente do status
CREATE POLICY "Usuários podem ver suas próprias imagens"
ON public.testimonial_gallery
FOR SELECT
USING (auth.uid() = user_id);

-- Criar política para permitir que administradores vejam todas as imagens
CREATE POLICY "Administradores podem ver todas as imagens" 
ON public.testimonial_gallery
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Criar política para permitir que administradores atualizem todas as imagens
CREATE POLICY "Administradores podem atualizar todas as imagens" 
ON public.testimonial_gallery
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Criar função para contar testemunhos pendentes (útil para o painel admin)
CREATE OR REPLACE FUNCTION public.count_pending_testimonials()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*) FROM public.testimonial_gallery WHERE status = 'pending';
$$;

-- Criar função para aprovar um testemunho
CREATE OR REPLACE FUNCTION public.approve_testimonial(testimonial_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  result JSONB;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado. Apenas administradores podem aprovar depoimentos.',
      'status', 'error'
    );
  END IF;
  
  -- Aprovar o testemunho
  UPDATE public.testimonial_gallery
  SET status = 'approved',
      approved_at = NOW(),
      approved_by = auth.uid()
  WHERE id = testimonial_id
  AND status = 'pending';
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Depoimento aprovado com sucesso!',
      'status', 'success'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Depoimento não encontrado ou já processado.',
      'status', 'error'
    );
  END IF;
END;
$$;

-- Criar função para rejeitar um testemunho
CREATE OR REPLACE FUNCTION public.reject_testimonial(testimonial_id UUID, rejection_notes TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  result JSONB;
BEGIN
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Acesso negado. Apenas administradores podem rejeitar depoimentos.',
      'status', 'error'
    );
  END IF;
  
  -- Rejeitar o testemunho
  UPDATE public.testimonial_gallery
  SET status = 'rejected',
      approved_at = NOW(),
      approved_by = auth.uid(),
      notes = rejection_notes
  WHERE id = testimonial_id
  AND status = 'pending';
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Depoimento rejeitado com sucesso!',
      'status', 'success'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Depoimento não encontrado ou já processado.',
      'status', 'error'
    );
  END IF;
END;
$$;

-- Criar função para listar depoimentos por status
CREATE OR REPLACE FUNCTION public.list_testimonials_by_status(status_filter TEXT DEFAULT 'approved')
RETURNS SETOF public.testimonial_gallery
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.testimonial_gallery
  WHERE status = status_filter
  ORDER BY submitted_at DESC;
$$;
```

### 2. Verificar a implementação

Após executar o script, verifique se:

1. A tabela `testimonial_gallery` foi criada
2. As políticas de RLS foram configuradas corretamente
3. As funções RPC estão disponíveis no Supabase

## Solucionando problemas com o painel administrativo

Se você estiver encontrando problemas para carregar os depoimentos no painel administrativo, siga estas etapas:

### 1. Verificar permissões RLS

Execute o script `database/sql/fix_testimonial_gallery_permissions.sql` no Supabase, que irá corrigir as políticas de segurança:

```sql
-- Script para corrigir as permissões da tabela testimonial_gallery
DO $$
BEGIN
  -- Remover políticas existentes
  DROP POLICY IF EXISTS "Administradores podem ver todas as imagens" ON public.testimonial_gallery;
  DROP POLICY IF EXISTS "Administradores podem atualizar todas as imagens" ON public.testimonial_gallery;
  DROP POLICY IF EXISTS "Administradores podem acessar tudo" ON public.testimonial_gallery;
  
  -- Adicionar política de acesso total para administradores
  CREATE POLICY "Administradores podem acessar tudo"
  ON public.testimonial_gallery
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
  
  -- Atualizar funções de segurança para maior compatibilidade
  CREATE OR REPLACE FUNCTION public.count_pending_testimonials()
  RETURNS INTEGER
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT COUNT(*) FROM public.testimonial_gallery WHERE status = 'pending';
  $$;
END
$$;
```

### 2. Depuração da API no navegador

O painel administrativo possui ferramentas de depuração embutidas. Se não estiver vendo depoimentos:

1. Clique no botão "Verificar contagem total na tabela" para confirmar que existem depoimentos no banco
2. Clique em "Verificar permissões de acesso" para testar se o usuário atual tem permissão para visualizar os dados
3. Verifique se você está logado como administrador no console do navegador, observando as mensagens com "Status de admin"

### 3. Verificar o relacionamento com a tabela de perfis

Se os depoimentos são exibidos, mas faltam informações de usuário:

1. Certifique-se de que cada `user_id` na tabela `testimonial_gallery` tenha um registro correspondente na tabela `profiles`
2. Verifique se os campos `nome` e `email` existem na tabela `profiles`

### 4. Limpeza de cache e recarregamento

1. Abra as ferramentas de desenvolvedor do navegador (F12)
2. Vá para a aba "Application" e limpe todos os caches
3. Na aba "Network", marque a opção "Disable cache" 
4. Atualize a página com Ctrl+F5 para forçar recarregamento completo

### 5. Ajuste de política para maior permissão

Se ainda houver problemas, você pode temporariamente desativar todas as políticas RLS para depuração:

```sql
-- ATENÇÃO: Use apenas em ambiente de desenvolvimento!
ALTER TABLE public.testimonial_gallery DISABLE ROW LEVEL SECURITY;
```

Lembre-se de reativar as políticas RLS depois:

```sql
ALTER TABLE public.testimonial_gallery ENABLE ROW LEVEL SECURITY;
```

## Componentes principais

O sistema consiste em três componentes principais:

1. **ImageUploadModal** - Modal para usuários enviarem imagens
2. **AffiliateTestimonials** - Página pública para exibir as imagens aprovadas
3. **TestimonialGallery** - Painel de administração para aprovação de imagens

## Uso do sistema

### Usuários comuns:

1. Acessam a página de Galeria de Depoimentos
2. Clicam em "Enviar Imagem"
3. Fazem upload da imagem no PostImage e colam o link
4. Preenchem informações como nome e produto
5. Enviam para aprovação
6. Recebem uma notificação de que a imagem será analisada

### Administradores:

1. Acessam o Painel de Administração
2. Clicam em "Galeria de Depoimentos"
3. Vêem todas as imagens enviadas (pendentes, aprovadas, rejeitadas)
4. Podem filtrar por status e tipo
5. Podem aprovar ou rejeitar imagens pendentes
6. Ao rejeitar, podem adicionar uma nota explicando o motivo

## Fluxo de dados

1. Usuário envia imagem → salva no banco com status "pending"
2. Administrador acessa painel admin → vê todas as imagens pendentes
3. Administrador aprova/rejeita → status atualizado no banco
4. Página pública carrega apenas imagens com status "approved"

## Personalização

O sistema pode ser personalizado de diversas formas:

1. Adicionar mais campos à tabela (como categoria, tags, etc.)
2. Implementar upload direto para o storage do Supabase (em vez de usar PostImage)
3. Adicionar sistema de votação dos depoimentos mais úteis
4. Implementar filtros adicionais na galeria pública

## Solução de problemas

Se os usuários não conseguirem enviar imagens, verifique:

1. Se as políticas RLS estão configuradas corretamente
2. Se o usuário está autenticado antes de tentar enviar
3. Se o formato da URL da imagem é suportado

Se os administradores não conseguirem aprovar/rejeitar, verifique:

1. Se o usuário tem a role 'admin' na tabela profiles
2. Se as funções RPC foram criadas corretamente
3. Se as políticas de administrador estão funcionando

## Manutenção

Recomendações para manutenção do sistema:

1. Verificar regularmente por imagens inadequadas
2. Limpar periodicamente imagens rejeitadas antigas
3. Monitorar o crescimento da tabela e ajustar índices conforme necessário 