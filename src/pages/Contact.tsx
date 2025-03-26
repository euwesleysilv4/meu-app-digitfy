import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Check,
  AlertCircle
} from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simula envio para um servidor
    setTimeout(() => {
      // Aqui você implementaria a lógica real de envio do formulário
      // Por exemplo, uma chamada a uma API
      
      setIsSubmitting(false);
      setSubmitStatus('success');
      
      // Limpa o formulário após envio bem-sucedido
      if (Math.random() > 0.2) { // 80% de chance de sucesso
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
      
      // Reseta o status após alguns segundos
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1500);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <Mail className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Entre em Contato
              </h1>
              <p className="text-gray-600 mt-1">
                Estamos prontos para ajudar. Envie sua mensagem!
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Informações de Contato */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 lg:p-8"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Informações de Contato</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-emerald-500 mt-1 mr-3" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-700">contato@digitalfy.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-emerald-500 mt-1 mr-3" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Telefone</p>
                <p className="text-gray-700">(11) 9999-8888</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-emerald-500 mt-1 mr-3" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Endereço</p>
                <p className="text-gray-700">
                  Av. Paulista, 1000<br />
                  São Paulo, SP, Brasil
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Horário de Atendimento</h3>
            <p className="text-gray-600 text-sm mb-1">Segunda à Sexta: 9h às 18h</p>
            <p className="text-gray-600 text-sm">Sábado: 9h às 13h</p>
          </div>
        </motion.div>
        
        {/* Formulário de Contato */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 lg:p-8 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Envie-nos uma mensagem</h2>
          
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              <span>Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.</span>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Seu nome"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="seu.email@exemplo.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="O assunto da sua mensagem"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Digite sua mensagem aqui..."
                required
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Enviar Mensagem</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 