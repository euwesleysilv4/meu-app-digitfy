import { motion } from "framer-motion";
import { Megaphone, Link2, Users, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

const PromoteCommunity = () => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    communityName: "",
    description: "",
    link: "",
    category: "",
    membersCount: "",
    contactEmail: "",
    type: "",
    imageUrl: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Você precisa estar logado para enviar uma comunidade");
      return;
    }
    
    // Validar o tipo de comunidade
    if (formData.type === "Outro") {
      toast.error("Por favor, selecione um tipo de comunidade válido: WhatsApp, Discord ou Telegram");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Converter o tipo para o formato esperado pelo banco de dados
      let databaseType = '';
      
      switch(formData.type) {
        case 'WhatsApp':
          databaseType = 'whatsapp';
          break;
        case 'Discord':
          databaseType = 'discord';
          break;
        case 'Telegram':
          databaseType = 'telegram';
          break;
        default:
          throw new Error('Tipo de comunidade inválido');
      }

      console.log('Enviando dados para o Supabase:', {
        p_community_name: formData.communityName,
        p_description: formData.description,
        p_link: formData.link,
        p_category: formData.category,
        p_members_count: parseInt(formData.membersCount),
        p_contact_email: formData.contactEmail,
        p_type: databaseType,
        p_image_url: formData.imageUrl || null
      });
      
      // Chama a função RPC que criamos no Supabase com o tipo correto
      const { data, error } = await supabase.rpc('submit_community', {
        p_community_name: formData.communityName,
        p_description: formData.description,
        p_link: formData.link,
        p_category: formData.category,
        p_members_count: parseInt(formData.membersCount),
        p_contact_email: formData.contactEmail,
        p_type: databaseType as 'whatsapp' | 'discord' | 'telegram',
        p_image_url: formData.imageUrl || null
      });
      
      if (error) {
        console.error("Detalhes do erro do Supabase:", error);
        throw new Error(error.message);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido ao enviar a comunidade');
      }
      
      console.log("Resposta do Supabase:", data);
      setIsSubmitted(true);
      toast.success("Sua comunidade foi enviada com sucesso! Ela será analisada pela nossa equipe.");
      setFormData({
        communityName: "",
        description: "",
        link: "",
        category: "",
        membersCount: "",
        contactEmail: "",
        type: "",
        imageUrl: ""
      });
    } catch (error) {
      console.error("Erro detalhado ao enviar a comunidade:", error);
      if (error instanceof Error) {
        toast.error(`Erro ao enviar sua comunidade: ${error.message}`);
      } else {
        toast.error("Ocorreu um erro ao enviar sua comunidade. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
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

      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100 max-w-md mx-auto"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Comunidade Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Sua comunidade foi enviada com sucesso e está sob análise. 
            Você receberá uma notificação quando ela for aprovada.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Enviar Outra Comunidade
          </button>
        </motion.div>
      ) : (
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
                <option value="Telegram">Canal de Telegram</option>
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

            {/* URL da Imagem */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL da Imagem (opcional)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Forneça um link para uma imagem que represente sua comunidade. Deixe em branco para usar uma imagem padrão.
              </p>
            </div>

            {/* Botão de Enviar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar para Divulgação'}
              </button>
            </div>
          </div>
        </motion.form>
      )}
    </div>
  );
};

export default PromoteCommunity; 