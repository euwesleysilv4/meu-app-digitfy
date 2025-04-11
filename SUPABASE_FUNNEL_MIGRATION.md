# Migração dos Funis para o Supabase

Este documento descreve como implementamos a integração dos funis com o Supabase para persistência confiável dos dados.

## Visão Geral

A implementação atual:
1. Mantém compatibilidade com o localStorage para usuários não autenticados
2. Migra automaticamente os funis do localStorage para o Supabase quando o usuário faz login
3. Prioriza o armazenamento no Supabase para usuários autenticados com fallback para localStorage

## Estrutura da Tabela

Criamos uma tabela `user_funnels` no Supabase com a seguinte estrutura:

- `id` (UUID): Identificador único do funil
- `user_id` (UUID): Referência ao usuário proprietário do funil
- `title` (TEXT): Título do funil
- `description` (TEXT): Descrição do funil
- `type` (TEXT): Tipo do funil (vendas, captura, webinar, etc.)
- `icon` (TEXT): Ícone representativo do funil
- `steps` (JSONB): Array JSON com todos os elementos e conexões do funil
- `created_at` (TIMESTAMP): Data de criação
- `updated_at` (TIMESTAMP): Data da última atualização

## Como Executar a Migração

Para implementar esta migração no ambiente de produção, siga os passos:

1. **Criar a Tabela no Supabase**:
   - Acesse o painel do Supabase > SQL Editor
   - Execute o script em `supabase/migrations/create_funnels_table.sql`
   - Verifique se a tabela foi criada com sucesso

2. **Ativar as Políticas de Segurança (RLS)**:
   - Verifique se as políticas Row Level Security estão ativadas na tabela
   - Certifique-se de que as políticas permitem que os usuários vejam, editem e excluam apenas seus próprios funis

3. **Implementar o Serviço no Frontend**:
   - Verifique se o arquivo `src/services/funnelService.ts` foi adicionado ao projeto
   - Certifique-se de que os componentes `FunnelFy.tsx` e `FunnelFyEditor.tsx` foram atualizados para usar o serviço

4. **Testar a Migração**:
   - Crie alguns funis como usuário não autenticado (serão salvos no localStorage)
   - Faça login com uma conta
   - Verifique se os funis foram migrados automaticamente para o Supabase
   - Verifique se novos funis são salvos no Supabase quando o usuário está autenticado

## Vantagens da Nova Implementação

- **Persistência confiável**: Os dados dos funis são armazenados de forma segura no banco de dados
- **Acesso em múltiplos dispositivos**: Usuários podem acessar seus funis em qualquer dispositivo após login
- **Backup e recuperação**: Os dados não são perdidos quando o usuário limpa o cache do navegador
- **Segurança**: Cada usuário só tem acesso aos seus próprios funis
- **Compatibilidade**: Continua funcionando para usuários não autenticados usando localStorage

## Monitoramento e Suporte

Após a implantação, monitore no console do navegador:
- Mensagens de migração automaticamente quando usuários fazem login
- Possíveis erros na sincronização com o Supabase
- Use o painel do Supabase para verificar se os dados estão sendo armazenados corretamente

Se ocorrerem problemas, o sistema continuará funcionando com localStorage como fallback. 