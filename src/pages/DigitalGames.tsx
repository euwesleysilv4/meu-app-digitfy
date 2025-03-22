import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad, Target, TrendingUp, BookOpen, Users } from 'lucide-react';

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

const gameCategories = [
  {
    id: 1,
    title: 'Quiz de Marketing Digital',
    description: 'Teste seus conhecimentos em estratégias de marketing online',
    icon: Target,
    color: 'emerald',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 2,
    title: 'Desafio de Tendências',
    description: 'Descubra quanto você sabe sobre as últimas tendências de marketing',
    icon: TrendingUp,
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 3,
    title: 'Fundamentos do Marketing',
    description: 'Prove seu domínio sobre os conceitos básicos de marketing digital',
    icon: BookOpen,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 4,
    title: 'Estratégias de Afiliados',
    description: 'Teste seu conhecimento em marketing de afiliação',
    icon: Users,
    color: 'orange',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  }
];

const DigitalGames = () => {
  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center mb-8"
        >
          <Gamepad className="text-emerald-500 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-emerald-800">Jogos do Digital</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {gameCategories.map((game, index) => {
            const IconComponent = game.icon;
            return (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3 + (index * 0.1) 
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-48 w-full"
                >
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="
                        w-full 
                        bg-emerald-500 
                        text-white 
                        py-3 
                        rounded-xl 
                        font-bold 
                        hover:bg-emerald-600 
                        transition-colors 
                        shadow-md 
                        hover:shadow-lg
                      "
                    >
                      Iniciar Quiz
                    </motion.button>
                  </div>
                </motion.div>
                
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <motion.div 
                      whileHover={{ rotate: 15 }}
                      className={`
                        w-10 h-10 
                        rounded-full 
                        bg-${game.color}-50 
                        flex items-center justify-center 
                        mr-3
                      `}
                    >
                      <IconComponent 
                        className={`text-${game.color}-500`} 
                        size={20} 
                      />
                    </motion.div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {game.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    {game.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DigitalGames; 