import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Instagram, Music, Star, AlertCircle, Download } from 'lucide-react';
import { usePermissions } from '../../services/permissionService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// Interface para representar cada item de áudio do banco de dados
interface TrendRushItem {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  image_url: string | null;
  status: 'published' | 'draft' | 'archived';
  platform: 'tiktok' | 'instagram' | 'both';
  artist: string | null;
  tags: string[] | null;
  is_featured: boolean;
  view_count: number;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Props do componente
interface TrendRushListProps {
  platform?: 'instagram' | 'tiktok' | 'all';
  initialData?: TrendRushItem[];
}

const TrendRushList: React.FC<TrendRushListProps> = ({ 
  platform = 'all',
  initialData = []
}) => {
  const [trendingAudios, setTrendingAudios] = useState<TrendRushItem[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { getTrendRushLimit, hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();
  
  const audioLimit = getTrendRushLimit();
  const hasTrendRushAccess = hasAccess('trendRush');

  // Buscar dados do Supabase
  useEffect(() => {
    if (initialData.length > 0) {
      setTrendingAudios(initialData);
      setLoading(false);
      return;
    }

    const fetchTrendingAudios = async () => {
      setLoading(true);
      try {
        // Montando a query baseado na plataforma selecionada
        let query = supabase
          .from('trend_rush')
          .select('*')
          .eq('status', 'published')
          .order('priority', { ascending: true });

        // Filtrar por plataforma se necessário
        if (platform !== 'all') {
          query = query.or(`platform.eq.${platform},platform.eq.both`);
        }

        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTrendingAudios(data);
        }
      } catch (error) {
        console.error('Erro ao buscar áudios em tendência:', error);
        // Em caso de erro, usando dados simulados como fallback
        const mockData: TrendRushItem[] = Array(5).fill(0).map((_, index) => ({
          id: `audio-${index}`,
          title: `Áudio Trending ${index + 1}`,
          description: `Descrição do áudio ${index + 1}`,
          audio_url: '#',
          image_url: `https://picsum.photos/200/200?random=${index}`,
          status: 'published',
          platform: index % 2 === 0 ? 'instagram' : 'tiktok',
          artist: `Artista ${Math.floor(index / 3) + 1}`,
          tags: ['trending', 'viral'],
          is_featured: index === 0,
          view_count: Math.floor(Math.random() * 900000) + 100000,
          priority: index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        setTrendingAudios(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingAudios();
  }, [platform, initialData]);

  // Controlar reprodução do áudio
  useEffect(() => {
    return () => {
      // Limpa o áudio ao desmontar o componente
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  // Toggle de reprodução do áudio
  const togglePlay = (audio: TrendRushItem) => {
    // Incrementar a contagem de visualizações
    incrementViewCount(audio.id);
    
    if (currentAudio === audio.id) {
      if (audioElement) {
        if (isPlaying) {
          audioElement.pause();
        } else {
          audioElement.play();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      
      const newAudio = new Audio(audio.audio_url);
      newAudio.addEventListener('canplaythrough', () => {
        newAudio.play();
        setIsPlaying(true);
        setCurrentAudio(audio.id);
        setAudioElement(newAudio);
      });
      
      newAudio.addEventListener('error', (e) => {
        console.error('Erro ao carregar o áudio:', e);
        alert('Não foi possível reproduzir este áudio. Por favor, tente novamente mais tarde.');
      });
      
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
  };

  // Incrementar a contagem de visualizações
  const incrementViewCount = async (audioId: string) => {
    try {
      await supabase.rpc('increment_trend_rush_view_count', { trend_rush_id: audioId });
    } catch (error) {
      console.error('Erro ao incrementar contagem de visualizações:', error);
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
    : userPlan === 'member'
      ? trendingAudios.slice(0, audioLimit)
      : userPlan === 'pro'
        ? trendingAudios.slice(0, audioLimit)
        : trendingAudios; // Plano Elite tem acesso a todos

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

  if (trendingAudios.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-amber-800 mb-2">
          Nenhum áudio disponível
        </h3>
        <p className="text-amber-700">
          Não encontramos áudios em tendência no momento. Por favor, tente novamente mais tarde.
        </p>
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
                    <span className="font-semibold">Visualização limitada:</span> No plano gratuito você tem acesso a apenas {audioLimit} áudios por dia. 
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
                    <span className="font-semibold">Limite de áudios:</span> No plano Member você tem acesso a {audioLimit} áudios por dia.
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
                    <span className="font-semibold">Limite de áudios:</span> No plano Pro você tem acesso a {audioLimit} áudios por dia.
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
            className="divide-y divide-gray-200"
          >
            {limitedAudios.map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center hover:bg-gray-50 rounded-lg px-3 sm:px-4 transition-colors"
              >
                <div className="flex items-center w-full sm:w-auto">
                  <div 
                    className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden flex-shrink-0 mr-3 cursor-pointer"
                    onClick={() => togglePlay(audio)}
                  >
                    <img 
                      src={audio.image_url || (audio.platform === 'instagram' 
                        ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%2322C55E"/%3E%3C/svg%3E'
                        : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%238B5CF6"/%3E%3C/svg%3E')}
                      alt={audio.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/10 to-black/30">
                      {audio.platform === 'instagram' ? (
                        <Instagram size={40} strokeWidth={2} className="text-white drop-shadow-lg" />
                      ) : audio.platform === 'tiktok' ? (
                        <Music size={40} strokeWidth={2} className="text-white drop-shadow-lg" />
                      ) : (
                        <Music size={40} strokeWidth={2} className="text-white drop-shadow-lg" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {currentAudio === audio.id && isPlaying ? (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="6" y="5" width="4" height="14" rx="1" fill="white" />
                          <rect x="14" y="5" width="4" height="14" rx="1" fill="white" />
                        </svg>
                      ) : (
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="white" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate pr-2">{audio.title}</h3>
                    <p className="text-sm text-gray-500">{audio.artist || 'Artista desconhecido'}</p>
                  </div>

                  {audio.is_featured && (
                    <div className="sm:hidden ml-auto">
                      <div className="bg-yellow-400 rounded-full px-2 py-0.5 text-xs text-black flex items-center gap-1 whitespace-nowrap">
                        <Star className="h-3 w-3" />
                        Destaque
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center w-full sm:w-auto mt-3 sm:mt-0 sm:ml-auto">
                  <div className="flex flex-wrap gap-1 max-w-[60%] sm:max-w-none">
                    {audio.tags?.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    {audio.is_featured && (
                      <div className="hidden sm:block">
                        <div className="bg-yellow-400 rounded-full px-2 py-0.5 text-xs text-black flex items-center gap-1 whitespace-nowrap">
                          <Star className="h-3 w-3" />
                          Destaque
                        </div>
                      </div>
                    )}
                    <a
                      href={audio.audio_url}
                      download
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementViewCount(audio.id);
                      }}
                    >
                      {audio.platform === 'instagram' ? (
                        <Instagram size={14} />
                      ) : audio.platform === 'tiktok' ? (
                        <Music size={14} />
                      ) : (
                        <Music size={14} />
                      )}
                      Usar Áudio
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default TrendRushList; 