import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  Star, 
  Calendar, 
  Rss, 
  ExternalLink 
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: 'highlight' | 'latest' | 'event';
  image: string;
  link?: string;
}

const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Novo Recurso de Marketing Digital Lançado',
    summary: 'Descubra a mais nova ferramenta que está revolucionando as estratégias de afiliados.',
    date: '15 de Junho, 2023',
    category: 'highlight',
    image: 'https://exemplo.com/imagem-noticia-1.jpg',
    link: '#'
  },
  {
    id: 'news-2',
    title: 'Evento Online de Estratégias de Vendas',
    summary: 'Participe do nosso webinar exclusivo sobre técnicas avançadas de conversão.',
    date: '22 de Junho, 2023',
    category: 'event',
    image: 'https://exemplo.com/imagem-evento-1.jpg',
    link: '#'
  },
  // Adicione mais notícias conforme necessário
];

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'highlight' | 'latest' | 'event'>('all');

  const filteredNews = selectedCategory === 'all'
    ? newsItems
    : newsItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
      <div className="container mx-auto">
        {/* Cabeçalho */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Newspaper className="text-emerald-500" size={40} />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Central de Notícias
            </h1>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${selectedCategory === 'all' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Todos
            </button>
            <button 
              onClick={() => setSelectedCategory('highlight')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${selectedCategory === 'highlight' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Destaques
            </button>
            <button 
              onClick={() => setSelectedCategory('latest')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${selectedCategory === 'latest' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Últimas
            </button>
            <button 
              onClick={() => setSelectedCategory('event')}
              className={`
                px-3 py-1 rounded-full text-sm transition-all
                ${selectedCategory === 'event' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'
                }
              `}
            >
              Eventos
            </button>
          </div>
        </motion.div>

        {/* Grid de Notícias */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredNews.map((news) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Imagem da Notícia */}
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Conteúdo da Notícia */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${
                      news.category === 'highlight' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : news.category === 'event'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }
                  `}>
                    {news.category === 'highlight' 
                      ? 'Destaque' 
                      : news.category === 'event' 
                      ? 'Evento' 
                      : 'Última Notícia'}
                  </span>
                  <span className="text-sm text-gray-500">{news.date}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">{news.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{news.summary}</p>

                {news.link && (
                  <a 
                    href={news.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    Leia mais <ExternalLink size={16} className="ml-2" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsPage; 