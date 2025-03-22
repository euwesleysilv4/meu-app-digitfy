import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  Clock, 
  Share2, 
  ThumbsUp, 
  MessageCircle,
  X
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  image: string;
  likes: number;
  comments: number;
}

const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Novidades em Marketing Digital para 2024',
    content: 'Descubra as principais tendências e estratégias que estão revolucionando o marketing digital neste ano...',
    author: 'Equipe Digital FY',
    date: '2 dias atrás',
    image: 'https://exemplo.com/imagem-noticia-1.jpg',
    likes: 42,
    comments: 15
  },
  {
    id: 'news-2',
    title: 'Como Escalar Seus Negócios Online',
    content: 'Estratégias comprovadas para aumentar sua presença digital e multiplicar seus resultados...',
    author: 'Maria Silva',
    date: '5 dias atrás',
    image: 'https://exemplo.com/imagem-noticia-2.jpg',
    likes: 67,
    comments: 23
  },
  // Adicione mais notícias conforme necessário
];

const NewsFeed: React.FC = () => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Cabeçalho */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Newspaper className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Feed de Notícias
          </h1>
        </motion.div>

        {/* Lista de Notícias */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="space-y-6"
        >
          {newsItems.map((news) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedNews(news)}
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
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{news.title}</h2>
                    <div className="flex items-center text-sm text-gray-600 space-x-2">
                      <span>{news.author}</span>
                      <Clock size={16} className="ml-2" />
                      <span>{news.date}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-3">
                  {news.content}
                </p>

                {/* Interações */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{news.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{news.comments}</span>
                    </div>
                  </div>
                  <Share2 size={20} className="text-gray-500 hover:text-emerald-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal de Notícia Completa */}
        {selectedNews && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>

              <img 
                src={selectedNews.image} 
                alt={selectedNews.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedNews.title}</h2>

              <div className="flex items-center mb-4 text-sm text-gray-600">
                <span className="mr-4">{selectedNews.author}</span>
                <Clock size={16} className="mr-2" />
                <span>{selectedNews.date}</span>
              </div>

              <p className="text-gray-700 leading-relaxed">{selectedNews.content}</p>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedNews.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedNews.comments}</span>
                  </div>
                </div>
                <Share2 size={24} className="text-gray-500 hover:text-emerald-500" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed; 