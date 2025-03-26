-- Script para corrigir problemas com triggers

-- Primeiro remover os triggers existentes
DROP TRIGGER IF EXISTS ebooks_updated_at ON public.ebooks;
DROP TRIGGER IF EXISTS update_ebooks_updated_at ON public.ebooks;
DROP TRIGGER IF EXISTS update_ebook_suggestions_updated_at ON public.ebook_suggestions;

-- Verificar se a função de atualização existe e recriá-la
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar os triggers corretamente
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ebook_suggestions_updated_at
BEFORE UPDATE ON public.ebook_suggestions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Verificar se o trigger foi criado corretamente
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.ebook_suggestions'::regclass; 