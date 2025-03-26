# Sistema de Gerenciamento de Planos

Este diretório contém scripts SQL e documentação para o novo sistema de gerenciamento de planos implementado para resolver problemas com a coluna `data_expiracao_plano`.

## O problema

O sistema anterior utilizava uma coluna chamada `data_expiracao_plano` que foi removida do banco de dados, mas continuava sendo referenciada em funções RPC do Supabase, gatilhos ou outros componentes internos, causando erros na atualização de planos.

## A solução

Criamos um sistema completo com múltiplas camadas de fallback:

1. Funções SQL de contorno - funções que evitam completamente os gatilhos e validações
2. Métodos de emergência - abordagens alternativas para quando o método principal falhar
3. Reset radical - último recurso que recria o perfil do usuário preservando dados essenciais

### Arquivos importantes

1. `create_plan_change_logs.sql` - Cria a tabela de logs para registro de alterações de plano
2. `create_direct_plan_functions.sql` - Cria funções SQL especiais para contornar os problemas

## Instalação

Para instalar este sistema completo, siga os passos abaixo:

1. **Criar tabela de logs**
   - Execute o script SQL `create_plan_change_logs.sql` no Editor SQL do Supabase

2. **Criar funções especiais**
   - Execute o script SQL `create_direct_plan_functions.sql` no Editor SQL do Supabase

3. **Atualizar o código do frontend**
   - O código já foi implementado no frontend

## Sistema em Camadas

Este sistema utiliza uma abordagem em camadas para garantir que a atualização de planos funcione mesmo em condições adversas:

### Camada 1: Método Direto (update_plan_direct)

Função SQL que contorna o ORM do Supabase e executa a atualização diretamente, evitando quaisquer gatilhos.

```sql
-- Execute o SQL diretamente, ignorando gatilhos e validações
UPDATE public.profiles SET plano = $1, data_modificacao = NOW() WHERE id = $2
```

### Camada 2: Método de Emergência

Se o método direto falhar, tentamos executar SQL nativo para garantir a atualização:

```typescript
// Tentativa 1: Usando função SQL personalizada
await supabase.rpc('execute_sql', { 
  sql_query: `UPDATE profiles SET plano = '${newPlan}' WHERE id = '${userId}'` 
});

// Tentativa 2: Usando a API mais básica do Supabase
await supabase.from('profiles').update({ plano: newPlan }).eq('id', userId);
```

### Camada 3: Reset Radical

Se todas as outras abordagens falharem, fazemos um reset completo do perfil:

```sql
-- Backup dos dados essenciais
-- Deletar o perfil completamente 
-- Recriar com os dados essenciais e o novo plano
```

## Como Usar

```typescript
import { planService } from '../services/planService';

// Tenta atualizar o plano usando todas as estratégias disponíveis
const { success, error } = await planService.updatePlan(userId, 'pro');

if (success) {
  // Plano atualizado com sucesso
  console.log('Plano atualizado!');
} else {
  // Falha em todas as tentativas
  console.error('Não foi possível atualizar o plano:', error);
}
```

## Solução de Problemas

### A atualização de plano ainda falha

Se a atualização de plano ainda falhar após todas as tentativas:

1. Verifique os logs do console para identificar qual camada está falhando
2. Execute o script SQL manualmente no Editor SQL do Supabase:

```sql
UPDATE profiles SET plano = 'nome_do_plano' WHERE id = 'id_do_usuario';
```

3. Considere uma verificação mais profunda do banco de dados para identificar gatilhos ou restrições problemáticas:

```sql
-- Listar todos os gatilhos na tabela profiles
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- Listar todas as funções que mencionam data_expiracao_plano
SELECT p.proname, p.prosrc 
FROM pg_proc p 
WHERE p.prosrc LIKE '%data_expiracao_plano%';
```

# INSTRUÇÕES PARA RESOLUÇÃO DOS PROBLEMAS DE PLANO

Este documento contém instruções atualizadas para resolver os problemas relacionados à atualização de planos de usuários.

## IMPLEMENTAÇÃO COMPLETA (PASSO A PASSO)

Siga estas instruções na ordem exata para implementar a solução:

### 1. Remover Referências à Coluna data_expiracao_plano

