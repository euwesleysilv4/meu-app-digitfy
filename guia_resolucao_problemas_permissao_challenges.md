# Guia para Resolução de Problemas de Permissão no Gerenciador de Desafios

## Problema Encontrado

Você está enfrentando erros de permissão ao tentar realizar operações como adicionar, editar ou desativar desafios. O erro específico que aparece é:

```
Erro ao atualizar status do desafio: 
{ code: "42501", details: null, hint: null, message: "permission denied for table users" }
```

Este erro indica que as políticas de segurança (Row Level Security - RLS) no Supabase não estão configuradas corretamente ou não estão concedendo as permissões necessárias para o usuário atual.

## Causas do Problema

Este tipo de erro geralmente ocorre por um dos seguintes motivos:

1. **Políticas RLS incorretas ou inexistentes**: As tabelas `challenges` e `challenge_steps` precisam ter políticas de segurança que permitam operações de inserção, atualização e exclusão para usuários administradores.

2. **Verificação de admin incorreta**: O método usado para verificar se um usuário é administrador pode estar incorreto ou não estar funcionando como esperado.

3. **Problemas na estrutura de dados do JWT**: O token JWT pode não conter as informações necessárias para identificar um usuário como administrador.

4. **Acesso negado à tabela users**: O erro específico "permission denied for table users" indica que o sistema está tentando acessar a tabela de usuários para verificar permissões, mas o token atual não tem permissão para esta tabela.

## Soluções

### Solução 1: Políticas RLS Simplificadas (Recomendada)

Criamos um arquivo SQL (`sql_permissoes_alternativas.sql`) com uma abordagem simplificada que evita o problema de permissão da tabela users:

1. Remove as políticas RLS existentes
2. Cria políticas mais simples que permitem acesso amplo
3. Implementa funções RPC com privilégios elevados para operações sensíveis

Esta solução é a mais recomendada para ambientes onde a segurança interna já é garantida por outros meios, como o uso de um modelo de acesso apenas para administradores.

### Solução 2: Atualizar as Políticas de RLS

Um arquivo SQL (`sql_correcao_politicas_rls.sql`) com as correções necessárias para as políticas RLS tradicionais. Execute este script no Editor SQL do Supabase para corrigir as políticas.

As novas políticas seguem estas regras:
- **SELECT**: Qualquer usuário autenticado pode visualizar desafios e etapas
- **INSERT/UPDATE/DELETE**: Apenas administradores podem modificar os dados

### Solução 3: Verificar a Identificação de Administradores

Existem diferentes maneiras de identificar administradores no Supabase:

#### Opção 1: Usando a coluna `role` na tabela `auth.users`

Verifique se a tabela `auth.users` possui uma coluna `role`. Se não existir, adicione-a:

```sql
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
```

Em seguida, defina usuários específicos como administradores:

```sql
UPDATE auth.users SET role = 'admin' WHERE id = 'ID_DO_USUÁRIO';
```

#### Opção 2: Usando uma tabela de perfis personalizada

Se você já tem uma tabela de perfis com um campo para indicar se um usuário é administrador, modifique as políticas RLS para usar essa informação:

```sql
CREATE POLICY "challenges_insert_policy"
ON "public"."challenges"
FOR INSERT
WITH CHECK ((auth.role() = 'authenticated') AND (auth.uid() IN (
  SELECT user_id FROM profiles WHERE is_admin = true
)));
```

### Solução 4: Usar Funções RPC para Operações Administrativas

A solução mais robusta é criar funções PostgreSQL no Supabase que sejam executadas com privilégios elevados:

```sql
CREATE OR REPLACE FUNCTION toggle_challenge_status(challenge_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER  -- Execute com privilégios do proprietário
AS $$
DECLARE
  current_status BOOLEAN;
BEGIN
  -- Obter status atual
  SELECT is_active INTO current_status
  FROM challenges
  WHERE id = challenge_id;
  
  -- Atualizar com o status oposto
  UPDATE challenges
  SET is_active = NOT current_status
  WHERE id = challenge_id;
END;
$$;
```

## Implementação da Solução

### Passo 1: Execute o script SQL no Supabase

1. Acesse o Dashboard do Supabase
2. Vá para a seção "SQL Editor"
3. Cole o conteúdo do arquivo `sql_permissoes_alternativas.sql`
4. Execute o script

### Passo 2: Verifique se as funções RPC foram criadas

1. No Supabase, vá para "Database" > "Functions"
2. Verifique se as funções `toggle_challenge_status` e `delete_complete_challenge` aparecem na lista
3. Se não aparecerem, verifique se houve algum erro na execução do script

### Passo 3: Teste o funcionamento

1. Faça logout e login novamente para atualizar seu token JWT
2. Acesse a página de administração de desafios
3. Tente ativar/desativar e excluir um desafio para verificar se as funções RPC estão funcionando corretamente

## Verificando o Status Atual

Para verificar suas políticas RLS atuais:

1. Acesse o Dashboard do Supabase
2. Vá para "Database" > "Tables"
3. Selecione a tabela `challenges` ou `challenge_steps`
4. Clique na aba "Policies"
5. Analise as políticas existentes e compare com as recomendadas neste guia

## Suporte Adicional

Se os problemas persistirem, verifique os logs do Supabase para obter mais detalhes sobre as permissões negadas e compartilhe essas informações para obter ajuda adicional. 