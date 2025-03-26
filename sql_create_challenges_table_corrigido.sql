-- Script SQL para criar uma tabela de desafios no Supabase

-- Criação da tabela de desafios
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- identificador único para a URL (ex: 'aquecimento-perfil')
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL, -- ex: '5 dias', '30 dias'
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Iniciante', 'Intermediário', 'Avançado')),
    reward TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabela para armazenar as etapas dos desafios
CREATE TABLE challenge_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    step_order SMALLINT NOT NULL, -- ordem da etapa no desafio
    title TEXT NOT NULL, -- título da etapa
    content TEXT NOT NULL, -- conteúdo detalhado da etapa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (challenge_id, step_order) -- garante que não existam duas etapas com a mesma ordem para o mesmo desafio
);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicando o trigger nas tabelas
CREATE TRIGGER update_challenges_updated_at
BEFORE UPDATE ON challenges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_steps_updated_at
BEFORE UPDATE ON challenge_steps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Permissões do Row Level Security (RLS)

-- Ativar RLS nas tabelas
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_steps ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso: qualquer usuário autenticado pode ler, mas apenas administradores podem modificar
CREATE POLICY "Qualquer pessoa pode visualizar desafios"
ON challenges FOR SELECT
TO authenticated
USING (true);

-- CORREÇÃO: Usando WITH CHECK para a política de INSERT
CREATE POLICY "Apenas administradores podem criar desafios"
ON challenges FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Apenas administradores podem modificar desafios"
ON challenges FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Apenas administradores podem excluir desafios"
ON challenges FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Políticas similares para a tabela de etapas
CREATE POLICY "Qualquer pessoa pode visualizar etapas dos desafios"
ON challenge_steps FOR SELECT
TO authenticated
USING (true);

-- CORREÇÃO: Usando WITH CHECK para a política de INSERT
CREATE POLICY "Apenas administradores podem criar etapas"
ON challenge_steps FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Apenas administradores podem modificar etapas"
ON challenge_steps FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Apenas administradores podem excluir etapas"
ON challenge_steps FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Função para inserir um desafio completo com suas etapas
CREATE OR REPLACE FUNCTION insert_complete_challenge(
    slug TEXT,
    title TEXT,
    image_url TEXT,
    description TEXT,
    duration TEXT,
    difficulty TEXT,
    reward TEXT,
    steps TEXT[],
    step_details TEXT[]
) RETURNS UUID AS $$
DECLARE
    new_challenge_id UUID;
    i INTEGER;
BEGIN
    -- Inserir o desafio principal
    INSERT INTO challenges (slug, title, image_url, description, duration, difficulty, reward)
    VALUES (slug, title, image_url, description, duration, difficulty, reward)
    RETURNING id INTO new_challenge_id;
    
    -- Inserir as etapas do desafio
    FOR i IN 1..array_length(steps, 1) LOOP
        INSERT INTO challenge_steps (challenge_id, step_order, title, content)
        VALUES (new_challenge_id, i, steps[i], step_details[i]);
    END LOOP;
    
    RETURN new_challenge_id;
END;
$$ LANGUAGE plpgsql;

-- Criar view para facilitar o acesso aos dados completos dos desafios
CREATE VIEW vw_complete_challenges AS
SELECT 
    c.id,
    c.slug,
    c.title,
    c.image_url,
    c.description,
    c.duration,
    c.difficulty,
    c.reward,
    c.is_active,
    c.created_at,
    c.updated_at,
    array_agg(cs.title ORDER BY cs.step_order) AS steps,
    array_agg(cs.content ORDER BY cs.step_order) AS step_details
FROM 
    challenges c
JOIN 
    challenge_steps cs ON c.id = cs.challenge_id
GROUP BY 
    c.id, c.slug, c.title, c.image_url, c.description, c.duration, c.difficulty, c.reward, c.is_active, c.created_at, c.updated_at;

-- Inserção dos desafios existentes para inicialização

-- Desafio 1: Aquecimento de Perfil
SELECT insert_complete_challenge(
    'aquecimento-perfil',
    'Desafio de Aquecimento de Perfil',
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'Transforme seu perfil em uma máquina de atração de leads e engajamento em apenas 5 dias!',
    '5 dias',
    'Iniciante',
    'Checklist de Perfil Otimizado + Consultoria Rápida',
    ARRAY[
        'Auditoria do perfil atual',
        'Definição de persona',
        'Otimização de bio e foto',
        'Criação de conteúdo inicial',
        'Estratégias de engajamento',
        'Técnicas de storytelling',
        'Primeiros passos de autoridade'
    ],
    ARRAY[
        'Realize uma auditoria completa do seu perfil atual, identificando pontos fortes e áreas de melhoria. Analise suas métricas atuais, tipo de conteúdo e engajamento para estabelecer um ponto de partida claro.',
        'Defina claramente sua persona ideal e o posicionamento do seu perfil. Identifique quem é seu público alvo, quais são suas dores, desejos e como você pode ajudá-los.',
        'Otimize sua bio para comunicar claramente seu valor e atrair sua persona ideal. Crie uma foto de perfil profissional que transmita confiança e autoridade.',
        'Crie seus primeiros conteúdos estratégicos focados em valor e engajamento. Desenvolva uma identidade visual consistente e atrativa.',
        'Implemente técnicas de engajamento para aumentar a interação com seu público. Aprenda a responder comentários de forma estratégica e criar chamadas para ação eficientes.',
        'Desenvolva técnicas de storytelling para criar conexão emocional com sua audiência. Aprenda a estruturar histórias que vendem e engajam.',
        'Crie seus primeiros conteúdos que estabelecem você como autoridade no seu nicho. Posicione-se como especialista e comece a construir sua reputação online.'
    ]
);

