import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, TrendingUp } from 'lucide-react';

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

const tiktokItems = [
  {
    id: 1,
    rank: 1,
    change: 'up',
    title: 'Show Me Love',
    artist: 'WizTheMc & bees & honey',
    icon: 'https://i.pravatar.cc/150?u=1',
    uses: '1.2M'
  },
  {
    id: 2,
    rank: 2,
    change: 'up',
    title: 'Lets Go Gaming',
    artist: 'soflans',
    icon: 'https://i.pravatar.cc/150?u=2',
    uses: '950K'
  },
  // Mais itens do TikTok
];

const instagramItems = [
  {
    id: 1,
    rank: 1,
    change: 'up',
    title: 'Instagram Melody',
    artist: 'IG Sounds',
    icon: 'https://i.pravatar.cc/150?u=8',
    uses: '800K'
  },
  {
    id: 2,
    rank: 2,
    change: 'up',
    title: 'Insta Beats',
    artist: 'Social Rhythm',
    icon: 'https://i.pravatar.cc/150?u=9',
    uses: '650K'
  },
  // Mais itens do Instagram
];

const TrendRush = () => {
  const [activePlatform, setActivePlatform] = useState('tiktok');

  const currentItems = activePlatform === 'tiktok' ? tiktokItems : instagramItems;

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-emerald-50 p-4 md:p-6 rounded-t-xl border-b border-emerald-100"
        >
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-emerald-800 font-bold text-lg md:text-xl mb-2">
                Descubra Novos Áudios com Trend Rush
              </h2>
              <p className="text-emerald-700 text-sm md:text-base">
                Na Digital FY, entendemos a importância dos áudios na viralização do seu conteúdo. Por isso, nossa equipe seleciona diariamente áudios com potencial viral. Oferecemos alguns gratuitamente e você pode acessar uma biblioteca completa em nossos planos premium.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3 w-full md:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                  bg-gradient-to-r from-emerald-500 to-teal-500 
                  text-white 
                  px-6 py-3 
                  rounded-xl 
                  text-sm 
                  font-bold 
                  uppercase 
                  tracking-wider
                  transform 
                  hover:scale-105 
                  transition-all 
                  duration-300 
                  shadow-lg 
                  hover:shadow-xl 
                  w-full 
                  md:w-auto
                  flex 
                  items-center 
                  justify-center 
                  space-x-2
                "
              >
                <span>Acessar Lista Completa</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 10l5 5 5-5"/>
                </svg>
              </motion.button>
              <p className="text-xs text-emerald-600 text-center">
                Acesse a lista completa de áudios exclusivos
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-between items-center p-6 border-b"
        >
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-emerald-500">
              <Music className="text-emerald-500" />
              Trend Rush
            </h1>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setActivePlatform('tiktok')}
                className={`
                  px-4 py-1 rounded-full text-sm font-medium transition-all duration-300
                  ${activePlatform === 'tiktok' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                TikTok
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setActivePlatform('instagram')}
                className={`
                  px-4 py-1 rounded-full text-sm font-medium transition-all duration-300
                  ${activePlatform === 'instagram' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                Instagram
              </motion.button>
            </div>

            <div className="ml-4 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
              Áudios atualizados em 15/03/2024 às 00:38
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="divide-y"
        >
          {currentItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.7 + (index * 0.1) 
              }}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="font-bold text-lg text-gray-500 w-8 text-right">
                  {item.rank}
                </span>
                {item.change === 'up' && <TrendingUp size={16} className="text-green-500" />}
                
                <img 
                  src={item.icon} 
                  alt={item.title} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.artist}</p>
                  <div className="text-xs text-emerald-600 mt-1">
                    <span>Usos: {item.uses}</span>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1.5 rounded-full transition-colors duration-300"
              >
                Usar Áudio
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrendRush; 