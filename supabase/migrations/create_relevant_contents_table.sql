-- Extensão para busca de texto com similarity (deve ser criada primeiro)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criação da tabela 'relevant_contents'
CREATE TABLE IF NOT EXISTS public.relevant_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    external_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    author TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Metadados e estatísticas opcionais
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    
    -- Relação com usuário criador (admin)
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Criar índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS relevant_contents_status_idx ON public.relevant_contents(status);
CREATE INDEX IF NOT EXISTS relevant_contents_title_idx ON public.relevant_contents USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS relevant_contents_description_idx ON public.relevant_contents USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS relevant_contents_tags_idx ON public.relevant_contents USING gin(tags);

-- Adicionar comentários à tabela e colunas
COMMENT ON TABLE public.relevant_contents IS 'Tabela para armazenar conteúdos relevantes da plataforma';
COMMENT ON COLUMN public.relevant_contents.id IS 'ID único do conteúdo relevante';
COMMENT ON COLUMN public.relevant_contents.title IS 'Título do conteúdo relevante';
COMMENT ON COLUMN public.relevant_contents.description IS 'Descrição breve do conteúdo';
COMMENT ON COLUMN public.relevant_contents.content IS 'Conteúdo completo em formato text/markdown';
COMMENT ON COLUMN public.relevant_contents.image_url IS 'URL da imagem de capa do conteúdo';
COMMENT ON COLUMN public.relevant_contents.external_url IS 'URL externa opcional para o conteúdo completo';
COMMENT ON COLUMN public.relevant_contents.status IS 'Status do conteúdo: published, draft ou scheduled';
COMMENT ON COLUMN public.relevant_contents.created_at IS 'Data de criação do conteúdo';
COMMENT ON COLUMN public.relevant_contents.updated_at IS 'Data da última atualização do conteúdo';
COMMENT ON COLUMN public.relevant_contents.author IS 'Nome do autor do conteúdo';
COMMENT ON COLUMN public.relevant_contents.tags IS 'Array de tags associadas ao conteúdo';
COMMENT ON COLUMN public.relevant_contents.view_count IS 'Contador de visualizações do conteúdo';
COMMENT ON COLUMN public.relevant_contents.like_count IS 'Contador de likes do conteúdo';
COMMENT ON COLUMN public.relevant_contents.scheduled_date IS 'Data agendada para publicação (se status for scheduled)';
COMMENT ON COLUMN public.relevant_contents.created_by IS 'Referência ao usuário admin que criou o conteúdo';

