import React from 'react';
import { motion } from 'framer-motion';
import { Package, Download } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  out: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.5,
      ease: "easeIn"
    }
  }
};

const freePacks = [
  {
    id: 1,
    title: 'Templates Instagram',
    description: 'Modelos prontos para marketing digital',
    downloads: '5.2K',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 2,
    title: 'Kit Storytelling',
    description: 'Histórias que convertem',
    downloads: '3.7K',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 3,
    title: 'Planilhas Gestão',
    description: 'Organize sua estratégia de conteúdo',
    downloads: '4.5K',
    image: 'https://images.unsplash.com/photo-1600880292089-90a7ff7c1074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 4,
    title: 'Guia Copywriting',
    description: 'Aprenda a escrever textos que convertem',
    downloads: '2.9K',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 5,
    title: 'Calendário Conteúdo',
    description: 'Planejamento estratégico de marketing',
    downloads: '3.3K',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 6,
    title: 'Análise de Métricas',
    description: 'Entenda e otimize seus resultados digitais',
    downloads: '2.6K',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 7,
    title: 'Guia Afiliados',
    description: 'Estratégias avançadas de marketing de afiliação',
    downloads: '4.1K',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 8,
    title: 'Kit Social Media',
    description: 'Ferramentas completas de gestão de redes sociais',
    downloads: '3.8K',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 9,
    title: 'Checklist Marketing',
    description: 'Otimize seus processos de marketing digital',
    downloads: '2.7K',
    image: 'https://images.unsplash.com/photo-1600880292089-90a7ff7c1074?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 10,
    title: 'Guia Email Marketing',
    description: 'Estratégias avançadas de conversão por e-mail',
    downloads: '3.5K',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  }
];

const FreePacks = () => {
  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center mb-8"
        >
          <Package className="text-emerald-500 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-emerald-800">Packs Gratuitos</h1>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {freePacks.map((pack, index) => (
            <motion.div 
              key={pack.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.3 + (index * 0.1) 
              }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-56 w-full">
                <img 
                  src={pack.image} 
                  alt={pack.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-30"></div>
              </div>
              
              <div className="p-5">
                <h2 className="text-base font-bold text-gray-800 mb-2 h-12">
                  {pack.title}
                </h2>
                <p className="text-sm text-gray-600 mb-3 h-16">
                  {pack.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-emerald-600">
                    <Download size={16} className="mr-2" />
                    <span>{pack.downloads} Downloads</span>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      bg-emerald-500 
                      text-white 
                      px-4 py-2 
                      rounded-full 
                      text-sm 
                      hover:bg-emerald-600 
                      transition-colors
                    "
                  >
                    Baixar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FreePacks; 