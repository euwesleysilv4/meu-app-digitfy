import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight, Bell, ThumbsUp, MessageSquare } from 'lucide-react';

const News = () => {
  const updates = [
    {
      id: 1,
      type: 'Atualização',
      title: 'Novas Ferramentas de Analytics',
      description: 'Adicionamos dashboards personalizáveis e métricas avançadas para melhor análise de performance.',
      date: '15 Mar 2024',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Ferramentas',
      importance: 'Alta'
    },
    {
      id: 2,
      type: 'Lançamento',
      title: 'Nova Área de Networking',
      description: 'Agora você pode se conectar diretamente com outros profissionais da plataforma.',
      date: '12 Mar 2024',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Comunidade',
      importance: 'Média'
    },
    {
      id: 3,
      type: 'Melhoria',
      title: 'Interface Atualizada',
      description: 'Redesenhamos a experiência do usuário para tornar a navegação mais intuitiva.',
      date: '10 Mar 2024',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Plataforma',
      importance: 'Média'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles className="text-emerald-600" size={32} />
        <h1 className="text-4xl font-bold text-gray-900">Novidades</h1>
      </motion.div>

      {/* Descrição */}
      <motion.div 
        className="bg-emerald-50/50 rounded-xl p-6 shadow-sm border border-emerald-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">
            Fique por Dentro das Atualizações
          </h2>
          <p className="text-emerald-600">
            Acompanhe as últimas atualizações, melhorias e novos recursos da plataforma. 
            Mantemos você informado sobre tudo que está acontecendo para melhorar sua experiência.
          </p>
        </div>
      </motion.div>

      {/* Grid de Novidades */}
      <motion.div 
        className="grid gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {updates.map((update) => (
          <motion.div
            key={update.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all"
            whileHover={{ y: -2 }}
          >
            <div className="md:flex">
              <div className="md:w-1/3">
                <img 
                  src={update.image} 
                  alt={update.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    update.importance === 'Alta' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {update.type}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {update.date}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {update.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {update.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {update.category}
                  </span>
                  
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors">
                      <ThumbsUp size={18} />
                      <span className="text-sm">Útil</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-emerald-600 transition-colors">
                      <MessageSquare size={18} />
                      <span className="text-sm">Feedback</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bell className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Ative as Notificações</h3>
              <p className="text-emerald-100">Receba alertas sobre novas atualizações</p>
            </div>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-emerald-600 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center space-x-2">
            <span>Ativar Agora</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default News;
