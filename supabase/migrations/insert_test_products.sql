-- Script para inserir produtos de teste no banco de dados
-- Esse script garante que existam produtos para exibição na página

-- Verificar quantos produtos existem no sistema
DO $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.recommended_products;
    RAISE NOTICE 'Total de produtos no sistema: %', product_count;
    
    -- Se não houver produtos ou tiver menos de 3, adicionar produtos de teste
    IF product_count < 3 THEN
        -- Limpar produtos existentes para evitar duplicação
        DELETE FROM public.recommended_products;
        
        -- Inserir produtos normais
        INSERT INTO public.recommended_products (
            name, 
            description, 
            price, 
            category, 
            image, 
            benefits, 
            rating, 
            sales_url, 
            is_featured,
            created_at,
            updated_at
        ) VALUES 
        -- Produtos comuns (não destacados)
        (
            'Curso de Instagram Marketing', 
            'Aprenda a criar conteúdo que engaja e converte no Instagram',
            199.00,
            'Marketing Digital',
            'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
            ARRAY['35 aulas em vídeo', 'Templates de posts', 'Suporte por 30 dias', 'Acesso vitalício'],
            4.7,
            'https://cursos.example.com/instagram-marketing',
            FALSE,
            NOW(),
            NOW()
        ),
        (
            'Kit de Planilhas para Gestão Financeira', 
            'Pacote completo com 15 planilhas para controle financeiro pessoal e empresarial',
            89.90,
            'Finanças',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200',
            ARRAY['Controle de gastos', 'Planejamento de investimentos', 'Fluxo de caixa', 'Controle de orçamento'],
            4.9,
            'https://planilhas.example.com/kit-financeiro',
            FALSE,
            NOW(),
            NOW()
        ),
        (
            'Ebook: Copywriting para Iniciantes', 
            'Guia completo para escrever textos que vendem e convertem',
            37.00,
            'Copywriting',
            'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300&h=200',
            ARRAY['100 páginas de conteúdo', '30 modelos de texto', 'Exercícios práticos', 'Bônus: Headline Formula'],
            4.5,
            'https://ebooks.example.com/copywriting',
            FALSE,
            NOW(),
            NOW()
        ),
        
        -- Produtos em destaque (featured)
        (
            'Método Copywriting Persuasivo Pro', 
            'Sistema completo de copywriting para triplicar suas vendas com textos persuasivos',
            497.00,
            'Copywriting',
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300&h=200',
            ARRAY['8 módulos avançados', 'Templates exclusivos', 'Correção de textos', 'Comunidade VIP'],
            5.0,
            'https://metodos.example.com/copywriting-pro',
            TRUE,
            NOW(),
            NOW()
        ),
        (
            'Pack de Templates Instagram Elite', 
            'Mais de 300 templates premium para Stories e Feed do Instagram',
            297.00,
            'Design',
            'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
            ARRAY['300+ templates editáveis', 'Atualizações mensais', 'Tutoriais em vídeo', 'Arquivos para Canva e Photoshop'],
            4.8,
            'https://templates.example.com/instagram-elite',
            TRUE,
            NOW(),
            NOW()
        ),
        (
            'Curso Masterclass Tráfego Pago', 
            'Domine Facebook Ads, Google Ads e TikTok Ads com estratégias avançadas',
            697.00,
            'Marketing Digital',
            'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=200',
            ARRAY['50+ horas de conteúdo', 'Estudos de caso reais', 'Scripts de anúncios', 'Mentorias em grupo'],
            4.9,
            'https://academia.example.com/trafego-pago',
            TRUE,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Produtos de teste inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'O sistema já possui produtos suficientes. Nenhum produto de teste foi adicionado.';
    END IF;
END$$; 