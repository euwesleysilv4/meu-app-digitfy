import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, User, Search, Filter, Star, MessageCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../services/permissionService';

const DashboardServices: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { userPlan, hasAccess } = usePermissions();
  
  // Verificar o acesso ao recurso de solicitações de serviços
  const canViewServiceRequests = hasAccess('viewServiceRequests');
  
  // Logs para depuração
  console.log("Plano atual na página de serviços:", userPlan);
  console.log("Pode visualizar solicitações de serviços:", canViewServiceRequests);
  
  // Simular carregamento dos dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Manipulador de clique para o botão de solicitações
  const handleServiceRequestsClick = () => {
    if (canViewServiceRequests) {
      // Se tiver permissão, navega para a página de solicitações
      navigate('/dashboard/services/requests');
    } else {
      // Se não tiver permissão, navega para a página de upgrade
      navigate('/dashboard/upgrade-plan');
    }
  };
  
  // Serviços fictícios para exibição
  const services = [
    { 
      id: '1', 
      title: 'Criação de Funis de Vendas', 
      provider: 'Ana Silva',
      rating: 4.9,
      reviews: 124,
      image: 'https://placehold.co/400x400/22C55E/FFFFFF?text=FS',
      providerImage: 'https://placehold.co/400x400/4C51BF/FFFFFF?text=AS',
      category: 'funis',
      price: 'R$ 1.200,00'
    },
    { 
      id: '2', 
      title: 'Tráfego Pago para E-commerce', 
      provider: 'Carlos Mendes',
      rating: 4.8,
      reviews: 98,
      image: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=TP',
      providerImage: 'https://placehold.co/400x400/EC4899/FFFFFF?text=CM',
      category: 'trafego',
      price: 'R$ 1.500,00'
    },
    { 
      id: '3', 
      title: 'Copywriting para Lançamentos', 
      provider: 'Bianca Oliveira',
      rating: 5.0,
      reviews: 156,
      image: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=CL',
      providerImage: 'https://placehold.co/400x400/F97316/FFFFFF?text=BO',
      category: 'copywriting',
      price: 'R$ 950,00'
    },
    { 
      id: '4', 
      title: 'Estratégia de Instagram para Empresas', 
      provider: 'Maria Costa',
      rating: 4.7,
      reviews: 87,
      image: 'https://placehold.co/400x400/F97316/FFFFFF?text=IG',
      providerImage: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=MC',
      category: 'redes',
      price: 'R$ 800,00'
    },
    { 
      id: '5', 
      title: 'Consultoria em SEO Avançado', 
      provider: 'Pedro Santos',
      rating: 4.9,
      reviews: 132,
      image: 'https://placehold.co/400x400/22C55E/FFFFFF?text=SE',
      providerImage: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=PS',
      category: 'seo',
      price: 'R$ 1.800,00'
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando serviços...</p>
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
          <Briefcase className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Serviços</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Encontre profissionais de marketing digital ou divulgue seus serviços para a comunidade.
        </p>
      </motion.div>
      
      {/* Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar serviços..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <button className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50">
              <Filter size={18} className="text-gray-500" />
              <span>Filtrar</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/services/providers')}
          className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md flex items-start transition-all"
        >
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mr-4">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Contratar Profissionais
            </h3>
            <p className="text-gray-500 text-sm">
              Encontre especialistas em marketing digital para seus projetos
            </p>
          </div>
        </motion.button>
        
        {/* Botão de Solicitações de Serviços - implementado diretamente */}
        {canViewServiceRequests ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleServiceRequestsClick}
            className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md flex items-start transition-all"
          >
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4">
              <Search size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Solicitações de Serviços
              </h3>
              <p className="text-gray-500 text-sm">
                Veja quem está precisando de serviços de marketing digital
              </p>
            </div>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleServiceRequestsClick}
            className="relative w-full bg-white border border-gray-200 rounded-xl p-5 flex items-start opacity-80 hover:opacity-90 transition-all"
          >
            <div className="absolute top-3 right-3">
              <div className="bg-amber-100 p-1.5 rounded-full">
                <Lock className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4">
              <Search size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1 line-through decoration-gray-400">
                Solicitações de Serviços
              </h3>
              <p className="text-gray-500 text-sm">
                Veja quem está precisando de serviços de marketing digital
              </p>
              <p className="mt-2 text-xs text-amber-600 font-medium">
                Disponível no plano Member ou superior
              </p>
            </div>
          </motion.button>
        )}
      </div>
      
      {/* Lista de serviços em destaque */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Serviços em Destaque</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('trafego')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'trafego' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tráfego
            </button>
            <button 
              onClick={() => setFilter('copywriting')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'copywriting' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Copywriting
            </button>
          </div>
        </div>
        
        <div>
          {services
            .filter(service => filter === 'all' || service.category === filter)
            .map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="relative w-14 h-14">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{service.title}</h4>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <div className="flex items-center">
                      <img 
                        src={service.providerImage} 
                        alt={service.provider} 
                        className="w-4 h-4 rounded-full mr-1.5"
                      />
                      <span>{service.provider}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3.5 w-3.5 text-amber-400 mr-1" />
                      <span>{service.rating} ({service.reviews})</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="font-medium text-gray-900">{service.price}</div>
                    <div className="text-xs text-gray-500">Preço médio</div>
                  </div>
                  
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 transition-colors text-sm font-medium flex items-center gap-1">
                    <MessageCircle size={16} />
                    Contato
                  </button>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardServices; 