import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MessageSquare, UserPlus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../services/permissionService';
import { ServiceRequestsButton } from '../../../components';

const DashboardMembers: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { userPlan } = usePermissions();
  
  // Simular carregamento dos dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Membros fictícios para exibição
  const members = [
    { 
      id: '1', 
      name: 'Ana Silva', 
      role: 'Designer', 
      specialty: 'UI/UX',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      status: 'online'
    },
    { 
      id: '2', 
      name: 'Carlos Mendes', 
      role: 'Copywriter', 
      specialty: 'Vendas',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'offline'
    },
    { 
      id: '3', 
      name: 'Juliana Costa', 
      role: 'Social Media', 
      specialty: 'Instagram',
      avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
      status: 'online'
    },
    { 
      id: '4', 
      name: 'Roberto Alves', 
      role: 'Tráfego', 
      specialty: 'Facebook Ads',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      status: 'busy'
    },
    { 
      id: '5', 
      name: 'Patrícia Lemos', 
      role: 'Designer', 
      specialty: 'Identidade Visual',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      status: 'online'
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando membros...</p>
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
          <Users className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Membros</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Encontre, conecte-se e colabore com outros profissionais de marketing digital.
        </p>
      </motion.div>
      
      {/* Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar profissionais..."
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
          
          <button
            onClick={() => navigate('/dashboard/members/directory')}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50"
          >
            <Users size={18} className="text-gray-500" />
            <span>Diretório</span>
          </button>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ServiceRequestsButton />
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/members/invite')}
          className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md flex items-start transition-all"
        >
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl mr-4">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Convidar Profissionais
            </h3>
            <p className="text-gray-500 text-sm">
              Convide colegas para criar uma rede de contatos profissionais
            </p>
          </div>
        </motion.button>
      </div>
      
      {/* Lista de membros */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Profissionais Recomendados</h3>
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
              onClick={() => setFilter('online')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'online' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Online
            </button>
          </div>
        </div>
        
        <div>
          {members
            .filter(member => filter === 'all' || member.status === filter)
            .map((member, index) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="relative">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    member.status === 'online' ? 'bg-green-400' : 
                    member.status === 'busy' ? 'bg-orange-400' : 'bg-gray-300'
                  }`}></div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.role} • {member.specialty}</p>
                </div>
                
                <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                  <MessageSquare size={18} className="text-gray-600" />
                </button>
              </motion.div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardMembers; 