import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Users 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface TelegramChannel {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  link: string;
  image?: string;
  category?: string;
}

// Canais estáticos como fallback
const fallbackChannels: TelegramChannel[] = [
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

// Imagens por categoria
const categoryImages: Record<string, string> = {
  "Marketing": "https://images.unsplash.com/photo-1552664730-3cecb9c8525f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  "Vendas": "https://images.unsplash.com/photo-1661956602944-249bcd04b63f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  "Empreendedorismo": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  "Tecnologia": "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80",
  "Educação": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80",
  "default": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80"
};

const TelegramChannels: React.FC = () => {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        
        // Buscar canais de Telegram aprovados
        const { data, error } = await supabase
          .from('submitted_communities')
          .select('*')
          .eq('type', 'telegram')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Mapear os dados para o formato Channel
          const mappedChannels = data.map((channel: any) => ({
            id: channel.id,
            name: channel.community_name,
            description: channel.description,
            link: channel.link,
            membersCount: channel.members_count,
            category: channel.category,
            // Usar a imagem enviada pelo usuário quando disponível, ou usar a imagem padrão da categoria
            image: channel.image_url || (categoryImages[channel.category] || categoryImages.default)
          }));
          
          setChannels(mappedChannels);
        } else {
          // Usar canais de fallback se não houver dados
          setChannels(fallbackChannels);
        }
      } catch (error) {
        console.error("Erro ao buscar canais do Telegram:", error);
        setError("Não foi possível carregar os canais. Tente novamente mais tarde.");
        // Usar canais de fallback em caso de erro
        setChannels(fallbackChannels);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChannels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
      <div className="container mx-auto">
        {/* Cabeçalho com animação */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center">
            <Send className="mr-4 text-emerald-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              Canais de Telegram
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Participe de grupos de discussão e networking
          </p>
        </motion.div>

        {/* Estado de Carregamento */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Lista de Canais com animações */}
        {!loading && !error && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-6"
          >
            {channels.map((channel) => (
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Imagem+Indisponível";
                    }}
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

                  {/* Categoria (se disponível) */}
                  {channel.category && (
                    <div className="mb-4">
                      <span className="inline-block bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full">
                        {channel.category}
                      </span>
                    </div>
                  )}

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
                    Entrar no Canal
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mensagem quando não há canais */}
        {!loading && !error && channels.length === 0 && (
          <div className="text-center py-20">
            <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum canal disponível</h3>
            <p className="text-gray-500">
              No momento não há canais do Telegram disponíveis. Volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelegramChannels; 