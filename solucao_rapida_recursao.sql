-- SOLUÇÃO RÁPIDA PARA PROBLEMAS DE RECURSÃO INFINITA NO SUPABASE
-- Este script foca apenas no essencial para resolver o problema

-- Desativar RLS temporariamente para facilitar operações
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 1. Remover todos os triggers envolvidos na recursão
DROP TRIGGER IF EXISTS sync_plan_trigger_v2 ON public.profiles;
DROP TRIGGER IF EXISTS sync_plan_trigger ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;

-- 2. Remover funções problemáticas
DROP FUNCTION IF EXISTS public.sync_user_plan(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_plan_v2(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_sync_plan_v2() CASCADE;

-- 3. Criar função simplificada para atualizar metadados diretamente
CREATE OR REPLACE FUNCTION public.atualizar_plano(user_id UUID, novo_plano user_plan)
RETURNS BOOLEAN AS $$
BEGIN
    -- Atualizar o perfil sem usar triggers
    UPDATE public.profiles
    SET plano = novo_plano,
        data_modificacao = NOW()
    WHERE id = user_id;
    
    -- Atualizar diretamente os metadados
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'plano', novo_plano::TEXT,
            'plano_updated_at', NOW()
        )
    WHERE id = user_id;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Conceder permissões
GRANT EXECUTE ON FUNCTION public.atualizar_plano TO authenticated;

-- 5. Reativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Criar política RLS simplificada para profiles
-- Remover políticas existentes primeiro
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;

-- Criar políticas simplificadas sem chamadas a funções complexas
CREATE POLICY profiles_select_policy ON public.profiles
    FOR SELECT USING (
        -- Permitir acesso ao próprio perfil ou para administradores
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'::user_role)
    );

CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE USING (
        -- Apenas o próprio usuário ou administradores podem atualizar
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'::user_role)
    );

-- 7. Testar a função (substitua o UUID abaixo por um ID real)
-- SELECT * FROM public.atualizar_plano('31b0c8d6-e3c4-4a7b-9fae-1d8e2bcd0575', 'gratuito'); 