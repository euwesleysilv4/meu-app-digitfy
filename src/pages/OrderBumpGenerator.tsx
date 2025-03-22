import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Percent, 
  Tag, 
  DollarSign, 
  Copy, 
  RefreshCw,
  QrCode,
  Lock,
  Info,
  Users,
  Layers,
  X,
  Gift,
  Sparkles,
  Loader2
} from 'lucide-react';

// Interface para definir a estrutura do produto e order bump
interface ProductDetails {
  name: string;
  price: string;
  targetAudience: string;
  category: string;
  description: string;
}

interface OrderBumpItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

// Categorias predefinidas
const PRODUCT_CATEGORIES = [
  'Educação Online',
  'Marketing Digital',
  'Desenvolvimento Pessoal',
  'Negócios',
  'Tecnologia',
  'Saúde e Bem-estar',
  'Finanças',
  'Outro'
];

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

// Dados de sugestões de Order Bump
const ORDER_BUMP_SUGGESTIONS: Record<string, OrderBumpItem[]> = {
  'Curso de Maquiagem': [
    { 
      id: 'makeup_kit',
      name: 'Kit de Pincéis Profissional', 
      price: '89,90', 
      description: 'Conjunto completo com 10 pincéis essenciais' 
    },
    { 
      id: 'makeup_palette',
      name: 'Paleta de Sombras Nude', 
      price: '129,00', 
      description: 'Paleta com 12 cores neutras' 
    }
  ],
  'Curso de Fotografia': [
    { 
      id: 'photo_tripod',
      name: 'Tripé Profissional', 
      price: '199,90', 
      description: 'Tripé resistente para câmeras' 
    },
    { 
      id: 'photo_filters',
      name: 'Kit de Filtros', 
      price: '149,00', 
      description: 'Conjunto de 5 filtros' 
    }
  ],
  'Curso de Marketing Digital': [
    { 
      id: 'mkt_metrics',
      name: 'Planilhas de Métricas', 
      price: '67,90', 
      description: 'Planilhas para acompanhamento de resultados' 
    },
    { 
      id: 'mkt_templates',
      name: 'Templates de Landing Page', 
      price: '97,00', 
      description: 'Kit com 10 modelos de landing pages' 
    }
  ]
};

