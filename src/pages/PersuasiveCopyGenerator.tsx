import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Copy, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const PersuasiveCopyGenerator = () => {
  const [inputText, setInputText] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyType, setCopyType] = useState('venda');

  const generateCopy = async () => {
    if (!inputText.trim()) {
      setError('Por favor, digite um texto base para gerar a copy.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Construir o prompt para a API Deepseek
      const copyTypeMap: Record<string, string> = {
        'venda': 'vendas e conversão de leads',
        'email': 'email marketing com alta taxa de abertura',
        'anuncio': 'anúncios de alta conversão',
        'site': 'descrição de produto para site',
        'social': 'posts persuasivos para redes sociais'
      };

      const tipoTexto = copyTypeMap[copyType] || 'vendas e conversão';
      
      const prompt = `Crie um texto persuasivo de copywriting para ${tipoTexto}, com base no seguinte conteúdo: "${inputText}". 
      O texto deve ser em português do Brasil, envolvente, com linguagem persuasiva, usando técnicas de copywriting como:
      - Despertar curiosidade
      - Destacar benefícios claros
      - Usar gatilhos mentais
      - Criar senso de urgência
      - Incluir chamadas para ação efetivas
      
      Formate o texto com parágrafos bem estruturados.`;

      // Configurar timeout para não bloquear a interface
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
              content: 'Você é um especialista em copywriting e marketing. Sua especialidade é criar textos persuasivos que convertem.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });
      
      // Executa com timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API do Deepseek - Status:', response.status, 'Resposta:', errorText);
        
        // Mensagem de erro específica para problemas comuns
        if (response.status === 401) {
          throw new Error('Erro de autenticação com a API Deepseek');
        } else if (response.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos');
        } else {
          throw new Error(`Erro na API (${response.status}): ${errorText.substring(0, 100)}`);
        }
      }

      const result = await response.json();
      
      // Extrair o texto gerado
      if (result.choices && result.choices[0]?.message?.content) {
        setGeneratedCopy(result.choices[0].message.content.trim());
      } else {
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('Erro ao gerar copy:', error);
      setError(`Não foi possível gerar a copy: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Fallback para quando a API falha
      if (inputText.length > 10) {
        const baseCopy = `🚀 ${inputText.slice(0, 30)}...

✨ Transforme sua visão em resultados extraordinários!

💡 Com nossa solução exclusiva, você terá acesso a benefícios que vão revolucionar sua experiência.

⏰ Não perca mais tempo! Esta oportunidade é por tempo limitado.

👉 Entre em contato agora mesmo e descubra como podemos ajudar.`;
        
        setGeneratedCopy(baseCopy);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cabeçalho */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
          <PenTool className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Gerador de Copy Persuasiva
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transforme suas ideias em textos persuasivos e envolventes com IA. 
          Nossa ferramenta utiliza a tecnologia Deepseek V3 para 
          criar conteúdo persuasivo que converte.
        </p>
      </motion.div>

      {/* Container Principal */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Área de Input */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu Texto Base
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite informações sobre seu produto, serviço ou ideia aqui... Quanto mais detalhes você fornecer, melhor será a copy gerada."
              className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Copy
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setCopyType('venda')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copyType === 'venda' 
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Texto de Vendas
              </button>
              <button
                onClick={() => setCopyType('email')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copyType === 'email' 
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email Marketing
              </button>
              <button
                onClick={() => setCopyType('anuncio')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copyType === 'anuncio' 
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Anúncio
              </button>
              <button
                onClick={() => setCopyType('site')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copyType === 'site' 
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Descrição de Site
              </button>
              <button
                onClick={() => setCopyType('social')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copyType === 'social' 
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Redes Sociais
              </button>
            </div>
          </div>

          <motion.button 
            onClick={generateCopy}
            disabled={isGenerating || !inputText.trim()}
            className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium transition duration-300 ${
              isGenerating || !inputText.trim() ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
            }`}
            whileHover={{ scale: inputText.trim() ? 1.02 : 1 }}
            whileTap={{ scale: inputText.trim() ? 0.98 : 1 }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gerando copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gerar com Deepseek V3</span>
              </>
            )}
          </motion.button>
          
          <p className="mt-2 text-xs text-gray-500 text-center">
            Esta ferramenta é apenas uma ajuda inicial para copywriting. Para usos mais avançados da IA, 
            visite o <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">site oficial da Deepseek</a>.
          </p>
          
          {error && (
            <div className="mt-3 flex items-start space-x-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </motion.div>

        {/* Área de Output */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Copy Gerada
              </label>
              {generatedCopy && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  Deepseek V3
                </span>
              )}
            </div>
            <div className="min-h-[18rem] p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-y-auto">
              {generatedCopy ? (
                <p className="text-gray-800 whitespace-pre-line">{generatedCopy}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Sua copy persuasiva aparecerá aqui...
                </p>
              )}
            </div>
          </div>
          {generatedCopy && (
            <motion.button 
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium transition duration-300 ${
                copied 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Copy className="w-5 h-5" />
              <span>{copied ? 'Copiado!' : 'Copiar para Área de Transferência'}</span>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Dicas */}
      <motion.div 
        className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Dicas para uma Copy Persuasiva
        </h3>
        <ul className="grid md:grid-cols-3 gap-4">
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500">•</span>
            <span className="text-sm text-gray-600">Foque nos benefícios, não apenas nas características</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500">•</span>
            <span className="text-sm text-gray-600">Use palavras que despertem emoções no leitor</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500">•</span>
            <span className="text-sm text-gray-600">Inclua chamadas para ação claras e urgentes</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500">•</span>
            <span className="text-sm text-gray-600">Crie um senso de escassez ou urgência quando apropriado</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500">•</span>
            <span className="text-sm text-gray-600">Conte histórias que conectem com seu público-alvo</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-emerald-500">•</span>
            <span className="text-sm text-gray-600">Utilize provas sociais para construir credibilidade</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default PersuasiveCopyGenerator; 