1. Acesse o painel administrativo do Supabase
2. Navegue até o SQL Editor
3. Crie uma nova consulta
4. Cole o conteúdo do arquivo `fix_data_expiracao_references.sql`
5. Execute o script
6. Verifique se não houve erros na execução
7. Observe os logs para ver quais funções foram encontradas e removidas

### 2. Criar as Funções de Metadados (V2)

1. Acesse o painel administrativo do Supabase
2. Navegue até o SQL Editor
3. Crie uma nova consulta
4. Cole o conteúdo do arquivo `create_metadata_functions.sql`
5. Execute o script
6. Verifique se não houve erros na execução

### 3. Criar as Funções de Atualização Direta (V2)

1. Ainda no SQL Editor, crie uma nova consulta
2. Cole o conteúdo do arquivo `create_direct_plan_functions_v2.sql`
3. Execute o script
4. Verifique se não houve erros na execução

### 4. Criar a Tabela de Logs de Alteração de Plano

1. Ainda no SQL Editor, crie uma nova consulta
2. Cole o conteúdo do arquivo `create_plan_change_logs.sql`
3. Execute o script
4. Verifique se não houve erros na execução

### 5. Verifique a instalação das funções

Execute estas consultas para confirmar que as funções V2 foram instaladas corretamente:

```sql
-- Verificar todas as funções V2 relacionadas a planos
SELECT p.proname, pg_get_functiondef(p.oid) 
FROM pg_proc p 
WHERE p.proname LIKE '%_v2' 
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verificar o trigger de sincronização
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_name = 'sync_plan_trigger_v2';
```

## ATUALIZAÇÃO 26/03/2025: CORREÇÃO DE PROBLEMAS DE TIPAGEM

Foram feitas as seguintes correções para resolver problemas de tipagem com a coluna `plano`:

1. As funções SQL agora utilizam conversão explícita para o tipo `user_plan`:
   ```sql
   -- Antes:
   SET plano = new_plan
   
   -- Depois:
   SET plano = new_plan::user_plan
   ```

2. A função `sync_user_plan_v2` agora converte explicitamente o valor para TEXT:
   ```sql
   -- Antes:
   SELECT plano INTO current_plan
   
   -- Depois:
   SELECT plano::TEXT INTO current_plan
   ```

3. No frontend, todas as referências ao plano agora usam conversão explícita para o tipo `UserPlan`:
   ```typescript
   // Antes:
   handlePlanUpdate(selectedUser.id, plan);
   
   // Depois:
   handlePlanUpdate(selectedUser.id, plan as UserPlan);
   ```

## ATUALIZAÇÃO 27/03/2025: REMOÇÃO DE FUNÇÕES ANTIGAS

Foi adicionado um script para remover todas as funções antigas que possam estar referenciando a coluna `data_expiracao_plano`:

1. O script `fix_data_expiracao_references.sql` remove:
   - Funções `update_user_plan` e `force_update_user_plan` (sem o sufixo v2)
   - Função `sync_user_plan` (sem o sufixo v2)
   - Gatilho `sync_plan_trigger` e sua função associada
   - Funções `update_plan` que possam existir
   - A coluna `data_expiracao_plano` se ainda existir

2. Para verificar funções sem removê-las, você pode usar o script `list_functions_using_data_expiracao.sql`

Essas alterações garantem que não ocorram problemas de incompatibilidade de tipos entre o valor enviado pelo frontend e o tipo esperado no banco de dados.

## TESTES DAS FUNÇÕES

Para testar as funções, você pode executar estas consultas no SQL Editor:

```sql
-- Teste da função sync_user_plan_v2
SELECT public.sync_user_plan_v2('ID_DO_USUARIO_AQUI');

-- Teste da função update_plan_direct_v2
SELECT public.update_plan_direct_v2('ID_DO_USUARIO_AQUI', 'member');

-- Verificar se o plano foi atualizado
SELECT id, nome, plano FROM public.profiles WHERE id = 'ID_DO_USUARIO_AQUI';

-- Verificar se o plano foi sincronizado com auth.users
SELECT id, raw_user_meta_data->>'plano' as plano FROM auth.users 
WHERE id = 'ID_DO_USUARIO_AQUI';
```

## VERIFICAÇÃO DE CONFLITOS

