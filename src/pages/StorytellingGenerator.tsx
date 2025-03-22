import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Wand2, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Definindo interfaces para tipos
interface Field {
  key: string;
  label: string;
  placeholder: string;
}

interface Template {
  id: number;
  title: string;
  description: string;
  template: string;
  fields: Field[];
}

interface Inputs {
  [key: string]: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  out: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.5,
      ease: "easeIn"
    }
  }
};

const storyTemplates = [
  {
    id: 1,
    title: 'Jornada do Herói',
    description: 'Transforme seu cliente no protagonista da história',
    template: 'Antes de [PRODUTO], eu lutava com [DESAFIO]. Então descobri [SOLUÇÃO], e agora [RESULTADO_TRANSFORMADOR].',
    fields: [
      { key: 'produto', label: 'Produto/Serviço', placeholder: 'O que você oferece?' },
      { key: 'desafio', label: 'Desafio Inicial', placeholder: 'Qual problema seu cliente enfrentava?' },
      { key: 'solucao', label: 'Momento de Virada', placeholder: 'Como seu produto ajudou?' },
      { key: 'resultado', label: 'Transformação', placeholder: 'Qual resultado foi alcançado?' }
    ]
  },
  {
    id: 2,
    title: 'Antes e Depois',
    description: 'Destaque a transformação completa',
    template: 'Imagine estar [SITUACAO_INICIAL]. Hoje, depois de [ACAO], minha vida é [SITUACAO_ATUAL].',
    fields: [
      { key: 'situacaoInicial', label: 'Situação Inicial', placeholder: 'Como era antes?' },
      { key: 'acao', label: 'Ação Transformadora', placeholder: 'O que mudou?' },
      { key: 'situacaoAtual', label: 'Situação Atual', placeholder: 'Como está agora?' }
    ]
  },
  {
    id: 3,
    title: 'Desafio e Superação',
    description: 'Mostre como seu produto resolve problemas',
    template: 'Quando [PROBLEMA] parecia impossível, [PRODUTO] me mostrou que [INSIGHT_REVELADOR].',
    fields: [
      { key: 'problema', label: 'Problema', placeholder: 'Qual era o desafio aparentemente impossível?' },
      { key: 'produto', label: 'Solução', placeholder: 'Qual produto/serviço ajudou?' },
      { key: 'insightRevelador', label: 'Insight', placeholder: 'Qual foi a grande revelação?' }
    ]
  },
  {
    id: 4,
    title: 'Descoberta Incrível',
    description: 'Compartilhe uma descoberta valiosa com seu público',
    template: 'Você sabia que [FATO_SURPREENDENTE]? Descobri isso quando [CONTEXTO_DESCOBERTA] e percebi que [APRENDIZADO]. Isto mudou completamente [AREA_IMPACTO].',
    fields: [
      { key: 'fatoSurpreendente', label: 'Fato Surpreendente', placeholder: 'Qual é a informação surpreendente?' },
      { key: 'contextoDescoberta', label: 'Contexto da Descoberta', placeholder: 'Como você descobriu isso?' },
      { key: 'aprendizado', label: 'Aprendizado', placeholder: 'O que você percebeu com isso?' },
      { key: 'areaImpacto', label: 'Área de Impacto', placeholder: 'O que mudou com essa descoberta?' }
    ]
  },
  {
    id: 5,
    title: 'Problema-Solução-Benefício',
    description: 'Estrutura clássica para apresentar seu produto ou serviço',
    template: 'Muitas pessoas enfrentam [PROBLEMA_COMUM]. A maioria tenta [SOLUCAO_COMUM], mas isso leva a [LIMITACAO]. Nossa abordagem é [DIFERENCIAL], que proporciona [BENEFICIO_PRINCIPAL].',
    fields: [
      { key: 'problemaComum', label: 'Problema Comum', placeholder: 'Qual problema seu público enfrenta?' },
      { key: 'solucaoComum', label: 'Solução Tradicional', placeholder: 'O que normalmente é feito?' },
      { key: 'limitacao', label: 'Limitação', placeholder: 'Por que isso não funciona bem?' },
      { key: 'diferencial', label: 'Seu Diferencial', placeholder: 'Como sua solução é diferente?' },
      { key: 'beneficioPrincipal', label: 'Benefício Principal', placeholder: 'Qual o resultado positivo?' }
    ]
  },
  {
    id: 6,
    title: 'História de Bastidores',
    description: 'Mostre o processo por trás do seu trabalho',
    template: 'Todo mundo vê [RESULTADO_VISIVEL], mas poucos sabem que por trás disso há [TRABALHO_BASTIDORES]. O desafio mais difícil foi [DESAFIO_OCULTO], mas valeu a pena porque [RECOMPENSA].',
    fields: [
      { key: 'resultadoVisivel', label: 'Resultado Visível', placeholder: 'O que as pessoas veem?' },
      { key: 'trabalhoBastidores', label: 'Trabalho nos Bastidores', placeholder: 'O que acontece por trás?' },
      { key: 'desafioOculto', label: 'Desafio Oculto', placeholder: 'Qual foi a maior dificuldade?' },
      { key: 'recompensa', label: 'Recompensa', placeholder: 'Por que valeu a pena?' }
    ]
  }
];

const StorytellingGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(storyTemplates[0]);
  const [inputs, setInputs] = useState<Inputs>({});
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<string>('emocional');
  const [audienceType, setAudienceType] = useState<string>('geral');

  useEffect(() => {
    const initialInputs: Inputs = {};
    selectedTemplate.fields.forEach(field => {
      initialInputs[field.key] = '';
    });
    setInputs(initialInputs);
  }, [selectedTemplate]);

  const generateStory = () => {
    let story = selectedTemplate.template;
    
    Object.keys(inputs).forEach(key => {
      const placeholder = key.toUpperCase();
      story = story.replace(`[${placeholder}]`, inputs[key] || `[${placeholder}]`);
    });

    setGeneratedStory(story);
  };

  const generateStoryWithAI = async () => {
    // Verificar se temos informações suficientes
    const emptyFields = Object.values(inputs).filter(value => !value.trim()).length;
    const totalFields = Object.keys(inputs).length;
    
    if (emptyFields > totalFields / 2) {
      setError('Preencha pelo menos metade dos campos para gerar uma história personalizada.');
      return;
    }

    setIsGeneratingAI(true);
    setError(null);
    
    try {
      // Construir o contexto a partir dos inputs do usuário
      const context = Object.entries(inputs)
        .map(([key, value]) => {
          const field = selectedTemplate.fields.find(f => f.key === key);
          return `${field?.label || key}: ${value}`;
        })
        .filter(entry => entry.split(': ')[1].trim() !== '')
        .join('\n');

      // Configurar o tipo de história baseado na seleção do usuário
      const storyTypeMap: Record<string, string> = {
        'emocional': 'emocional e envolvente',
        'transformacao': 'de transformação pessoal',
        'desafio': 'de superação de desafios',
        'educativo': 'educativa e informativa',
        'engracado': 'com toques de humor'
      };
      
      const audienceTypeMap: Record<string, string> = {
        'geral': 'público geral',
        'jovem': 'público jovem',
        'profissional': 'profissionais',
        'especialista': 'especialistas do setor'
      };

      const escolhidoStoryType = storyTypeMap[storyType] || storyTypeMap.emocional;
      const escolhidoAudience = audienceTypeMap[audienceType] || audienceTypeMap.geral;
      
      // Construir o prompt para a API Deepseek
      const prompt = `Crie uma história curta ${escolhidoStoryType} para ${escolhidoAudience} no formato de storytelling para Instagram. 
      Use estas informações como contexto:
      
      ${context}
      
      A história deve seguir o formato do modelo "${selectedTemplate.title}".
      Crie um texto envolvente, em português do Brasil, com 3-4 parágrafos curtos.
      Inclua elementos de narrativa como tensão, resolução e chamada para ação.
      Mantenha um tom alinhado ao tema e adapte para uso em marketing digital.`;

      // Timeout para não bloquear a interface
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout - A API demorou muito para responder')), 15000);
      });
      
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
              content: 'Você é um especialista em storytelling e marketing de conteúdo. Sua especialidade é criar histórias persuasivas que engajam audiências.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 600
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
      
      // Extrair a história gerada
      if (result.choices && result.choices[0]?.message?.content) {
        const aiContent = result.choices[0].message.content.trim();
        setGeneratedStory(aiContent);
      } else {
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('Erro ao gerar história:', error);
      setError(`Não foi possível gerar a história: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Fallback para geração local se a API falhar
      let localStory = selectedTemplate.template;
      
      Object.keys(inputs).forEach(key => {
        const placeholder = key.toUpperCase();
        localStory = localStory.replace(`[${placeholder}]`, inputs[key] || `[${placeholder}]`);
      });
      
      setGeneratedStory(localStory);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedStory);
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center mb-8"
        >
          <BookOpen className="text-emerald-500 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-emerald-800">Gerador de Storytelling</h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-emerald-700">Escolha um Modelo</h2>
            <div className="space-y-4">
              {storyTemplates.map((template) => (
                <motion.div 
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    p-4 rounded-lg cursor-pointer transition-all 
                    ${selectedTemplate.id === template.id 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-emerald-100'
                    }
                  `}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h3 className="font-bold">{template.title}</h3>
                  <p className="text-sm">{template.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-emerald-700">
              Personalize sua História - {selectedTemplate.title}
            </h2>
            <div className="space-y-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.key}>
                  <label className="block mb-2 text-sm text-gray-700">
                    {field.label}
                  </label>
                  <input 
                    type="text" 
                    placeholder={field.placeholder}
                    value={inputs[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-2 text-sm text-gray-700">Tipo de História</label>
                  <select
                    value={storyType}
                    onChange={(e) => setStoryType(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="emocional">Emocional</option>
                    <option value="transformacao">Transformação</option>
                    <option value="desafio">Superação</option>
                    <option value="educativo">Educativo</option>
                    <option value="engracado">Humor</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-gray-700">Público-Alvo</label>
                  <select
                    value={audienceType}
                    onChange={(e) => setAudienceType(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="geral">Geral</option>
                    <option value="jovem">Jovem</option>
                    <option value="profissional">Profissional</option>
                    <option value="especialista">Especializado</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateStory}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-center"
                >
                  <Wand2 className="mr-2" /> Gerar Básico
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateStoryWithAI}
                  disabled={isGeneratingAI}
                  className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-lg flex items-center justify-center ${
                    isGeneratingAI ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" /> Deepseek V3
                    </>
                  )}
              </motion.button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-1">
                Esta ferramenta é apenas uma ajuda inicial. Para usos mais avançados da IA, 
                visite o <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">site oficial da Deepseek</a>.
              </p>

              {error && (
                <div className="flex items-start space-x-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {generatedStory && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-emerald-700 mr-2">História Gerada</h2>
                {isGeneratingAI && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Deepseek V3</span>}
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={copyToClipboard}
                  className="text-emerald-500 hover:bg-emerald-50 p-2 rounded-full"
                >
                  <Copy size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={generateStory}
                  className="text-emerald-500 hover:bg-emerald-50 p-2 rounded-full"
                >
                  <RefreshCw size={20} />
                </motion.button>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{generatedStory}</p>
            
            <div className="mt-4 bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 text-emerald-800">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Este storytelling foi gerado com nossa IA do Deepseek, que é limitada. 
                  Para melhorias e personalizações adicionais, recomendamos que acesse a plataforma 
                  <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline ml-1">
                    Deepseek
                  </a> e continue aprimorando este texto.
                </p>
            </div>
          </div>
        </motion.div>
        )}

        {generatedStory && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">
              Tutorial: Aplicando Storytelling Efetivo
            </h2>
            <p className="text-gray-700 mb-4">
              Assista este tutorial completo sobre como aplicar técnicas avançadas de storytelling, 
              organização de conteúdo, hierarquia visual e chamadas para ação que vão transformar 
              suas histórias em conversões.
            </p>
            <div className="relative pt-[56.25%] w-full">
              <iframe 
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/Nj5RCaE_b00" 
                title="Tutorial de Storytelling Avançado" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StorytellingGenerator;
 