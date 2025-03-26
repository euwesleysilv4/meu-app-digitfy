# Sistema de Gerenciamento de Produtos - DigitFy

## Visão Geral

O Sistema de Gerenciamento de Produtos da plataforma DigitFy permite:
- Administradores aprovarem produtos submetidos pelos usuários
- Administradores adicionarem produtos diretamente como recomendados
- Usuários submeterem produtos para aprovação
- Exibição de produtos aprovados na plataforma

## Estrutura do Banco de Dados

O sistema utiliza duas tabelas principais no Supabase:

### 1. Tabela `recommended_products`

Armazena produtos aprovados que são exibidos na plataforma.

**Estrutura:**
- `id`: Identificador único do produto (UUID)
- `name`: Nome do produto
- `description`: Descrição detalhada do produto
- `benefits`: Array de benefícios/recursos do produto
- `price`: Preço do produto (formato de texto)
- `rating`: Avaliação do produto (de 0 a 5)
- `image`: URL da imagem do produto
- `category`: Categoria do produto
- `elite_badge`: Indicador de produto elite (booleano)
- `top_pick`: Indicador de produto destaque (booleano)
- `status`: Status do produto (sempre "aprovado" nesta tabela)
- `added_by_admin`: Indica se foi adicionado diretamente por um admin
- `added_at`: Data de adição do produto
- `approved_at`: Data de aprovação do produto

### 2. Tabela `submitted_products`

Armazena produtos enviados pelos usuários que aguardam aprovação ou foram rejeitados.

**Estrutura:**
- `id`: Identificador único do produto (UUID)
- `name`: Nome do produto
- `description`: Descrição detalhada do produto
- `benefits`: Array de benefícios/recursos do produto
- `price`: Preço do produto (formato de texto)
- `rating`: Avaliação do produto (de 0 a 5)
- `image`: URL da imagem do produto
- `category`: Categoria do produto
- `elite_badge`: Indicador de produto elite (booleano)
- `top_pick`: Indicador de produto destaque (booleano)
- `user_id`: ID do usuário que submeteu o produto
- `status`: Status do produto ("pendente", "aprovado" ou "rejeitado")
- `submitted_at`: Data de submissão do produto
- `updated_at`: Data da última atualização do produto

## Fluxo de Gerenciamento de Produtos

### Submissão de Produtos
1. Usuários submetem produtos através do formulário na plataforma
2. O produto é inserido na tabela `submitted_products` com status "pendente"
3. Administradores são notificados de novos produtos pendentes

### Aprovação de Produtos
1. Administradores revisam produtos pendentes na interface de gerenciamento
2. Ao aprovar um produto:
   - O status na tabela `submitted_products` é alterado para "aprovado"
   - O produto é copiado para a tabela `recommended_products`
   - O usuário é notificado da aprovação

### Rejeição de Produtos
1. Administradores revisam produtos pendentes na interface de gerenciamento
2. Ao rejeitar um produto:
   - O status na tabela `submitted_products` é alterado para "rejeitado"
   - O produto permanece na tabela para histórico
   - O usuário é notificado da rejeição

### Adição Direta de Produtos
1. Administradores podem adicionar produtos diretamente como recomendados
2. O produto é inserido na tabela `recommended_products`
3. O campo `added_by_admin` é marcado como verdadeiro

## Políticas de Segurança (RLS)

O sistema implementa Row Level Security no Supabase para proteção dos dados:

### Para `recommended_products`:
- Qualquer usuário pode visualizar produtos aprovados
- Apenas administradores podem inserir, atualizar ou excluir produtos

### Para `submitted_products`:
- Usuários podem ver apenas seus próprios produtos submetidos
- Administradores podem ver todos os produtos submetidos
- Usuários podem submeter novos produtos
- Usuários podem atualizar apenas seus próprios produtos com status "pendente"
- Administradores podem atualizar ou excluir qualquer produto submetido

## Validação de Dados

Uma função trigger `validate_product` garante a integridade dos dados:
- Nome deve ter pelo menos 3 caracteres
- Descrição deve ter pelo menos 10 caracteres
- Preço deve estar no formato correto (R$ X,XX)
- Imagem deve ser uma URL válida (http:// ou https://)

## API de Produtos (src/services/productService.ts)

O arquivo `productService.ts` contém todas as funções para interação com as tabelas de produtos:

- `listAllProducts()`: Lista todos os produtos aprovados
- `listPendingProducts()`: Lista produtos pendentes de aprovação
- `approveProduct(productId)`: Aprova um produto pendente
- `rejectProduct(productId)`: Rejeita um produto pendente
- `addProduct(product)`: Adiciona um produto diretamente como recomendado
- `removeProduct(productId)`: Remove um produto da lista de aprovados

## Interface de Gerenciamento (src/pages/admin/ProductsManagement.tsx)

A interface administrativa implementa:
- Visualização em abas de produtos pendentes e aprovados
- Funcionalidades de aprovação, rejeição e remoção de produtos
- Formulário para adição direta de produtos pelos administradores
- Filtros de busca por texto
- Feedback ao usuário sobre ações realizadas

## Implementação Técnica

A implementação utiliza:
- Supabase para banco de dados e políticas de segurança
- React para interface de usuário
- TypeScript para tipagem e segurança do código
- Contexto de autenticação para verificação de permissões
