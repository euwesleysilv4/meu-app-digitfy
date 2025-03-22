import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Users 
} from 'lucide-react';

interface TelegramChannel {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  link: string;
  image: string;
}

const telegramChannels: TelegramChannel[] = [
  {
    id: 'marketing-digital',
    name: 'Marketing Digital',
    description: 'Grupo para discussões sobre estratégias de marketing digital.',
    membersCount: 120,
    link: 'https://t.me/estrategiasmarketing',
    image: 'https://images.unsplash.com/photo-1552664730-3cecb9c8525f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'vendas-negocios',
    name: 'Vendas e Negócios',
    description: 'Compartilhamento de dicas e oportunidades de negócios.',
    membersCount: 95,
    link: 'https://t.me/vendasenegocios',
    image: 'https://images.unsplash.com/photo-1661956602944-249bcd04b63f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'empreendedorismo',
    name: 'Empreendedorismo',
    description: 'Discussões sobre empreendedorismo e gestão de negócios.',
    membersCount: 150,
    link: 'https://t.me/empreendedorismo',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  }
];

const TelegramChannels: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
      <div className="container mx-auto">
        {/* Cabeçalho com animação */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <div className="flex items-center">
              <Send className="mr-4 text-emerald-500" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">
                Canais de Telegram
              </h1>
            </div>
            <p className="text-gray-600 mt-2">
              Participe de grupos de discussão e networking
            </p>
          </div>

          {/* Aviso de Sugerir Grupo com animação */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-emerald-50 rounded-lg p-4 flex items-center space-x-4"
          >
            <div className="flex-grow">
              <p className="text-emerald-800 font-semibold text-sm">
                Sugira um grupo! Envie o link do grupo para que possamos adicioná-lo aqui.
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
                bg-emerald-500 
                text-white 
                px-4 py-2 
                rounded-lg 
                flex 
                items-center 
                hover:bg-emerald-600
                transition-colors
                font-semibold
                shadow-md
                hover:shadow-lg
              "
            >
              + Sugerir Grupo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Lista de Canais com animações */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          {telegramChannels.map((channel) => (
            <motion.div 
              key={channel.id}
              variants={itemVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              {/* Imagem do Grupo */}
              <div className="h-48 w-full overflow-hidden">
                <motion.img 
                  src={channel.image} 
                  alt={channel.name} 
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Conteúdo do Grupo */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {channel.name}
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  {channel.description}
                </p>

                {/* Membros */}
                <div className="flex items-center text-gray-600 mb-4">
                  <Users className="mr-2 text-emerald-500" size={20} />
                  <span>{channel.membersCount} membros</span>
                </div>

                {/* Botão de Entrar */}
                <motion.a 
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="
                    w-full 
                    bg-emerald-500 
                    text-white 
                    py-3 
                    rounded-lg 
                    text-center 
                    inline-block
                    hover:bg-emerald-600
                    transition-colors
                    shadow-md
                    hover:shadow-lg
                  "
                >
                  Entrar no Grupo
                </motion.a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TelegramChannels; 