import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import NewsFeed from './NewsFeed';
import AffiliateArea from './AffiliateArea';
import UpgradePage from './UpgradePage';
import { 
  Zap, 
  Rocket, 
  BookOpenText, 
  Users2, 
  Wrench, 
  TrendingUp, 
  Bell, 
  ArrowRight, 
  Crown, 
  Star, 
  Clock,
  UserPlus,
  FileText,
  MessageSquare,
  BarChart3,
  Hash,
  BadgeCheck,
  Calendar,
  PlayCircle,
  ExternalLink,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Interface para o banner
interface Banner {
  id: number;
  imagem_desktop: string;
  imagem_mobile: string;
  url_destino: string;
  ativo: boolean;
  data_inicio: string;
  data_fim: string | null;
  titulo: string;
}

const Dashboard: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<string>('home');
  const { profile, session, loading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Iniciar carregamento da página quando o componente montar
  useEffect(() => {
    // Verificar se a autenticação foi concluída e o perfil foi carregado
    if (!authLoading && profile) {
      // Adicionar um pequeno delay para garantir que todos os componentes estejam prontos
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading, profile]);
  
  useEffect(() => {
    // Atualizar horário a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Buscar banner atual
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        // Criar cliente Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const today = new Date().toISOString().split('T')[0];
        
        // Buscar banner ativo para hoje
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('ativo', true)
          .lte('data_inicio', today) // Data de início <= hoje
          .or(`data_fim.is.null, data_fim.gte.${today}`) // Data de fim é null OU data_fim >= hoje
          .order('id', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Erro ao buscar banner:', error);
        } else if (data && data.length > 0) {
          setBanner(data[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar banner:', err);
      } finally {
        setBannerLoading(false);
      }
    };
    
    fetchBanner();
  }, []);
  
  // Formatar saudação baseada na hora do dia
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  
  // Formatar data atual
  const formatDate = () => {
    return currentTime.toLocaleDateString('pt-BR', {
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };
  
  // Definir período do plano
  const getPlanStatus = () => {
    const planName = profile?.plano || 'free';
    const planMap: {[key: string]: {color: string, badge: string}} = {
      'free': { color: 'emerald', badge: 'Gratuito' },
      'member': { color: 'emerald', badge: 'Member' },
      'pro': { color: 'emerald', badge: 'Pro' },
      'elite': { color: 'emerald', badge: 'Elite' }
    };
    
    return planMap[planName] || planMap.free;
  };

  // Renderizar tela de carregamento enquanto os dados são carregados
  if (pageLoading || authLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="relative">
          <img 
            src="/novas%20logos/fav-icon-digitfy.png" 
            alt="DigitFy" 
            className="w-16 h-16 animate-spin"
            style={{ animationDuration: '2s' }}
          />
        </div>
        <h2 className="text-xl font-semibold text-emerald-700 mb-2 mt-4">Carregando seu painel</h2>
        <p className="text-emerald-600">Preparando seus dados personalizados...</p>
      </div>
    );
  }
  
  const renderContent = () => {
    switch(currentContent) {
      case 'news-feed':
        return <NewsFeed />;
      case 'upgrade':
        return <UpgradePage />;
      case 'affiliate':
        return <AffiliateArea />;
      default:
        const planStatus = getPlanStatus();
        
        return (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Banner Dinâmico */}
            {!bannerLoading && banner && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-emerald-100"
              >
                <div className="relative banner-container" style={{ height: '250px' }}>
                  {/* Imagem do banner para Desktop */}
                  <img 
                    src={banner.imagem_desktop} 
                    alt={banner.titulo}
                    className="hidden md:block absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Imagem do banner para Mobile */}
                  <img 
                    src={banner.imagem_mobile} 
                    alt={banner.titulo}
                    className="md:hidden absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Link clicável sobre o banner */}
                  <a 
                    href={banner.url_destino} 
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{banner.titulo}</span>
                  </a>
                </div>
              </motion.div>
            )}
            
            {/* Cabeçalho com gradiente e saudação personalizada */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-sm p-8 text-emerald-800 relative overflow-hidden border border-emerald-100 mb-8"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full -mt-12 -mr-12 z-0"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-100/30 rounded-full -mb-10 -ml-10 z-0"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-md mr-3">
                        <Zap size={24} className="text-white" />
                      </div>
                      <div>
                        <h1 className="text-lg md:text-2xl font-bold">
                          {getGreeting()}, {profile?.nome || 'usuário'}!
                        </h1>
                        <p className="text-sm text-emerald-700/80 mt-1 capitalize">
                          {formatDate()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className={`bg-${planStatus.color}-100 border border-${planStatus.color}-200 text-${planStatus.color}-700 px-4 py-1 rounded-full text-sm font-medium flex items-center`}>
                      <Crown size={16} className="mr-1" />
                      Plano {planStatus.badge}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-emerald-100/50">
                  <p className="text-emerald-700">
                    Seja bem-vindo ao seu painel de controle personalizado. Aqui você tem acesso a todas as ferramentas e recursos para alavancar seus resultados!
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Informações do Perfil */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full mr-2"></div>
                Seu Perfil
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Notificações</p>
                      <h3 className="text-lg font-bold text-gray-800 mt-1 capitalize">{profile?.notificacoes_ativas ? 'Ativas' : 'Desativadas'}</h3>
                    </div>
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Bell className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-xs text-emerald-600">
                    <span>Receba atualizações importantes</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Membro desde</p>
                      <h3 className="text-lg font-bold text-gray-800 mt-1">
                        {profile?.data_criacao 
                          ? new Date(profile.data_criacao).toLocaleDateString('pt-BR', {month: 'short', year: 'numeric'})
                          : 'Jan 2024'}
                      </h3>
                    </div>
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Calendar className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-xs text-emerald-600">
                    <span>Obrigado pela confiança!</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Último Acesso</p>
                      <h3 className="text-lg font-bold text-gray-800 mt-1">
                        {profile?.ultimo_login 
                          ? new Date(profile.ultimo_login).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})
                          : 'Hoje'}
                      </h3>
                    </div>
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Clock className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-xs text-emerald-600">
                    <span>Atividade recente</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Seu Plano</p>
                      <h3 className="text-lg font-bold text-gray-800 mt-1 capitalize">
                        {profile?.plano || 'Gratuito'}
                      </h3>
                    </div>
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Crown className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-3 text-xs text-emerald-600">
                    <span>Acesso personalizado</span>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Tutoriais em Vídeo */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full mr-2"></div>
                Tutoriais em Vídeo
              </h2>
              
              <div className="space-y-12">
                <TutorialVideosSection categoria="introducao" titulo="Introdução à DigitFy" />
                
                <TutorialVideosSection categoria="planos_premium" titulo="Benefícios dos Planos Premium" />
                
                <TutorialVideosSection categoria="ferramentas" titulo="Ferramentas Avançadas" />
              </div>
            </div>
          </div>
        ); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">      
      <main className="pt-4 pb-12">
        {renderContent()}
      </main>
    </div>
  );
};

const TutorialVideosSection: React.FC<{ categoria: string; titulo: string }> = ({ categoria, titulo }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Criar cliente Supabase local
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        
        // Buscar TODOS os vídeos ativos desta categoria
        const { data, error } = await supabaseClient
          .from('tutorial_videos')
          .select('*')
          .eq('categoria', categoria)
          .eq('ativo', true)
          .order('ordem', { ascending: true });
        
        if (error) {
          console.error(`Erro ao buscar vídeos da categoria ${categoria}:`, error);
          setError(error.message);
        } else {
          setVideos(data || []);
        }
      } catch (err: any) {
        console.error(`Erro ao buscar vídeos tutoriais da categoria ${categoria}:`, err);
        setError(err.message || 'Erro ao carregar vídeos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, [categoria]);
  
  if (loading) {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        </div>
        <div className="p-4 flex-grow">
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        </div>
        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
        </div>
      </motion.div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
            <AlertCircle size={48} className="text-red-300" />
          </div>
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-semibold text-gray-800 mb-1">{titulo}</h3>
          <p className="text-gray-600 text-sm mb-3">Erro ao carregar o vídeo</p>
        </div>
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            disabled
            className="w-full flex items-center justify-center bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Indisponível
          </button>
        </div>
      </motion.div>
    );
  }
  
  if (videos.length === 0) {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      >
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <PlayCircle size={48} className="text-gray-300" />
          </div>
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-semibold text-gray-800 mb-1">{titulo}</h3>
          <p className="text-gray-600 text-sm mb-3">Em breve novos vídeos sobre este tema</p>
        </div>
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            disabled
            className="w-full flex items-center justify-center bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Em breve
          </button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className="col-span-1 lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => (
          <motion.div 
            key={video.id}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <img 
                src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`} 
                alt={video.titulo} 
                className="absolute top-0 left-0 w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para thumbnail de menor resolução se maxresdefault não existir
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a 
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-500/90 text-white rounded-full p-3 shadow-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <PlayCircle size={36} />
                </a>
              </div>
            </div>
            <div className="p-4 flex-grow">
              <h3 className="font-semibold text-gray-800 mb-1">{video.titulo}</h3>
              <p className="text-gray-600 text-sm mb-3">{video.descricao}</p>
            </div>
            <div className="p-4 border-t border-gray-100 mt-auto">
              <a 
                href={`https://www.youtube.com/watch?v=${video.youtube_id}`} 
                target="_blank"
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Assistir no YouTube
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 