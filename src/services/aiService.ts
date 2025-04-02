import { RelevantContent } from '../types/contentTypes';

// Chave da API Deepseek
const DEEPSEEK_API_KEY = 'sk-dfb407e8a9264e9c93def213f7941ebf';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

export interface AIGenerationOptions {
  topic: string;
  additionalInfo?: string;
  tone?: string;
  targetAudience?: string;
  contentLength?: string;
  includeHeaders?: boolean;
  includeFAQs?: boolean;
  customAuthor?: string;
}

interface DeepseekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

// Adicionar uma interface para as opções de melhoria do conteúdo
export interface ContentBoostOptions {
  existingContent: string;
  existingTitle: string;
  boostType: 'depth' | 'seo' | 'engagement' | 'examples' | 'all';
  additionalInstructions?: string;
}

// Serviço para interações com IA usando Deepseek
export const aiService = {
  /**
   * Gera conteúdo relevante utilizando a API Deepseek V3
   * @param options - Opções para geração do conteúdo
   * @returns Promise com o conteúdo gerado
   */
  generateRelevantContent: async (options: AIGenerationOptions): Promise<RelevantContent> => {
    const { 
      topic, 
      additionalInfo = '', 
      tone = 'profissional', 
      targetAudience = 'profissionais de marketing digital',
      contentLength = 'médio',
      includeHeaders = true,
      includeFAQs = false,
      customAuthor = 'AI Deepseek V3'
    } = options;

    if (!topic || topic.trim() === '') {
      throw new Error('Tópico é obrigatório para gerar conteúdo');
    }

    // Timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      // Estruturar o prompt para o modelo
      let systemPrompt = `Você é um especialista em criação de conteúdo para marketing digital com amplo conhecimento em ${topic}.
      Seu objetivo é criar conteúdo de alta qualidade, extremamente detalhado e abrangente que seja informativo, envolvente e otimizado para SEO.
      Utilize linguagem em português brasileiro, formal mas acessível, e estruture o conteúdo de forma lógica e organizada.
      Procure criar um conteúdo completo e autoritativo sobre o assunto, que demonstre expertise profundo e forneça valor real ao leitor.`;

      let userPrompt = `
        Crie um conteúdo detalhado, abrangente e aprofundado sobre "${topic}".
        
        Detalhes sobre o conteúdo:
        - Tom de voz: ${tone}
        - Público-alvo: ${targetAudience}
        - Extensão do conteúdo: ${contentLength}
        - ${includeHeaders ? 'Incluir títulos e subtítulos organizados hierarquicamente (H1, H2, H3)' : 'Sem títulos e subtítulos'}
        - ${includeFAQs ? 'Incluir seção de perguntas frequentes (FAQ) no final com pelo menos 5 perguntas relevantes' : 'Não incluir FAQ'}
        ${additionalInfo ? `\n- Informações adicionais: ${additionalInfo}` : ''}
        
        O conteúdo deve:
        1. Ter um título atraente e otimizado para SEO
        2. Incluir uma meta descrição de 150-160 caracteres
        3. Conter uma introdução envolvente que capte a atenção do leitor e apresente o problema ou necessidade
        4. Ter conteúdo principal detalhado com informações valiosas, atualizadas e organizadas em seções lógicas
        5. Incluir exemplos práticos, casos de uso reais, dados estatísticos e pesquisas quando relevante
        6. Fornecer conselhos acionáveis e soluções claras para os problemas do leitor
        7. Terminar com uma conclusão que resuma os pontos principais e inclua um call-to-action persuasivo
        8. Utilizar uma linguagem clara, direta e envolvente, evitando jargões desnecessários
        
        Formate o conteúdo em HTML limpo e semântico, utilizando tags adequadas como:
        - <h1>, <h2>, <h3> para hierarquia de títulos
        - <p> para parágrafos
        - <ul>, <ol>, <li> para listas
        - <strong>, <em> para ênfase
        - <blockquote> para citações
        
        Importante:
        - Não inclua aviso de que você é uma IA, apenas entregue o conteúdo
        - Forneça informações precisas e atualizadas
        - O conteúdo deve ser original e não parecer gerado por IA
        - Seja claro, conciso e direto, mas sem sacrificar a profundidade
        - Crie um conteúdo que demonstre autoridade no assunto
      `;

      console.log('Chamando API Deepseek com o tópico:', topic);
      console.log('Prompt do sistema:', systemPrompt);
      console.log('Prompt do usuário:', userPrompt);

      // Chamada para a API Deepseek
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: contentLength === 'longo' ? 4000 : contentLength === 'médio' ? 3000 : 2000,
          top_p: 0.9
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API Deepseek:', response.status, errorText);
        
        // Tratamento específico para diferentes códigos de erro
        if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Por favor, aguarde um momento e tente novamente.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Erro de autenticação com a API Deepseek. Verifique se a chave API está válida.');
        } else if (response.status >= 500) {
          throw new Error('O servidor da API Deepseek está com problemas. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro ao chamar a API Deepseek (${response.status}): ${errorText}`);
        }
      }

      const result = await response.json() as DeepseekResponse;
      
      if (!result || !result.choices || !result.choices.length || !result.choices[0]?.message?.content) {
        console.error('Resposta inválida da API Deepseek:', result);
        throw new Error('A API Deepseek retornou uma resposta em formato inválido ou vazio.');
      }

      const generatedContent = result.choices[0].message.content;
      
      // Extrair título e meta descrição do conteúdo
      let title = topic;
      let description = '';
      let content = generatedContent;

      // Tentar extrair o título (geralmente é o primeiro H1 ou a primeira linha)
      const titleMatch = generatedContent.match(/<h1[^>]*>(.*?)<\/h1>/i) || generatedContent.match(/^#\s+(.*)$/m);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
        // Remover tags HTML do título se houver
        title = title.replace(/<[^>]*>/g, '');
      }

      // Tentar extrair a meta descrição
      const descMatch = generatedContent.match(/<meta[^>]*description[^>]*content="([^"]*)"/) || 
                        generatedContent.match(/Meta descrição:?\s*([^\n]+)/i);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      } else {
        // Se não encontrar descrição explícita, usar o primeiro parágrafo
        const firstParagraph = generatedContent.match(/<p[^>]*>(.*?)<\/p>/i);
        if (firstParagraph && firstParagraph[1]) {
          // Remover tags HTML e limitar a 160 caracteres
          const cleanText = firstParagraph[1].replace(/<[^>]*>/g, '');
          description = cleanText.substring(0, 157) + '...';
        } else {
          description = `Conteúdo sobre ${topic} - Informações valiosas e atualizadas para ${targetAudience}`;
        }
      }

      // Gerar tags com base no tópico e conteúdo
      const suggestedTags = [topic.toLowerCase()];
      
      // Extrair possíveis palavras-chave do conteúdo para gerar mais tags
      const contentText = generatedContent.replace(/<[^>]*>/g, ' ');
      const keywords = extractKeywords(contentText, topic);
      suggestedTags.push(...keywords);
      
      // Retornar o conteúdo estruturado
      return {
        id: '',
        title,
        description,
        content,
        image_url: '',
        status: 'draft',
        author: customAuthor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: suggestedTags,
        view_count: 0,
        like_count: 0
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('A requisição excedeu o tempo limite. Para conteúdos mais longos, pode ser necessário mais tempo.');
        } else if (error.name === 'TypeError' || error.name === 'SyntaxError') {
          console.error('Erro ao processar resposta da API:', error);
          throw new Error('Erro ao processar a resposta da API Deepseek. Tente novamente.');
        }
        // Repassar erros já tratados
        throw error;
      }
      console.error('Erro desconhecido ao gerar conteúdo com IA:', error);
      throw new Error(`Falha ao gerar conteúdo: Erro desconhecido, tente novamente mais tarde.`);
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * Gera uma URL de imagem sugerida com base no título do conteúdo
   * @param title - Título do conteúdo
   * @returns URL da imagem sugerida
   */
  getSuggestedImageUrl: (title: string): string => {
    // Usar o Unsplash para obter imagens relacionadas ao tópico
    const encodedQuery = encodeURIComponent(title);
    return `https://source.unsplash.com/1200x630/?${encodedQuery}`;
  },

  /**
   * Melhora e expande um conteúdo existente
   * @param options - Opções para o impulso do conteúdo
   * @returns Promise com o conteúdo melhorado
   */
  boostContent: async (options: ContentBoostOptions): Promise<string> => {
    const { existingContent, existingTitle, boostType, additionalInstructions = '' } = options;
    
    if (!existingContent) {
      throw new Error('É necessário fornecer um conteúdo existente para melhorar');
    }

    // Timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      // Estruturar o prompt para o modelo com base no tipo de impulso
      let boostInstruction = '';
      
      switch (boostType) {
        case 'depth':
          boostInstruction = 'Expanda e aprofunde o conteúdo com mais detalhes, exemplos e explicações, mantendo a estrutura original.';
          break;
        case 'seo':
          boostInstruction = 'Otimize o conteúdo para SEO, melhorando palavras-chave, meta descrições, headings e densidade de palavras-chave.';
          break;
        case 'engagement':
          boostInstruction = 'Torne o conteúdo mais envolvente e cativante, melhorando a narrativa, adicionando perguntas retóricas e elementos persuasivos.';
          break;
        case 'examples':
          boostInstruction = 'Adicione mais exemplos práticos, casos de uso reais e estudos de caso para ilustrar os pontos principais.';
          break;
        case 'all':
        default:
          boostInstruction = 'Melhore significativamente este conteúdo, expandindo-o com mais detalhes, exemplos, otimizações SEO e elementos de engajamento.';
      }

      // Estruturar o prompt para o modelo
      let systemPrompt = `Você é um especialista em melhoria de conteúdo com vasto conhecimento no assunto "${existingTitle}".
      Seu objetivo é aprimorar significativamente o conteúdo fornecido, mantendo sua essência e estrutura básica, mas tornando-o mais completo, detalhado e valioso.
      Você deve atuar como um editor especializado que sabe como transformar conteúdos bons em conteúdos excelentes.
      Busque sempre adicionar valor através de exemplos, dados, estudos de caso, estatísticas e explicações mais aprofundadas.`;

      let userPrompt = `
        Melhore o seguinte conteúdo sobre "${existingTitle}".
        
        Instruções específicas:
        ${boostInstruction}
        ${additionalInstructions ? `\nInstruções adicionais: ${additionalInstructions}` : ''}
        
        Ao melhorar este conteúdo:
        1. Preserve o formato HTML e a estrutura básica
        2. Mantenha o tom e estilo originais
        3. Não remova informações existentes, apenas acrescente e melhore
        4. Adicione novos subtópicos relevantes e expanda as seções existentes
        5. Insira estatísticas atualizadas, dados relevantes, estudos de caso e exemplos práticos
        6. Melhore a otimização para SEO, incluindo palavras-chave naturalmente no texto
        7. Torne o conteúdo mais persuasivo e envolvente para o leitor
        8. Adicione citações de especialistas ou fontes confiáveis quando apropriado
        9. Garanta que o conteúdo final seja significativamente mais detalhado e valioso
        
        Aqui está o conteúdo original a ser melhorado:
        
        ${existingContent}
        
        Forneça apenas o conteúdo melhorado, sem explicações ou introduções.
        O HTML deve estar limpo e bem formatado, mantendo a estrutura semântica apropriada.
      `;

      console.log('Chamando API Deepseek para melhorar conteúdo');
      console.log('Tipo de impulso:', boostType);

      // Chamada para a API Deepseek
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 6000,
          top_p: 0.9
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API Deepseek ao melhorar conteúdo:', response.status, errorText);
        
        // Tratamento específico para diferentes códigos de erro
        if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Por favor, aguarde um momento e tente novamente.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Erro de autenticação com a API Deepseek. Verifique se a chave API está válida.');
        } else if (response.status >= 500) {
          throw new Error('O servidor da API Deepseek está com problemas. Tente novamente mais tarde.');
        } else {
          throw new Error(`Erro ao chamar a API Deepseek (${response.status}): ${errorText}`);
        }
      }

      const result = await response.json() as DeepseekResponse;
      
      if (!result || !result.choices || !result.choices.length || !result.choices[0]?.message?.content) {
        console.error('Resposta inválida da API Deepseek:', result);
        throw new Error('A API Deepseek retornou uma resposta em formato inválido ou vazio.');
      }

      // Retornar o conteúdo melhorado
      return result.choices[0].message.content;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('A requisição de melhoria excedeu o tempo limite. Para conteúdos mais longos, pode ser necessário mais tempo.');
        } else if (error.name === 'TypeError' || error.name === 'SyntaxError') {
          console.error('Erro ao processar resposta da API:', error);
          throw new Error('Erro ao processar a resposta da API Deepseek. Tente novamente.');
        }
        // Repassar erros já tratados
        throw error;
      }
      console.error('Erro desconhecido ao melhorar conteúdo com IA:', error);
      throw new Error(`Falha ao melhorar conteúdo: Erro desconhecido, tente novamente mais tarde.`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
};

/**
 * Extrai palavras-chave relevantes do texto
 * @param text - Texto para extrair palavras-chave
 * @param mainTopic - Tópico principal para comparação
 * @returns Array de palavras-chave únicas
 */
function extractKeywords(text: string, mainTopic: string): string[] {
  // Lista de palavras a serem ignoradas (stopwords em português)
  const stopwords = ['a', 'o', 'e', 'é', 'de', 'da', 'do', 'em', 'para', 'com', 'um', 'uma', 'os', 'as', 'que', 'por', 'mais', 'como'];
  
  // Normalizar texto e dividir em palavras
  const words = text.toLowerCase()
    .replace(/[^\w\sáàâãéèêíìóòôõúùç]/g, '') // Manter apenas letras, números e espaços
    .split(/\s+/);
  
  // Contar frequência das palavras
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    if (
      word.length > 3 && // Palavras com mais de 3 caracteres
      !stopwords.includes(word) && // Excluir stopwords
      word !== mainTopic.toLowerCase() // Excluir o tópico principal
    ) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Converter para array e ordenar por frequência
  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Retornar as 5 palavras mais frequentes
  return [...new Set(sortedWords.slice(0, 5))];
}

export default aiService; 