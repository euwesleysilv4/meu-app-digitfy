# Sistema de Compartilhamento de Funis via Token

Este documento descreve a implementação do sistema de compartilhamento de funis via token na plataforma DigitFy.

## Visão Geral

O sistema permite que os usuários compartilhem seus funis com outros usuários da plataforma através de tokens únicos, sem a necessidade de compartilhar informações sensíveis como e-mail ou ID de usuário.

## Funcionalidades Principais

1. **Geração de Tokens de Compartilhamento**
   - Os usuários podem gerar tokens únicos para compartilhar seus funis
   - Os tokens podem ter um prazo de validade configurável
   - Os dados do funil são capturados no momento da geração do token

2. **Importação de Funis Compartilhados**
   - Os usuários podem importar funis compartilhados inserindo o token recebido
   - O sistema valida o token e mostra uma pré-visualização do funil antes da importação
   - Ao importar, uma cópia do funil é criada na conta do usuário

3. **Gerenciamento de Tokens**
   - Os usuários podem ver todos os tokens que criaram
   - Podem desativar tokens existentes a qualquer momento
   - Podem visualizar estatísticas de uso dos tokens (visualizações e cópias)

## Estrutura do Banco de Dados

### Tabela `funnel_share_tokens`
Armazena os tokens de compartilhamento:

- `id` - Identificador único do token
- `token` - String única do token de compartilhamento
- `funnel_id` - ID do funil sendo compartilhado
- `created_by` - ID do usuário que criou o token
- `created_at` - Data de criação do token
- `expires_at` - Data de expiração do token (opcional)
- `is_active` - Status de ativação do token
- `funnel_data` - Snapshot dos dados do funil no momento da criação do token

### Tabela `funnel_share_token_usage`
Registra o uso dos tokens:

- `id` - Identificador único do registro
- `token_id` - ID do token utilizado
- `used_by` - ID do usuário que utilizou o token
- `used_at` - Data e hora de uso
- `action` - Ação realizada ('view', 'copy', etc.)

## Funções PostgreSQL

### `generate_funnel_share_token(p_funnel_id UUID, p_days_valid INT)`
Gera um novo token de compartilhamento para um funil.

### `validate_funnel_share_token(p_token TEXT)`
Valida um token e retorna os dados associados se for válido.

### `copy_shared_funnel(p_token TEXT)`
Cria uma cópia do funil compartilhado na conta do usuário atual.

## Componentes Front-end

### `FunnelShareModal`
Modal para gerar e copiar tokens de compartilhamento:
- Permite configurar a validade do token
- Exibe o token gerado
- Facilita a cópia para a área de transferência

### `ImportFunnelModal`
Modal para importar funis via token:
- Campo para inserir o token
- Validação do token
- Pré-visualização do funil a ser importado
- Confirmação da importação

## Segurança

O sistema implementa as seguintes medidas de segurança:

1. **Row Level Security (RLS)**
   - Cada usuário só pode ver e gerenciar seus próprios tokens
   - Cada usuário só pode ver seus próprios registros de uso de token

2. **Validação de Propriedade**
   - Ao gerar um token, o sistema verifica se o funil pertence ao usuário
   - O token armazena um snapshot dos dados do funil, evitando problemas se o original for modificado

3. **Expiração de Tokens**
   - Os tokens podem ter uma data de expiração
   - Tokens expirados são automaticamente invalidados

## Como Usar

### Para Compartilhar um Funil

1. Acesse a lista de funis
2. Clique no ícone de compartilhamento ao lado do funil desejado
3. Configure o período de validade do token (opcional)
4. Clique em "Gerar Token"
5. Copie o token e compartilhe com quem desejar

### Para Importar um Funil

1. Na página de funis, clique no botão "Importar Funil"
2. Cole o token recebido
3. Clique em "Validar Token"
4. Verifique os detalhes do funil
5. Clique em "Importar Funil" para criar uma cópia na sua conta

## Instalação e Configuração

Para implementar esta funcionalidade:

1. Execute o script SQL `create_funnel_sharing_tables.sql` no Supabase
2. Execute o script `run_migration_funnel_sharing.bat` para aplicar as migrações
3. Certifique-se de que os componentes front-end estão instalados
4. Verifique a integração com o serviço existente de funis

## Solução de Problemas

### Token inválido
- Verifique se o token foi digitado corretamente
- O token pode ter expirado
- O criador do token pode tê-lo desativado

### Erro ao gerar token
- Verifique se você é o proprietário do funil
- Verifique sua conexão com o banco de dados

### Erro ao importar funil
- Verifique se o token é válido
- Verifique sua conexão com o banco de dados
- Verifique se você tem as permissões necessárias 