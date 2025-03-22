import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MessageCircle, Calendar, Search, Filter, Tag, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../services/permissionService';

const ServiceRequests: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { userPlan } = usePermissions();
  
  // Logs para depuração
  console.log("Plano atual na página de solicitações:", userPlan);
  
  // Simular carregamento dos dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Dados simulados de solicitações de serviços
  const serviceRequests = [
    { 
      id: '1', 
      title: 'Preciso de um profissional para gerenciar minhas redes sociais', 
      author: 'Carlos Oliveira',
      authorImage: 'https://placehold.co/400x400/4C51BF/FFFFFF?text=CO',
      category: 'marketing',
      budget: 'R$ 1.500,00',
      date: '2 dias atrás',
      priority: 'Alta',
      description: 'Preciso de um profissional para gerenciar minhas redes sociais Instagram e Facebook, com foco em crescimento orgânico e engajamento.'
    },
    { 
      id: '2', 
      title: 'Busco um desenvolvedor para criar um site institucional', 
      author: 'Mariana Costa',
      authorImage: 'https://placehold.co/400x400/EC4899/FFFFFF?text=MC',
      category: 'desenvolvimento',
      budget: 'R$ 3.000,00',
      date: '3 dias atrás',
      priority: 'Normal',
      description: 'Estou procurando um desenvolvedor para criar um site institucional responsivo e moderno para minha empresa de consultoria.'
    },
    { 
      id: '3', 
      title: 'Preciso de um copywriter para email marketing', 
      author: 'André Santos',
      authorImage: 'https://placehold.co/400x400/8B5CF6/FFFFFF?text=AS',
      category: 'copywriting',
      budget: 'R$ 800,00',
      date: '4 dias atrás',
      priority: 'Normal',
      description: 'Busco um copywriter experiente para criar uma sequência de 5 emails para uma campanha de lançamento de curso.'
    },
    { 
      id: '4', 
      title: 'Preciso de um especialista em Google Ads', 
      author: 'Fernanda Lima',
      authorImage: 'https://placehold.co/400x400/F97316/FFFFFF?text=FL',
      category: 'trafego',
      budget: 'R$ 2.000,00',
      date: '5 dias atrás',
      priority: 'Alta',
      description: 'Preciso de um especialista em Google Ads para otimizar minhas campanhas de e-commerce e aumentar o ROAS.'
    },
    { 
      id: '5', 
      title: 'Busco editor de vídeo para conteúdos de YouTube', 
      author: 'Rafael Mendonça',
      authorImage: 'https://placehold.co/400x400/0EA5E9/FFFFFF?text=RM',
      category: 'video',
      budget: 'R$ 1.200,00 por vídeo',
      date: '6 dias atrás',
      priority: 'Normal',
      description: 'Procuro um editor de vídeo para editar 4 vídeos por mês para meu canal do YouTube sobre marketing digital.'
    }
  ];
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Carregando solicitações de serviços...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Solicitações de Serviços</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Veja quem está precisando de serviços de marketing digital e conecte-se para oferecer suas soluções.
        </p>
      </motion.div>
      
      {/* Aviso Importante */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8"
      >
        <h3 className="font-medium text-amber-800 mb-1">Aviso Importante:</h3>
        <p className="text-amber-700 text-sm">
          A DigitFy atua exclusivamente como uma plataforma de divulgação e conexão entre profissionais e usuários. 
          Não nos responsabilizamos por quaisquer acordos, transações ou interações que ocorram após a conexão. 
          Recomendamos que todas as partes envolvidas realizem verificações e acordos prévios de forma independente.
        </p>
      </motion.div>
      
      {/* Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar solicitações..."
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
          
          <div className="relative">
            <button className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 hover:bg-gray-50">
              <Calendar size={18} className="text-gray-500" />
              <span>Data</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Categorias */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'all' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button 
          onClick={() => setFilter('marketing')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'marketing' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Marketing
        </button>
        <button 
          onClick={() => setFilter('desenvolvimento')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'desenvolvimento' 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Desenvolvimento
        </button>
        <button 
          onClick={() => setFilter('copywriting')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'copywriting' 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Copywriting
        </button>
        <button 
          onClick={() => setFilter('trafego')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'trafego' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tráfego Pago
        </button>
        <button 
          onClick={() => setFilter('video')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filter === 'video' 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Vídeo
        </button>
      </div>
      
      {/* Lista de solicitações */}
      <div className="space-y-4">
        {serviceRequests
          .filter(request => filter === 'all' || request.category === filter)
          .map((request, index) => (
            <motion.div 
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <img 
                    src={request.authorImage} 
                    alt={request.author} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{request.title}</h3>
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                        <Tag size={14} className="mr-1 text-gray-500" />
                        <span className="capitalize">{request.category}</span>
                      </div>
                      <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md flex items-center">
                        <span>{request.budget}</span>
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                        <Clock size={14} className="mr-1 text-gray-500" />
                        <span>{request.date}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-md flex items-center ${
                        request.priority === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <span>Prioridade: {request.priority}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 transition-colors text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                    <MessageCircle size={16} />
                    Entrar em contato
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default ServiceRequests; 