Se você tiver problemas com funções ou gatilhos conflitantes, execute:

```sql
-- Verificar todas as funções relacionadas a planos
SELECT p.proname
FROM pg_proc p 
WHERE p.proname LIKE '%plan%' 
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Verificar todos os gatilhos na tabela profiles
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';
```

## COMO TESTAR NA APLICAÇÃO

1. Acesse a página de atualização de plano
2. Selecione um plano diferente do atual
3. Verifique no console do navegador (F12) os logs de execução
4. Confirme se o plano foi atualizado corretamente em:
   - Página de dashboard
   - Perfil do usuário
   - Banco de dados (ambas as tabelas: profiles e auth.users)

## SOLUÇÃO DE PROBLEMAS

Se continuar enfrentando problemas após seguir todas estas etapas:

1. Limpe o cache do navegador e faça login novamente
2. Verifique os logs do servidor para identificar erros
3. Execute a função de reparo em todos os usuários:
   ```sql
   SELECT public.repair_all_user_plans();
   ```
4. Se necessário, use a função de emergência para executar SQL direto:
   ```sql
   SELECT public.execute_sql_safe('
     UPDATE public.profiles 
     SET plano = ''member'', data_modificacao = NOW() 
     WHERE id = ''ID_DO_USUARIO_AQUI''
   ');
   ```

## NOVA ARQUITETURA DE PLANOS

A nova implementação utiliza uma abordagem em camadas:

1. **Camada normal**: Tenta atualizar via função RPC `update_plan_direct_v2`
2. **Camada de emergência**: Se a primeira falhar, tenta o reset radical com `reset_and_update_plan_v2`
3. **Sincronização**: Utiliza `sync_user_plan_v2` para garantir consistência entre tabelas
4. **Atualização de sessão**: Força a atualização na sessão atual do usuário

Esta abordagem multicamadas garante maior robustez e tolerância a falhas.

## RESOLUÇÃO PARA O ERRO "column data_expiracao_plano does not exist"

Se você está enfrentando o erro específico `ERROR: 42703: column "data_expiracao_plano" does not exist`, siga este procedimento de emergência:

### PROCEDIMENTO DE EMERGÊNCIA EXTREMA

1. Acesse o painel administrativo do Supabase
2. Navegue até o SQL Editor
3. Crie uma nova consulta
4. Cole o conteúdo do arquivo `execute_emergency_fix.sql`
5. Execute o script (este script realiza operações radicais)
6. Verifique se não houve erros na execução

Este script faz o seguinte:
- Desativa temporariamente TODOS os gatilhos da tabela `profiles`
- Remove TODAS as funções que contenham referência à coluna `data_expiracao_plano`
- Remove todas as funções relacionadas a planos para evitar conflitos
- Remove todos os gatilhos relacionados a sincronização de planos
- Tenta remover a coluna `data_expiracao_plano` (se ainda existir)
- Cria uma função de emergência extrema `emergency_update_plan` que atualiza o plano diretamente
- Recria apenas as funções essenciais V2 sem nenhuma referência à coluna problemática
- Reativa os gatilhos da tabela `profiles`

### Depois de executar o script:

1. Volte para a aplicação e tente atualizar o plano novamente
2. O sistema agora tentará primeiro usar o método de emergência extrema
3. Se ainda houver problemas, use este comando SQL diretamente:

```sql
-- Substitua ID_DO_USUARIO e PLANO_DESEJADO pelos valores reais
UPDATE public.profiles 
SET plano = 'PLANO_DESEJADO'::user_plan, 
    data_modificacao = NOW() 
WHERE id = 'ID_DO_USUARIO';

-- E depois sincronize os metadados
UPDATE auth.users
SET raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object(
        'plano', 'PLANO_DESEJADO', 
        'plano_updated_at', now()
    ) 
WHERE id = 'ID_DO_USUARIO';
```

### Verificação final:

Confirme que a atualização funcionou consultando:

```sql
-- Verificar perfil
SELECT id, nome, plano FROM public.profiles WHERE id = 'ID_DO_USUARIO';

-- Verificar metadados
SELECT id, raw_user_meta_data->>'plano' as plano FROM auth.users WHERE id = 'ID_DO_USUARIO';
``` 