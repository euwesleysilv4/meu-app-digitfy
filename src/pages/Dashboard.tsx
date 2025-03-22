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
  ChevronDown
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<string>('home');
  const { profile, session } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  
  useEffect(() => {
    // Atualizar horário a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
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
            
            {/* Cards de recursos principais */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full mr-2"></div>
                Recursos Principais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <Wrench size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 ml-3 relative z-10">
                      Ferramentas
                    </h3>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4 relative z-10 flex-grow">
                    Utilize nossas ferramentas exclusivas para otimizar seus resultados
                  </p>
                  <Link to="/dashboard/tools" className="inline-flex items-center justify-center text-sm font-medium text-emerald-700 hover:text-white hover:bg-emerald-600 group relative z-10 mt-auto border border-emerald-200 rounded-lg py-2 px-4 transition-all hover:border-emerald-600">
                    Acessar
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <BookOpenText size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 ml-3 relative z-10">
                      Conteúdos
                    </h3>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4 relative z-10 flex-grow">
                    Aprenda com nossas videoaulas e materiais exclusivos
                  </p>
                  <Link to="/dashboard/learning" className="inline-flex items-center justify-center text-sm font-medium text-emerald-700 hover:text-white hover:bg-emerald-600 group relative z-10 mt-auto border border-emerald-200 rounded-lg py-2 px-4 transition-all hover:border-emerald-600">
                    Acessar
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <Users2 size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 ml-3 relative z-10">
                      Comunidade
                    </h3>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4 relative z-10 flex-grow">
                    Conecte-se com outros membros e amplie sua rede
                  </p>
                  <Link to="/dashboard/community" className="inline-flex items-center justify-center text-sm font-medium text-emerald-700 hover:text-white hover:bg-emerald-600 group relative z-10 mt-auto border border-emerald-200 rounded-lg py-2 px-4 transition-all hover:border-emerald-600">
                    Acessar
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <Rocket size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 ml-3 relative z-10">
                      Destaque-se
                    </h3>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4 relative z-10 flex-grow">
                    Turbine seus resultados com nossos recursos premium
                  </p>
                  <Link to="/dashboard/upgrade" className="inline-flex items-center justify-center text-sm font-medium text-emerald-700 hover:text-white hover:bg-emerald-600 group relative z-10 mt-auto border border-emerald-200 rounded-lg py-2 px-4 transition-all hover:border-emerald-600">
                    Acessar
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 ml-3 relative z-10">
                      Análises
                    </h3>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4 relative z-10 flex-grow">
                    Acompanhe métricas e resultados detalhados das suas campanhas
                  </p>
                  <Link to="/dashboard/analytics" className="inline-flex items-center justify-center text-sm font-medium text-emerald-700 hover:text-white hover:bg-emerald-600 group relative z-10 mt-auto border border-emerald-200 rounded-lg py-2 px-4 transition-all hover:border-emerald-600">
                    Acessar
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6 relative overflow-hidden group flex flex-col h-full"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg shadow-sm">
                      <MessageSquare size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-800 ml-3 relative z-10">
                      Suporte
                    </h3>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4 relative z-10 flex-grow">
                    Entre em contato com nossa equipe para resolver suas dúvidas
                  </p>
                  <Link to="/dashboard/support" className="inline-flex items-center justify-center text-sm font-medium text-emerald-700 hover:text-white hover:bg-emerald-600 group relative z-10 mt-auto border border-emerald-200 rounded-lg py-2 px-4 transition-all hover:border-emerald-600">
                    Acessar
                    <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </div>
            
            {/* Tutoriais em Vídeo */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full mr-2"></div>
                Tutoriais em Vídeo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <img 
                      src="https://img.youtube.com/vi/YOUTUBE_ID_1/maxresdefault.jpg" 
                      alt="Introdução à DigitFy" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-emerald-500/90 text-white rounded-full p-3 shadow-lg hover:bg-emerald-600 transition-colors cursor-pointer">
                        <PlayCircle size={36} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-gray-800 mb-1">Introdução à DigitFy</h3>
                    <p className="text-gray-600 text-sm mb-3">Aprenda o básico sobre nossa plataforma e como começar</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 mt-auto">
                    <a 
                      href="https://www.youtube.com/watch?v=YOUTUBE_ID_1" 
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Assistir no YouTube
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <img 
                      src="https://img.youtube.com/vi/YOUTUBE_ID_2/maxresdefault.jpg" 
                      alt="Benefícios dos Planos Premium" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-emerald-500/90 text-white rounded-full p-3 shadow-lg hover:bg-emerald-600 transition-colors cursor-pointer">
                        <PlayCircle size={36} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-gray-800 mb-1">Benefícios dos Planos Premium</h3>
                    <p className="text-gray-600 text-sm mb-3">Conheça as vantagens exclusivas de cada nível de assinatura</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 mt-auto">
                    <a 
                      href="https://www.youtube.com/watch?v=YOUTUBE_ID_2" 
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Assistir no YouTube
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <img 
                      src="https://img.youtube.com/vi/YOUTUBE_ID_3/maxresdefault.jpg" 
                      alt="Ferramentas Avançadas" 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-emerald-500/90 text-white rounded-full p-3 shadow-lg hover:bg-emerald-600 transition-colors cursor-pointer">
                        <PlayCircle size={36} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-gray-800 mb-1">Ferramentas Avançadas</h3>
                    <p className="text-gray-600 text-sm mb-3">Domine as funcionalidades premium da plataforma</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 mt-auto">
                    <a 
                      href="https://www.youtube.com/watch?v=YOUTUBE_ID_3" 
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Assistir no YouTube
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </div>
                </motion.div>
              </div>
              
              <div className="mt-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start">
                    <div className="bg-emerald-500 rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                      <svg viewBox="0 0 24 24" height="24" width="24" fill="#FFFFFF">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-800 mb-2">
                        Aprenda mais no nosso canal do YouTube
                      </h3>
                      <p className="text-emerald-700 text-sm mb-3">
                        A DigitFy disponibiliza diversos tutoriais detalhados no nosso canal oficial do YouTube. 
                        Aprenda estratégias avançadas, dicas exclusivas e fique atualizado com as últimas 
                        tendências do mercado digital.
                      </p>
                      <a 
                        href="https://www.youtube.com/channel/CHANNEL_ID" 
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
                      >
                        Visitar nosso canal
                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
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

export default Dashboard; 