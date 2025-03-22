import { motion } from "framer-motion";
import { MessageSquare, Plus, ArrowRight, Users } from "lucide-react";
import { useState } from "react";

interface Group {
  id: number;
  name: string;
  description: string;
  link: string;
  image: string;
  members: number;
}

const groups: Group[] = [
  {
    id: 1,
    name: "Marketing Digital",
    description: "Grupo para discussões sobre estratégias de marketing digital.",
    link: "https://chat.whatsapp.com/example1",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 120
  },
  {
    id: 2,
    name: "Vendas e Negócios",
    description: "Compartilhamento de dicas e oportunidades de negócios.",
    link: "https://chat.whatsapp.com/example2",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 95
  },
  {
    id: 3,
    name: "Empreendedorismo",
    description: "Discussões sobre empreendedorismo e gestão de negócios.",
    link: "https://chat.whatsapp.com/example3",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&h=128&q=80",
    members: 150
  }
];

const WhatsAppGroups = () => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupLink, setGroupLink] = useState("");

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar a sugestão
    console.log("Grupo sugerido:", { name: groupName, link: groupLink });
    setShowSuggestionModal(false);
    setGroupName("");
    setGroupLink("");
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
            <MessageSquare className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Grupos de WhatsApp
              </h1>
              <p className="text-gray-600 mt-1">
                Participe de grupos de discussão e networking
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
                    <span className="font-medium text-emerald-600">Sugira um grupo!</span> Envie o link do grupo para que possamos adicioná-lo aqui.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sugerir Grupo</span>
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
            <h2 className="text-xl font-semibold mb-4">Sugerir Grupo</h2>
            <form onSubmit={handleSubmitSuggestion}>
              <div className="mb-4">
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Grupo
                </label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome do Grupo"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="groupLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Grupo
                </label>
                <input
                  type="url"
                  id="groupLink"
                  value={groupLink}
                  onChange={(e) => setGroupLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://chat.whatsapp.com/..."
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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-300"
                >
                  Enviar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Lista de Grupos */}
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
    </div>
  );
};

export default WhatsAppGroups; 