import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Settings, 
  Package, 
  Layers, 
  ShieldCheck,
  Cog,
  Lock,
  ChevronRight,
  Crown,
  Clock,
  Activity,
  Wrench,
  User,
  UserPlus,
  Database,
  Code,
  FileText,
  Download,
  BookOpen,
  BookOpenCheck,
  Map,
  DollarSign,
  Music,
  Trophy,
  Share2,
  Briefcase,
  Video,
  PlayCircle,
  ArrowRight,
  ImageIcon,
  Award,
  Bell,
  MessageSquare,
  Youtube
} from 'lucide-react';
import { userService } from '../../services/userService';
import type { UserProfile } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';

// Interface para as props do card
interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: number | null;
}

// Componente de cartão com hover effect aprimorado
const AdminCard = ({ title, description, icon, color, badge = null }: AdminCardProps) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow duration-300 relative`}>
      {/* Badge para notificações */}
      {badge !== null && badge > 0 && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className={`p-3 rounded-lg inline-block bg-gradient-to-r ${color}`}>
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600 flex-grow">
          {description}
        </p>
        <div className="mt-4 inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
          <span>Acessar</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </div>
  );
};

// Interface para os cards administrativos
interface AdminCardType {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  stats?: string;
  badge: number | null;
}

const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    lastLogin: '—'
  });
  
  const [adminCards, setAdminCards] = useState<AdminCardType[]>([
    {
      title: 'Permissões de Usuários',
      description: 'Gerencie planos e papéis dos usuários',
      icon: <Users className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/user-permissions',
      color: 'from-emerald-400 to-teal-500',
      stats: `0 usuários ativos`,
      badge: null,
    },
    {
      title: 'Configurações',
      description: 'Ajustes do sistema e da plataforma',
      icon: <Settings className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/settings',
      color: 'from-emerald-500 to-green-600',
      badge: null,
    },
    {
      title: 'Gerenciamento de Banners',
      description: 'Configure banners promocionais no dashboard',
      icon: <ImageIcon className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/banner-management',
      color: 'from-cyan-400 to-blue-500',
      badge: null,
    },
    {
      title: 'Gerenciar Produtos',
      description: 'Crie e edite produtos da plataforma',
      icon: <Package className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/products',
      color: 'from-green-400 to-emerald-500',
      badge: null,
    },
    {
      title: 'Produtos de Afiliados',
      description: 'Gerencie produtos para área do afiliado',
      icon: <Users className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/affiliate-products',
      color: 'from-blue-400 to-cyan-500',
      badge: null,
    },
    {
      title: 'Gerenciamento de Comunidades',
      description: 'Aprove e gerencie as comunidades enviadas',
      icon: <Share2 className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/community-management',
      color: 'from-violet-400 to-purple-500',
      badge: null,
    },
    {
      title: 'Gerenciamento de Serviços',
      description: 'Aprove e gerencie serviços de marketing digital',
      icon: <Briefcase className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/service-management',
      color: 'from-blue-400 to-indigo-500',
      badge: null,
    },
    {
      title: 'Galeria de Depoimentos',
      description: 'Aprove imagens enviadas pelos usuários',
      icon: <MessageSquare className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/testimonial-gallery',
      color: 'from-pink-400 to-rose-500',
      badge: null,
    },
    {
      title: 'Players Recomendados',
      description: 'Gerencie os influenciadores que recomendam a plataforma',
      icon: <Users className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/players',
      color: 'from-cyan-400 to-blue-500',
      badge: null,
    },
    {
      title: 'Conteúdo',
      description: 'Gerencie páginas e conteúdo do site',
      icon: <Layers className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/content',
      color: 'from-emerald-300 to-teal-400',
      badge: null,
    },
    {
      title: 'Top Afiliados',
      description: 'Gerencie os Top Afiliados exibidos na página principal',
      icon: <Trophy className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/top-afiliados',
      color: 'from-yellow-400 to-amber-500',
      badge: null,
    },
    {
      title: 'Ferramentas',
      description: 'Gerencie ferramentas disponíveis na plataforma',
      icon: <Wrench className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/tools',
      color: 'from-blue-300 to-cyan-400',
      badge: null,
    },
    {
      title: 'Gerenciamento de Desafios',
      description: 'Crie e gerencie desafios de aprendizado',
      icon: <Award className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/challenges',
      color: 'from-orange-400 to-red-500',
      badge: null,
    },
    {
      title: 'Trend Rush',
      description: 'Gerenciar áudios do Trend Rush',
      icon: <Music className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/trend-rush',
      color: 'from-indigo-400 to-violet-500',
      badge: null,
    },
    {
      title: 'Pacotes Gratuitos',
      description: 'Gerencie pacotes para download gratuito',
      icon: <Download className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/free-packs',
      color: 'from-blue-400 to-cyan-500',
      badge: null,
    },
    {
      title: 'Mapas Mentais',
      description: 'Gerencie mapas mentais disponíveis',
      icon: <Map className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/mind-maps',
      color: 'from-teal-300 to-emerald-400',
      badge: null,
    },
    {
      title: 'Estratégias de Vendas',
      description: 'Gerenciar técnicas e métodos de vendas',
      icon: <DollarSign className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/sales-strategies',
      color: 'from-indigo-400 to-blue-500',
      badge: null,
    },
    {
      title: 'eBooks e PDFs',
      description: 'Gerencie materiais para download',
      icon: <FileText className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/ebooks',
      color: 'from-teal-400 to-cyan-500',
      badge: null,
    },
    {
      title: 'Sugestões de eBooks',
      description: 'Gerenciar sugestões enviadas por usuários',
      icon: <BookOpenCheck className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/ebook-suggestions',
      color: 'from-emerald-600 to-teal-500',
      badge: null,
    },
    {
      title: 'Gerenciamento de API',
      description: 'Configure integrações e APIs',
      icon: <Code className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/api',
      color: 'from-green-500 to-teal-600',
      badge: null,
    },
    {
      title: 'Vídeos de Afiliados',
      description: 'Gerencie o vídeo tutorial de afiliados',
      icon: <Youtube className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/affiliate-videos',
      color: 'from-red-500 to-pink-600',
      badge: null,
    },
    {
      title: 'Gerenciamento de Novidades',
      description: 'Gerencie as novidades exibidas na plataforma',
      icon: <Bell className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/novidades',
      color: 'from-purple-400 to-pink-500',
      badge: null,
    },
    {
      title: 'Vídeos Tutoriais',
      description: 'Gerencie os vídeos exibidos no dashboard',
      icon: <Video className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/tutorial-videos',
      color: 'from-green-400 to-emerald-500',
      badge: null,
    },
  ]);
  
  const navigate = useNavigate();

  // Função para buscar todos os usuários do Supabase
  const fetchUserStats = async () => {
    try {
      const { data, error } = await userService.listAllUsers();
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }
      
      if (data) {
        // Contar total de usuários
        const totalUsers = data.length;
        
        // Contar usuários com planos pagos
        const premiumUsers = data.filter((user: UserProfile) => 
          user.plano === 'member' || 
          user.plano === 'pro' || 
          user.plano === 'elite'
        ).length;
        
        setStats({
          totalUsers,
          premiumUsers,
          lastLogin: new Date().toLocaleString('pt-BR')
        });
        
        // Atualizar o stats no adminCards
        setAdminCards(currentCards => {
          return currentCards.map(card => {
            if (card.title === 'Permissões de Usuários') {
              return {
                ...card,
                stats: `${totalUsers} usuários ativos`
              };
            }
            return card;
          });
        });
      }
    } catch (err) {
      console.error('Erro ao calcular estatísticas de usuários:', err);
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      try {
        console.log("Verificando status de administrador...");
        const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setErrorMessage('Não foi possível verificar suas permissões de administrador.');
          setIsAdmin(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        console.log("Status de administrador:", adminStatus);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setErrorMessage('Você não tem permissões de administrador para acessar esta página. Apenas o administrador autorizado pode acessar.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          // Buscar estatísticas reais de usuários
          await fetchUserStats();
        }
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setErrorMessage('Ocorreu um erro ao verificar suas permissões.');
        setIsAdmin(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Função para buscar contadores
  const fetchBadgeCounts = async () => {
    try {
      // Carregar contagem de sugestões pendentes
      const { data, error } = await supabase
        .from('ebook_suggestions')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');
      
      if (error) {
        console.error("Erro ao buscar contagem de sugestões:", error);
        return;
      }
      
      const pendingSuggestions = data?.length || 0;
      
      // Atualizar o badge do card de sugestões
      setAdminCards(prevCards => 
        prevCards.map(card => 
          card.title === "Sugestões de eBooks" 
            ? { ...card, badge: pendingSuggestions } 
            : card
        )
      );
    } catch (err) {
      console.error("Erro ao buscar contadores:", err);
    }
  };

  // Buscar contadores quando o componente carregar e for admin
  useEffect(() => {
    if (isAdmin && !isLoading) {
      fetchBadgeCounts();
    }
  }, [isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-medium">Carregando...</div>
          
          {/* Elementos decorativos animados */}
          <motion.div 
            className="absolute -z-10 w-32 h-32 rounded-full bg-emerald-300/20 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md relative overflow-hidden"
        >
          <motion.div 
            className="absolute -z-10 top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full -mt-20 -mr-20 blur-2xl"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="text-center mb-6 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Lock className="h-10 w-10 text-emerald-500" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-800"
            >
              Acesso Restrito
            </motion.h1>
            
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mt-2"
            >
              {errorMessage || 'Você não tem permissões para acessar o painel de administração.'}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-gray-500 mt-4 text-sm">
                Redirecionando para a página inicial...
              </p>
              
              <div className="w-full bg-gray-100 h-1 rounded-full mt-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header com animação de entrada */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.div 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 text-white shadow-lg overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Elementos decorativos animados */}
            <motion.div 
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-20 -mr-20"
              animate={{ 
                y: [0, 10, 0],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            
            <motion.div 
              className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -mb-10 -ml-10"
              animate={{ 
                x: [0, 10, 0],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Painel de Administração
                </h1>
                <p className="text-emerald-50">
                  Bem-vindo ao controle central da DigitFy
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 relative z-10">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-emerald-50 text-sm mb-1">Usuários Totais</div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-white" />
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
              </div>
              
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-emerald-50 text-sm mb-1">Usuários Premium</div>
                <div className="flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-white" />
                  <span className="text-2xl font-bold">{stats.premiumUsers}</span>
                </div>
              </div>
              
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-emerald-50 text-sm mb-1">Seu último login</div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-white" />
                  <span className="text-sm font-medium">{stats.lastLogin}</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-bold text-gray-800 mb-6 flex items-center"
          >
            <User className="h-6 w-6 mr-2 text-emerald-600" />
            Ferramentas de Administração
          </motion.h2>
        </motion.div>

        {/* Grid de cartões com animação de entrada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="col-span-1"
            >
              <Link
                to={card.link}
                className="block h-full"
                onClick={() => console.log(`Navegando para: ${card.link}`)}
              >
                <AdminCard
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  color={card.color}
                  badge={card.badge}
                />
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* Rodapé */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>
            DigitFy Admin Dashboard v2.0 • Acesso exclusivo para administradores
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 