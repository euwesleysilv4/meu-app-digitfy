import { motion } from "framer-motion";
import { Download, FileText, Plus, Instagram, Map, ExternalLink } from "lucide-react";
import { useState } from "react";

interface MindMap {
  id: number;
  title: string;
  description: string;
  image: string;
  fileUrl: string;
  instagram?: string;
}

const mindMaps: MindMap[] = [
  {
    id: 1,
    title: "Mapa Mental de Marketing Digital",
    description: "Estratégias essenciais para o sucesso no marketing digital.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    fileUrl: "#",
    instagram: "@marketingexpert"
  },
  {
    id: 2,
    title: "Mapa Mental de Produtividade",
    description: "Técnicas para aumentar a produtividade no dia a dia.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    fileUrl: "#"
  },
  // Adicione mais mapas mentais aqui...
];

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

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar a sugestão
    console.log("Link enviado:", mindMapLink);
    console.log("Instagram:", instagram);
    setShowSuggestionModal(false);
    setMindMapLink("");
    setInstagram("");
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

      {/* Vitrine de Mapas Mentais */}
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
                src={mindMap.image} 
                alt={mindMap.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                }}
              />
            </div>

            {/* Informações */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Título e Descrição */}
              <div className="flex-1 mb-2">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                  {mindMap.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {mindMap.description}
                </p>
              </div>

              {/* Enviado por */}
              {mindMap.instagram && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-3 p-2 bg-emerald-50 rounded-lg">
                  <span>Enviado por</span>
                  <Instagram className="w-4 h-4" />
                  <a 
                    href={`https://instagram.com/${mindMap.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-700 transition-colors duration-300"
                  >
                    {mindMap.instagram}
                  </a>
                </div>
              )}

              {/* Botão Acessar Agora */}
              <a
                href={mindMap.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Acessar Agora</span>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MindMaps; 