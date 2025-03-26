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
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <Package className="text-emerald-500 mr-3" size={32} />
            <h1 className="text-3xl font-bold text-emerald-800">Pacotes Gratuitos</h1>
          </div>
          
          <button 
            onClick={loadFreePacks}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </motion.div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={loadFreePacks}
              className="ml-4 underline hover:text-red-800"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw size={32} className="animate-spin text-emerald-600" />
            <span className="ml-3 text-lg text-gray-700">Carregando pacotes gratuitos...</span>
          </div>
        ) : freePacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum pacote gratuito disponível</h3>
            <p className="text-gray-500">Novos pacotes gratuitos serão adicionados em breve. Volte mais tarde!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {freePacks.map((pack, index) => (
              <motion.div 
                key={pack.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3 + (index * 0.1) 
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-56 w-full">
                  <img 
                    src={pack.image_url} 
                    alt={pack.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // Imagem de fallback se a URL da imagem falhar
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Digital+Fy';
                    }}
                  />
                  <div className="absolute inset-0 bg-black opacity-30"></div>
                  
                  {pack.file_type && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {pack.file_type}
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h2 className="text-base font-bold text-gray-800 mb-2 h-12 line-clamp-2">
                    {pack.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3 h-16 line-clamp-3">
                    {pack.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-emerald-600">
                      <Download size={16} className="mr-2" />
                      <span>{formatDownloadCount(pack.download_count)} Downloads</span>
                      {pack.file_size && (
                        <span className="ml-2 text-gray-500">• {pack.file_size}</span>
                      )}
                    </div>
                    
                    <motion.button 
                      onClick={() => handleDownload(pack)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="
                        bg-emerald-500 
                        text-white 
                        px-4 py-2 
                        rounded-full 
                        text-sm 
                        hover:bg-emerald-600 
                        transition-colors
                        flex items-center
                      "
                    >
                      <Download size={14} className="mr-1" />
                      <span>Baixar</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FreePacks; 