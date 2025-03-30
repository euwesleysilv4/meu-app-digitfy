import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

// Variantes para estágios de animação baseados em viewport
const cardContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

// Interface para os pacotes gratuitos
interface FreePack {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_url: string;
  download_count: number;
  file_size?: string;
  file_type?: string;
  tags?: string[];
}

const FreePacks = () => {
  const [freePacks, setFreePacks] = useState<FreePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFreePacks();
  }, []);

  const loadFreePacks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscando pacotes gratuitos publicados do Supabase
      const { data, error } = await supabase
        .from('free_packs')
        .select('*')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar pacotes gratuitos:', error);
        setError('Não foi possível carregar os pacotes gratuitos.');
        throw error;
      }
      
      setFreePacks(data || []);
    } catch (err) {
      console.error('Falha ao carregar pacotes gratuitos:', err);
      setError('Ocorreu um erro ao carregar os pacotes. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (pack: FreePack) => {
    try {
      // Incrementar o contador de downloads no Supabase
      await supabase.rpc('increment_pack_download_count', { pack_id: pack.id });
      
      // Abrir o link do arquivo em uma nova aba
      window.open(pack.file_url, '_blank');
    } catch (err) {
      console.error('Erro ao registrar download:', err);
      // Ainda abre o link mesmo se falhar o registro do download
      window.open(pack.file_url, '_blank');
    }
  };

  // Formatar o número de downloads
  const formatDownloadCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
        >
          <div className="flex items-center">
            <div className="bg-emerald-100 p-2 rounded-lg mr-3">
              <Package className="text-emerald-600" size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pacotes Gratuitos</h1>
          </div>
          
          <button 
            onClick={loadFreePacks}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p>{error}</p>
                <button 
                  onClick={loadFreePacks}
                  className="mt-2 text-red-700 underline hover:text-red-800"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <RefreshCw size={28} className="animate-spin text-emerald-600 mb-3" />
              <span className="text-gray-600">Carregando pacotes gratuitos...</span>
            </div>
          </div>
        ) : freePacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8 text-center"
          >
            <div className="bg-gray-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Nenhum pacote gratuito disponível</h3>
            <p className="text-gray-600 max-w-md mx-auto">Novos pacotes gratuitos serão adicionados em breve. Volte mais tarde!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={cardContainerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {freePacks.map((pack, index) => (
              <motion.div 
                key={pack.id}
                variants={cardVariants}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img 
                    src={pack.image_url} 
                    alt={pack.title} 
                    loading={index < 8 ? "eager" : "lazy"}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      // Imagem de fallback se a URL da imagem falhar
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Digital+Fy';
                    }}
                  />
                  
                  {pack.file_type && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                      {pack.file_type}
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {pack.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {pack.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Download size={16} className="mr-1.5 text-emerald-500" />
                      <span>{formatDownloadCount(pack.download_count)} downloads</span>
                    </div>
                    
                    <motion.button 
                      onClick={() => handleDownload(pack)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                      <Download size={16} className="mr-1.5" />
                      <span>Baixar</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FreePacks; 