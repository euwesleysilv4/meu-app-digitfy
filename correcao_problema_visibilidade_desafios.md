# Correção do Problema de Visibilidade dos Desafios

## Problemas Encontrados

Você relatou dois problemas específicos:

1. **Desafios desativados continuam visíveis**: Quando você desativa um desafio no painel admin, ele continua sendo exibido na página pública `/dashboard/learning/challenges`.

2. **Novos desafios não aparecem**: Quando você adiciona um novo desafio, ele não aparece na página de desafios.

## Causa do Problema

Após análise, identificamos duas causas principais:

1. **Uso de dados estáticos**: A página `LearningChallenges.tsx` está usando dados estáticos de um array local (`challengesData`) em vez de carregar os desafios diretamente do Supabase.

2. **Possíveis problemas na view ou políticas RLS**: A view `vw_complete_challenges` ou políticas de segurança podem não estar permitindo a visualização correta dos desafios.

## Solução

Criamos uma solução em três partes:

### 1. Script SQL para Corrigir a Visibilidade dos Desafios

Criamos o arquivo `sql_correcao_visibilidade_desafios.sql` que:

- Recria a view `vw_complete_challenges` para garantir que está atualizada
- Cria índices para melhorar performance
- Modifica a função `toggle_challenge_status` para atualizar o timestamp e registrar logs
- Cria uma tabela de logs para facilitar a depuração
- Estabelece políticas RLS corretas para permitir a visualização pública

### 2. Versão Atualizada da Página de Desafios

Criamos uma nova versão da página `LearningChallenges.tsx` que:

- Carrega os desafios diretamente do Supabase em vez de usar dados estáticos
- Filtra apenas desafios ativos (`is_active = true`)
- Adiciona estados de carregamento e tratamento de erros
- Faz log no console dos desafios carregados para depuração

### 3. Orientações para Aplicar as Correções

#### Passo 1: Executar o Script SQL

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Cole o conteúdo do arquivo `sql_correcao_visibilidade_desafios.sql`
4. Execute o script

#### Passo 2: Atualizar o Código da Página de Desafios

1. Substitua o conteúdo do arquivo `src/pages/LearningChallenges.tsx` pelo novo código que criamos
2. Verifique se a importação para o cliente Supabase está correta (deve apontar para `../lib/supabaseClient` ou o caminho equivalente em seu projeto)

#### Passo 3: Testar as Alterações

1. Tente ativar/desativar um desafio no painel administrativo e verifique se a alteração é refletida na página pública
2. Crie um novo desafio e confirme se ele aparece na página pública quando está ativo

## Verificação

Para confirmar que as alterações estão funcionando:

1. Verifique os logs no console do navegador ao acessar a página de desafios
2. Consulte a tabela de logs no Supabase após alterações de status:
   ```sql
   SELECT * FROM logs ORDER BY created_at DESC LIMIT 10;
   ```
3. Confirme que a view está retornando os dados corretos:
   ```sql
   SELECT * FROM vw_complete_challenges WHERE is_active = true;
   ```

Com estas alterações, o sistema agora deve mostrar corretamente apenas os desafios ativos na página pública, e novos desafios devem aparecer imediatamente após serem criados e marcados como ativos. 