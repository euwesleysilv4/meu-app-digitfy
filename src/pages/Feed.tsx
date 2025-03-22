import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Bookmark, ChevronRight, ExternalLink, 
  Award, Clock, ArrowRight, TrendingUp,
  Tag, X, Activity, ThumbsUp, Search,
  ChevronLeft, ChevronUp
} from 'lucide-react';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  description?: string;
  image?: string;
  timestamp: string;
  popular?: boolean;
  featured?: boolean;
  trending?: boolean;
  overlayText?: boolean;
  url?: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    category: 'Marketing Digital',
    title: 'Inflação de CPMs: o desafio dos afiliados no cenário de alta nos custos de tráfego pago',
    description: 'Pesquisa aponta que ads em cada quatro itens analisados ficam mais caros, o que impede estratégia dos consumidores de substituir produtos.',
    image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Hoje às 08:45',
    featured: true
  },
  {
    id: '2',
    category: 'Internacional',
    title: 'Guru do marketing leva "microfurada" no rosto antes de embarcar para o Brasil',
    description: 'Senado dos EUA aprova lei que trata penalização do algoritmo.',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Ontem às 15:32',
    trending: true,
    featured: true
  },
  {
    id: '3',
    category: 'Vendas',
    title: 'Destinos da Europa e Ásia usam táticas para limitar cursos contra praça',
    image: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Há 2 dias',
    trending: true,
    featured: true
  },
  {
    id: '4',
    category: 'Lançamentos',
    title: '2 réus são condenados pela morte de conversões em quiosque no Rio',
    description: 'Falha fatal - Erro no funil digital já cumpre seis anos de prisão em regime fechado.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Há 3 dias',
    popular: true,
    overlayText: true
  },
  {
    id: '5',
    category: 'Alta dos anúncios',
    title: '"Inflação passou a mão no direito do povo de converter leads", diz mentor',
    description: '"Eu choro quando vejo quanto um sistema de vendas custa agora em dólar" ?',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Há 4 dias',
    overlayText: true
  },
  {
    id: '6',
    category: 'Assuntos em alta',
    title: 'Dono da Hotly é condenado por crimes antiéticos e corrupção no Growth-Hacking',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Há 5 dias',
    overlayText: true
  },
  {
    id: '7',
    category: 'Assuntos em alta',
    title: 'Briga em academia termina em promessa de preços em MS; veja vídeo',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Há 5 dias'
  },
  {
    id: '8',
    category: 'Assuntos em alta',
    title: 'Estados Unidos expulsam embaixador da África do Sul no país; Trafego orgânico quebra recorde',
    image: 'https://images.unsplash.com/photo-1531266752426-aad472b7bbf4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3',
    timestamp: 'Há 5 dias'
  }
];

