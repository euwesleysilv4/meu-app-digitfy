import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Instagram, Music } from 'lucide-react';
import { usePermissions } from '../../services/permissionService';
import { useNavigate } from 'react-router-dom';

// Interface para representar cada item de áudio
interface TrendAudio {
  id: string;
  title: string;
  artist: string;
  views: number;
  growth: number;
  platform: 'instagram' | 'tiktok';
  audioUrl: string;
  thumbnailUrl: string;
}

// Props do componente
interface TrendRushListProps {
  platform?: 'instagram' | 'tiktok' | 'all';
  initialData?: TrendAudio[];
}

const TrendRushList: React.FC<TrendRushListProps> = ({ 
  platform = 'all',
  initialData = []
}) => {
  const [trendingAudios, setTrendingAudios] = useState<TrendAudio[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { getTrendRushLimit, hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();
  
  const audioLimit = getTrendRushLimit();
  const hasTrendRushAccess = hasAccess('trendRush');

  // Simula a busca de dados
  useEffect(() => {
    if (initialData.length > 0) {
      setTrendingAudios(initialData);
      setLoading(false);
      return;
    }

    const fetchTrendingAudios = async () => {
      setLoading(true);
      try {
        // Simulando chamada de API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados simulados para demonstração
        const mockData: TrendAudio[] = Array(30).fill(0).map((_, index) => ({
          id: `audio-${index}`,
          title: `Áudio Trending ${index + 1}`,
          artist: `Artista ${Math.floor(index / 3) + 1}`,
          views: Math.floor(Math.random() * 900000) + 100000,
          growth: Math.floor(Math.random() * 350) + 50,
          platform: index % 2 === 0 ? 'instagram' : 'tiktok',
          audioUrl: '#',
          thumbnailUrl: `https://picsum.photos/200/200?random=${index}`
        }));
        
        // Filtrar por plataforma se necessário
        const filteredData = platform === 'all' 
          ? mockData 
          : mockData.filter(audio => audio.platform === platform);
        
        setTrendingAudios(filteredData);
      } catch (error) {
        console.error('Erro ao buscar áudios em tendência:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingAudios();
  }, [platform, initialData]);

  // Toggle de reprodução do áudio
  const togglePlay = (audioId: string) => {
    if (currentAudio === audioId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(audioId);
      setIsPlaying(true);
    }
  };

  // Formatar número de visualizações
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Filtrar os áudios com base no limite do plano
  const limitedAudios = userPlan === 'gratuito' 
    ? trendingAudios.slice(0, audioLimit)
    : trendingAudios;

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-10">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Carregando áudios em tendência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!hasTrendRushAccess ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Funcionalidade Limitada
          </h3>
          <p className="text-amber-700 mb-4">
            Faça upgrade para o plano Member ou superior para acessar o Trend Rush.
          </p>
          <button 
            onClick={() => navigate('/upgrade-plan')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Ver Planos
          </button>
        </div>
      ) : (
        <>
          {userPlan === 'gratuito' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-amber-700">
                    <span className="font-semibold">Visualização limitada:</span> No plano gratuito você tem acesso a apenas 5 áudios por dia. 
                    <button 
                      onClick={() => navigate('/upgrade-plan')}
                      className="ml-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Fazer upgrade
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {userPlan === 'member' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-blue-700">
                    <span className="font-semibold">Limite de áudios:</span> No plano Member você tem acesso a 10 áudios por dia.
                    <button 
                      onClick={() => navigate('/upgrade-plan')}
                      className="ml-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Faça upgrade para o plano Pro
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {userPlan === 'pro' && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <p className="text-indigo-700">
                    <span className="font-semibold">Limite de áudios:</span> No plano Pro você tem acesso a 15 áudios por dia.
                    <button 
                      onClick={() => navigate('/upgrade-plan')}
                      className="ml-1 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Faça upgrade para o plano Elite
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {userPlan === 'elite' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="text-purple-700">
                    <span className="font-semibold">Acesso Ilimitado:</span> No plano Elite você tem acesso ilimitado a todos os áudios em tendência.
                  </p>
                </div>
              </div>
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {limitedAudios.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={audio.thumbnailUrl} 
                    alt={audio.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
                      {audio.platform === 'instagram' ? (
                        <Instagram className="h-3 w-3" />
                      ) : (
                        <Music className="h-3 w-3" />
                      )}
                      {audio.platform}
                    </div>
                    <h3 className="text-white font-semibold truncate">{audio.title}</h3>
                    <p className="text-white/80 text-sm">{audio.artist}</p>
                  </div>
                  <button
                    onClick={() => togglePlay(audio.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-emerald-500 text-white p-4 rounded-full">
                      {currentAudio === audio.id && isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">
                      {formatViews(audio.views)} visualizações
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                      <TrendingUp className="h-4 w-4" />
                      +{audio.growth}%
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {userPlan === 'gratuito' && trendingAudios.length > audioLimit && (
            <div className="mt-8 text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Mais {trendingAudios.length - audioLimit} áudios disponíveis
              </h3>
              <p className="text-gray-600 mb-4">
                Faça upgrade do seu plano para desbloquear mais áudios em tendência por dia.
              </p>
              <button
                onClick={() => navigate('/upgrade-plan')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Fazer Upgrade
              </button>
            </div>
          )}

          {userPlan === 'member' && trendingAudios.length > audioLimit && (
            <div className="mt-8 text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Mais {trendingAudios.length - audioLimit} áudios disponíveis
              </h3>
              <p className="text-gray-600 mb-4">
                Faça upgrade para o plano Pro para obter acesso ilimitado aos áudios em tendência.
              </p>
              <button
                onClick={() => navigate('/upgrade-plan')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Upgrade para o Plano Pro
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrendRushList; 