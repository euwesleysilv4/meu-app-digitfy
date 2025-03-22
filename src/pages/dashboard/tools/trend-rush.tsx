import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, AlertCircle, Play, PauseCircle, Upload, Lock, Info } from 'lucide-react';
import { usePermissions } from '../../../services/permissionService';
import { useNavigate } from 'react-router-dom';

// Importando ou criando o componente TrendRushList para esta versão
const TrendRushList = React.lazy(() => import('../../../components/TrendRush/TrendRushList'));

const DashboardTrendRush: React.FC = () => {
  const [currentPlatform, setCurrentPlatform] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { userPlan, getTrendRushLimit, hasUnlimitedTrendRush } = usePermissions();
  const audioLimit = getTrendRushLimit();
  const audioUsage = 2; // Valor simulado para demonstração
  const remainingAudios = audioLimit - audioUsage;
  const usagePercentage = (audioUsage / audioLimit) * 100;
  const navigate = useNavigate();
  
  // Verificação mais explícita para identificar se o usuário está no plano gratuito
  const isFreePlan = userPlan === 'gratuito';
  
  console.log("Plano atual:", userPlan);
  console.log("É plano gratuito?", isFreePlan);
  console.log("Limite de áudios:", audioLimit);

  // Dados simulados de áudios em tendência
  const trendingAudios = [
    { 
      id: '1', 
      title: 'Como Monetizar Seu Instagram Em 30 Dias',
      duration: '3:42',
      date: '2 dias atrás',
      views: 12500,
      category: 'monetização',
      thumbnail: 'https://placehold.co/400x400/22C55E/FFFFFF?text=1'
    },
    { 
      id: '2', 
      title: 'Tráfego Pago Para Iniciantes',
      duration: '4:15',
      date: '3 dias atrás',
      views: 10800,
      category: 'tráfego',
      thumbnail: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=2'
    },
    { 
      id: '3', 
      title: 'Segredos de Copywriting Para Email Marketing',
      duration: '5:01',
      date: '5 dias atrás',
      views: 9300,
      category: 'copywriting',
      thumbnail: 'https://placehold.co/400x400/EC4899/FFFFFF?text=3'
    },
    { 
      id: '4', 
      title: 'Como Criar Funis de Vendas Automáticos',
      duration: '4:22',
      date: '7 dias atrás',
      views: 8900,
      category: 'vendas',
      thumbnail: 'https://placehold.co/400x400/F97316/FFFFFF?text=4'
    },
    { 
      id: '5', 
      title: 'SEO Avançado Para Blogs',
      duration: '3:55',
      date: '8 dias atrás',
      views: 7600,
      category: 'seo',
      thumbnail: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=5'
    },
    { 
      id: '6', 
      title: 'Estratégias de Reels Para Aumentar Conversões',
      duration: '4:30',
      date: '9 dias atrás',
      views: 7200,
      category: 'social media',
      thumbnail: 'https://placehold.co/400x400/F59E0B/FFFFFF?text=6'
    },
    { 
      id: '7', 
      title: 'Como Gerar Leads Qualificados no LinkedIn',
      duration: '5:15',
      date: '10 dias atrás',
      views: 6800,
      category: 'b2b',
      thumbnail: 'https://placehold.co/400x400/3B82F6/FFFFFF?text=7'
    },
    { 
      id: '8', 
      title: 'Construindo Autoridade com Podcast',
      duration: '6:05',
      date: '12 dias atrás',
      views: 6300,
      category: 'branding',
      thumbnail: 'https://placehold.co/400x400/10B981/FFFFFF?text=8'
    },
    { 
      id: '9', 
      title: 'Como Destacar seu Produto no TikTok',
      duration: '3:48',
      date: '14 dias atrás',
      views: 5900,
      category: 'produtos',
      thumbnail: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=9'
    },
    { 
      id: '10', 
      title: 'Automação de Marketing para Pequenos Negócios',
      duration: '4:55',
      date: '15 dias atrás',
      views: 5500,
      category: 'automação',
      thumbnail: 'https://placehold.co/400x400/EC4899/FFFFFF?text=10'
    }
  ];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handlePlayPause = (id: string) => {
    if (selectedAudio === id) {
      setIsPlaying(!isPlaying);
    } else {
      setSelectedAudio(id);
      setIsPlaying(true);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando tendências de áudio...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Trend Rush</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Descubra os áudios mais populares do momento para se inspirar em suas campanhas de marketing.
        </p>
      </motion.div>
      
      {/* Limitação para plano gratuito - Garantindo que sempre apareça para planos gratuitos */}
      {isFreePlan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="bg-amber-200 text-amber-600 p-2 rounded-lg">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 mb-1">Limite de Áudios no Plano Gratuito</h3>
              <p className="text-amber-700 mb-3">
                Você tem acesso a {audioLimit} áudios por dia. Você já utilizou {audioUsage} hoje.
              </p>
              
              <div className="w-full bg-amber-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-amber-700 mb-4">
                <span>{audioUsage} usado</span>
                <span>{remainingAudios} restante</span>
              </div>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Upload size={16} />
                Faça upgrade para o plano Member
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Limitação para plano Member */}
      {userPlan === 'member' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-200 text-blue-600 p-2 rounded-lg">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 mb-1">Limite de Áudios no Plano Member</h3>
              <p className="text-blue-700 mb-3">
                Você tem acesso a {audioLimit} áudios por dia. Você já utilizou {audioUsage} hoje.
              </p>
              
              <div className="w-full bg-blue-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full" 
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-blue-700 mb-4">
                <span>{audioUsage} usado</span>
                <span>{remainingAudios} restante</span>
              </div>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Upload size={16} />
                Faça upgrade para o plano Pro
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Limitação para plano Pro */}
      {userPlan === 'pro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-5 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="bg-indigo-200 text-indigo-600 p-2 rounded-lg">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-indigo-800 mb-1">Limite de Áudios no Plano Pro</h3>
              <p className="text-indigo-700 mb-3">
                Você tem acesso a {audioLimit} áudios por dia. Você já utilizou {audioUsage} hoje.
              </p>
              
              <div className="w-full bg-indigo-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-indigo-500 h-2.5 rounded-full" 
                  style={{ width: `${usagePercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-indigo-700 mb-4">
                <span>{audioUsage} usado</span>
                <span>{remainingAudios} restante</span>
              </div>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Upload size={16} />
                Faça upgrade para o plano Elite
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Aviso para plano Elite - Acesso ilimitado */}
      {userPlan === 'elite' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="bg-purple-200 text-purple-600 p-2 rounded-lg">
              <Info size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-purple-800 mb-1">Acesso Ilimitado ao Trend Rush</h3>
              <p className="text-purple-700">
                Como usuário do plano Elite, você tem acesso ilimitado a todos os áudios em tendência. 
                Aproveite para explorar e baixar quantos áudios quiser sem restrições!
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Lista de áudios */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Áudios em Tendência</h3>
        </div>
        
        <div>
          {trendingAudios.slice(0, audioLimit).map((audio, index) => (
            <motion.div 
              key={audio.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="relative w-14 h-14">
                <img 
                  src={audio.thumbnail} 
                  alt={audio.title} 
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <button 
                  onClick={() => handlePlayPause(audio.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg hover:bg-opacity-20 transition-all"
                >
                  {isPlaying && selectedAudio === audio.id ? (
                    <PauseCircle className="text-white" size={24} />
                  ) : (
                    <Play className="text-white" size={24} />
                  )}
                </button>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 truncate">{audio.title}</h4>
                <div className="flex flex-wrap text-xs text-gray-500 gap-x-4">
                  <span>{audio.duration}</span>
                  <span>{audio.views.toLocaleString()} visualizações</span>
                  <span>{audio.date}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg p-2 transition-colors">
                  <Play size={18} />
                </button>
                
                <button 
                  disabled={isFreePlan && remainingAudios <= 0}
                  className={`${
                    isFreePlan && remainingAudios <= 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  } rounded-lg p-2 transition-colors flex items-center gap-1`}
                >
                  {isFreePlan && remainingAudios <= 0 ? (
                    <Lock size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTrendRush; 