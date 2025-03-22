import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X, User, Link, DollarSign, Mail, Instagram, Star } from 'lucide-react';
import ReactDOM from 'react-dom';

// Interface para os dados do formulário
interface AffiliateFormData {
  nome: string;
  email: string;
  instagram: string;
  site: string;
  produto: string;
  comissao: string;
  mensagem: string;
  tipo: string; // Tipo de dados a ser enviado
  documento: string; // URL do documento oficial
}

interface AffiliateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AffiliateFormModal: React.FC<AffiliateFormModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Estado para os dados do formulário
  const [formData, setFormData] = useState<AffiliateFormData>({
    nome: '',
    email: '',
    instagram: '',
    site: '',
    produto: '',
    comissao: '',
    mensagem: '',
    tipo: 'produto', // Valor padrão
    documento: ''
  });
  
  // Prevenir rolagem do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Função para atualizar os dados do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Função para enviar o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulação de envio de dados para o servidor
    setTimeout(() => {
      console.log('Dados enviados:', formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Resetar o formulário após o sucesso
      setTimeout(() => {
        setFormData({
          nome: '',
          email: '',
          instagram: '',
          site: '',
          produto: '',
          comissao: '',
          mensagem: '',
          tipo: 'produto',
          documento: ''
        });
      }, 500);
    }, 1500);
  };
  
  // Função para fechar o modal
  const handleCloseModal = () => {
    onClose();
    // Resetar o estado de sucesso após fechar o modal
    if (submitSuccess) {
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 300);
    }
  };
  
  if (!isOpen) return null;
  
  // Conteúdo do modal
  const modalContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999]" 
        onClick={handleCloseModal}
      />
      
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pt-1 pb-3 z-10 border-b border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Send className="text-emerald-500" size={20} />
                {formData.tipo === 'produto' && 'Enviar Produto'}
                {formData.tipo === 'top_afiliado' && 'Enviar Top Afiliado'}
                {formData.tipo === 'mais_vendido' && 'Enviar Produto Mais Vendido'}
                {formData.tipo === 'mais_afiliados' && 'Enviar Produto com Mais Afiliados'}
                {formData.tipo === 'perfil_completo' && 'Enviar Perfil Completo'}
                {formData.tipo === 'depoimento' && 'Enviar Depoimento'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>
            </div>
            
            {submitSuccess ? (
              // Mensagem de sucesso
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-emerald-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">Dados Enviados com Sucesso!</h3>
                <p className="text-emerald-600 mb-4">
                  {formData.tipo === 'produto' && 'Seu produto foi enviado e será analisado pela nossa equipe.'}
                  {formData.tipo === 'top_afiliado' && 'O perfil do afiliado foi enviado para análise como Top Afiliado.'}
                  {formData.tipo === 'mais_vendido' && 'O produto foi enviado para análise como Mais Vendido.'}
                  {formData.tipo === 'mais_afiliados' && 'O produto foi enviado para análise como destaque em Mais Afiliados.'}
                  {formData.tipo === 'perfil_completo' && 'O perfil completo foi enviado para análise.'}
                  {formData.tipo === 'depoimento' && 'Seu depoimento foi enviado para análise.'}
                </p>
                <button
                  onClick={handleCloseModal}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </motion.div>
            ) : (
              // Formulário
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Dados*
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                  >
                    <option value="produto">Produto Próprio</option>
                    <option value="top_afiliado">Top Afiliado</option>
                  </select>
                </div>
                
                {/* Campos específicos baseados no tipo selecionado */}
                {formData.tipo === 'produto' && (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Informações do Produto</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Seu nome completo"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail de Contato*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                            Instagram
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Instagram className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="text"
                              id="instagram"
                              name="instagram"
                              value={formData.instagram}
                              onChange={handleInputChange}
                              className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="@seuinstagram"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                            Site ou Blog
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Link className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="url"
                              id="site"
                              name="site"
                              value={formData.site}
                              onChange={handleInputChange}
                              className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="https://seusite.com.br"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
                          Produto Principal*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Star className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="produto"
                            name="produto"
                            value={formData.produto}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Nome do seu produto principal"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="comissao" className="block text-sm font-medium text-gray-700 mb-1">
                          Comissão Oferecida
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="comissao"
                            name="comissao"
                            value={formData.comissao}
                            onChange={handleInputChange}
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Ex: 50% ou R$ 100,00 por venda"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipo === 'top_afiliado' && (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Informações do Afiliado</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Afiliado*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Nome do afiliado a ser destacado"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail de Contato*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Email para contato"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                            Instagram do Afiliado*
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Instagram className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="text"
                              id="instagram"
                              name="instagram"
                              value={formData.instagram}
                              onChange={handleInputChange}
                              required
                              className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="@instagramdoafiliado"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
                            Produto que promove*
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Star className="text-gray-400" size={16} />
                            </div>
                            <input
                              type="text"
                              id="produto"
                              name="produto"
                              value={formData.produto}
                              onChange={handleInputChange}
                              required
                              className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Nome do produto que promove"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {(formData.tipo === 'mais_vendido' || formData.tipo === 'mais_afiliados') && (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Informações do Produto</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Produto*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Star className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="produto"
                            name="produto"
                            value={formData.produto}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Nome do produto"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Criador*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Nome de quem criou o produto"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="comissao" className="block text-sm font-medium text-gray-700 mb-1">
                          Comissão Oferecida*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="comissao"
                            name="comissao"
                            value={formData.comissao}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Ex: 50% ou R$ 100,00 por venda"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipo === 'perfil_completo' && (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Informações do Afiliado</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Afiliado*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Nome do afiliado"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-mail de Contato*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="E-mail para contato"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Instagram className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="instagram"
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="@seuinstagram"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                          Site ou Blog*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Link className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="url"
                            id="site"
                            name="site"
                            value={formData.site}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="https://seusite.com.br"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.tipo === 'depoimento' && (
                  <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Informações do Depoimento</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Seu nome"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">
                          Produto*
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Star className="text-gray-400" size={16} />
                          </div>
                          <input
                            type="text"
                            id="produto"
                            name="produto"
                            value={formData.produto}
                            onChange={handleInputChange}
                            required
                            className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Produto que está dando depoimento"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Adicionar campo de documento para todos os tipos de formulário */}
                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <h3 className="text-md font-medium text-gray-700 mb-3 border-b pb-2">Documento Comprobatório</h3>
                  <div>
                    <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-1">
                      Documento Oficial
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="documento"
                        name="documento"
                        value={formData.documento}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="URL do documento comprobatório (PDF, planilha, etc.)"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Forneça um link para um documento oficial que comprove os dados informados (exemplo: relatório da plataforma, comprovante de vendas, etc.). Os dados devem ser atualizados mensalmente para garantir a precisão das informações no marketplace.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem Adicional
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Informações adicionais que considere relevantes"
                  />
                </div>
                
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={18} />
                        Enviar Dados
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Os campos marcados com * são obrigatórios. Todos os dados enviados serão analisados por nossa equipe antes de serem publicados.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
  
  // Usar React Portal para renderizar o modal fora da hierarquia do DOM
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default AffiliateFormModal; 