// Função para gerar sugestões de Order Bump
const generateOrderBumpSuggestions = (product: ProductDetails): OrderBumpItem[] => {
  const { category, targetAudience } = product;
  const lowercaseCategory = category.toLowerCase();
  const lowercaseAudience = targetAudience.toLowerCase();

  // Mapeamento de sugestões baseado em categoria e público-alvo
  const suggestionMap: Record<string, OrderBumpItem[]> = {
    'educação online': [
      { 
        id: 'ed_material',
        name: 'Material de Apoio Completo', 
        price: '97,00', 
        description: 'Apostilas, videoaulas extras e resumos' 
      },
      { 
        id: 'ed_mentoria',
        name: 'Mentoria Individual', 
        price: '297,00', 
        description: 'Sessão de coaching personalizado' 
      }
    ],
    'marketing digital': [
      { 
        id: 'mkt_templates_pkg',
        name: 'Kit de Templates', 
        price: '129,00', 
        description: 'Modelos prontos para campanhas' 
      },
      { 
        id: 'mkt_auditoria',
        name: 'Auditoria de Funil', 
        price: '247,00', 
        description: 'Análise detalhada de estratégias' 
      }
    ],
    'desenvolvimento pessoal': [
      { 
        id: 'dev_plano',
        name: 'Plano de Desenvolvimento', 
        price: '147,00', 
        description: 'Estratégia personalizada de crescimento' 
      },
      { 
        id: 'dev_coach',
        name: 'Sessão de Coaching', 
        price: '267,00', 
        description: 'Consultoria individual de desenvolvimento' 
      }
    ]
  };

  // Sugestões baseadas em público-alvo
  const audienceSuggestions: Record<string, OrderBumpItem[]> = {
    'empreendedores': [
      { 
        id: 'emp_plano',
        name: 'Plano de Negócios', 
        price: '197,00', 
        description: 'Documento estratégico personalizado' 
      }
    ],
    'estudantes': [
      { 
        id: 'est_material',
        name: 'Material Complementar', 
        price: '67,90', 
        description: 'Conteúdo extra de aprofundamento' 
      }
    ]
  };

  // Combina sugestões de categoria e público-alvo
  const categorySuggestions = suggestionMap[lowercaseCategory] || [];
  const audienceSpecificSuggestions = Object.entries(audienceSuggestions)
    .filter(([key]) => lowercaseAudience.includes(key))
    .flatMap(([, suggestions]) => suggestions);

  // Combina e remove duplicatas por ID
  const combinedSuggestions = [...categorySuggestions, ...audienceSpecificSuggestions];
  const uniqueSuggestions = combinedSuggestions.reduce((acc: OrderBumpItem[], current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Retorna sugestões únicas ou sugestões gerais
  return uniqueSuggestions.length > 0 
    ? uniqueSuggestions
    : [
        { 
          id: 'bump_default_1',
          name: 'Consultoria Complementar', 
          price: '197,00', 
          description: 'Suporte adicional personalizado' 
        },
        { 
          id: 'bump_default_2',
          name: 'Material de Apoio', 
          price: '97,00', 
          description: 'Conteúdo extra para aprofundamento' 
        }
      ];
};

const OrderBumpGenerator: React.FC = () => {
  // Estados para detalhes do produto
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    name: '',
    price: '',
    targetAudience: '',
    category: '',
    description: ''
  });

  // Lista de sugestões de Order Bump
  const [orderBumpSuggestions, setOrderBumpSuggestions] = useState<OrderBumpItem[]>([]);

  // Estado para order bumps selecionados
  const [selectedOrderBumps, setSelectedOrderBumps] = useState<OrderBumpItem[]>([]);
  // Estado para indicar quando a IA está gerando sugestões
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Atualiza os campos do produto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para selecionar/deselecionar order bump
  const toggleOrderBump = (bump: OrderBumpItem) => {
    setSelectedOrderBumps(current => 
      current.some(item => item.id === bump.id)
        ? current.filter(item => item.id !== bump.id)
        : [...current, bump]
    );
  };

  // Calcula o valor total
  const calculateTotal = () => {
    const basePrice = parseFloat(productDetails.price.replace(',', '.'));
    const orderBumpsTotal = selectedOrderBumps.reduce((total, bump) => 
      total + parseFloat(bump.price.replace(',', '.')), 0);
    return (basePrice + orderBumpsTotal).toFixed(2).replace('.', ',');
  };

  // Processa a geração de sugestões de Order Bump
  const processOrderBumpSuggestions = () => {
    const { name, price, targetAudience, category, description } = productDetails;
    
    if (!name || !price || !targetAudience || !category || !description) {
      alert('Por favor, preencha todos os campos antes de gerar as sugestões');
      return;
    }

    const suggestions = generateOrderBumpSuggestions(productDetails);
    setOrderBumpSuggestions(suggestions);
  };

  // Gera sugestões de Order Bumps usando a IA Deepseek
  const generateOrderBumpsWithAI = async () => {
    const { name, price, targetAudience, category, description } = productDetails;
    
    if (!name || !price || !targetAudience || !category) {
      alert('Por favor, preencha pelo menos o nome, preço, público-alvo e categoria do produto');
      return;
    }

    setIsGeneratingAI(true);
    setErrorMessage(null);
    
    try {
      // Construir o prompt para a API Deepseek
      const prompt = `Crie 3 sugestões de order bumps (produtos complementares) para o seguinte produto:
      
      Nome do produto: ${name}
      Preço: R$ ${price}
      Público-alvo: ${targetAudience}
      Categoria: ${category}
      Descrição: ${description || 'Não fornecida'}
      
      Para cada order bump, inclua:
      1. Um nome atraente e relevante
      2. Um preço adequado (em reais, formato XX,XX)
      3. Uma descrição curta e persuasiva
      
      Os order bumps devem ser complementares ao produto principal e ter um valor percebido alto, 
      mas com preço menor que o produto principal. Use psicologia de vendas para criar ofertas irresistíveis.
      
      Responda APENAS no seguinte formato JSON:
      [
        {"name": "Nome do Order Bump 1", "price": "XX,XX", "description": "Descrição persuasiva 1"},
        {"name": "Nome do Order Bump 2", "price": "XX,XX", "description": "Descrição persuasiva 2"},
        {"name": "Nome do Order Bump 3", "price": "XX,XX", "description": "Descrição persuasiva 3"}
      ]`;

      // Chamada para a API Deepseek
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
              content: 'Você é um especialista em marketing e vendas, com foco em aumentar o valor do ticket médio através de order bumps estratégicos.'
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
      
      if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
      }

      const result = await response.json();
      
      if (result.choices && result.choices[0]?.message?.content) {
        const content = result.choices[0].message.content.trim();
        
        try {
          // Tenta extrair o JSON da resposta
          const jsonContent = content.match(/\[[\s\S]*\]/)?.[0] || content;
          const aiSuggestions = JSON.parse(jsonContent);
          
          // Converte as sugestões para o formato esperado
          const formattedSuggestions = aiSuggestions.map((item: any, index: number) => ({
            id: `ai_bump_${index}`,
            name: item.name,
            price: item.price,
            description: item.description
          }));
          
          setOrderBumpSuggestions(formattedSuggestions);
        } catch (parseError) {
          console.error('Erro ao processar resposta da IA:', parseError);
          throw new Error('Formato de resposta inválido da IA');
        }
      } else {
        throw new Error('Resposta da IA vazia ou inválida');
      }
    } catch (error) {
      console.error('Erro ao gerar order bumps com IA:', error);
      setErrorMessage(`Não foi possível gerar sugestões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      
      // Fallback para geração local
      const suggestions = generateOrderBumpSuggestions(productDetails);
      setOrderBumpSuggestions(suggestions);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="container mx-auto px-4 sm:px-6 py-6 sm:py-8"
    >
      {/* Cabeçalho da Página */}
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
          Gerador de Order Bump
        </h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
            Aumente o valor do seu ticket médio com ofertas complementares irresistíveis. 
            Use nossa ferramenta para criar order bumps estratégicos e persuasivos 
            que maximizam suas vendas e melhoram a experiência do cliente.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex items-center bg-emerald-50 p-3 sm:p-4 px-4 sm:px-5 rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-emerald-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center mr-3">
                <Plus className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-emerald-700 text-base sm:text-lg">Aumente Vendas</p>
                <p className="text-xs sm:text-sm text-emerald-600">+30% no ticket médio</p>
              </div>
            </div>
            <div className="flex items-center bg-green-50 p-3 sm:p-4 px-4 sm:px-5 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-green-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2v7a2 2 0 0 0 2 2h7"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-green-700 text-base sm:text-lg">Fácil Implementação</p>
                <p className="text-xs sm:text-sm text-green-600">Para qualquer plataforma</p>
              </div>
            </div>
            <div className="flex items-center bg-teal-50 p-3 sm:p-4 px-4 sm:px-5 rounded-lg border border-teal-200 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-teal-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-500 flex items-center justify-center mr-3">
                <Sparkles className="text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-teal-700 text-base sm:text-lg">IA Avançada</p>
                <p className="text-xs sm:text-sm text-teal-600">Sugestões otimizadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Coluna de Sugestões de Order Bump */}
        <div className="w-full lg:w-1/2 lg:pr-4 mb-6 lg:mb-0">
          {/* Formulário de Detalhes do Produto */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-emerald-700">
              Detalhes do Produto
            </h2>
            
            <div className="space-y-4">
              {/* Nome do Produto */}
              <div>
                <label className="block mb-2 font-semibold flex items-center">
                  <Tag className="mr-2 text-emerald-500" />
                  Nome do Produto
                </label>
                <input 
                  type="text"
                  name="name"
                  value={productDetails.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Curso Completo de Marketing Digital"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Preço do Produto */}
              <div>
                <label className="block mb-2 font-semibold flex items-center">
                  <DollarSign className="mr-2 text-emerald-500" />
                  Preço do Produto
                </label>
                <input 
                  type="text"
                  name="price"
                  value={productDetails.price}
                  onChange={handleInputChange}
                  placeholder="Ex: 97,00"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Público-Alvo */}
              <div>
                <label className="block mb-2 font-semibold flex items-center">
                  <Users className="mr-2 text-emerald-500" />
                  Público-Alvo
                </label>
                <input 
                  type="text"
                  name="targetAudience"
                  value={productDetails.targetAudience}
                  onChange={handleInputChange}
                  placeholder="Ex: Empreendedores, Estudantes, Profissionais"
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Categoria do Produto */}
              <div>
                <label className="block mb-2 font-semibold flex items-center">
                  <Layers className="mr-2 text-emerald-500" />
                  Categoria do Produto
                </label>
                <select
                  name="category"
                  value={productDetails.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Selecione uma categoria</option>
                  {PRODUCT_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição do Produto */}
              <div>
                <label className="block mb-2 font-semibold flex items-center">
                  <Info className="mr-2 text-emerald-500" />
                  Descrição do Produto
                </label>
                <textarea 
                  name="description"
                  value={productDetails.description}
                  onChange={handleInputChange}
                  placeholder="Descreva detalhadamente seu produto, seus benefícios e diferenciais..."
                  rows={5}
                  className="w-full p-2 border rounded-lg resize-none"
                />
              </div>

              {/* Botões para Gerar Sugestões */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <button
                  onClick={processOrderBumpSuggestions}
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-center"
                >
                  <Plus className="mr-2" /> Gerar Básico
                </button>

                <button
                  onClick={generateOrderBumpsWithAI}
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
                      <Sparkles className="mr-2" /> Deepseek AI
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-2 text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-1">
                A IA Deepseek analisa seu produto e gera order bumps otimizados para maximizar seu ticket médio.
              </p>
            </div>
          </div>

          {/* Sugestões de Order Bump - mostrar apenas quando houver sugestões */}
          {orderBumpSuggestions.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-700 flex items-center">
                <ShoppingCart className="mr-2" />
                Sugestões de Order Bump
                {isGeneratingAI && <Loader2 className="ml-2 animate-spin" size={20} />}
              </h2>

              {orderBumpSuggestions.map(bump => (
                <div 
                  key={bump.id} 
                  className={`
                    border rounded-lg p-3 sm:p-4 mb-3 cursor-pointer flex items-center
                    ${selectedOrderBumps.some(item => item.id === bump.id) 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'}
                  `}
                  onClick={() => toggleOrderBump(bump)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedOrderBumps.some(item => item.id === bump.id)}
                    onChange={() => {}}
                    className="mr-3 w-5 h-5"
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-center flex-wrap">
                      <span className="font-bold text-sm sm:text-base">{bump.name}</span>
                      <span className="font-semibold text-emerald-600 text-sm sm:text-base">
                        R$ {bump.price}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {bump.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna de Preview */}
        <div className="w-full lg:w-1/2 lg:pl-4">
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
            {/* Checkout Clean */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">
                {productDetails.name || "Nome do Produto"}
              </h2>
              <div className="text-center mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-700">
                  R$ {productDetails.price || "0,00"}
                </span>
              </div>

              {/* Campos de Checkout */}
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Users size={18} />
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="E-mail" 
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="Telefone" 
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                </div>

                {/* Order Bumps Selecionados */}
                {selectedOrderBumps.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg p-3 sm:p-4 mb-4"
                  >
                    <h3 className="font-bold mb-3 text-yellow-800 flex items-center text-sm sm:text-base">
                      <Gift className="mr-2 text-yellow-600" />
                      Ofertas Especiais Selecionadas
                    </h3>
                    
                    {selectedOrderBumps.map(bump => (
                      <motion.div 
                        key={bump.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center mb-3 pb-3 border-b border-yellow-200 last:border-b-0 last:mb-0 last:pb-0"
                      >
                        <div className="flex items-center flex-1 mr-2">
                          <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-yellow-200 rounded-full mr-2 sm:mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-700"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          </div>
                          <span className="text-yellow-900 font-medium text-xs sm:text-sm">{bump.name}</span>
                        </div>
                        <div className="flex items-center shrink-0">
                          <span className="mr-2 sm:mr-3 text-yellow-700 font-bold text-xs sm:text-sm">
                            R$ {bump.price}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOrderBump(bump);
                            }}
                            className="text-red-500 hover:bg-red-100 rounded-full p-1 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="mt-3 pt-2 border-t border-yellow-200 flex justify-between items-center">
                      <span className="text-yellow-800 font-semibold text-xs sm:text-sm">Total das ofertas:</span>
                      <span className="text-yellow-800 font-bold text-xs sm:text-sm">
                        R$ {selectedOrderBumps.reduce((total, bump) => 
                          total + parseFloat(bump.price.replace(',', '.')), 0).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Pagamento PIX */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-5 rounded-lg border border-blue-100">
                  <h3 className="font-semibold mb-3 text-blue-800 flex items-center text-sm sm:text-base">
                    <QrCode className="mr-2 text-blue-600" />
                    Informações sobre o pagamento via PIX:
                  </h3>
                  <ul className="space-y-2 text-blue-700 text-xs sm:text-sm">
                    <li className="flex items-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                      </div>
                      <span>Valor à vista: <span className="font-bold">R$ {calculateTotal()}</span></span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l2 2"/></svg>
                      </div>
                      <span>Liberação imediata após confirmação</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                      </div>
                      <span>Super seguro. O pagamento PIX foi desenvolvido pelo Banco Central</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botão de Finalização */}
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 sm:p-4 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all hover:from-green-600 hover:to-emerald-700">
              <Lock className="mr-2" /> Finalizar Compra Segura
            </button>
            
            <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
              <Lock size={12} className="mr-1" /> 
              <span>Pagamento 100% seguro e criptografado</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderBumpGenerator; 