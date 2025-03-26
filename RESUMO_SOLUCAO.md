# Solução para o Erro de Permissão no Gerenciador de Desafios

## O Problema

Você está enfrentando o erro `permission denied for table users` ao tentar atualizar o status ou excluir desafios. Este erro específico indica que:

1. O sistema está tentando verificar se você é administrador consultando a tabela `users`
2. Seu token JWT não tem permissão para acessar esta tabela
3. As políticas RLS (Row Level Security) estão bloqueando a operação

## A Solução

Criamos uma solução em três partes:

### 1. Arquivo SQL com Abordagem Alternativa

Criamos o arquivo `sql_permissoes_alternativas.sql` que:

- Remove as políticas RLS existentes que estão causando problemas
- Cria políticas simplificadas para permitir acesso às tabelas
- Implementa funções RPC (Remote Procedure Calls) com privilégios elevados para realizar operações seguras

Estas funções RPC são:
- `toggle_challenge_status`: Para ativar/desativar desafios
- `delete_complete_challenge`: Para excluir desafios e suas etapas

### 2. Código Atualizado no Frontend

Modificamos o código no frontend para usar estas funções RPC ao invés de operar diretamente nas tabelas:

- Função `toggleChallengeStatus` agora usa a RPC `toggle_challenge_status`
- Função `deleteChallenge` agora usa a RPC `delete_complete_challenge`

### 3. Documentação Detalhada

Fornecemos dois arquivos com instruções detalhadas:
- `guia_resolucao_problemas_permissao_challenges.md`: Guia completo explicando o problema e todas as possíveis soluções
- `sql_permissoes_alternativas.sql`: Script SQL pronto para executar no Supabase

## Como Aplicar a Solução

1. **Execute o script SQL no Supabase**:
   - Acesse o painel do Supabase
   - Vá para "SQL Editor"
   - Cole o conteúdo do arquivo `sql_permissoes_alternativas.sql`
   - Execute o script

2. **Verifique as funções RPC**:
   - No Supabase, vá para "Database" > "Functions"
   - Confirme que `toggle_challenge_status` e `delete_complete_challenge` aparecem na lista

3. **Reinicie a aplicação e teste novamente**:
   - Faça logout e login novamente para atualizar seu token JWT
   - Acesse a página de administração de desafios
   - Teste ativar/desativar e excluir desafios

Esta solução contorna o problema de permissão usando funções RPC que executam com privilégios elevados, evitando assim a necessidade de acessar diretamente a tabela `users`. 