-- Desafio 2: Primeira Venda no Orgânico
SELECT insert_complete_challenge(
    'primeira-venda-organico',
    'Desafio 7 Dias para a Primeira Venda no Orgânico',
    'https://images.unsplash.com/photo-1556761175-4b46a3fb44de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    'Transforme seu perfil em um funil de vendas e conquiste sua primeira venda orgânica em apenas 7 dias!',
    '7 dias',
    'Iniciante',
    'Certificado de Primeira Venda + Mentoria Exclusiva',
    ARRAY[
        'Defina seu nicho de atuação',
        'Crie um perfil atrativo nas redes sociais',
        'Desenvolva conteúdo de valor',
        'Aprenda técnicas de engajamento',
        'Implemente estratégias de conversão',
        'Crie uma oferta irresistível',
        'Feche sua primeira venda'
    ],
    ARRAY[
        'Identifique um nicho específico onde você possui conhecimento e paixão. Pesquise a demanda e a concorrência para validar sua escolha.',
        'Configure seu perfil com elementos profissionais: foto, bio estratégica, links relevantes e identidade visual consistente.',
        'Crie pelo menos 3 conteúdos de alto valor focados nas dores e necessidades do seu público. Priorize a qualidade sobre a quantidade.',
        'Aplique técnicas de engajamento ativo: responda comentários, interaja com perfis relevantes e participe de discussões em sua área.',
        'Implemente CTAs estratégicos em seus conteúdos. Crie uma sequência lógica que leve seu seguidor da descoberta à decisão de compra.',
        'Desenvolva uma oferta inicial acessível e de alto valor percebido. Crie um material de vendas persuasivo destacando benefícios claros.',
        'Aplique técnicas de fechamento: crie urgência, responda objeções e simplifique o processo de compra para facilitar a decisão.'
    ]
);

-- Desafio 3: Tráfego Orgânico 30 Dias
SELECT insert_complete_challenge(
    'trafego-organico-30-dias',
    'Desafio 30 Dias de Tráfego Orgânico',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'Domine as estratégias de geração de tráfego orgânico e expanda sua presença digital em 30 dias!',
    '30 dias',
    'Intermediário',
    'Relatório Completo de Crescimento + Consultoria',
    ARRAY[
        'Análise do seu perfil atual',
        'Estratégia de conteúdo',
        'Criação de calendário de postagens',
        'Técnicas de hashtags estratégicas',
        'Engajamento com a comunidade',
        'Otimização de perfis',
        'Métricas e ajustes',
        'Criação de funil de atração'
    ],
    ARRAY[
        'Faça uma análise detalhada do seu perfil e conteúdo atual. Identifique os pontos fortes e fracos, métricas atuais e oportunidades de melhoria.',
        'Desenvolva uma estratégia de conteúdo alinhada com os objetivos do seu negócio e interesses do seu público. Defina pilares de conteúdo e formatos.',
        'Crie um calendário editorial completo para os próximos 30 dias, com temas, formatos e objetivos de cada publicação.',
        'Pesquise e implemente hashtags estratégicas para aumentar o alcance orgânico do seu conteúdo. Crie grupos de hashtags por nicho e relevância.',
        'Desenvolva uma rotina diária de engajamento com sua comunidade e perfis relevantes. Participe ativamente de discussões no seu nicho.',
        'Otimize todos os aspectos do seu perfil: bio, destaque, feed, conteúdo fixado e links estratégicos para maximizar conversões.',
        'Implemente um sistema de análise de métricas semanais e faça ajustes na sua estratégia com base nos resultados obtidos.',
        'Crie um funil de atração completo: do conteúdo frio até a conversão, com pontos de contato e nurturing estratégico.'
    ]
);

-- Desafio 4: Primeira Venda no Tráfego Pago
SELECT insert_complete_challenge(
    'primeira-venda-trafego-pago',
    'Desafio Primeira Venda no Tráfego Pago',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'Aprenda a criar e otimizar campanhas de ads para conquistar sua primeira venda em tráfego pago!',
    '15 dias',
    'Avançado',
    'Bônus de Créditos em Ads + Mentoria Especializada',
    ARRAY[
        'Fundamentos de tráfego pago',
        'Definição de público-alvo',
        'Criação de anúncios persuasivos',
        'Configuração de campanhas',
        'Gestão de orçamento',
        'Análise de métricas',
        'Otimização de conversão',
        'Escalonamento de resultados'
    ],
    ARRAY[
        'Aprenda os conceitos fundamentais do tráfego pago: plataformas disponíveis, tipos de anúncios, métricas principais e estrutura de campanhas.',
        'Desenvolva uma definição precisa do seu público-alvo. Crie personas detalhadas e segmentações específicas para suas campanhas.',
        'Crie anúncios persuasivos com copy, imagem e proposta de valor alinhados. Desenvolva versões diferentes para testes.',
        'Configure sua primeira campanha com todos os parâmetros otimizados: objetivo, público, orçamento, formato e segmentação.',
        'Aprenda a gerenciar seu orçamento de forma eficiente, estabelecendo limites diários, lances adequados e monitoramento constante.',
        'Implemente um sistema de análise diária das métricas principais: CPC, CTR, taxa de conversão e ROAS. Identifique pontos de melhoria.',
        'Otimize sua página de destino e funil de vendas para maximizar as conversões do tráfego pago. Elimine atritos e facilite a compra.',
        'Aprenda a escalonar resultados positivos: aumentando orçamento, expandindo públicos semelhantes e replicando campanhas vencedoras.'
    ]
); 