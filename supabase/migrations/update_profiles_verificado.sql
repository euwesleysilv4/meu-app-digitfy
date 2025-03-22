-- Script para atualizar o campo verificado na tabela de perfis

-- Verificar se há perfis com verificado NULL e atualizá-los para FALSE
UPDATE profiles
SET verificado = FALSE
WHERE verificado IS NULL;

-- Atualizar a função handle_new_user para garantir que verificado seja FALSE por padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, verificado)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger existe e recriá-lo se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$; 