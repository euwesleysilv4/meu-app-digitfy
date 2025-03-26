'use client';

import React, { useState } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  DollarSign,
  Tag,
  FileText,
  Link as LinkIcon,
  Percent,
  User,
  Cloud
} from 'lucide-react';
import { submittedProductService } from '../../app/services/submittedProductService';

const PLATFORM_OPTIONS = [
  { value: 'Hotmart', label: 'Hotmart' },
  { value: 'Eduzz', label: 'Eduzz' },
  { value: 'Monetizze', label: 'Monetizze' },
  { value: 'Kiwify', label: 'Kiwify' },
  { value: 'Ticto', label: 'Ticto' },
  { value: 'Braip', label: 'Braip' },
  { value: 'PerfectPay', label: 'PerfectPay' },
  { value: 'Paypal', label: 'Paypal' },
  { value: 'Outro', label: 'Outro' }
];

const CATEGORY_OPTIONS = [
  { value: 'Marketing Digital', label: 'Marketing Digital' },
  { value: 'SEO', label: 'SEO' },
  { value: 'Anúncios', label: 'Anúncios' },
  { value: 'Copywriting', label: 'Copywriting' },
  { value: 'Lançamentos', label: 'Lançamentos' },
  { value: 'Educação', label: 'Educação' },
  { value: 'Finanças', label: 'Finanças' },
  { value: 'Saúde', label: 'Saúde' },
  { value: 'Desenvolvimento Pessoal', label: 'Desenvolvimento Pessoal' },
  { value: 'Outros', label: 'Outros' }
];

