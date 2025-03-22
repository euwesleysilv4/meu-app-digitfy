import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Star, MessageSquare, Clock, CheckCircle, 
  Palette, Edit3, BarChart2, Camera, Globe, Mail, Search
} from 'lucide-react';

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = [
    { name: 'Todos', icon: Briefcase },
    { name: 'Design', icon: Palette },
    { name: 'Copywriting', icon: Edit3 },
    { name: 'Marketing', icon: BarChart2 },
    { name: 'Foto/Vídeo', icon: Camera },
    { name: 'Web/Dev', icon: Globe },
    { name: 'Email Marketing', icon: Mail }
  ];

  const professionals = [
    {
      id: 1,
      name: 'Ana Silva',
      role: 'Social Media Designer',
      category: 'Design',
      rating: 4.9,
      reviews: 127,
      completedProjects: 89,
      hourlyRate: 120,
      avatar: 'https://i.pravatar.cc/150?img=1',
      skills: ['Photoshop', 'Illustrator', 'Canva Pro'],
      description: 'Especialista em design para redes sociais com mais de 5 anos de experiência.',
      availability: 'Disponível em 2 dias',
      verified: true
    },
    {
      id: 2,
      name: 'Pedro Santos',
      role: 'Copywriter',
      category: 'Copywriting',
      rating: 4.8,
      reviews: 94,
      completedProjects: 156,
      hourlyRate: 150,
      avatar: 'https://i.pravatar.cc/150?img=2',
      skills: ['Copywriting', 'Storytelling', 'Email Marketing'],
      description: 'Copywriter especializado em textos persuasivos e email marketing.',
      availability: 'Disponível agora',
      verified: true
    },
    {
      id: 3,
      name: 'Mariana Costa',
      role: 'Marketing Estrategista',
      category: 'Marketing',
      rating: 5.0,
      reviews: 73,
      completedProjects: 42,
      hourlyRate: 200,
      avatar: 'https://i.pravatar.cc/150?img=3',
      skills: ['Google Ads', 'Facebook Ads', 'Analytics'],
      description: 'Estrategista de marketing digital focada em resultados mensuráveis.',
      availability: 'Disponível em 3 dias',
      verified: true
    },
    // Adicione mais profissionais conforme necessário
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex flex-col space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">Encontre Profissionais</h1>
        <p className="text-gray-600 max-w-3xl">
          Conecte-se com os melhores profissionais de marketing digital. 
          Encontre especialistas qualificados para impulsionar seu negócio.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <input
          type="text"
          placeholder="Busque por habilidade, serviço ou profissional..."
          className="w-full px-6 py-4 rounded-xl border bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-14"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
      </motion.div>

      {/* Categories */}
      <motion.div 
        className="flex flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              selectedCategory === category.name
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
          >
            <category.icon size={20} />
            <span>{category.name}</span>
          </button>
        ))}
      </motion.div>

      {/* Professionals Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {professionals.map((professional) => (
          <motion.div
            key={professional.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all"
            whileHover={{ y: -4 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={professional.avatar} 
                      alt={professional.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {professional.verified && (
                      <CheckCircle className="absolute -bottom-1 -right-1 text-emerald-500 bg-white rounded-full" size={16} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                    <p className="text-emerald-600">{professional.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="font-semibold">{professional.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{professional.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {professional.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} />
                  <span>{professional.reviews} avaliações</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{professional.availability}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  R${professional.hourlyRate}/h
                </span>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Contratar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">É um profissional?</h2>
            <p className="text-emerald-100">
              Cadastre-se e comece a oferecer seus serviços para milhares de clientes.
            </p>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
            Começar a Vender
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Services; 