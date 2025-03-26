# Guia para Correção do Erro no SQL do Supabase

## O Problema

Ao executar o script SQL no Supabase, você encontrou o seguinte erro:

```
ERROR: 42601: only WITH CHECK expression allowed for INSERT
```

Este erro ocorre porque nas políticas de Row Level Security (RLS) do Supabase, há uma diferença importante entre as cláusulas `USING` e `WITH CHECK`:

- A cláusula `USING` é usada para políticas de `SELECT`, `UPDATE` e `DELETE`
- A cláusula `WITH CHECK` é necessária para políticas de `INSERT`

No script original, incorretamente usamos `USING` em políticas de `INSERT`, quando deveríamos ter usado `WITH CHECK`.

## A Solução

Para corrigir o erro, modifique as políticas de `INSERT` substituindo a cláusula `USING` por `WITH CHECK`:

### Política Original (com erro):

```sql
CREATE POLICY "Apenas administradores podem criar desafios"
ON challenges FOR INSERT
USING (  -- Aqui está o erro
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);
```

### Política Corrigida:

```sql
CREATE POLICY "Apenas administradores podem criar desafios"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (  -- Correção aqui
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);
```

## Como Aplicar a Correção

1. Use o arquivo `sql_create_challenges_table_corrigido.sql` para criar as tabelas e políticas
2. Alternativamente, você pode executar os seguintes comandos para corrigir políticas existentes:

```sql
-- Remover as políticas de INSERT originais
DROP POLICY IF EXISTS "Apenas administradores podem criar desafios" ON challenges;
DROP POLICY IF EXISTS "Apenas administradores podem criar etapas" ON challenge_steps;

-- Criar as políticas de INSERT corrigidas com WITH CHECK
CREATE POLICY "Apenas administradores podem criar desafios"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Apenas administradores podem criar etapas"
ON challenge_steps FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);
```

## Explicação Técnica

No PostgreSQL (que é usado pelo Supabase), há duas cláusulas para definir políticas de RLS:

1. **USING**: Define quando uma linha existente é visível em operações de leitura (SELECT) ou pode ser modificada (UPDATE/DELETE).

2. **WITH CHECK**: Define quando uma nova linha pode ser criada por uma operação INSERT ou quando linhas existentes podem ser modificadas por uma operação UPDATE.

Para políticas de INSERT, é necessário usar a cláusula WITH CHECK, pois estamos validando dados que ainda não existem na tabela.

## Verificando Permissões de Admin

Certifique-se de que a coluna `role` exista na tabela `auth.users` do Supabase. Se não existir, você pode precisar modificar as políticas ou criar uma tabela personalizada para armazenar os papéis dos usuários.

Você também pode simplificar e usar uma abordagem diferente para reconhecer administradores, como:

```sql
WITH CHECK (auth.uid() IN (SELECT user_id FROM admins))
```

Onde `admins` seria uma tabela separada com os IDs dos usuários administradores. 