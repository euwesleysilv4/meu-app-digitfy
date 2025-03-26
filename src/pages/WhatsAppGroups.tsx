import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Group {
  id: string;
  name: string;
  description: string;
  link: string;
  image?: string;
  members: number;
  category?: string;
}

// Grupos estáticos como fallback
const fallbackGroups: Group[] = [
  {
    id: "1",
    name: "Marketing Digital",
    description: "Grupo para discussões sobre estratégias de marketing digital.",
    link: "https://chat.whatsapp.com/example1",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 120
  },
  {
    id: "2",
    name: "Vendas e Negócios",
    description: "Compartilhamento de dicas e oportunidades de negócios.",
    link: "https://chat.whatsapp.com/example2",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 95
  },
  {
    id: "3",
    name: "Empreendedorismo",
    description: "Discussões sobre empreendedorismo e gestão de negócios.",
    link: "https://chat.whatsapp.com/example3",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 150
  }
];

// Imagens por categoria
const categoryImages: Record<string, string> = {
  "Marketing": "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
  "Vendas": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
  "Empreendedorismo": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
  "Tecnologia": "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
  "Educação": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
  "default": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80"
};

const WhatsAppGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        
        // Buscar grupos de WhatsApp aprovados
        const { data, error } = await supabase
          .from('submitted_communities')
          .select('*')
          .eq('type', 'whatsapp')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          // Mapear os dados para o formato Group
          const mappedGroups = data.map((group: any) => ({
            id: group.id,
            name: group.community_name,
            description: group.description,
            link: group.link,
            members: group.members_count,
            category: group.category,
            // Usar a imagem enviada pelo usuário quando disponível, ou usar a imagem padrão da categoria
            image: group.image_url || (categoryImages[group.category] || categoryImages.default)
          }));
          
          setGroups(mappedGroups);
        } else {
          // Usar grupos de fallback se não houver dados
          setGroups(fallbackGroups);
        }
      } catch (error) {
        console.error("Erro ao buscar grupos de WhatsApp:", error);
        setError("Não foi possível carregar os grupos. Tente novamente mais tarde.");
        // Usar grupos de fallback em caso de erro
        setGroups(fallbackGroups);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
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
          <MessageSquare className="w-10 h-10 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Grupos de WhatsApp
            </h1>
            <p className="text-gray-600 mt-1">
              Participe de grupos de discussão e networking
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

      {/* Lista de Grupos */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 p-6"
            >
              {/* Foto do Grupo */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100">
                  <img 
                    src={group.image} 
                    alt={group.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/128?text=Imagem+Indisponível";
                    }}
                  />
                </div>
              </div>

              {/* Informações do Grupo */}
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {group.name}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {group.description}
                </p>

                {/* Quantidade de Membros */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{group.members} membros</span>
                </div>

                {/* Categoria (se disponível) */}
                {group.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded-full">
                      {group.category}
                    </span>
                  </div>
                )}

                {/* Botão Entrar no Grupo */}
                <a
                  href={group.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
                >
                  <span>Entrar no Grupo</span>
                  <img 
                    src="https://www.google.com/s2/favicons?domain=whatsapp.com&sz=32" 
                    alt="WhatsApp Icon" 
                    className="w-4 h-4 filter brightness-0 invert"
                  />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mensagem quando não há grupos */}
      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum grupo disponível</h3>
          <p className="text-gray-500">
            No momento não há grupos de WhatsApp disponíveis. Volte mais tarde.
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatsAppGroups; 