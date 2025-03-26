-- Script para corrigir as permissões da tabela testimonial_gallery
-- Este script verifica se a tabela existe e ajusta as políticas RLS

-- Verificar se a tabela existe
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'testimonial_gallery'
  ) THEN
    -- Dropar políticas existentes para recriar com configurações corretas
    DROP POLICY IF EXISTS "Usuários podem ver apenas imagens aprovadas" ON public.testimonial_gallery;
    DROP POLICY IF EXISTS "Usuários podem enviar suas próprias imagens" ON public.testimonial_gallery;
    DROP POLICY IF EXISTS "Usuários podem ver suas próprias imagens" ON public.testimonial_gallery;
    DROP POLICY IF EXISTS "Administradores podem ver todas as imagens" ON public.testimonial_gallery;
    DROP POLICY IF EXISTS "Administradores podem atualizar todas as imagens" ON public.testimonial_gallery;
    DROP POLICY IF EXISTS "Administradores podem acessar tudo" ON public.testimonial_gallery;
    
    -- Recrear as políticas com configurações otimizadas
    
    -- 1. Política para usuários verem imagens aprovadas (público)
    CREATE POLICY "Usuários podem ver apenas imagens aprovadas"
    ON public.testimonial_gallery
    FOR SELECT
    USING (status = 'approved');
    
    -- 2. Política para usuários enviar suas próprias imagens
    CREATE POLICY "Usuários podem enviar suas próprias imagens"
    ON public.testimonial_gallery
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
    -- 3. Política para usuários verem suas próprias imagens
    CREATE POLICY "Usuários podem ver suas próprias imagens"
    ON public.testimonial_gallery
    FOR SELECT
    USING (auth.uid() = user_id);
    
    -- 4. Política para administradores acessarem tudo (mais abrangente)
    CREATE POLICY "Administradores podem acessar tudo"
    ON public.testimonial_gallery
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    );
    
    -- Verificar e atualizar a função que conta testemunhos pendentes
    CREATE OR REPLACE FUNCTION public.count_pending_testimonials()
    RETURNS INTEGER
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT COUNT(*) FROM public.testimonial_gallery WHERE status = 'pending';
    $$;
    
    -- Atualizar a função que aprova um testemunho
    CREATE OR REPLACE FUNCTION public.approve_testimonial(testimonial_id UUID)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
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
    
    -- Atualizar a função que rejeita um testemunho
    CREATE OR REPLACE FUNCTION public.reject_testimonial(testimonial_id UUID, rejection_notes TEXT DEFAULT NULL)
    RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
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
    
    RAISE NOTICE 'Políticas da tabela testimonial_gallery atualizadas com sucesso!';
  ELSE
    RAISE NOTICE 'A tabela testimonial_gallery não existe no banco de dados.';
  END IF;
END$$; 