import { motion } from "framer-motion";
import { Download, FileText, Plus, Instagram } from "lucide-react";
import { useState } from "react";

interface Material {
  id: number;
  title: string;
  description: string;
  image: string;
  fileUrl: string;
  fileSize: string;
  instagram?: string;
}

const materials: Material[] = [
  {
    id: 1,
    title: "Guia Completo de Marketing Digital",
    description: "Aprenda tudo sobre marketing digital e como aplicá-lo no seu negócio.",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    fileUrl: "#",
    fileSize: "5 MB",
    instagram: "@marketingexpert"
  },
  {
    id: 2,
    title: "Manual de Copywriting",
    description: "Descubra como escrever textos persuasivos que convertem.",
    image: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80",
    fileUrl: "#",
    fileSize: "3 MB"
  },
  // Adicione mais materiais aqui...
];

const EbooksPdfs = () => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [instagram, setInstagram] = useState("");

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar a sugestão
    console.log("Link enviado:", driveLink);
    console.log("Instagram:", instagram);
    setShowSuggestionModal(false);
    setDriveLink("");
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
            <FileText className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Ebooks e PDFs
              </h1>
              <p className="text-gray-600 mt-1">
                Baixe materiais gratuitos e melhore suas habilidades
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
                    <span className="font-medium text-emerald-600">Compartilhe conhecimento!</span> Envie o link do Google Drive com permissão de visualização. 
                    Após aprovação, seu PDF será disponibilizado aqui.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enviar Sugestão</span>
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
            <h2 className="text-xl font-semibold mb-4">Enviar Sugestão de PDF</h2>
            <form onSubmit={handleSubmitSuggestion}>
              <div className="mb-4">
                <label htmlFor="driveLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Google Drive
                </label>
                <input
                  type="url"
                  id="driveLink"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
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
                {/* Aviso de Reconhecimento */}
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

      {/* Lista de Materiais em Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {materials.map((material, index) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Imagem */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={material.image} 
                alt={material.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                }}
              />
            </div>

            {/* Informações */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Título e Descrição */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {material.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {material.description}
                </p>
              </div>

              {/* Enviado por */}
              {material.instagram && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4">
                  <span>Enviado por</span>
                  <Instagram className="w-4 h-4" />
                  <a 
                    href={`https://instagram.com/${material.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-700 transition-colors duration-300"
                  >
                    {material.instagram}
                  </a>
                </div>
              )}

              {/* Tamanho do Arquivo */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <FileText className="w-4 h-4" />
                <span>{material.fileSize}</span>
              </div>

              {/* Botão de Download */}
              <div className="mt-auto">
                <a
                  href={material.fileUrl}
                  download
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EbooksPdfs; 