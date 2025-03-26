import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  RefreshCw,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface MindMap {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_url: string;
  status: string;
  instagram?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
}

const MindMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [currentMindMap, setCurrentMindMap] = useState<MindMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMindMaps = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Se temos um ID, busca o mapa mental específico
        if (id) {
          const { data, error } = await supabase
            .from('mind_maps')
            .select('*')
            .eq('id', id)
            .eq('status', 'published')
            .single();
            
          if (error) throw error;
          
          if (data) {
            setCurrentMindMap(data);
            // Incrementar contador de visualizações
            await incrementViewCount(id);
          } else {
            setError('Mapa mental não encontrado');
          }
        } 
        // Caso contrário, busca todos os mapas mentais publicados
        else {
          const { data, error } = await supabase
            .from('mind_maps')
            .select('*')
            .eq('status', 'published')
            .order('updated_at', { ascending: false });
            
          if (error) throw error;
          
          setMindMaps(data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar mapas mentais:', err);
        setError('Não foi possível carregar os mapas mentais. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMindMaps();
  }, [id]);
  
  const incrementViewCount = async (mapId: string) => {
    try {
      // Primeiro, obtenha o valor atual de view_count
      const { data, error } = await supabase
        .from('mind_maps')
        .select('view_count')
        .eq('id', mapId)
        .single();
        
      if (error) throw error;
      
      const newViewCount = (data?.view_count || 0) + 1;
      
      // Atualize o view_count
      const { error: updateError } = await supabase
        .from('mind_maps')
        .update({ view_count: newViewCount })
        .eq('id', mapId);
        
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erro ao incrementar visualizações:', err);
    }
  };
  
  // Exibe um mapa mental específico
  if (id && currentMindMap) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link 
          to="/mapas-mentais"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Voltar para todos os mapas</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {currentMindMap.image_url && (
            <div className="w-full h-64 overflow-hidden">
              <img 
                src={currentMindMap.image_url}
                alt={currentMindMap.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x300?text=Mapa+Mental';
                }}
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{currentMindMap.title}</h1>
            
            <div className="mb-6 text-gray-600">
              {currentMindMap.description}
            </div>
            
            {currentMindMap.file_url && (
              <div className="mb-6">
                <a 
                  href={currentMindMap.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Ver Mapa Mental Completo</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </div>
            )}
            
            {currentMindMap.instagram && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Instagram do criador:</p>
                <a 
                  href={`https://instagram.com/${currentMindMap.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {currentMindMap.instagram}
                </a>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-200 pt-4 flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-4">Visualizações: {currentMindMap.view_count}</span>
              </div>
              
              <div>
                Atualizado em {new Date(currentMindMap.updated_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Exibe a lista de todos os mapas mentais
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <BrainCircuit className="w-10 h-10 text-purple-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Mapas Mentais
              </h1>
              <p className="text-gray-600 mt-1">
                Visualize conceitos complexos de forma clara e estruturada
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw className="w-10 h-10 text-purple-500" />
            </motion.div>
            <p className="mt-4 text-gray-600">Carregando mapas mentais...</p>
          </div>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Sem mapas disponíveis */}
      {!isLoading && mindMaps.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <BrainCircuit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum mapa mental disponível</h3>
          <p className="text-gray-500">Volte em breve para conferir nossos mapas mentais!</p>
        </div>
      )}
      
      {/* Lista de mapas mentais */}
      {!isLoading && mindMaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindMaps.map((map, index) => (
            <motion.div
              key={map.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
            >
              {map.image_url ? (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={map.image_url} 
                    alt={map.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Mapa+Mental';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <BrainCircuit className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{map.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{map.description}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {map.view_count} visualizações
                  </div>
                  
                  <Link
                    to={`/mapas-mentais/${map.id}`}
                    className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    <span>Ver detalhes</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MindMapPage; 