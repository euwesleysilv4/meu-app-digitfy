# Sistema de Gerenciamento de Usuários - Supabase

Este diretório contém os scripts SQL e documentação necessários para configurar o sistema de gerenciamento de usuários no Supabase, que permite a administração de permissões e planos dos usuários da plataforma DigitFy.

## Estrutura de Arquivos

- **/sql**: Contém os scripts SQL que devem ser executados no Supabase
  - `create_profiles_table.sql`: Cria a tabela de perfis e configura tipos enumerados
  - `update_user_plan.sql`: Funções para atualizar o plano de um usuário
  - `list_users.sql`: Funções para listar todos os usuários (apenas para administradores)
  - `admin_permissions.sql`: Funções para gerenciar permissões administrativas

## Instalação

1. Acesse o painel de administração do Supabase para o seu projeto
2. Vá para a seção SQL Editor
3. Crie uma nova consulta para cada arquivo SQL
4. Execute os scripts na seguinte ordem:
   - `create_profiles_table.sql`
   - `update_user_plan.sql`
   - `list_users.sql`
   - `admin_permissions.sql`

## Funções RPC Disponíveis

Após a execução dos scripts, as seguintes funções estarão disponíveis para chamada a partir do frontend:

### Administração de Usuários

- `list_all_users(search_term TEXT, filter_plan user_plan)`: Lista todos os usuários com filtros opcionais
- `update_user_plan(user_id UUID, new_plan user_plan)`: Atualiza o plano de um usuário específico
- `is_admin()`: Verifica se o usuário atual é um administrador
- `promote_to_admin(user_id UUID)`: Promove um usuário a administrador
- `update_user_role(user_id UUID, new_role user_role)`: Atualiza o papel de um usuário

## Tipos Enumerados

### user_plan
- `gratuito`: Plano DigitFy Free
- `member`: Plano DigitFy Member
- `pro`: Plano DigitFy Pro
- `elite`: Plano DigitFy Elite

### user_role
- `user`: Usuário comum
- `admin`: Administrador com acesso total
- `moderator`: Moderador com acesso parcial

### user_status
- `online`: Usuário está ativo no sistema
- `offline`: Usuário não está logado

## Políticas de Segurança (RLS)

O sistema implementa as seguintes políticas de segurança:

1. Usuários podem ver e atualizar apenas seus próprios perfis
2. Administradores podem ver e atualizar todos os perfis
3. As funções RPC para gerenciamento de usuários só podem ser executadas por administradores

## Troubleshooting

Se encontrar problemas com as permissões, verifique:

1. Se as políticas RLS estão configuradas corretamente (execute `supabase/fix_rls_policies.sql`)
2. Se o usuário tem o papel `admin` definido na tabela `profiles`
3. Se as funções foram criadas com `SECURITY DEFINER`

Para promover o primeiro administrador, pode ser necessário desativar temporariamente as políticas RLS:

```sql
-- Desativar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Promover um usuário a administrador
UPDATE profiles
SET role = 'admin'
WHERE email = 'seu_email@exemplo.com';

-- Reativar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
``` 