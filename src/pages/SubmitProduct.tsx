import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, ArrowLeft, Upload, Check, Star } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const SubmitProduct = () => {
  const { hasAccess } = usePermissions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const canRecommendProducts = hasAccess('recommendedSection');
  const hasFeaturedProducts = hasAccess('featuredProductListing');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    
    if (!canRecommendProducts) {
      navigate('/upgrade-plan');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Aqui faria a chamada para Supabase na tabela de produtos recomendados
      // Este é um exemplo simulado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Ativar estado de sucesso
      setIsSuccess(true);
      
      // Após 3 segundos, volta para a página de produtos recomendados
      setTimeout(() => {
        navigate('/recommended-products');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se o usuário não tem acesso, redirecionar para página de upgrade
  if (!canRecommendProducts) {
    return (
      <motion.div 
        className="max-w-3xl mx-auto py-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <PlusCircle className="text-amber-500" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            Recomendação de Produtos Bloqueada
          </h2>
          <p className="text-amber-700 mb-6">
            Para recomendar seu infoproduto para a comunidade, você precisa fazer upgrade para o plano Pro.
          </p>
          <button 
            onClick={() => navigate('/upgrade-plan')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Ver Planos Disponíveis
          </button>
        </div>
      </motion.div>
    );
  }

  // Exibição de sucesso
  if (isSuccess) {
    return (
      <motion.div 
        className="max-w-3xl mx-auto py-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
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
            Redirecionando para a página de produtos...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button 
        onClick={() => navigate('/recommended-products')}
        className="flex items-center text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        <span>Voltar para produtos recomendados</span>
      </button>
      
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-emerald-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Recomendar seu Infoproduto</h1>
        </div>
        
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
              placeholder="Ex: R$ 97/única ou R$ 49/mês"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Principais Benefícios *
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
                  required={index < 2} // Pelo menos 2 benefícios obrigatórios
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                isSubmitting 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Enviar Infoproduto</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 text-center">
            Todos os produtos enviados passam por análise antes de serem publicados. 
            A aprovação não é garantida e segue nossos critérios de qualidade.
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default SubmitProduct; 