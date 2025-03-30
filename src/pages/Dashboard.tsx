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
  Users, 
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
  AlertCircle,
  BookOpen
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
                className="mb-8 rounded-2xl overflow-hidden shadow-sm border border-emerald-100 relative"
              >
                {/* Link clicável sobre todo o banner */}
                <a 
                  href={banner.url_destino} 
                  className="absolute inset-0 w-full h-full z-10"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={banner.titulo}
                >
                  <span className="sr-only">{banner.titulo}</span>
                </a>
                
                {/* Imagem do banner para Desktop - altura adaptável */}
                <div 
                  className="hidden md:block"
                  style={{ 
                    backgroundColor: '#f3f4f6',
                    textAlign: 'center'
                  }}
                >
                  <img 
                    src={banner.imagem_desktop} 
                    alt=""
                    className="w-full"
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                </div>
                
                {/* Imagem do banner para Mobile - altura adaptável */}
                <div 
                  className="md:hidden block"
                  style={{ 
                    backgroundColor: '#f3f4f6',
                    textAlign: 'center'
                  }}
                >
                  <img 
                    src={banner.imagem_mobile} 
                    alt=""
                    className="w-full"
                    style={{ 
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
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
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full -mt-12 -mr-12 z-0 blur-md"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-100/30 rounded-full -mb-10 -ml-10 z-0 blur-md"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  {/* Órbita à esquerda - Melhorada para mobile */}
                  <div className="md:w-1/2 flex justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.7 }}
                      className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[26rem] md:h-[26rem] lg:w-[30rem] lg:h-[30rem]"
                    >
                      <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
                        {/* Linhas orbitais - primeira órbita */}
                        <div className="absolute inset-0 w-full h-full border border-emerald-200/50 rounded-full"></div>
                        
                        {/* Linhas orbitais - segunda órbita */}
                        <div className="absolute inset-0 w-3/4 h-3/4 mx-auto my-auto border border-emerald-200/50 rounded-full"></div>
                        
                        {/* Linhas orbitais - terceira órbita */}
                        <div className="absolute inset-0 w-1/2 h-1/2 mx-auto my-auto border border-emerald-200/50 rounded-full"></div>
                        
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, 0, -5, 0],
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 6,
                            ease: "easeInOut"
                          }}
                          className="bg-gradient-to-br from-emerald-400 to-emerald-500 backdrop-blur-xl w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center"
                        >
                          <img 
                            src="/novas%20logos/icon-logo-white-solo.png" 
                            alt="DigitFy"
                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                          />
                        </motion.div>
                        
                        {/* Órbitas ao redor do ícone principal - Primeira linha orbital - Responsiva */}
                        <div className="absolute inset-0 w-full h-full animate-spin-slow" style={{ animationDuration: '30s' }}>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center border border-emerald-100">
                            <FileText size={16} className="text-emerald-500 md:hidden" />
                            <FileText size={22} className="text-emerald-500 hidden md:block" />
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 w-full h-full animate-spin-slow" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white/95 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-emerald-100">
                            <Hash size={14} className="text-emerald-500 md:hidden" />
                            <Hash size={20} className="text-emerald-500 hidden md:block" />
                          </div>
                        </div>
                        
                        {/* Segunda linha orbital - Responsiva */}
                        <div className="absolute inset-0 w-3/4 h-3/4 mx-auto my-auto animate-spin-slow" style={{ animationDuration: '25s' }}>
                          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-white/95 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-emerald-100">
                            <BarChart3 size={14} className="text-emerald-500 md:hidden" />
                            <BarChart3 size={20} className="text-emerald-500 hidden md:block" />
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 w-3/4 h-3/4 mx-auto my-auto animate-spin-slow" style={{ animationDuration: '18s', animationDirection: 'reverse' }}>
                          <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border border-emerald-100">
                            <MessageSquare size={14} className="text-emerald-500 md:hidden" />
                            <MessageSquare size={20} className="text-emerald-500 hidden md:block" />
                          </div>
                        </div>
                        
                        {/* Terceira linha orbital - Responsiva para devices menores, esconde em tamanhos muito pequenos */}
                        <div className="absolute inset-0 w-1/2 h-1/2 mx-auto my-auto animate-spin-slow hidden sm:block" style={{ animationDuration: '15s' }}>
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border border-emerald-100">
                            <BookOpen size={14} className="text-emerald-500 lg:hidden" />
                            <BookOpen size={20} className="text-emerald-500 hidden lg:block" />
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 w-1/2 h-1/2 mx-auto my-auto animate-spin-slow hidden sm:block" style={{ animationDuration: '22s', animationDirection: 'reverse' }}>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white/95 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center border border-emerald-100">
                            <Users size={14} className="text-emerald-500 lg:hidden" />
                            <Users size={20} className="text-emerald-500 hidden lg:block" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Texto de boas-vindas à direita - centralizado no mobile */}
                  <div className="md:w-1/2 mt-6 md:mt-0 md:ml-4">
                    <div className="flex items-center mb-4 justify-center md:justify-start">
                      <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-md mr-3">
                        <img 
                          src="/novas%20logos/icon-logo-white-solo.png" 
                          alt="DigitFy"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div>
                        <h1 className="text-xl md:text-3xl font-bold">
                          {getGreeting()}, {profile?.nome || 'usuário'}!
                        </h1>
                        <p className="text-base text-emerald-700/80 mt-1 capitalize">
                          {formatDate()}
                        </p>
                    </div>
                  </div>
                  
                    <div className="mt-4 md:mt-0 mb-6 text-center md:text-left">
                      <div className={`bg-${planStatus.color}-100 border border-${planStatus.color}-200 text-${planStatus.color}-700 px-4 py-1.5 rounded-full text-base font-medium inline-flex items-center`}>
                      <Crown size={18} className="mr-2" />
                      Plano {planStatus.badge}
                  </div>
                </div>
                
                    <div className="bg-white/60 backdrop-blur-sm p-5 px-8 rounded-xl border border-emerald-100/50 max-w-lg mx-auto md:mx-0">
                  <p className="text-emerald-700 text-lg text-center md:text-left">
                    Seja bem-vindo ao seu painel de controle personalizado. Aqui você tem acesso a todas as ferramentas e recursos para alavancar seus resultados!
                  </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Seção Moderna Estilo SaaS - Apresentação DigitFy */}
            <div className="mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-gray-50 rounded-2xl overflow-hidden"
                >
                {/* Seção vazia - todo conteúdo foi removido */}
                </motion.div>
            </div>
                
            {/* Tutoriais em Vídeo - Com título centralizado mais moderno e animado */}
            <div className="mb-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center mb-10"
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Acelere sua Jornada
                  </span>
                </motion.h2>
                <motion.p 
                  className="text-gray-600 max-w-2xl mx-auto text-lg mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Se você acabou de chegar na plataforma, estes vídeos vão te ajudar a extrair o
                  <span className="text-emerald-600 font-semibold"> máximo de recursos</span> e 
                  potencializar seus resultados.
                </motion.p>
              </motion.div>
              
              <div className="space-y-10">
                {/* Introdução à DigitFy - sem cabeçalho */}
                <div>
                <TutorialVideosSection categoria="introducao" titulo="Introdução à DigitFy" />
                </div>
                
                {/* Benefícios dos Planos Premium - sem cabeçalho */}
                <div>
                <TutorialVideosSection categoria="planos_premium" titulo="Benefícios dos Planos Premium" />
                </div>
                
                {/* Ferramentas Avançadas - sem cabeçalho */}
                <div>
                <TutorialVideosSection categoria="ferramentas" titulo="Ferramentas Avançadas" />
                </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
      <motion.div 
            key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
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
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-100 p-5 text-center">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-800 mb-1">Erro ao carregar vídeos</h3>
        <p className="text-gray-600 text-sm">Não foi possível carregar os vídeos neste momento. Tente novamente mais tarde.</p>
        </div>
    );
  }
  
  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
        <PlayCircle size={36} className="text-emerald-300 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-800 mb-1">Conteúdo em desenvolvimento</h3>
        <p className="text-gray-600 text-sm">Em breve novos vídeos sobre {titulo.toLowerCase()} serão disponibilizados.</p>
        </div>
    );
  }
  
  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {videos.map((video, index) => (
          <motion.div 
            key={video.id}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <a 
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                className="bg-emerald-500/90 text-white rounded-full p-3 shadow-lg hover:bg-emerald-600 hover:scale-110 transition-all transform duration-200 cursor-pointer"
                >
                <PlayCircle size={40} />
                </a>
              </div>
            </div>
            <div className="p-4 flex-grow">
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-lg">{video.titulo}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.descricao}</p>
            </div>
            <div className="p-4 border-t border-gray-100 mt-auto">
              <a 
                href={`https://www.youtube.com/watch?v=${video.youtube_id}`} 
                target="_blank"
                rel="noopener noreferrer" 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center transition-all text-sm font-medium"
              >
              Assistir Vídeo
              <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </motion.div>
        ))}
    </div>
  );
};

export default Dashboard; 