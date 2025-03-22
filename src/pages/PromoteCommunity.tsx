import { motion } from "framer-motion";
import { Megaphone, Link2, Users, MessageCircle, X } from "lucide-react";
import { useState } from "react";

const PromoteCommunity = () => {
  const [formData, setFormData] = useState({
    communityName: "",
    description: "",
    link: "",
    category: "",
    membersCount: "",
    contactEmail: "",
    type: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para enviar os dados
    console.log("Dados da comunidade:", formData);
    setIsSubmitted(true);
    setFormData({
      communityName: "",
      description: "",
      link: "",
      category: "",
      membersCount: "",
      contactEmail: "",
      type: ""
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4">
          <Megaphone className="w-10 h-10 text-emerald-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Divulgue sua Comunidade
            </h1>
            <p className="text-gray-600 mt-1">
              Envie os dados da sua comunidade para que possamos divulgá-la na Digitalfy
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulário */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-2xl mx-auto"
      >
        <div className="space-y-4">
          {/* Nome da Comunidade */}
          <div>
            <label htmlFor="communityName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Comunidade
            </label>
            <input
              type="text"
              id="communityName"
              name="communityName"
              value={formData.communityName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder="Ex: Comunidade de Marketing Digital"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              rows={3}
              placeholder="Descreva sua comunidade..."
              required
            />
          </div>

          {/* Tipo de Comunidade */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Comunidade
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="WhatsApp">Grupo de WhatsApp</option>
              <option value="Discord">Servidor do Discord</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Link e Categoria em Linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Link da Comunidade */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                Link de Acesso
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="https://..."
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="Marketing">Marketing</option>
                <option value="Vendas">Vendas</option>
                <option value="Empreendedorismo">Empreendedorismo</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Educação">Educação</option>
              </select>
            </div>
          </div>

          {/* Número de Membros e Email em Linha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Número de Membros */}
            <div>
              <label htmlFor="membersCount" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Membros
              </label>
              <input
                type="number"
                id="membersCount"
                name="membersCount"
                value={formData.membersCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="Ex: 150"
                required
              />
            </div>

            {/* Email de Contato */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email de Contato
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>
          </div>

          {/* Botão de Enviar */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
            >
              Enviar para Divulgação
            </button>
          </div>
        </div>
      </motion.form>

      {/* Popup de Confirmação */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Divulgação em Análise</h2>
            <p className="text-gray-600 mb-4">
              Sua comunidade foi enviada para análise. O tempo médio para aprovação é de <span className="font-semibold text-emerald-600">até 10 minutos</span>. Logo ela estará ativa e disponível para todos!
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PromoteCommunity; 