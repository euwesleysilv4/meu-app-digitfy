import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, AlertCircle, Play, PauseCircle, Upload, Lock, Info } from 'lucide-react';
import { usePermissions } from '../../../services/permissionService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

// Carregando o componente TrendRushList com lazy loading
const TrendRushList = React.lazy(() => import('../../../components/TrendRush/TrendRushList'));

// Definindo a interface para o tipo de dados de TrendRush
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
}

const DashboardTrendRush: React.FC = () => {
  const [currentPlatform, setCurrentPlatform] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [trendRushItems, setTrendRushItems] = useState<TrendRushItem[]>([]);
  
  const { userPlan, getTrendRushLimit, hasUnlimitedTrendRush } = usePermissions();
  const audioLimit = getTrendRushLimit();
  const navigate = useNavigate();
  
  // Verificação para identificar se o usuário está no plano gratuito
  const isFreePlan = userPlan === 'gratuito';

  // Buscar os itens do TrendRush
  useEffect(() => {
    const fetchTrendRushItems = async () => {
      setIsLoading(true);
      try {
        // Consulta ao Supabase filtrada por plataforma
        let query = supabase
          .from('trend_rush')
          .select('*')
          .eq('status', 'published')
          .order('priority', { ascending: true });
        
        // Aplicar filtro de plataforma, se necessário
        if (currentPlatform !== 'all') {
          query = query.or(`platform.eq.${currentPlatform},platform.eq.both`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTrendRushItems(data);
        }
      } catch (error) {
        console.error('Erro ao buscar itens do Trend Rush:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendRushItems();
  }, [currentPlatform]);
  
  // Loader durante o carregamento inicial - estilo DigitFy
  if (isLoading && trendRushItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-5 text-emerald-700 font-medium">Carregando tendências de áudio...</p>
        <p className="text-sm text-emerald-600/70">Estamos buscando os áudios mais populares para você</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabeçalho com design da DigitFy */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full -mt-12 -mr-12 z-0"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-100/30 rounded-full -mb-10 -ml-10 z-0"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl shadow-md">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Trend Rush</h1>
                <div className="h-1 w-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-emerald-700 text-lg max-w-3xl ml-1 mt-2">
              Potencialize suas campanhas de marketing com os áudios mais virais do momento. 
              Descubra tendências, amplie seu alcance e destaque-se nas redes sociais com conteúdo relevante.
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Filtro de plataformas com estilo DigitFy */}
      <div className="mb-6">
        <div className="inline-flex rounded-xl border border-emerald-100 bg-white/80 backdrop-blur-sm p-1.5 mb-4 shadow-sm">
          <button
            onClick={() => setCurrentPlatform('all')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPlatform === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setCurrentPlatform('instagram')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPlatform === 'instagram'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setCurrentPlatform('tiktok')}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              currentPlatform === 'tiktok'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            TikTok
          </button>
        </div>
      </div>
      
      {/* Limitação para plano gratuito - estilo DigitFy */}
      {isFreePlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full -mt-20 -mr-20 z-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/20 rounded-full -mb-10 -ml-10 z-0"></div>
          
          <div className="flex items-start gap-5 relative z-10">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl shadow-md">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-emerald-800 text-lg mb-1.5">Limite de Áudios no Plano Gratuito</h3>
              <p className="text-emerald-700 mb-5">
                Você tem acesso a {audioLimit} áudios por dia.
              </p>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Upload size={16} />
                Faça upgrade para o plano Member
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Limitação para plano Member - estilo DigitFy */}
      {userPlan === 'member' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full -mt-20 -mr-20 z-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/20 rounded-full -mb-10 -ml-10 z-0"></div>
          
          <div className="flex items-start gap-5 relative z-10">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl shadow-md">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-emerald-800 text-lg mb-1.5">Limite de Áudios no Plano Member</h3>
              <p className="text-emerald-700 mb-5">
                Você tem acesso a {audioLimit} áudios por dia.
              </p>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Upload size={16} />
                Faça upgrade para o plano Pro
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Limitação para plano Pro - estilo DigitFy */}
      {userPlan === 'pro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full -mt-20 -mr-20 z-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/20 rounded-full -mb-10 -ml-10 z-0"></div>
          
          <div className="flex items-start gap-5 relative z-10">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl shadow-md">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-emerald-800 text-lg mb-1.5">Limite de Áudios no Plano Pro</h3>
              <p className="text-emerald-700 mb-5">
                Você tem acesso a {audioLimit} áudios por dia.
              </p>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Upload size={16} />
                Faça upgrade para o plano Elite
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Lista de áudios - Usando o componente TrendRushList */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm p-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando áudios em tendência...</p>
          </div>
        }>
          <TrendRushList 
            platform={currentPlatform} 
            initialData={trendRushItems}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardTrendRush; 