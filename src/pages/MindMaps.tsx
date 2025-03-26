import { motion } from "framer-motion";
import { Download, FileText, Plus, Instagram, Map, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface MindMap {
  id: string;
  title: string;
  description: string;
  image_url: string;
  file_url: string;
  status: string;
  instagram?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
}

const mindMapTools = [
  {
    name: "Miro",
    url: "https://miro.com",
    description: "Plataforma colaborativa para criação de mapas mentais",
    logo: "https://www.google.com/s2/favicons?domain=miro.com&sz=64"
  },
  {
    name: "MindMeister",
    url: "https://www.mindmeister.com",
    description: "Crie e compartilhe mapas mentais online",
    logo: "https://www.google.com/s2/favicons?domain=mindmeister.com&sz=64"
  },
  {
    name: "Boardmix",
    url: "https://boardmix.com",
    description: "Ferramenta intuitiva para mapeamento de ideias",
    logo: "https://www.google.com/s2/favicons?domain=boardmix.com&sz=64"
  }
];

const MindMaps = () => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [mindMapLink, setMindMapLink] = useState("");
  const [instagram, setInstagram] = useState("");
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchMindMaps = async () => {
      setIsLoading(true);
      setErrorMessage("");
      
      try {
        // Incrementar a contagem de visualizações
        const { data, error } = await supabase
          .from('mind_maps')
          .select('*')
          .eq('status', 'published')
          .order('updated_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setMindMaps(data || []);
      } catch (err) {
        console.error('Erro ao carregar mapas mentais:', err);
        setErrorMessage("Não foi possível carregar os mapas mentais. Tente novamente mais tarde.");
        
        // Dados de exemplo em caso de falha no carregamento
        setMindMaps([
          {
            id: '1',
            title: 'Mapa Mental de Marketing Digital',
            description: 'Estratégias essenciais para o sucesso no marketing digital.',
            image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
            file_url: 'https://miro.com/app/board/o9J_lq9W1_s=/',
            status: 'published',
            instagram: '@marketingexpert',
            created_at: '2023-03-10T14:30:00',
            updated_at: '2023-03-15T10:45:00',
            view_count: 120,
            like_count: 45
          },
          {
            id: '2',
            title: 'Mapa Mental de Produtividade',
            description: 'Técnicas para aumentar a produtividade no dia a dia.',
            image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80',
            file_url: 'https://miro.com/app/board/uXjVMR2W65s=/',
            status: 'published',
            created_at: '2023-03-05T09:15:00',
            updated_at: '2023-03-20T16:20:00',
            view_count: 85,
            like_count: 32
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMindMaps();
  }, []);

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mindMapLink) {
      alert("Por favor, insira o link do mapa mental.");
      return;
    }
    
    try {
      // Obter informações do usuário atual (se estiver logado)
      const { data: { session } } = await supabase.auth.getSession();
      
      const suggestion = {
        file_url: mindMapLink,
        instagram: instagram || null,
        status: 'draft', // Sugestões começam como rascunho para aprovação de admin
        title: 'Sugestão de Mapa Mental', // Título temporário
        description: 'Mapa mental enviado por usuário', // Descrição temporária
        created_at: new Date().toISOString(),
        created_by: session?.user?.id || null
      };
      
      const { error } = await supabase
        .from('mind_maps')
        .insert([suggestion]);
        
      if (error) throw error;
      
      alert("Seu mapa mental foi enviado com sucesso e será analisado pela nossa equipe. Obrigado pela contribuição!");
      setShowSuggestionModal(false);
      setMindMapLink("");
      setInstagram("");
    } catch (err) {
      console.error('Erro ao enviar sugestão:', err);
      alert("Não foi possível enviar sua sugestão. Por favor, tente novamente mais tarde.");
    }
  };
  
  const incrementViewCount = async (id: string) => {
    try {
      // Primeiro, obtenha o valor atual de view_count
      const { data, error } = await supabase
        .from('mind_maps')
        .select('view_count')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      const newViewCount = (data?.view_count || 0) + 1;
      
      // Atualize o view_count
      const { error: updateError } = await supabase
        .from('mind_maps')
        .update({ view_count: newViewCount })
        .eq('id', id);
        
      if (updateError) throw updateError;
    } catch (err) {
      console.error('Erro ao incrementar visualizações:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <Map className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Mapas Mentais
              </h1>
              <p className="text-gray-600 mt-1">
                Explore mapas mentais para organizar e expandir seus conhecimentos
              </p>
            </div>
          </motion.div>

          {/* Coluna Direita */}
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-4"
          >
            <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-emerald-600">Compartilhe conhecimento!</span> Envie o link do mapa mental com permissão de visualização. 
                    Após aprovação, seu mapa será disponibilizado aqui.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enviar Mapa Mental</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Ferramentas para Criação de Mapas Mentais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {mindMapTools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={tool.logo} 
                  alt={`Logo ${tool.name}`}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.src = "https://www.google.com/s2/favicons?domain=google.com&sz=64";
                  }}
                />
                <h3 className="text-lg font-semibold text-emerald-600">{tool.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 transition-colors duration-300"
              >
                <span>Acessar Plataforma</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Sugestão */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Enviar Mapa Mental</h2>
            <form onSubmit={handleSubmitSuggestion}>
              <div className="mb-4">
                <label htmlFor="mindMapLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Mapa Mental
                </label>
                <input
                  type="url"
                  id="mindMapLink"
                  value={mindMapLink}
                  onChange={(e) => setMindMapLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Seu Instagram (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Instagram className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="@seuinstagram"
                  />
                </div>
                <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  Seu @ será exibido apenas como forma de reconhecimento pela contribuição.
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSuggestionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-300"
                >
                  Enviar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}
      
      {/* Mensagem de erro */}
      {errorMessage && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      {/* Vitrine de Mapas Mentais */}
      {!isLoading && mindMaps.length === 0 && !errorMessage && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum mapa mental disponível ainda</h3>
          <p className="text-gray-500 mb-6">Seja o primeiro a contribuir compartilhando um mapa mental útil!</p>
          <button
            onClick={() => setShowSuggestionModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Enviar Mapa Mental
          </button>
        </div>
      )}

      {!isLoading && mindMaps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mindMaps.map((mindMap, index) => (
            <motion.div
              key={mindMap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Imagem */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={mindMap.image_url} 
                  alt={mindMap.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=Mapa+Mental";
                  }}
                />
              </div>

              {/* Informações */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Título e Descrição */}
                <div className="flex-1 mb-2">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{mindMap.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{mindMap.description}</p>
                </div>

                {/* Instagram e Download */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    {mindMap.instagram ? (
                      <a 
                        href={`https://instagram.com/${mindMap.instagram.replace('@', '')}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-500"
                      >
                        <Instagram className="w-3 h-3" />
                        <span>{mindMap.instagram}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Equipe DigitalFy</span>
                    )}
                    
                    <a
                      href={mindMap.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => incrementViewCount(mindMap.id)}
                      className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <span>Acessar</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MindMaps; 