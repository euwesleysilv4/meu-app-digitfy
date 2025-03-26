import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, GitBranch, Bell, Globe, Image, Link as LinkIcon, PenTool, Hash, 
  Smile, User, Gamepad, Music, BookOpen, ShoppingCart, Wrench, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Interface da ferramenta
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  image_url: string;
  status: 'published' | 'draft' | 'scheduled';
  is_free: boolean;
  is_online: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  priority: number;
}

// Mapeamento dos ícones do Lucide React
const iconMap: { [key: string]: React.ElementType } = {
  Scale: Scale,
  GitBranch: GitBranch,
  Bell: Bell,
  Globe: Globe,
  Image: Image,
  LinkIcon: LinkIcon,
  PenTool: PenTool,
  Hash: Hash,
  Smile: Smile,
  User: User,
  Gamepad: Gamepad,
  Music: Music,
  BookOpen: BookOpen,
  ShoppingCart: ShoppingCart,
  Wrench: Wrench,
  Sparkles: Sparkles
  // Adicione outros ícones aqui conforme necessário
};

const Tools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Incrementar visualização da página
        
        // Buscar ferramentas do Supabase
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('status', 'published')
          .order('priority', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setTools(data);
        }
      } catch (err) {
        console.error('Erro ao carregar ferramentas:', err);
        setError('Não foi possível carregar as ferramentas disponíveis');
        
        // Dados mockados em caso de falha
        setTools([
          {
            id: '1',
            title: 'Trend Rush',
            description: 'Descubra as tendências do momento',
            icon: 'Music',
            path: '/tools/trend-rush',
            color: 'violet',
            image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300',
            status: 'published',
            is_free: true,
            is_online: true,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            view_count: 0,
            priority: 1
          },
          {
            id: '2',
            title: 'Comparador de Plataformas',
            description: 'Compare comissões e recursos entre plataformas',
            icon: 'Scale',
            path: '/tools/commission-calculator',
            color: 'emerald',
            image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
            status: 'published',
            is_free: true,
            is_online: true,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            view_count: 0,
            priority: 2
          }
          // Adicione mais itens mockados se necessário
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTools();
  }, []);

  // Renderiza dinamicamente o ícone baseado no nome
  const renderIcon = (iconName: string, className: string = '') => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className={className} /> : <Wrench className={className} />;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string, hover: string, text: string, border: string } } = {
      emerald: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-100' },
      blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-100' },
      purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-100' },
      violet: { bg: 'bg-violet-50', hover: 'hover:bg-violet-100', text: 'text-violet-600', border: 'border-violet-100' },
      indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-100' },
      green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-600', border: 'border-green-100' },
      yellow: { bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-100' },
      orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-600', border: 'border-orange-100' },
      red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', text: 'text-red-600', border: 'border-red-100' },
      teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', text: 'text-teal-600', border: 'border-teal-100' },
      cyan: { bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-100' },
      fuchsia: { bg: 'bg-fuchsia-50', hover: 'hover:bg-fuchsia-100', text: 'text-fuchsia-600', border: 'border-fuchsia-100' },
      rose: { bg: 'bg-rose-50', hover: 'hover:bg-rose-100', text: 'text-rose-600', border: 'border-rose-100' }
    };
    return colorMap[color] || colorMap.emerald;
  };

  // Formatar data para "x dias atrás"
  const formatLastUpdated = (dateString: string) => {
    try {
      const lastUpdated = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'hoje';
      } else if (diffDays === 1) {
        return 'ontem';
      } else {
        return `${diffDays} dias atrás`;
      }
    } catch (e) {
      return 'recentemente';
    }
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar ferramentas</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, index) => {
              const colorClasses = getColorClasses(tool.color);
              
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group h-full"
                >
                  <Link
                    to={tool.path}
                    className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 relative h-full flex flex-col"
                  >
                    {/* Imagem de Fundo com Overlay */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent z-10" />
                      <motion.img
                        src={tool.image_url}
                        alt={tool.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <div className={`p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg
                          group-hover:scale-110 transition-all duration-300`}>
                          {renderIcon(tool.icon, `w-6 h-6 text-emerald-600`)}
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="space-y-3 mb-auto">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                          {tool.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {tool.description}
                        </p>
                      </div>

                      {/* Parte inferior do card - fixada na base */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        {/* Badge de Status */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.is_free ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {tool.is_free ? 'Gratuito' : 'Premium'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.is_online ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tool.is_online ? 'Online' : 'Em breve'}
                          </span>
                        </div>

                        {/* Botão de Ação */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Última atualização: {formatLastUpdated(tool.last_updated)}
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
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}} />
    </div>
  );
};

export default Tools;
