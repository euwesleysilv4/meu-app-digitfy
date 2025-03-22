import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, GitBranch, Bell, Globe, Image, Link as LinkIcon, PenTool, Hash, 
  Smile, User, Gamepad, Music, BookOpen, ShoppingCart, Wrench, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Tools = () => {
  const tools = [
    {
      icon: Music,
      title: 'Trend Rush',
      description: 'Descubra as tendências do momento',
      path: '/tools/trend-rush',
      color: 'violet',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: Scale,
      title: 'Comparador de Plataformas',
      description: 'Compare comissões e recursos entre plataformas',
      path: '/tools/commission-calculator',
      color: 'emerald',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: GitBranch,
      title: 'Funil de LTV',
      description: 'Calcule e analise o valor vitalício do cliente',
      path: '/tools/ltv-funnel',
      color: 'blue',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: Bell,
      title: 'Simulador de Notificações',
      description: 'Crie notificações personalizadas',
      path: '/tools/notification-simulator',
      color: 'purple',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: Globe,
      title: 'Sites Úteis',
      description: 'Acesse uma curadoria de sites essenciais',
      path: '/tools/useful-sites',
      color: 'indigo',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: LinkIcon,
      title: 'Criador de Link para WhatsApp',
      description: 'Gere links personalizados para WhatsApp',
      path: '/whatsapp-generator',
      color: 'green',
      image: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: PenTool,
      title: 'Gerador de Copy Persuasiva',
      description: 'Crie textos persuasivos para suas vendas',
      path: '/persuasive-copy',
      color: 'yellow',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: Hash,
      title: 'Gerador de Hashtag',
      description: 'Crie hashtags relevantes para seu conteúdo',
      path: '/hashtag-generator',
      color: 'orange',
      image: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: Smile,
      title: 'Simulador de Provas Sociais',
      description: 'Gere provas sociais para seus produtos',
      path: '/social-proof-generator',
      color: 'red',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: User,
      title: 'Gerador de Estrutura de Perfil',
      description: 'Crie uma estrutura profissional para seu perfil',
      path: '/profile-structure-generator',
      color: 'teal',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: Gamepad,
      title: 'Jogos do Digital',
      description: 'Aprenda marketing digital jogando',
      path: '/tools/digital-games',
      color: 'cyan',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: BookOpen,
      title: 'Gerador de Storytelling',
      description: 'Crie histórias envolventes para suas vendas',
      path: '/tools/storytelling-generator',
      color: 'fuchsia',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=300'
    },
    {
      icon: ShoppingCart,
      title: 'Gerador de Order Bump',
      description: 'Crie ofertas irresistíveis para checkout',
      path: '/tools/order-bump-generator',
      color: 'rose',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=300'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string, hover: string, text: string, border: string } } = {
      emerald: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-100' },
      blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-100' },
      purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-100' },
      // ... adicione mais cores conforme necessário
    };
    return colorMap[color] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-emerald-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-100/30 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Wrench className="h-5 w-5 text-emerald-600" />
              <span className="text-emerald-600 text-sm font-medium">Ferramentas DigitFy</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent mb-6">
              Potencialize seus Resultados
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore nossa coleção completa de ferramentas desenvolvidas para impulsionar 
              seu marketing digital e maximizar suas conversões.
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute -bottom-10 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </div>

      {/* Tools Grid Section */}
      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link
                to={tool.path}
                className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 relative"
              >
                {/* Imagem de Fundo com Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent z-10" />
                  <motion.img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <div className={`p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg
                      group-hover:scale-110 transition-all duration-300`}>
                      <tool.icon className={`w-6 h-6 text-${tool.color}-600`} />
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                      {tool.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {tool.description}
                    </p>
                    
                    {/* Badge de Status */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Gratuito
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Última atualização: 2 dias atrás
                      </span>
                      <motion.div 
                        className="flex items-center gap-2 text-emerald-600 text-sm font-medium group-hover:translate-x-2 transition-transform duration-300"
                        whileHover={{ x: 5 }}
                      >
                        Acessar
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default Tools;