-- Trigger para atualizar automaticamente o campo 'updated_at'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger na tabela
DROP TRIGGER IF EXISTS set_relevant_contents_updated_at ON public.relevant_contents;
CREATE TRIGGER set_relevant_contents_updated_at
BEFORE UPDATE ON public.relevant_contents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Definir políticas de segurança (Row Level Security)
ALTER TABLE public.relevant_contents ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Administradores podem inserir conteúdos" ON public.relevant_contents
    FOR INSERT 
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Administradores podem atualizar conteúdos" ON public.relevant_contents
    FOR UPDATE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Administradores podem excluir conteúdos" ON public.relevant_contents
    FOR DELETE
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Políticas para todos os usuários (leitura)
CREATE POLICY "Todos podem ver conteúdos publicados" ON public.relevant_contents
    FOR SELECT
    USING (
        status = 'published' OR 
        (
            -- Admins podem ver todos os conteúdos
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    );

-- Função para incrementar contador de visualizações
CREATE OR REPLACE FUNCTION public.increment_content_view_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.relevant_contents
  SET view_count = view_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar contador de likes
CREATE OR REPLACE FUNCTION public.increment_content_like_count(content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.relevant_contents
  SET like_count = like_count + 1
  WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar conteúdos por texto e tags
CREATE OR REPLACE FUNCTION public.search_relevant_contents(search_term TEXT, tag_filter TEXT[] DEFAULT NULL)
RETURNS SETOF public.relevant_contents AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.relevant_contents
  WHERE 
    status = 'published' AND
    (
      search_term IS NULL OR
      search_term = '' OR
      title ILIKE '%' || search_term || '%' OR
      description ILIKE '%' || search_term || '%' OR
      content ILIKE '%' || search_term || '%'
    ) AND
    (
      tag_filter IS NULL OR
      array_length(tag_filter, 1) IS NULL OR
      tags && tag_filter
    )
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Dados iniciais de exemplo
INSERT INTO public.relevant_contents (
  title, 
  description, 
  content, 
  image_url, 
  status, 
  author, 
  tags
) VALUES (
  'Introdução ao Marketing Digital',
  'Um guia completo para iniciantes no marketing digital',
  '# Introdução ao Marketing Digital

## O que é Marketing Digital?

O marketing digital refere-se ao uso de canais digitais, plataformas e tecnologias para promover produtos, serviços ou marcas. Diferente do marketing tradicional, o marketing digital permite maior precisão no direcionamento, mensuração em tempo real e ajustes rápidos nas estratégias.

## Por que é importante?

* **Alcance Global**: Sua marca pode ser vista em qualquer lugar do mundo
* **Custo-Benefício**: Geralmente mais barato que marketing tradicional
* **Mensuração Precisa**: Dados e métricas em tempo real
* **Personalização**: Comunicação direcionada para públicos específicos

## Principais Canais de Marketing Digital

1. **SEO (Search Engine Optimization)**: Otimização para mecanismos de busca
2. **Marketing de Conteúdo**: Blogs, e-books, vídeos, podcasts
3. **Email Marketing**: Comunicação direta por email
4. **Mídias Sociais**: Presença em plataformas como Instagram, Facebook, LinkedIn
5. **PPC (Pay-Per-Click)**: Anúncios pagos por clique

## Como Começar

Para iniciar no marketing digital, é importante:

1. Definir seu público-alvo
2. Estabelecer objetivos claros
3. Escolher os canais mais adequados
4. Criar conteúdo relevante
5. Analisar resultados e otimizar estratégias

## Conclusão

O marketing digital é essencial para qualquer negócio atualmente. Comece com pequenos passos, teste diferentes abordagens e sempre analise os resultados para melhorar continuamente.',
  'https://example.com/images/marketing-digital.jpg',
  'published',
  'Admin',
  ARRAY['marketing', 'digital', 'iniciantes']
),
(
  'Guia Completo de Copywriting',
  'Aprenda técnicas avançadas de copywriting para aumentar suas vendas',
  '# Guia Completo de Copywriting

## O que é Copywriting?

Copywriting é a arte de escrever textos persuasivos que levam o leitor a realizar uma ação específica, seja comprar um produto, inscrever-se em uma newsletter ou clicar em um link.

## Elementos Essenciais do Copywriting Eficaz

### 1. Headline Poderosa

A headline (título) é o elemento mais importante do seu texto. Ela deve:

* Capturar a atenção imediatamente
* Prometer um benefício claro
* Despertar curiosidade
* Ser específica e direta

### 2. Conhecer seu Público

Um bom copywriter:

* Entende as dores e desejos do público
* Fala a linguagem do leitor
* Aborda objeções antes que surjam
* Cria conexão emocional

### 3. Estrutura AIDA

* **Atenção**: Capture o interesse inicial
* **Interesse**: Desenvolva o interesse com informações relevantes
* **Desejo**: Crie desejo pelo seu produto/serviço
* **Ação**: Incentive uma ação clara

### 4. Prova Social

Inclua:
* Depoimentos de clientes
* Números e estatísticas
* Cases de sucesso
* Menções na mídia

### 5. Call-to-Action (CTA) Claro

Sempre termine com um CTA que:
* É visível e destacado
* Usa verbos de ação
* Cria senso de urgência
* Elimina riscos (garantias)

## Técnicas Avançadas

* **Storytelling**: Use histórias para criar conexão emocional
* **Escassez e Urgência**: Limite tempo ou quantidade para motivar ação
* **Redação Sensorial**: Use palavras que ativam os sentidos
* **Testes A/B**: Compare diferentes versões do seu texto

## Erros Comuns a Evitar

* Focar em características, não em benefícios
* Usar jargões desnecessários
* Escrever parágrafos muito longos
* Não revisar gramática e ortografia

## Conclusão

O copywriting eficaz combina arte e ciência. Com prática constante e testes, você pode criar textos que não apenas informam, mas também persuadem e convertem.',
  'https://example.com/images/copywriting.jpg',
  'published',
  'Admin',
  ARRAY['copywriting', 'vendas', 'conversão']
); 