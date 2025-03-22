import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Megaphone, Handshake, Search, CheckCircle, Star, MessageSquare, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Services = () => {
  const [selectedTab, setSelectedTab] = useState<'divulgar' | 'solicitar'>('divulgar');

  const services = [
    {
      id: 1,
      type: 'divulgar',
      title: 'Design Gráfico para Redes Sociais',
      description: 'Criação de artes profissionais para Instagram, Facebook e outras plataformas.',
      price: 120,
      rating: 4.9,
      reviews: 127,
      completedProjects: 89,
      user: {
        name: 'Ana Silva',
        avatar: 'https://i.pravatar.cc/150?img=1',
        verified: true
      }
    },
    {
      id: 2,
      type: 'solicitar',
      title: 'Preciso de um Copywriter para E-mail Marketing',
      description: 'Busco um profissional para criar campanhas de e-mail marketing para minha loja online.',
      budget: 500,
      user: {
        name: 'Pedro Santos',
        avatar: 'https://i.pravatar.cc/150?img=2',
        verified: true
      }
    },
    {
      id: 3,
      type: 'divulgar',
      title: 'Gestão de Tráfego Pago',
      description: 'Gerenciamento de campanhas no Google Ads e Facebook Ads para maximizar ROI.',
      price: 200,
      rating: 5.0,
      reviews: 73,
      completedProjects: 42,
      user: {
        name: 'Mariana Costa',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: true
      }
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">Serviços de Marketing Digital</h1>
        <p className="text-gray-600 max-w-3xl">
          Encontre profissionais para divulgar seus serviços ou solicite serviços específicos para seu negócio.
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        className="flex space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={() => setSelectedTab('divulgar')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            selectedTab === 'divulgar'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
        >
          <Megaphone size={20} />
          <span>Divulgar Serviços</span>
        </button>
        <button
          onClick={() => setSelectedTab('solicitar')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            selectedTab === 'solicitar'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
        >
          <Handshake size={20} />
          <span>Solicitar Serviços</span>
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          placeholder="Busque por serviço, profissional ou habilidade..."
          className="w-full px-6 py-4 rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-14"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
      </motion.div>

      {/* Services Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {services
          .filter(service => service.type === selectedTab)
          .map((service) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all"
              whileHover={{ y: -4 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={service.user.avatar} 
                        alt={service.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {service.user.verified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 text-emerald-500 bg-white rounded-full" size={16} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.user.name}</h3>
                      <p className="text-emerald-600">{service.title}</p>
                    </div>
                  </div>
                  {service.type === 'divulgar' && (
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 fill-current" size={16} />
                      <span className="font-semibold">{service.rating}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4">{service.description}</p>

                {service.type === 'divulgar' && (
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <MessageSquare size={16} />
                      <span>{service.reviews} avaliações</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{service.completedProjects} projetos concluídos</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {service.type === 'divulgar' ? `R$${service.price}/h` : `Orçamento: R$${service.budget}`}
                  </span>
                  <NavLink
                    to={service.type === 'divulgar' ? '/members/promote-service' : '/members/request-service'}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {service.type === 'divulgar' ? 'Contratar' : 'Oferecer Serviço'}
                  </NavLink>
                </div>
              </div>
            </motion.div>
          ))}
      </motion.div>
    </div>
  );
};

export default Services; 