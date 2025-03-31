import { motion } from "framer-motion";
import { AlertTriangle, X, Gift } from "lucide-react";
import { useState } from "react";

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    category: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatWhatsAppMessage = (data: typeof formData) => {
    return [
      '⚠️ *REPORTE DE PROBLEMA - DIGITFY*',
      '━━━━━━━━━━━━━━━━',
      '',
      `👤 *Nome:*\n${data.name || 'Não informado'}`,
      '',
      `🔍 *Título:*\n${data.title || 'Não informado'}`,
      '',
      `🏷️ *Categoria:*\n${data.category || 'Não informada'}`,
      '',
      `📝 *Descrição:*\n${data.description || 'Não informada'}`,
      '',
      '━━━━━━━━━━━━━━━━'
    ].join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Formatar a mensagem para o WhatsApp (com %0A para quebras de linha na URL)
    const message = formatWhatsAppMessage(formData).replace(/\n/g, '%0A');

    // Número do WhatsApp (substitua pelo número correto)
    const whatsappNumber = "91986300548"; // Número atualizado

    // Criar o link do WhatsApp
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

    // Abrir o WhatsApp em uma nova aba
    window.open(whatsappLink, '_blank');

    // Resetar o formulário e mostrar confirmação
    setIsSubmitted(true);
    setFormData({
      name: "",
      title: "",
      description: "",
      category: ""
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              Reportar Problema
            </h1>
            <p className="text-gray-600 mt-1">
              Ajude-nos a melhorar reportando problemas encontrados na plataforma DigitFy
            </p>
          </div>
        </div>
      </motion.div>

      {/* Aviso de Prioridade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-100 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-red-600">Tratamento Prioritário!</h3>
        </div>
        <p className="text-base text-gray-700">
          Todos os problemas reportados são tratados com prioridade pela nossa equipe. Faremos o possível para resolver sua questão o mais rápido possível!
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulário */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6"
        >
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Seu Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          
          {/* Título do Problema */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título do Problema
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              placeholder="Ex: Erro ao carregar página"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Problema
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              rows={4}
              placeholder="Descreva o problema em detalhes (passos para reproduzir, comportamento esperado, etc)..."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="Erro de Sistema">Erro de Sistema</option>
              <option value="Bug na Interface">Bug na Interface</option>
              <option value="Problema de Performance">Problema de Performance</option>
              <option value="Erro de Login">Erro de Login/Acesso</option>
              <option value="Problema com Pagamento">Problema com Pagamento</option>
              <option value="Erro em Relatórios">Erro em Relatórios/Dados</option>
              <option value="Problema de Integração">Problema de Integração</option>
              <option value="Erro na Documentação">Erro na Documentação</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Botão de Enviar */}
          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
            >
              Enviar Problema via WhatsApp
            </button>
          </div>
        </motion.form>

        {/* Preview do WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#efeae2] rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <div className="bg-[#128C7E] text-white px-4 py-2 rounded-t-lg mb-4 -mt-6 -mx-6">
            <h2 className="text-lg font-semibold">Preview do WhatsApp</h2>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm whitespace-pre-wrap font-[system-ui] text-[15px]">
            {formatWhatsAppMessage(formData)}
          </div>
        </motion.div>
      </div>

      {/* Avisos */}
      <div className="mt-6">
        {/* Aviso de Benefício */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-100 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-6 h-6 text-red-500 animate-bounce" />
            <h3 className="text-lg font-semibold text-red-600">Benefício Especial!</h3>
          </div>
          <p className="text-base text-gray-700">
            Caso você descubra um <span className="font-bold">problema grave</span> e nossa equipe o corrija, você ganhará um <span className="font-bold">acesso anual ao melhor plano da DigitFy</span>, com direito a todas as ferramentas e funcionalidades premium!
          </p>
        </motion.div>
      </div>

      {/* Popup de Confirmação */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Problema Reportado!</h2>
            <p className="text-gray-600 mb-4">
              Agradecemos por nos ajudar a melhorar. Nossa equipe irá analisar seu reporte e tomar as providências necessárias.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportIssue; 