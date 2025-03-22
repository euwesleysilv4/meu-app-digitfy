# Sistema de Controle de Acesso Administrativo

Este documento explica o sistema de controle de acesso administrativo implementado no Supabase, que permite apenas o usuário com email **wexxxleycomercial@gmail.com** acessar as funcionalidades de administrador.

## Visão Geral

O sistema implementa:

1. Políticas de Row Level Security (RLS) restritas
2. Funções RPC específicas para o administrador autorizado
3. Log de alterações para auditoria
4. Sistema de verificação de email específico

## Arquivos SQL

Os seguintes arquivos SQL devem ser executados na ordem abaixo:

1. `database/sql/create_profiles_table.sql` - Cria a estrutura básica da tabela profiles
2. `database/sql/admin_access_control.sql` - Implementa o controle de acesso específico para o email autorizado

## Implementação no Supabase

Siga estas etapas para implementar o sistema de controle de acesso:

1. Acesse o painel do Supabase para seu projeto
2. Navegue até a seção "SQL Editor"
3. Crie uma nova consulta
4. Cole o conteúdo do arquivo `admin_access_control.sql`
5. Execute a consulta

### Verificação da Implementação

Após executar o script, verifique se:

1. A função `is_specific_admin()` foi criada
2. As políticas RLS `Administrador específico pode ver todos os perfis` e `Administrador específico pode atualizar todos os perfis` foram criadas
3. A tabela `profile_changes` foi criada
4. O usuário com email wexxxleycomercial@gmail.com foi promovido a administrador

## Como Testar o Sistema

### 1. Verificar se o usuário autorizado existe

```sql
SELECT * FROM profiles WHERE email = 'wexxxleycomercial@gmail.com';
```

Se o usuário não existir, você precisará criá-lo primeiro.

### 2. Teste manual de acesso

Faça login com o usuário autorizado e tente acessar a rota `/dashboard/admin/user-permissions`. Você deve ter acesso.

Faça login com qualquer outro usuário e tente acessar a mesma rota. Você deve ser redirecionado para a página inicial.

### 3. Teste da função is_specific_admin

No SQL Editor do Supabase, execute a consulta abaixo com o token de acesso do usuário autorizado:

```sql
SELECT is_specific_admin();
```

Para o usuário autorizado, isso deve retornar `true`. Para qualquer outro usuário, deve retornar `false`.

## Solução de Problemas

Se o sistema não estiver funcionando como esperado, verifique o seguinte:

### 1. Permissões do RLS

Se nenhum usuário conseguir acessar dados, é possível que as políticas RLS estejam muito restritivas. Você pode desativá-las temporariamente para diagnóstico:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Não se esqueça de reativá-las depois:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Verificar as Políticas RLS

Verifique se as políticas foram criadas corretamente:

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### 3. Verificar se o usuário é administrador

Verifique se o usuário autorizado tem a função de administrador:

```sql
SELECT id, email, role FROM profiles WHERE email = 'wexxxleycomercial@gmail.com';
```

O valor da coluna `role` deve ser `'admin'`.

## Monitoramento

O sistema inclui uma tabela `profile_changes` para monitorar todas as alterações feitas nos perfis dos usuários. Você pode consultar essa tabela para ver o histórico de alterações:

```sql
SELECT * FROM profile_changes ORDER BY change_date DESC;
```

## Segurança Adicional

Para reforçar a segurança:

1. Considere ativar a autenticação de dois fatores (2FA) para a conta do administrador
2. Revise regularmente os logs de acesso do Supabase
3. Monitore a tabela de mudanças para detectar atividades suspeitas
4. Faça backup regular do banco de dados

## Modificação de Usuário Administrador

Se você precisar alterar o email do administrador autorizado, edite a função `is_specific_admin()` no Supabase:

```sql
CREATE OR REPLACE FUNCTION public.is_specific_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND email = 'novo_email_admin@exemplo.com'
  );
$$;
```

Certifique-se de atualizar todas as outras funções que verificam o email específico do administrador. 