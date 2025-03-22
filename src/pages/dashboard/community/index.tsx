import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MessageSquare, BookOpen, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../services/permissionService';
import { PromoteCommunityButton } from '../../../components';

const DashboardCommunity: React.FC = () => {
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
  
  // Comunidades fictícias para exibição
  const communities = [
    { 
      id: '1', 
      name: 'Afiliados Elite', 
      type: 'discord', 
      members: 1253,
      image: 'https://placehold.co/400x400/4C51BF/FFFFFF?text=AE',
      lastActivity: 'Agora mesmo'
    },
    { 
      id: '2', 
      name: 'Marketing Digital BR', 
      type: 'whatsapp', 
      members: 842,
      image: 'https://placehold.co/400x400/22C55E/FFFFFF?text=MD',
      lastActivity: '5 min atrás'
    },
    { 
      id: '3', 
      name: 'Tráfego Pago Avançado', 
      type: 'telegram', 
      members: 3215,
      image: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=TP',
      lastActivity: '28 min atrás'
    },
    { 
      id: '4', 
      name: 'Copywriting Experts', 
      type: 'discord', 
      members: 1876,
      image: 'https://placehold.co/400x400/EC4899/FFFFFF?text=CE',
      lastActivity: '1h atrás'
    },
    { 
      id: '5', 
      name: 'Instagram Strategies', 
      type: 'telegram', 
      members: 942,
      image: 'https://placehold.co/400x400/F97316/FFFFFF?text=IS',
      lastActivity: '3h atrás'
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando comunidades...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Comunidade</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Participe de grupos, servidores e canais para discutir marketing digital com outros profissionais.
        </p>
      </motion.div>
      
      {/* Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar comunidades..."
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
            onClick={() => navigate('/dashboard/community/guide')}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50"
          >
            <BookOpen size={18} className="text-gray-500" />
            <span>Guia</span>
          </button>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/dashboard/community/join')}
          className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md flex items-start transition-all"
        >
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mr-4">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Entrar em Comunidades
            </h3>
            <p className="text-gray-500 text-sm">
              Participe de grupos, servidores Discord e canais do Telegram
            </p>
          </div>
        </motion.button>
        
        <PromoteCommunityButton />
      </div>
      
      {/* Lista de comunidades */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Comunidades Recomendadas</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('discord')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'discord' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Discord
            </button>
            <button 
              onClick={() => setFilter('telegram')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                filter === 'telegram' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Telegram
            </button>
          </div>
        </div>
        
        <div>
          {communities
            .filter(community => filter === 'all' || community.type === filter)
            .map((community, index) => (
              <motion.div 
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="relative">
                  <img 
                    src={community.image} 
                    alt={community.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    community.type === 'discord' ? 'bg-indigo-400' : 
                    community.type === 'telegram' ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{community.name}</h4>
                  <p className="text-sm text-gray-500">
                    {community.members.toLocaleString()} membros • Atividade: {community.lastActivity}
                  </p>
                </div>
                
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 transition-colors text-sm font-medium">
                  Participar
                </button>
              </motion.div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardCommunity; 