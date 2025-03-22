import { motion } from "framer-motion";
import { Disc, Plus, Users } from "lucide-react";
import { useState } from "react";

interface Server {
  id: number;
  name: string;
  description: string;
  link: string;
  image: string;
  members: number;
}

const servers: Server[] = [
  {
    id: 1,
    name: "Marketing Digital",
    description: "Servidor para discussões sobre estratégias de marketing digital.",
    link: "https://discord.gg/example1",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 120
  },
  {
    id: 2,
    name: "Vendas e Negócios",
    description: "Compartilhamento de dicas e oportunidades de negócios.",
    link: "https://discord.gg/example2",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 95
  },
  {
    id: 3,
    name: "Empreendedorismo",
    description: "Discussões sobre empreendedorismo e gestão de negócios.",
    link: "https://discord.gg/example3",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 150
  }
];

const DiscordServers = () => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverLink, setServerLink] = useState("");

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar a sugestão
    console.log("Servidor sugerido:", { name: serverName, link: serverLink });
    setShowSuggestionModal(false);
    setServerName("");
    setServerLink("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <Disc className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Servidores do Discord
              </h1>
              <p className="text-gray-600 mt-1">
                Participe de servidores de discussão e networking
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
                    <span className="font-medium text-emerald-600">Sugira um servidor!</span> Envie o link do servidor para que possamos adicioná-lo aqui.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sugerir Servidor</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de Sugestão */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Sugerir Servidor</h2>
            <form onSubmit={handleSubmitSuggestion}>
              <div className="mb-4">
                <label htmlFor="serverName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Servidor
                </label>
                <input
                  type="text"
                  id="serverName"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome do Servidor"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="serverLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Servidor
                </label>
                <input
                  type="url"
                  id="serverLink"
                  value={serverLink}
                  onChange={(e) => setServerLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://discord.gg/..."
                  required
                />
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
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-colors duration-300"
                >
                  Enviar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Lista de Servidores */}
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
    </div>
  );
};

export default DiscordServers; 