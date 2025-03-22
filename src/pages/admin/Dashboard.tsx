import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  Layers, 
  MessageSquare, 
  Bell, 
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
  DownloadCloud,
  HelpCircle,
  Shield
} from 'lucide-react';
import { userService } from '../../services/userService';
import type { UserProfile } from '../../lib/supabase';

// Componente de cartão com hover effect aprimorado
const AdminCard = ({ card, index }: { card: any, index: number }) => {
  return (
    <motion.div
      key={card.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <Link 
        to={card.link}
        className="group block h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
      >
        <div className={`relative bg-gradient-to-r ${card.color} p-6 pb-10 overflow-hidden`}>
          <motion.div 
            className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-8 -mr-8 blur-2xl" 
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-10 -ml-10 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
          
          <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center backdrop-blur-sm relative z-10 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            {card.icon}
          </div>
        </div>
        
        <div className="p-6 relative">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-emerald-500">
            <ChevronRight size={20} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
            {card.title}
          </h3>
          <p className="text-gray-600">
            {card.description}
          </p>
          
          {card.stats && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-emerald-600 font-medium">
                <Activity size={14} className="mr-1" />
                {card.stats}
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

const AdminDashboard: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    lastLogin: '—'
  });
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
      }
    } catch (err) {
      console.error('Erro ao calcular estatísticas de usuários:', err);
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      try {
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
            className="absolute -z-10 top-0 right-0 w-64 h-64 bg-red-100 rounded-full -mt-20 -mr-20 blur-2xl"
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="text-center mb-6 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Lock className="h-10 w-10 text-red-500" />
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

  const adminCards = [
    {
      title: 'Permissões de Usuários',
      description: 'Gerencie planos e papéis dos usuários',
      icon: <Users className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/user-permissions',
      color: 'from-emerald-400 to-teal-500',
      stats: `${stats.totalUsers} usuários ativos`
    },
    {
      title: 'Configurações',
      description: 'Ajustes do sistema e da plataforma',
      icon: <Settings className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/settings',
      color: 'from-blue-400 to-indigo-500'
    },
    {
      title: 'Estatísticas',
      description: 'Visualize métricas e relatórios',
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/statistics',
      color: 'from-purple-400 to-pink-500',
      stats: `${stats.premiumUsers} usuários premium`
    },
    {
      title: 'Gerenciar Produtos',
      description: 'Crie e edite produtos da plataforma',
      icon: <Package className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/products',
      color: 'from-orange-400 to-red-500'
    },
    {
      title: 'Conteúdo',
      description: 'Gerencie páginas e conteúdo do site',
      icon: <Layers className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/content',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      title: 'Mensagens',
      description: 'Administre mensagens e comunicações',
      icon: <MessageSquare className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/messages',
      color: 'from-indigo-400 to-violet-500'
    },
    {
      title: 'Notificações',
      description: 'Configure notificações do sistema',
      icon: <Bell className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/notifications',
      color: 'from-red-400 to-rose-500'
    },
    {
      title: 'Manutenção',
      description: 'Ferramentas de manutenção do sistema',
      icon: <Wrench className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/maintenance',
      color: 'from-gray-400 to-slate-500'
    },
    {
      title: 'Gerenciamento de API',
      description: 'Configure integrações e APIs',
      icon: <Code className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/api',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      title: 'Backup de Dados',
      description: 'Gerenciar backups e restauração',
      icon: <DownloadCloud className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/backup',
      color: 'from-emerald-500 to-green-600'
    },
    {
      title: 'Suporte Avançado',
      description: 'Ferramentas para suporte técnico',
      icon: <HelpCircle className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/support',
      color: 'from-amber-400 to-orange-500'
    },
    {
      title: 'Segurança',
      description: 'Configure opções de segurança',
      icon: <Shield className="h-8 w-8 text-white" />,
      link: '/dashboard/admin/security',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

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
            <AdminCard key={card.title} card={card} index={index} />
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