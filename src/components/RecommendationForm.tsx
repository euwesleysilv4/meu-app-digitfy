import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Star, Check } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Product, ProductBenefit } from '../types/product';
import ReactDOM from 'react-dom';

interface RecommendationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente para o overlay
const Overlay = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="modal-overlay fixed inset-0 bg-black/50 z-[9999]"
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      width: '100vw', 
      height: '100vh',
      zIndex: 9999,
      backdropFilter: 'blur(2px)'
    }}
    onClick={onClose}
  />
);

const RecommendationForm: React.FC<RecommendationFormProps> = ({ isOpen, onClose }) => {
  const { hasAccess } = usePermissions();
  const { user } = useAuth();
  const hasFeaturedProducts = hasAccess('featuredProductListing');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    benefits: ['', '', '', ''],
    category: 'Infoproduto',
    imageUrl: '',
    salesUrl: '',
    featured: hasFeaturedProducts
  });
  
  // Efeito para evitar rolagem do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      document.body.style.position = 'fixed';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
      document.body.style.width = 'auto';
      document.body.style.position = 'static';
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
      document.body.style.width = 'auto';
      document.body.style.position = 'static';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resetar mensagem de erro
    setError(null);
    setIsSubmitting(true);
    console.log('Enviando dados para o Supabase:', formData);
    
    try {
      // Validar dados antes de enviar
      if (!formData.name || !formData.description || !formData.price || !formData.imageUrl || !formData.salesUrl) {
        throw new Error('Preencha todos os campos obrigatórios');
      }
      
      if (!formData.benefits[0] && !formData.benefits[1]) {
        throw new Error('Adicione pelo menos dois benefícios para o produto');
      }

      // Enviar para o Supabase
      const { data, error } = await supabase
        .from('recommended_products')
        .insert([
          {
            user_id: user?.id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
            category: formData.category,
            image_url: formData.imageUrl,
            sales_url: formData.salesUrl,
            is_featured: formData.featured,
            status: 'pending', // pending, approved, rejected
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }
      
      console.log('Produto enviado com sucesso:', data);
      
      // Ativar estado de sucesso
      setIsSuccess(true);
      
      // Após 3 segundos, fechar o modal
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          benefits: ['', '', '', ''],
          category: 'Infoproduto',
          imageUrl: '',
          salesUrl: '',
          featured: hasFeaturedProducts
        });
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar produto:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao enviar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar no portal para garantir que fique acima de tudo
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <Overlay onClose={onClose} />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
            style={{ zIndex: 10000 }}
          >
            <div 
              className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recomendar seu Infoproduto</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6">
                {isSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-emerald-100 p-4 rounded-full">
                        <Check className="text-emerald-600" size={48} />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                      Infoproduto Enviado com Sucesso!
                    </h2>
                    <p className="text-emerald-700 mb-6">
                      Obrigado por compartilhar seu infoproduto. Nossa equipe irá revisar e, se aprovado, 
                      seu produto aparecerá na seção de produtos recomendados em breve.
                    </p>
                    <p className="text-emerald-600 text-sm">
                      Fechando em alguns segundos...
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-6">
                      Compartilhe seu infoproduto com a comunidade DigitFy. Produtos aprovados serão exibidos 
                      na seção de recomendados, aumentando sua visibilidade para possíveis compradores.
                    </p>
                    
                    {hasFeaturedProducts && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-200 p-2 rounded-full mt-1">
                            <Star className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-purple-800 mb-1">Produto em Destaque</h3>
                            <p className="text-purple-700">
                              Como usuário do plano Elite, seu produto será exibido com destaque na seção de produtos recomendados, 
                              recebendo maior visibilidade e atraindo mais cliques.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-red-200 p-2 rounded-full mt-1">
                            <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-red-800 mb-1">Erro ao enviar produto</h3>
                            <p className="text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Nome do Produto *
                          </label>
                          <input 
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Ex: Curso Completo de Marketing Digital"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Categoria *
                          </label>
                          <select 
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          >
                            <option value="Infoproduto">Infoproduto</option>
                            <option value="Curso">Curso</option>
                            <option value="Ebook">Ebook</option>
                            <option value="Mentorias">Mentoria</option>
                            <option value="Software">Software</option>
                            <option value="Serviços">Serviço</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Descrição *
                        </label>
                        <textarea 
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
                          placeholder="Descreva brevemente o seu produto (máximo 150 caracteres)"
                          maxLength={150}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Preço *
                        </label>
                        <input 
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Ex: R$ 197/única ou R$ 49/mês"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Benefícios Principais (até 4) *
                        </label>
                        <div className="space-y-3">
                          {formData.benefits.map((benefit, index) => (
                            <input 
                              key={index}
                              type="text"
                              value={benefit}
                              onChange={(e) => handleBenefitChange(index, e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder={`Benefício ${index + 1}`}
                              required={index < 2} // Apenas os dois primeiros são obrigatórios
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          URL da Página de Vendas *
                        </label>
                        <input 
                          type="url"
                          name="salesUrl"
                          value={formData.salesUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Ex: https://seusite.com.br/produto"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          URL da Imagem de Capa *
                        </label>
                        <input 
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Ex: https://seusite.com.br/imagem.jpg"
                          required
                        />
                        <p className="mt-2 text-sm text-teal-600 flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span>
                            Dica: O site <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-teal-700 mx-1">PostImage</a> é uma ótima opção para fazer upload e obter o link da sua imagem.
                          </span>
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-4 pt-4">
                        <button 
                          type="button"
                          onClick={onClose}
                          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className={`px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-lg transition-all flex items-center gap-2
                            ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-teal-600 hover:to-emerald-600 hover:shadow-md'}`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span>Enviar Produto</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root') || document.body
  );
};

export default RecommendationForm; 