const Feed: React.FC = () => {
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  
  const featuredNews = newsData.filter(item => item.featured);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Alternar automaticamente as notícias em destaque
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prev => 
        prev === featuredNews.length - 1 ? 0 : prev + 1
      );
    }, 5000); // Trocar a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [featuredNews.length]);

  const toggleSave = (id: string) => {
    setSavedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de pesquisa aqui
    console.log('Pesquisando por:', searchTerm);
  };

  const navigateCarousel = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentFeaturedIndex(prev => 
        prev === 0 ? featuredNews.length - 1 : prev - 1
      );
    } else {
      setCurrentFeaturedIndex(prev => 
        prev === featuredNews.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Cabeçalho com Barra de Pesquisa */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center">
            <Activity className="text-emerald-500 mr-4" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Feed</h1>
          </div>
          
          {/* Barra de Pesquisa */}
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full pl-4 pr-2 py-2 shadow-sm">
            <Search size={18} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Pesquisar no feed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none outline-none bg-transparent w-40 md:w-64"
            />
            <button 
              type="submit"
              className="bg-emerald-500 text-white p-1 rounded-full hover:bg-emerald-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </form>
          
          <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
            <span className="mr-2 text-emerald-600 font-medium">Tópicos em alta:</span>
            <div className="flex space-x-3">
              <span className="text-gray-600 text-sm hover:text-emerald-500 cursor-pointer transition-colors">#MarketingDigital</span>
              <span className="text-gray-600 text-sm hover:text-emerald-500 cursor-pointer transition-colors">#Afiliados</span>
              <span className="text-gray-600 text-sm hover:text-emerald-500 cursor-pointer transition-colors">#Vendas</span>
            </div>
          </div>
        </motion.div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Coluna Principal (8 colunas em desktop) */}
          <div className="md:col-span-8 space-y-6">
            {/* Carrossel de Destaques Principais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm relative"
              ref={carouselRef}
            >
              <div 
                className="transition-all duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentFeaturedIndex * 100}%)`, display: 'flex' }}
              >
                {featuredNews.map((news, index) => (
                  <div key={news.id} className="min-w-full">
                    <div className="relative">
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {news.category}
                      </div>
                      
                      {/* Text overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-6">
                        <h2 className="text-2xl font-bold text-white mb-3">
                          {news.title}
                        </h2>
                        <p className="text-white text-opacity-90 mb-4 max-w-3xl">
                          {news.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-white text-opacity-80 text-sm">
                            <Clock size={14} className="mr-1" />
                            {news.timestamp}
                          </div>
                          <button 
                            onClick={() => toggleSave(news.id)}
                            className={`
                              flex items-center text-sm font-medium
                              ${savedItems.includes(news.id) 
                                ? 'text-emerald-400' 
                                : 'text-white text-opacity-80 hover:text-emerald-400'
                              }
                            `}
                          >
                            <Bookmark size={16} className="mr-1" />
                            {savedItems.includes(news.id) ? 'Salvo' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Indicadores */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featuredNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeaturedIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentFeaturedIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Banner Promocional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between"
            >
              <div className="text-white mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2">Domínio de Email Marketing</h3>
                <p className="opacity-90">Aprenda como escalar suas vendas com estratégias avançadas de email</p>
              </div>
              <button className="bg-white text-emerald-700 px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors">
                Saiba mais
              </button>
            </motion.div>

            {/* Notícias normais em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsData
                .filter(item => !item.featured && !item.trending)
                .slice(0, 2)
                .map(news => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="relative">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-48 object-cover"
                    />
                    {news.popular && (
                      <div className="absolute top-4 right-4 bg-amber-400 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <ThumbsUp size={12} className="mr-1" /> 
                        Popular
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {news.category}
                    </div>
                    
                    {news.overlayText ? (
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-4">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {news.title}
                        </h3>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-white text-opacity-80 text-xs">
                            <Clock size={12} className="mr-1" />
                            {news.timestamp}
                          </div>
                          <button 
                            onClick={() => toggleSave(news.id)}
                            className={`
                              text-sm
                              ${savedItems.includes(news.id) 
                                ? 'text-emerald-400' 
                                : 'text-white text-opacity-80 hover:text-emerald-400'
                              }
                            `}
                          >
                            <Bookmark size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {news.title}
                        </h3>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-500 text-xs">
                            <Clock size={12} className="mr-1" />
                            {news.timestamp}
                          </div>
                          <button 
                            onClick={() => toggleSave(news.id)}
                            className={`
                              text-sm
                              ${savedItems.includes(news.id) 
                                ? 'text-emerald-500' 
                                : 'text-gray-400 hover:text-emerald-500'
                              }
                            `}
                          >
                            <Bookmark size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mais notícias */}
            {newsData
              .filter(item => !item.featured && !item.trending)
              .slice(2)
              .map(news => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/3">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {news.category}
                    </div>
                  </div>
                  <div className="p-4 md:p-6 md:w-2/3">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {news.title}
                    </h3>
                    {news.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {news.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock size={14} className="mr-1" />
                        {news.timestamp}
                      </div>
                      <button 
                        onClick={() => toggleSave(news.id)}
                        className={`
                          flex items-center text-sm transition-colors
                          ${savedItems.includes(news.id) 
                            ? 'text-emerald-500' 
                            : 'text-gray-500 hover:text-emerald-500'
                          }
                        `}
                      >
                        <Bookmark size={16} className="mr-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coluna Lateral (4 colunas em desktop) */}
          <div className="md:col-span-4 space-y-6">
            {/* Em Tendência */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 py-3 px-4">
                <h3 className="text-white font-bold flex items-center">
                  <TrendingUp size={18} className="mr-2" />
                  Em Tendência
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {newsData
                  .filter(item => item.trending)
                  .map(news => (
                  <div key={news.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex space-x-3">
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <span className="text-xs text-emerald-600 font-medium">{news.category}</span>
                        <h4 className="font-medium text-gray-800">{news.title}</h4>
                        <div className="flex items-center text-gray-500 text-xs mt-1">
                          <Clock size={12} className="mr-1" />
                          {news.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50">
                <button className="w-full text-emerald-600 text-sm font-medium flex items-center justify-center">
                  Ver mais <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Assuntos em Alta */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="py-3 px-4 bg-gray-800 text-white">
                <h3 className="font-bold flex items-center">
                  <Tag size={18} className="mr-2" />
                  Assuntos em Alta
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {newsData
                  .filter(item => item.category === 'Assuntos em alta')
                  .map(news => (
                  <div key={news.id} className="flex p-3 hover:bg-gray-50 transition-colors">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-16 h-16 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-gray-800">{news.title}</h4>
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <Clock size={12} className="mr-1" />
                        {news.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50">
                <button className="w-full text-gray-600 text-sm font-medium flex items-center justify-center">
                  Ver mais <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </motion.div>

            {/* Banner Publicidade */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 text-center"
            >
              <div className="mb-4">
                <h3 className="text-amber-800 font-bold text-xl mb-1">Digital FY Prime</h3>
                <h4 className="text-amber-700">Fragâncias digitais marcantes</h4>
              </div>
              <div className="flex justify-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3" 
                  alt="Produtos em destaque"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
              <button className="bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors uppercase text-sm tracking-wider">
                Compre Agora
              </button>
            </motion.div>
            
            {/* Botão para voltar ao topo */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-6 right-6 bg-emerald-500 text-white p-3 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ChevronUp size={24} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modal para exibir notícia */}
      {selectedNews && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNews(null)}
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={selectedNews.image} 
                alt={selectedNews.title}
                className="w-full h-64 object-cover"
              />
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full">
                {selectedNews.category}
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {selectedNews.title}
              </h2>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <Clock size={14} className="mr-1" />
                {selectedNews.timestamp}
              </div>
              <p className="text-gray-600 mb-6">
                {selectedNews.description || 'Conteúdo completo da notícia estará disponível em breve.'}
              </p>
              {selectedNews.url && (
                <a 
                  href={selectedNews.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-emerald-600 font-medium"
                >
                  Ler notícia completa
                  <ExternalLink size={16} className="ml-1" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Feed; 