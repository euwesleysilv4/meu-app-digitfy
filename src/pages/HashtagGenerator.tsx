import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Copy, Check, Sparkles, Loader2, AlertCircle, Instagram, Youtube, Linkedin, Store, Briefcase, TrendingUp, Settings, Globe } from 'lucide-react';

const HashtagGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<
    'instagram' | 
    'tiktok' | 
    'youtube' | 
    'marketing' | 
    'negocios' | 
    'tecnologia' | 
    'moda' | 
    'saude' |
    'outro'
  >('instagram');
  const [customNiche, setCustomNiche] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Método básico para gerar hashtags a partir do texto
  const generateHashtags = () => {
    const words = inputText.split(' ').filter(word => word.trim() !== '');
    const newHashtags = words.map(word => `#${word.toLowerCase().replace(/[^\w\dáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]/g, '')}`).slice(0, 10); // Limitar a 10 hashtags
    setHashtags(newHashtags);
  };

  // Método avançado usando a API Deepseek V3
  const generateHashtagsWithAI = async () => {
    if (!inputText.trim()) {
      setError('Por favor, digite algum texto para gerar hashtags');
      return;
    }

    setIsGeneratingAI(true);
    setError(null);

    try {
      // Timeout para não bloquear a interface
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - A API demorou muito para responder')), 15000);
      });
      
      // Construir prompt baseado no modo selecionado
      let contextPrompt = "";
      switch (mode) {
        case 'instagram':
          contextPrompt = "Otimize para o Instagram com foco em engajamento, estética e visibilidade.";
          break;
        case 'tiktok':
          contextPrompt = "Otimize para o TikTok com foco em tendências virais, challenges e conteúdo de vídeo curto.";
          break;
        case 'youtube':
          contextPrompt = "Otimize para o YouTube com foco em SEO, descoberta de conteúdo e categorização de vídeos.";
          break;
        case 'marketing':
          contextPrompt = "Foco em marketing digital, promoção de produtos/serviços e campanhas.";
          break;
        case 'negocios':
          contextPrompt = "Foco em empreendedorismo, gestão e visibilidade para negócios.";
          break;
        case 'tecnologia':
          contextPrompt = "Foco em tecnologia, inovação, digital e tendências tech.";
          break;
        case 'moda':
          contextPrompt = "Foco em moda, estilo, tendências e beleza.";
          break;
        case 'saude':
          contextPrompt = "Foco em saúde, bem-estar, fitness e vida saudável.";
          break;
        case 'outro':
          contextPrompt = customNiche ? `Foco no nicho de ${customNiche}.` : "Foco em engajamento e visibilidade geral.";
          break;
        default:
          contextPrompt = "Foco em engajamento e visibilidade geral.";
      }
      
      // Prompt para a API
      const prompt = `Com base no seguinte texto, gere 15 hashtags relevantes em português brasileiro. ${contextPrompt}
      
      Texto: "${inputText}"
      
      Considere:
      - Palavras-chave relevantes do texto
      - Tendências atuais relacionadas ao tema
      - Hashtags populares no nicho específico selecionado
      - Combinação de hashtags específicas e genéricas
      - Hashtags sem espaços e acentos adequados
      - Especificidades da plataforma escolhida
      
      Responda APENAS com uma lista de hashtags separadas por vírgula, sem numeração ou explicações adicionais.
      Não inclua o símbolo # nas hashtags, eu adicionarei depois.`;

      // Chamada para a API Deepseek
      const fetchPromise = fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-5aa1c8205bb846b68c3de8660b3523e4'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em redes sociais e marketing digital, com amplo conhecimento em hashtags eficazes para cada plataforma e nicho específico.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        }),
      });
      
      // Executa com timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API do Deepseek - Status:', response.status, 'Resposta:', errorText);
        
        if (response.status === 401) {
          throw new Error('Erro de autenticação com a API Deepseek');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
        } else {
          throw new Error(`Erro na API (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }

      const result = await response.json();
      
      // Processar as hashtags retornadas pela API
      if (result.choices && result.choices[0]?.message?.content) {
        const aiContent = result.choices[0].message.content.trim();
        // Dividir por vírgula, remover espaços extras e adicionar #
        const hashtagList = aiContent
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
          .map((tag: string) => `#${tag}`);
        
        setHashtags(hashtagList);
      } else {
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('Erro ao gerar hashtags:', error);
      setError(`Não foi possível gerar hashtags: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Fallback para o método básico se a API falhar
      generateHashtags();
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopyHashtags = () => {
    const hashtagsString = hashtags.join(' ');
    navigator.clipboard.writeText(hashtagsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handler para o modo "outro"
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setShowCustomInput(newMode === 'outro');
  };

  // Função para retornar o ícone correto para cada modo
  const getModeIcon = (modeName: string) => {
    switch (modeName) {
      case 'instagram':
        return <Instagram className="w-4 h-4 mr-2" />;
      case 'tiktok':
        return <TrendingUp className="w-4 h-4 mr-2" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 mr-2" />;
      case 'marketing':
        return <Store className="w-4 h-4 mr-2" />;
      case 'negocios':
        return <Briefcase className="w-4 h-4 mr-2" />;
      case 'tecnologia':
        return <Settings className="w-4 h-4 mr-2" />;
      case 'moda':
        return <Briefcase className="w-4 h-4 mr-2" />;
      case 'saude':
        return <Briefcase className="w-4 h-4 mr-2" />;
      case 'outro':
        return <Globe className="w-4 h-4 mr-2" />;
      default:
        return <Hash className="w-4 h-4 mr-2" />;
    }
  };

  // Função para obter o nome de exibição do modo
  const getModeName = (modeName: string) => {
    const modeMap: Record<string, string> = {
      'instagram': 'Instagram',
      'tiktok': 'TikTok',
      'youtube': 'YouTube',
      'marketing': 'Marketing Digital',
      'negocios': 'Negócios',
      'tecnologia': 'Tecnologia',
      'moda': 'Moda',
      'saude': 'Saúde',
      'outro': customNiche || 'Outro'
    };
    
    return modeMap[modeName] || modeName;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center space-x-3">
          <Hash className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Gerador de Hashtags
          </h1>
        </div>

        {/* Descrição */}
        <motion.div 
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm border border-emerald-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-emerald-600">
            Crie hashtags relevantes e otimizadas para suas postagens com nossa inteligência artificial Deepseek V3. Aumente seu alcance e engajamento nas redes sociais com hashtags estratégicas para plataformas específicas.
          </p>
        </motion.div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto para Gerar Hashtags
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-4 shadow-inner"
              placeholder="Digite o texto do seu post, ou descreva o conteúdo para o qual deseja gerar hashtags..."
            />
          </div>

          {/* Modos de otimização - Design melhorado */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Otimização por Plataforma ou Nicho
            </label>
            
            {/* Seleção de categoria - Plataformas */}
            <div className="mb-4">
              <h4 className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
                <Hash className="w-3 h-3 mr-1" />
                Plataformas
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleModeChange('instagram')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'instagram'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </button>
                <button
                  onClick={() => handleModeChange('tiktok')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'tiktok'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  TikTok
                </button>
                <button
                  onClick={() => handleModeChange('youtube')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'youtube'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  YouTube
                </button>
              </div>
            </div>
            
            {/* Seleção de categoria - Nichos */}
            <div>
              <h4 className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 mb-2">
                <Briefcase className="w-3 h-3 mr-1" />
                Nichos
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleModeChange('marketing')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'marketing'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Marketing
                </button>
                <button
                  onClick={() => handleModeChange('negocios')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'negocios'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Negócios
                </button>
                <button
                  onClick={() => handleModeChange('tecnologia')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'tecnologia'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Tecnologia
                </button>
                <button
                  onClick={() => handleModeChange('moda')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'moda'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Moda
                </button>
                <button
                  onClick={() => handleModeChange('saude')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'saude'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Saúde
                </button>
                <button
                  onClick={() => handleModeChange('outro')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                    mode === 'outro'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Outro
                </button>
              </div>
            </div>
            
            {/* Campo de input para o modo "outro" */}
            {showCustomInput && (
              <div className="mt-3 ml-2 flex items-center">
                <input
                  type="text"
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  placeholder="Especifique o nicho..."
                  className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
            )}
            
            {/* Indicador visual do modo selecionado */}
            <div className="flex items-center px-4 py-3 mt-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-100">
              {getModeIcon(mode)}
              <span className="text-sm text-emerald-700">
                Otimizado para 
                <span className="font-semibold"> {getModeName(mode)}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
            <button
              onClick={generateHashtags}
              className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 border border-gray-200"
            >
              <Hash className="w-4 h-4 mr-2" /> 
              <span className="font-medium">Gerar Básico</span>
            </button>
            
            <button
              onClick={generateHashtagsWithAI}
              disabled={isGeneratingAI || !inputText.trim()}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isGeneratingAI || !inputText.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:from-emerald-600 hover:to-teal-600'
              }`}
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                  <span className="font-medium">Gerando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> 
                  <span className="font-medium">Deepseek V3</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            Esta ferramenta utiliza a poderosa API do Deepseek V3 para gerar hashtags precisas e relevantes.
          </p>

          {error && (
            <div className="flex items-start space-x-2 text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Hashtags Geradas - Design melhorado */}
          {hashtags.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-emerald-500" />
                  Hashtags Geradas
                </h3>
                {isGeneratingAI && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                    Deepseek V3
                  </span>
                )}
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((hashtag, index) => (
                    <motion.span 
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm hover:bg-emerald-100 transition-colors duration-200 shadow-sm"
                    >
                      {hashtag}
                    </motion.span>
                  ))}
                </div>
                
                <div className="flex justify-end mt-5">
                  <button
                    onClick={handleCopyHashtags}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copiar Hashtags</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dicas para uso de hashtags - Design aprimorado */}
              <div className="mt-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
                    <h4 className="text-sm font-medium flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Dicas para uso eficaz de hashtags
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-emerald-600 font-medium text-sm mb-2 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2">1</span>
                        Quantidade ideal
                      </div>
                      <p className="text-xs text-gray-600">Instagram: 5-10 hashtags | TikTok: 3-5 | YouTube: 5-8</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-emerald-600 font-medium text-sm mb-2 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2">2</span>
                        Combine específicas e gerais
                      </div>
                      <p className="text-xs text-gray-600">Use hashtags de nicho (menos competição) e populares (mais exposição)</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-emerald-600 font-medium text-sm mb-2 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2">3</span>
                        Pesquise concorrentes
                      </div>
                      <p className="text-xs text-gray-600">Analise hashtags usadas por perfis similares bem-sucedidos</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-emerald-600 font-medium text-sm mb-2 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2">4</span>
                        Evite hashtags banidas
                      </div>
                      <p className="text-xs text-gray-600">Algumas hashtags podem ser shadowbanned ou bloqueadas pelas plataformas</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-emerald-600 font-medium text-sm mb-2 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2">5</span>
                        Crie hashtags próprias
                      </div>
                      <p className="text-xs text-gray-600">Desenvolva hashtags exclusivas para sua marca ou campanhas</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-emerald-600 font-medium text-sm mb-2 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2">6</span>
                        Varie as hashtags
                      </div>
                      <p className="text-xs text-gray-600">Não use sempre as mesmas; algoritmos podem penalizar padrões repetitivos</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-t border-gray-100">
                    <p className="text-xs text-emerald-700 text-center">
                      Atualize regularmente suas hashtags com base no desempenho e tendências atuais
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HashtagGenerator; 