interface AffiliateProductSubmitFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function AffiliateProductSubmitForm({ onSuccess, onCancel }: AffiliateProductSubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [benefitInput, setBenefitInput] = useState('');
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    image_url: '',
    benefits: [] as string[],
    price: 0,
    price_display: '',
    category: '',
    sales_url: '',
    affiliate_link: '',
    commission_rate: 50,
    vendor_name: '',
    platform: 'Hotmart'
  });

  // Atualizar o formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'price' || name === 'commission_rate') {
      const numericValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: isNaN(numericValue) ? 0 : numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Adicionar benefício
  const handleAddBenefit = () => {
    if (benefitInput.trim() === '') return;
    
    setFormData({
      ...formData,
      benefits: [...formData.benefits, benefitInput.trim()]
    });
    
    setBenefitInput('');
  };

  // Remover benefício
  const handleRemoveBenefit = (index: number) => {
    const newBenefits = [...formData.benefits];
    newBenefits.splice(index, 1);
    
    setFormData({
      ...formData,
      benefits: newBenefits
    });
  };

  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    
    try {
      // Validações básicas
      if (!formData.name.trim()) {
        setStatusMessage({ type: 'error', message: 'O nome do produto é obrigatório' });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.description.trim()) {
        setStatusMessage({ type: 'error', message: 'A descrição do produto é obrigatória' });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.image.trim() && !formData.image_url.trim()) {
        setStatusMessage({ type: 'error', message: 'Pelo menos uma URL de imagem é obrigatória' });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.category.trim()) {
        setStatusMessage({ type: 'error', message: 'A categoria é obrigatória' });
        setIsSubmitting(false);
        return;
      }
      
      if (formData.price <= 0) {
        setStatusMessage({ type: 'error', message: 'O preço deve ser maior que zero' });
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.price_display.trim()) {
        setStatusMessage({ type: 'error', message: 'O formato de exibição do preço é obrigatório' });
        setIsSubmitting(false);
        return;
      }
      
      // Copiar imagem para image_url se apenas uma estiver preenchida
      let finalFormData = { ...formData };
      
      if (!finalFormData.image_url && finalFormData.image) {
        finalFormData.image_url = finalFormData.image;
      } else if (!finalFormData.image && finalFormData.image_url) {
        finalFormData.image = finalFormData.image_url;
      }
      
      // Enviar produto para aprovação
      const { data, error } = await submittedProductService.submitProduct({
        ...finalFormData,
        userId: '' // O userId será definido automaticamente pelo serviço no backend
      });
      
      if (error) {
        setStatusMessage({ 
          type: 'error', 
          message: `Erro ao enviar produto: ${error.message || 'Erro desconhecido'}` 
        });
      } else {
        setStatusMessage({ 
          type: 'success', 
          message: 'Produto enviado com sucesso! Ele será analisado pela nossa equipe.'
        });
        
        // Resetar formulário
        setFormData({
          name: '',
          description: '',
          image: '',
          image_url: '',
          benefits: [],
          price: 0,
          price_display: '',
          category: '',
          sales_url: '',
          affiliate_link: '',
          commission_rate: 50,
          vendor_name: '',
          platform: 'Hotmart'
        });
        
        // Notificar sucesso
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Erro ao enviar produto:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Ocorreu um erro ao enviar o produto. Tente novamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Enviar Produto</h2>
        <p className="text-gray-600 mt-1">
          Preencha os detalhes do produto para enviar para aprovação
        </p>
      </div>
      
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {statusMessage.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção Básica */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <FileText className="mr-2 text-indigo-500" size={20} />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Produto */}
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nome do produto"
                  required
                />
              </div>
              
              {/* Descrição */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Descreva o produto em detalhes"
                  required
                ></textarea>
              </div>
              
              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="text-gray-400" size={16} />
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Plataforma */}
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Cloud className="text-gray-400" size={16} />
                  </div>
                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {PLATFORM_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Imagens */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <ImageIcon className="mr-2 text-indigo-500" size={20} />
              Imagens
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* URL da Imagem Principal */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem Principal*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>
              
              {/* URL da Imagem Alternativa */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem Alternativa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://exemplo.com/imagem-alt.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Preços */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <DollarSign className="mr-2 text-indigo-500" size={20} />
              Preços
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Preço */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              {/* Formato de Exibição do Preço */}
              <div>
                <label htmlFor="price_display" className="block text-sm font-medium text-gray-700 mb-1">
                  Formato de Exibição*
                </label>
                <input
                  type="text"
                  id="price_display"
                  name="price_display"
                  value={formData.price_display}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="R$ 197/única"
                  required
                />
              </div>
              
              {/* Taxa de Comissão */}
              <div>
                <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Comissão (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Percent className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="number"
                    id="commission_rate"
                    name="commission_rate"
                    value={formData.commission_rate || ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Links */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <LinkIcon className="mr-2 text-indigo-500" size={20} />
              Links
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* URL de Vendas */}
              <div>
                <label htmlFor="sales_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Vendas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="url"
                    id="sales_url"
                    name="sales_url"
                    value={formData.sales_url}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://exemplo.com/vendas"
                  />
                </div>
              </div>
              
              {/* Link de Afiliado */}
              <div>
                <label htmlFor="affiliate_link" className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Afiliado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="url"
                    id="affiliate_link"
                    name="affiliate_link"
                    value={formData.affiliate_link}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://exemplo.com/afiliado"
                  />
                </div>
              </div>
              
              {/* Nome do Vendedor */}
              <div>
                <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Vendedor/Produtor
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={16} />
                  </div>
                  <input
                    type="text"
                    id="vendor_name"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nome do produtor"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Benefícios do Produto */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <Plus className="mr-2 text-indigo-500" size={20} />
              Benefícios do Produto
            </h3>
            
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Adicione um benefício do produto"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="bg-indigo-600 text-white rounded-r-lg px-4 py-2 hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            
            {formData.benefits.length > 0 ? (
              <ul className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Remover benefício"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Nenhum benefício adicionado. Adicione os principais benefícios ou diferenciais do produto.
              </p>
            )}
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            className="w-full sm:w-auto order-1 sm:order-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Enviar para Aprovação</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 