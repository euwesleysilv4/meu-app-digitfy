# Funcionalidade de Mapas Mentais

## Visão Geral

A funcionalidade de Mapas Mentais foi implementada para permitir o gerenciamento e compartilhamento de mapas mentais na plataforma DigitalFy. Esta funcionalidade permite:

1. Administradores podem criar, editar, publicar e excluir mapas mentais
2. Usuários podem visualizar mapas mentais publicados
3. Usuários podem enviar sugestões de mapas mentais para serem aprovados por administradores

## Estrutura do Banco de Dados

Foi criada uma tabela `mind_maps` com a seguinte estrutura:

```sql
CREATE TABLE mind_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')),
  instagram TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);
```

## Páginas Implementadas

### 1. Página Pública de Mapas Mentais

**Arquivo:** `src/pages/MindMaps.tsx`

Esta página exibe os mapas mentais publicados para todos os usuários. Funcionalidades:

- Visualização de mapas mentais publicados
- Formulário para envio de sugestões de novos mapas mentais
- Contagem automática de visualizações ao acessar os mapas
- Exibição do Instagram do criador do mapa (quando disponível)
- Ferramentas recomendadas para criação de mapas mentais

### 2. Página de Administração de Mapas Mentais

**Arquivo:** `src/pages/admin/MindMaps.tsx`

Esta página permite que administradores gerenciem os mapas mentais. Funcionalidades:

- Listagem de todos os mapas mentais (publicados, rascunhos e agendados)
- Criação de novos mapas mentais
- Edição de mapas mentais existentes
- Exclusão de mapas mentais
- Visualização de estatísticas básicas (visualizações)
- Busca/filtragem de mapas mentais

## Permissões e Acesso

- Qualquer usuário pode visualizar mapas mentais com status "published"
- Apenas administradores podem criar, editar e excluir mapas mentais
- Qualquer usuário pode enviar sugestões de mapas mentais, que são salvas como rascunho para revisão

## Fluxo de Trabalho para Sugestões

1. Usuário envia sugestão através do formulário na página pública de Mapas Mentais
2. A sugestão é salva no banco de dados com status "draft"
3. Administrador revisa a sugestão na página de administração
4. Administrador pode editar e publicar ou excluir a sugestão

## Como Integrar com Outras Funcionalidades

### Contagem de Visualizações

A contagem de visualizações é incrementada automaticamente quando um usuário clica no link do mapa mental. Esta estatística pode ser utilizada para análises e relatórios.

### Destaques na Página Inicial

Os mapas mentais mais populares (baseados em visualizações) podem ser destacados na página inicial ou em outras seções relevantes do site.

## Melhorias Futuras

1. Implementar sistema de curtidas para mapas mentais
2. Adicionar categorias para melhor organização
3. Permitir comentários nos mapas mentais
4. Adicionar recursos de compartilhamento em redes sociais
5. Implementar recomendações personalizadas baseadas no histórico do usuário 