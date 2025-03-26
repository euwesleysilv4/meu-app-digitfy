# Guia de Gerenciamento de Desafios no Supabase

Este guia explica como utilizar o sistema de gerenciamento de desafios implementado no Supabase, permitindo criar, editar, atualizar e excluir os desafios da seção "Aprenda Aqui".

## Estrutura das Tabelas

O sistema utiliza duas tabelas principais:

1. **challenges** - Armazena as informações básicas dos desafios
2. **challenge_steps** - Armazena as etapas (passos) de cada desafio

Além disso, criamos:
- Uma função `insert_complete_challenge` para facilitar a inserção de desafios completos
- Uma view `vw_complete_challenges` para visualizar os dados completos dos desafios

## Como Executar o Script SQL

1. Acesse o painel de controle do Supabase
2. Navegue até a seção "SQL Editor"
3. Copie e cole todo o conteúdo do arquivo `sql_create_challenges_table.sql`
4. Clique em "Run" para executar o script
5. O script criará as tabelas, funções, políticas e inserirá os dados iniciais

## Gerenciando Desafios

### Visualizar Todos os Desafios

Para ver todos os desafios com suas etapas, use a view criada:

```sql
SELECT * FROM vw_complete_challenges;
```

### Criar um Novo Desafio

Você pode criar um novo desafio de duas maneiras:

#### 1. Usando a função insert_complete_challenge

```sql
SELECT insert_complete_challenge(
    'slug-do-desafio',
    'Título do Desafio',
    'URL da imagem de capa',
    'Descrição do desafio',
    'Duração (ex: 10 dias)',
    'Dificuldade', -- Deve ser: 'Iniciante', 'Intermediário' ou 'Avançado'
    'Recompensa oferecida',
    ARRAY['Título da Etapa 1', 'Título da Etapa 2', ...], -- Títulos das etapas
    ARRAY['Conteúdo detalhado da Etapa 1', 'Conteúdo detalhado da Etapa 2', ...] -- Conteúdos de cada etapa
);
```

#### 2. Inserindo separadamente nas tabelas

Primeiro insira o desafio principal:

```sql
INSERT INTO challenges (slug, title, image_url, description, duration, difficulty, reward)
VALUES ('slug-do-desafio', 'Título do Desafio', 'URL da imagem', 'Descrição', 'Duração', 'Dificuldade', 'Recompensa')
RETURNING id;
```

Depois insira cada etapa usando o ID retornado:

```sql
INSERT INTO challenge_steps (challenge_id, step_order, title, content)
VALUES 
('ID-do-desafio', 1, 'Título da Etapa 1', 'Conteúdo detalhado da Etapa 1'),
('ID-do-desafio', 2, 'Título da Etapa 2', 'Conteúdo detalhado da Etapa 2');
```

### Editar um Desafio Existente

Para editar as informações básicas de um desafio:

```sql
UPDATE challenges 
SET 
    title = 'Novo título',
    description = 'Nova descrição',
    image_url = 'Nova URL de imagem',
    duration = 'Nova duração',
    difficulty = 'Nova dificuldade',
    reward = 'Nova recompensa'
WHERE slug = 'slug-do-desafio';
```

### Editar Etapas de um Desafio

Para editar uma etapa específica:

```sql
UPDATE challenge_steps 
SET 
    title = 'Novo título da etapa',
    content = 'Novo conteúdo da etapa'
WHERE 
    challenge_id = 'ID-do-desafio' AND step_order = 1; -- Para a primeira etapa
```

### Adicionar uma Nova Etapa a um Desafio Existente

```sql
INSERT INTO challenge_steps (challenge_id, step_order, title, content)
VALUES ('ID-do-desafio', 9, 'Título da Nova Etapa', 'Conteúdo da Nova Etapa');
```

### Desativar um Desafio

Em vez de excluir completamente, você pode apenas desativar um desafio:

```sql
UPDATE challenges 
SET is_active = false
WHERE slug = 'slug-do-desafio';
```

### Excluir um Desafio

Se você realmente precisar excluir um desafio e todas as suas etapas:

```sql
DELETE FROM challenges WHERE slug = 'slug-do-desafio';
```

Isso também excluirá automaticamente todas as etapas associadas devido à constraint `ON DELETE CASCADE`.

## Interface de Administração

Como alternativa a escrever SQL manualmente, você pode utilizar a interface de gerenciamento de tabelas do Supabase:

1. Acesse a seção "Table Editor" no painel do Supabase
2. Selecione a tabela "challenges" ou "challenge_steps"
3. Use a interface para inserir, editar ou excluir registros

## Observações Importantes

1. O campo `slug` é único e deve ser usado como identificador nas URLs
2. A dificuldade deve ser obrigatoriamente: 'Iniciante', 'Intermediário' ou 'Avançado'
3. É recomendado usar a função `insert_complete_challenge` para inserir novos desafios, garantindo a consistência entre as etapas e o desafio principal
4. As políticas de segurança (RLS) garantem que apenas administradores possam modificar os desafios

## Integração com o Frontend

Para integrar com o frontend da aplicação, utilize a API do Supabase para fazer as chamadas necessárias. Exemplo:

```javascript
// Buscar todos os desafios ativos
const { data, error } = await supabase
  .from('vw_complete_challenges')
  .select('*')
  .eq('is_active', true);

// Buscar um desafio específico por slug
const { data, error } = await supabase
  .from('vw_complete_challenges')
  .select('*')
  .eq('slug', 'slug-do-desafio')
  .single();
``` 