import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpenText,
  Rocket, 
  Users2, 
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  Star,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Heart,
  Quote,
  Wrench,
  HelpCircle,
  Zap,
  BarChart3,
  FileText,
  MessageSquare,
  Hash,
  PenTool,
  Award,
  Image,
  LineChart,
  Link,
  Bell,
  Calculator,
  Layers,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Activity,
  AreaChart
} from 'lucide-react';
import HomeFeaturesGrid from '../components/HomeFeaturesGrid';

const Home: React.FC = () => {
  const { profile, session } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar para o dashboard se o usuário estiver logado
  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);
  
  // Renderizar página de vendas para usuários não logados
  if (!session) {
    // Estados específicos para a página de vendas (usuários não logados)
    const [counts, setCounts] = useState({
      users: 0,
      content: 0,
      tools: 0
    });
    
    const [showNotification, setShowNotification] = useState(false);
    const [currentUser] = useState({
      name: "Wesley Silva",
      time: "agora mesmo"
    });

    // Depoimentos
    const testimonials = [
      {
        name: "Carlos Mendes",
        role: "Empresário",
        avatar: "https://i.pravatar.cc/150?img=8",
        content: "A DigitFy transformou minha abordagem de marketing digital. Os conteúdos gratuitos são melhores que muitos cursos pagos que já fiz!",
        rating: 5
      },
      {
        name: "Amanda Souza",
        role: "Social Media",
        avatar: "https://i.pravatar.cc/150?img=5",
        content: "As ferramentas exclusivas economizam horas do meu trabalho todo dia. A comunidade é extremamente acolhedora e colaborativa.",
        rating: 5
      },
      {
        name: "Roberto Alves",
        role: "Consultor Digital",
        avatar: "https://i.pravatar.cc/150?img=3",
        content: "Desde que comecei a usar os templates e seguir os cursos, meus resultados com clientes melhoraram consideravelmente.",
        rating: 4
      }
    ];

    // Características da plataforma
    const features = [
      {
        icon: BookOpenText,
        title: "Cursos Gratuitos",
        description: "Aprenda com dezenas de cursos sobre marketing digital, tráfego e vendas"
      },
      {
        icon: Rocket,
        title: "Ferramentas Práticas",
        description: "Acesso a ferramentas exclusivas para otimizar suas campanhas"
      },
      {
        icon: Users2,
        title: "Comunidade Ativa",
        description: "Conecte-se com outros profissionais e aprenda com cases reais"
      },
      {
        icon: Heart,
        title: "Suporte Dedicado",
        description: "Conte com nossa equipe para ajudar em todas as etapas da sua jornada"
      }
    ];

    // Ícones de ferramentas para o carrossel - primeira linha
    const toolIcons = [
      { icon: MessageSquare, name: "WhatsApp Link" },
      { icon: BarChart3, name: "Prova Social" },
      { icon: Image, name: "Estrutura de Perfil" },
      { icon: Hash, name: "Hashtags" },
      { icon: PenTool, name: "Copy Persuasiva" },
      { icon: Award, name: "Storytelling" },
      { icon: Rocket, name: "Order Bump" },
      { icon: FileText, name: "Criativos" },
      { icon: Layers, name: "Landing Pages" },
      { icon: Lightbulb, name: "Ideias de Posts" },
      { icon: Users2, name: "Segmentação" },
      { icon: HelpCircle, name: "FAQ Builder" },
      { icon: Bell, name: "Alertas" },
      { icon: Link, name: "Bio Links" },
      { icon: Calculator, name: "ROI Calculator" },
      { icon: BookOpenText, name: "Scripts" }
    ];
    
    // Ícones de ferramentas para o carrossel - segunda linha
    const toolIcons2 = [
      { icon: LineChart, name: "Funil de LTV" },
      { icon: Link, name: "Sites Úteis" },
      { icon: Bell, name: "Notificações" },
      { icon: Calculator, name: "Comparador" },
      { icon: Zap, name: "Trend Rush" },
      { icon: Layers, name: "Jogos Digitais" },
      { icon: BookOpenText, name: "E-books" },
      { icon: Lightbulb, name: "Ideias" },
      { icon: Image, name: "Banco de Imagens" },
      { icon: Heart, name: "Engajamento" },
      { icon: MessageSquare, name: "Chat Templates" },
      { icon: FileText, name: "Documentos" },
      { icon: PenTool, name: "Design" },
      { icon: Hash, name: "SEO Tools" },
      { icon: BarChart3, name: "Analytics" },
      { icon: Wrench, name: "Automação" }
    ];

    // Benefícios listados
    const benefits = [
      "Cursos atualizados semanalmente",
      "Certificados gratuitos",
      "Ferramentas exclusivas",
      "Suporte 24/7",
      "Templates prontos para usar",
      "Networking qualificado"
    ];

    // Efeito para animar os números
    useEffect(() => {
      const duration = 2000; // duração da animação em ms
      const interval = 20; // intervalo entre atualizações
      const steps = duration / interval;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounts({
          users: Math.floor(progress * 50000),
          content: Math.floor(progress * 100),
          tools: Math.floor(progress * 30)
        });
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }, []);

    // Animações para elementos individuais
    const fadeInUp = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      }
    };

    const staggerContainer = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    // Página de vendas com animações mais sofisticadas
    return (
      <div className="min-h-screen overflow-hidden">
        {/* Elementos de fundo animados e modernos */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div 
            className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-300/20 to-emerald-400/5 blur-[80px]"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.15, 0.2],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 15,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-teal-300/15 to-emerald-400/5 blur-[100px]"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.1, 0.15],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 20,
              ease: "easeInOut",
              delay: 5
            }}
          />
          <motion.div 
            className="absolute top-[40%] left-[20%] w-40 h-40 rounded-full bg-emerald-300/10 blur-[60px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{ 
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section */}
          <div className="mb-10 sm:mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-start">
              {/* Coluna da esquerda com título e texto */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="lg:col-span-6"
              >
                <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight text-center sm:text-left">
                  <motion.span 
                    className="block text-emerald-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Aprenda tudo sobre
                  </motion.span>
                  <motion.span 
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Marketing Digital
                  </motion.span>
                  <motion.span 
                    className="block text-emerald-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    Gratuitamente!
                  </motion.span>
                </h1>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto text-center sm:text-left sm:mx-0"
                >
                  Imagine um lugar onde você pode aprender tudo sobre 
                  Marketing Digital na atualidade sem precisar pagar nada.
                </motion.p>
                
                {/* Botões com animações instantâneas no hover */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center sm:justify-start">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/auth?register=true')}
                    className="group bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-3 px-6 rounded-lg text-base font-medium shadow-md transition-all duration-75 flex items-center justify-center gap-2"
                  >
                    <span>Criar conta gratuita</span>
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-75" />
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/auth')}
                    className="group bg-white text-emerald-500 py-3 px-6 rounded-lg text-base font-medium border border-emerald-100 hover:border-emerald-200 shadow-sm transition-all duration-75 flex items-center justify-center gap-2"
                  >
                    <span>Fazer Login</span>
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-75" />
                  </motion.button>
                </div>
                
                {/* Lista de benefícios abaixo dos botões */}
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3 flex flex-col items-center sm:items-start"
                >
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="flex items-center gap-3 text-gray-700 transition-all duration-75 hover:text-emerald-500"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.1 }}
                      >
                        <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
                      </motion.div>
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Coluna da direita com os recursos */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="lg:col-span-6 overflow-hidden"
              >
                {/* Cards de recursos/funcionalidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white rounded-xl p-5 shadow-sm border border-emerald-50 hover:border-emerald-100 transition-all duration-200"
                    >
                      <div className="flex flex-col">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 w-10 h-10 rounded-lg shadow-sm mb-4 flex items-center justify-center">
                          <feature.icon className="text-white" size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Card de estatísticas */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl p-6 border border-emerald-50 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="font-medium text-gray-800">Estatísticas em Tempo Real</h4>
                    <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-500 px-3 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span>Ao vivo</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-5">
                    <motion.div className="flex items-center gap-3" whileHover={{ x: 3 }}>
                      <div className="bg-emerald-50 p-2 rounded-full">
                        <Users2 size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Usuários</p>
                        <p className="font-semibold text-gray-800">{counts.users.toLocaleString()}+</p>
                      </div>
                    </motion.div>
                    
                    <motion.div className="flex items-center gap-3" whileHover={{ x: 3 }}>
                      <div className="bg-emerald-50 p-2 rounded-full">
                        <BookOpenText size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Conteúdos</p>
                        <p className="font-semibold text-gray-800">{counts.content}+</p>
                      </div>
                    </motion.div>
                    
                    <motion.div className="flex items-center gap-3" whileHover={{ x: 3 }}>
                      <div className="bg-emerald-50 p-2 rounded-full">
                        <Wrench size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ferramentas</p>
                        <p className="font-semibold text-gray-800">{counts.tools}+</p>
                      </div>
                    </motion.div>
                    
                    <motion.div className="flex items-center gap-3" whileHover={{ x: 3 }}>
                      <div className="bg-emerald-50 p-2 rounded-full">
                        <HelpCircle size={18} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Suporte</p>
                        <p className="font-semibold text-gray-800">24/7</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Carrossel de Ferramentas e Recursos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-24 overflow-hidden py-8"
          >
            {/* Carrossel com animação infinita - Implementação verdadeiramente contínua */}
            <div className="relative">
              {/* Gradiente de fade nas bordas */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
              
              {/* Primeira linha de ferramentas - rolando para direita */}
              <div className="overflow-hidden">
                <div className="flex items-center mb-8 w-max animate-scroll-x">
                  {/* Repetir os ícones 3 vezes para criar uma ilusão de continuidade */}
                  {[...toolIcons, ...toolIcons, ...toolIcons].map((tool, index) => (
                    <div key={index} className="flex flex-col items-center mx-4 px-2 flex-shrink-0 w-24">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-3 rounded-lg shadow-sm mb-2 w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                        <tool.icon size={24} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-700 font-medium text-center truncate w-full">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Segunda linha de ferramentas - rolando para esquerda */}
              <div className="overflow-hidden">
                <div className="flex items-center w-max animate-scroll-x-reverse">
                  {/* Repetir os ícones 3 vezes para criar uma ilusão de continuidade */}
                  {[...toolIcons2, ...toolIcons2, ...toolIcons2].map((tool, index) => (
                    <div key={index} className="flex flex-col items-center mx-4 px-2 flex-shrink-0 w-24">
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-3 rounded-lg shadow-sm mb-2 w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                        <tool.icon size={24} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-700 font-medium text-center truncate w-full">{tool.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Seção de Crescimento Comparativo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full mb-4"
              >
                Crescimento Comparativo
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-4 text-gray-800"
              >
                Evolução de quem utiliza nossas ferramentas
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-600 max-w-2xl mx-auto"
              >
                Compare os resultados obtidos pelos nossos usuários em diferentes momentos da jornada
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              {/* Item de Comparação 1 - Engajamento nas Redes Sociais */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-2 rounded-lg shadow-sm">
                    <Activity size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800">Engajamento nas Redes Sociais</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Antes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Sem DigitFy</span>
                      <span className="text-sm font-bold">12%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gray-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "12%" }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Depois */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Com DigitFy</span>
                      <span className="text-sm font-bold text-emerald-600">48%</span>
                    </div>
                    <div className="h-4 bg-emerald-50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "48%" }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Aumento médio de <span className="font-bold text-emerald-600">4x</span> no engajamento das publicações após aplicar nossas estratégias.</p>
                </div>
              </motion.div>
              
              {/* Item de Comparação 2 - Conversão de Leads */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-2 rounded-lg shadow-sm">
                    <Users2 size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800">Conversão de Leads</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Antes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Sem DigitFy</span>
                      <span className="text-sm font-bold">5%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gray-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "5%" }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Depois */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Com DigitFy</span>
                      <span className="text-sm font-bold text-emerald-600">32%</span>
                    </div>
                    <div className="h-4 bg-emerald-50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "32%" }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Aumento médio de <span className="font-bold text-emerald-600">6.4x</span> na taxa de conversão de leads após implementação.</p>
                </div>
              </motion.div>
              
              {/* Item de Comparação 3 - Tráfego Orgânico */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-2 rounded-lg shadow-sm">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800">Tráfego Orgânico</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Antes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Sem DigitFy</span>
                      <span className="text-sm font-bold">8%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gray-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "8%" }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Depois */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Com DigitFy</span>
                      <span className="text-sm font-bold text-emerald-600">40%</span>
                    </div>
                    <div className="h-4 bg-emerald-50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "40%" }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Aumento significativo de <span className="font-bold text-emerald-600">8%</span> para <span className="font-bold text-emerald-600">40%</span> na visibilidade orgânica com nossas estratégias de SEO.</p>
                </div>
              </motion.div>
              
              {/* Item de Comparação 4 - ROI do Marketing */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-2 rounded-lg shadow-sm">
                    <DollarSign size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800">ROI do Marketing</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Antes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">Sem DigitFy</span>
                      <span className="text-sm font-bold">150%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gray-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "15%" }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                  
                  {/* Depois */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Com DigitFy</span>
                      <span className="text-sm font-bold text-emerald-600">550%</span>
                    </div>
                    <div className="h-4 bg-emerald-50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "55%" }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Aumento médio de <span className="font-bold text-emerald-600">3.7x</span> no retorno sobre investimento em campanhas de marketing.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Seção de Depoimentos Redesenhada e Clean */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-24"
          >
            <div className="text-center mb-12">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-sm font-medium rounded-full mb-4"
              >
                Depoimentos
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-4 text-gray-800"
              >
                O que nossa comunidade diz
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-gray-600 max-w-2xl mx-auto"
              >
                Histórias reais de profissionais que transformaram suas carreiras com nossos recursos
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * index, duration: 0.5 }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 15px 30px -10px rgba(16, 185, 129, 0.1)",
                    transition: { duration: 0.2 } 
                  }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100/30 relative"
                >
                  {/* Círculo verde removido */}
                  
                  {/* Conteúdo do depoimento */}
                  <div className="mb-6">
                    <p className="text-gray-600 text-sm italic font-light leading-relaxed">
                      {testimonial.content}
                    </p>
                  </div>
                  
                  {/* Informações do autor com avatar ao lado */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-gray-800 mb-0.5">{testimonial.name}</h4>
                        <span className="text-emerald-500 text-xs font-medium">
                          {testimonial.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={`${i < testimonial.rating ? "text-emerald-500 fill-emerald-500" : "text-gray-200"} ml-0.5`} 
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Banner com Círculos Suaves - melhorado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl overflow-hidden shadow-lg relative mb-24"
          >
            {/* Elementos decorativos suaves no fundo */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-10 blur-2xl"
                style={{ transform: "translate(30%, -30%)" }}
                animate={{ 
                  scale: [1, 1.05, 1],
                  x: [0, 10, 0]
                }}
                transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white opacity-10 blur-2xl"
                style={{ transform: "translate(-30%, 30%)" }}
                animate={{ 
                  scale: [1, 1.08, 1],
                  x: [0, -10, 0]
                }}
                transition={{ repeat: Infinity, duration: 18, ease: "easeInOut", delay: 2 }}
              />
              <motion.div 
                className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-emerald-300 opacity-10 blur-2xl"
                style={{ transform: "translate(-50%, -50%)" }}
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 15, ease: "easeInOut", delay: 1 }}
              />
            </div>
            
            <div className="relative z-10 flex flex-col items-center md:flex-row md:items-center px-8 py-12 md:py-14 md:px-16">
              <div className="md:w-2/3 mb-8 md:mb-0 md:pr-12 text-left">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-white mb-5"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Entre para nossa comunidade
                  </span>
                </motion.div>
                
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight"
                >
                  Junte-se a milhares de profissionais hoje mesmo
                </motion.h2>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-white/90 text-lg max-w-xl mb-0"
                >
                  Nossa plataforma reúne as melhores ferramentas e recursos para impulsionar sua carreira no marketing digital.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="md:w-1/3 flex justify-center md:justify-end"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.2)",
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/auth?register=true')}
                  className="group bg-white text-emerald-500 hover:text-emerald-600 py-4 px-8 rounded-xl text-base font-medium transition-all duration-200 inline-flex items-center gap-2 shadow-xl"
                >
                  <span>Criar Conta Gratuita</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-150" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Redesenhado */}
          <footer className="border-t border-gray-100 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              {/* Coluna de informações da empresa */}
              <div className="col-span-1">
                <div className="flex items-center mb-4 gap-2">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <Zap size={18} className="text-white" />
                  </div>
                  <div className="flex items-baseline">
                    <h3 className="text-xl font-bold text-emerald-600">DigitFy</h3>
                    <span className="text-xs text-emerald-600/60 ml-0.5">.com.br</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 max-w-sm text-sm">
                  Somos uma plataforma dedicada a democratizar o conhecimento em marketing digital, 
                  oferecendo recursos de qualidade para impulsionar sua carreira.
                </p>
                <div className="flex space-x-4">
                  <motion.a 
                    href="#" 
                    whileHover={{ y: -3, transition: { duration: 0.1 } }}
                    className="bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-emerald-500 p-2 rounded-full transition-all duration-150"
                  >
                    <Instagram size={18} />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    whileHover={{ y: -3, transition: { duration: 0.1 } }}
                    className="bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-emerald-500 p-2 rounded-full transition-all duration-150"
                  >
                    <Youtube size={18} />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    whileHover={{ y: -3, transition: { duration: 0.1 } }}
                    className="bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-emerald-500 p-2 rounded-full transition-all duration-150"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="lucide"
                    >
                      <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0 -6 0"></path>
                      <path d="M16.82 15.42c-1.92 2.1 -3.32 2.97 -5.82 2.97c-2.5 0 -3.9 -.87 -5.82 -2.97c-1.59 -1.74 -2.18 -3.78 -2.18 -8.42c0 -3.5 1.63 -5 3 -5c1.37 0 1.5 1 3 1h4c1.5 0 1.71 -1 3 -1c1.37 0 3 1.5 3 5c0 4.64 -.59 6.68 -2.18 8.42z"></path>
                    </svg>
                  </motion.a>
                </div>
              </div>
              
              {/* Grupos de links em um contêiner flexível para melhor distribuição */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-8">
                {/* Links rápidos */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Plataforma</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Recursos</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Ferramentas</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Comunidade</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Cursos</a></li>
                  </ul>
                </div>
                
                {/* Links de suporte */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Ajuda</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Suporte</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Perguntas Frequentes</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Contato</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Tutoriais</a></li>
                  </ul>
                </div>
                
                {/* Links legais */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Termos de Uso</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Privacidade</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">Cookies</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 text-center">
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} DigitFy. Todos os direitos reservados.
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Usuário logado - aplicando a mesma identidade visual do resto do sistema
  const userName = profile?.nome?.split(' ')[0] || 'Usuário';
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabeçalho com saudação personalizada */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-8 md:px-10 md:py-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Olá, {userName}! 👋
            </h1>
            <p className="text-teal-50 text-lg max-w-2xl mb-6">
              Bem-vindo à DigitFy, sua plataforma completa para marketing digital e crescimento profissional.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/tools')}
              className="bg-white text-teal-600 hover:bg-teal-50 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 font-medium shadow-md"
            >
              Explorar ferramentas <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Título da seção de recursos */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-800">
          Recursos Disponíveis
        </h2>
        <p className="text-gray-600">
          Acesse todos os recursos e ferramentas disponíveis para você.
        </p>
      </motion.div>

      {/* Grade de recursos */}
      <HomeFeaturesGrid />
    </div>
  );
};

export default Home;
