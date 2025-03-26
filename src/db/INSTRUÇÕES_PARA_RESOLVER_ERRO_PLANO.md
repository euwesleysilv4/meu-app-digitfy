# INSTRUÇÕES PARA RESOLVER O ERRO DE ATUALIZAÇÃO DE PLANO

Este documento contém instruções passo a passo para resolver o erro relacionado à coluna `data_expiracao_plano` que está causando falhas na atualização de planos de usuários.

## O PROBLEMA

Quando tentamos atualizar o plano de um usuário, recebemos o seguinte erro:

```
Erro na atualização do plano: column "data_expiracao_plano" does not exist
```

Isto ocorre porque:
1. A coluna `data_expiracao_plano` foi removida da tabela `profiles`
2. Mas continua sendo referenciada em funções RPC, gatilhos ou outros componentes do banco de dados

## SOLUÇÃO COMPLETA (PASSO A PASSO)

Siga estas instruções na ordem exata para implementar a solução:

### 1. Criar as Funções SQL Especiais

1. Acesse o painel administrativo do Supabase: https://app.supabase.io
2. Navegue até o seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo `create_direct_plan_functions.sql`
6. Clique em "RUN" para executar o script
7. Verifique se não houve erros na execução

### 2. Criar a Tabela de Logs de Alteração de Plano

1. Ainda no SQL Editor, crie uma nova consulta
2. Cole o conteúdo do arquivo `create_plan_change_logs.sql`
3. Clique em "RUN" para executar o script
4. Verifique se não houve erros na execução

### 3. Atualizar o Frontend

O frontend já está atualizado com a nova implementação. Certifique-se de que está usando a versão mais recente do código.

## COMO TESTAR

1. Acesse a interface de administração de usuários
2. Selecione um usuário
3. Tente alterar o plano para outro valor

Se o problema persistir, abra o console do navegador (F12) para verificar os logs e ver qual camada está falhando.

## VERIFICAÇÃO DO BANCO DE DADOS

Se mesmo com todas as alterações o problema persistir, faça uma verificação profunda do banco de dados:

1. Execute estas consultas no SQL Editor para identificar a fonte do problema:

```sql
-- Verificar todos os gatilhos na tabela profiles
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- Verificar todas as funções que mencionam a coluna problemática
SELECT p.proname, p.prosrc 
FROM pg_proc p 
WHERE p.prosrc LIKE '%data_expiracao_plano%';

-- Verificar todas as policies que possam estar relacionadas
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';
```

2. Se encontrar referências à coluna `data_expiracao_plano`, você precisará:
   - Remover ou atualizar os gatilhos problemáticos
   - Atualizar as funções que usam essa coluna
   - Modificar as policies relacionadas

## SOLUÇÃO MANUAL DE EMERGÊNCIA

Se você precisar atualizar o plano de um usuário urgentemente e nenhuma das soluções automáticas funcionar:

1. Execute o seguinte SQL diretamente no SQL Editor, substituindo os valores conforme necessário:

```sql
-- Força a atualização direta ignorando todas as restrições
UPDATE profiles 
SET plano = 'nome_do_plano' -- substitua por 'gratuito', 'member', 'pro' ou 'elite'
WHERE id = 'id_do_usuario';  -- substitua pelo ID do usuário
```

## CONTATO PARA SUPORTE

Se você continuar enfrentando problemas após seguir todas estas etapas, entre em contato com a equipe de desenvolvimento para assistência adicional. 