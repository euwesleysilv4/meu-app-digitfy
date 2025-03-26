import { motion } from "framer-motion";
import { Disc, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Server {
  id: string;
  name: string;
  description: string;
  link: string;
  image?: string;
  members: number;
  category?: string;
}

// Servidores estáticos como fallback
const fallbackServers: Server[] = [
  {
    id: "1",
    name: "Marketing Digital",
    description: "Servidor para discussões sobre estratégias de marketing digital.",
    link: "https://discord.gg/example1",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 120
  },
  {
    id: "2",
    name: "Vendas e Negócios",
    description: "Compartilhamento de dicas e oportunidades de negócios.",
    link: "https://discord.gg/example2",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 95
  },
  {
    id: "3",
    name: "Empreendedorismo",
    description: "Discussões sobre empreendedorismo e gestão de negócios.",
    link: "https://discord.gg/example3",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 150
  }
];

// Imagens por categoria
const categoryImages: Record<string, string> = {
  "Marketing": "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
  "Vendas": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
  "Empreendedorismo": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
  "Tecnologia": "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
  "Educação": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
  "default": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80"
};

const DiscordServers = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        
        // Buscar servidores de Discord aprovados
        const { data, error } = await supabase
          .from('submitted_communities')
          .select('*')
          .eq('type', 'discord')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Mapear os dados para o formato Server
          const mappedServers = data.map((server: any) => ({
            id: server.id,
            name: server.community_name,
            description: server.description,
            link: server.link,
            members: server.members_count,
            category: server.category,
            // Usar a imagem enviada pelo usuário quando disponível, ou usar a imagem padrão da categoria
            image: server.image_url || (categoryImages[server.category] || categoryImages.default)
          }));
          
          setServers(mappedServers);
        } else {
          // Usar servidores de fallback se não houver dados
          setServers(fallbackServers);
        }
      } catch (error) {
        console.error("Erro ao buscar servidores do Discord:", error);
        setError("Não foi possível carregar os servidores. Tente novamente mais tarde.");
        // Usar servidores de fallback em caso de erro
        setServers(fallbackServers);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12"
      >
        <div className="flex items-center gap-4">
          <Disc className="w-10 h-10 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Servidores do Discord
            </h1>
            <p className="text-gray-600 mt-1">
              Participe de servidores de discussão e networking
            </p>
          </div>
        </div>
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

      {/* Lista de Servidores */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              {/* Foto do Servidor */}
              <div className="w-full h-48 relative overflow-hidden">
                <img 
                  src={server.image} 
                  alt={server.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x200?text=Imagem+Indisponível";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-xl font-semibold text-white line-clamp-2">
                    {server.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">{server.members} membros</span>
                  </div>
                </div>
              </div>

              {/* Informações do Servidor */}
              <div className="p-6">
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {server.description}
                </p>
                
                {/* Categoria (se disponível) */}
                {server.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full">
                      {server.category}
                    </span>
                  </div>
                )}
                
                <a
                  href={server.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg"
                >
                  <Disc className="w-5 h-5" />
                  <span>Entrar no Servidor</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mensagem quando não há servidores */}
      {!loading && !error && servers.length === 0 && (
        <div className="text-center py-20">
          <Disc className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum servidor disponível</h3>
          <p className="text-gray-500">
            No momento não há servidores do Discord disponíveis. Volte mais tarde.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscordServers; 