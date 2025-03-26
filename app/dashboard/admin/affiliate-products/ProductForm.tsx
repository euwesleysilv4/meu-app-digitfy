'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  DollarSign,
  Tag,
  FileText,
  Link as LinkIcon,
  Percent,
  User,
  Star
} from 'lucide-react';
import { affiliateProductService, AffiliateProduct } from '../../services/affiliateProductService';

interface ProductFormProps {
  product?: AffiliateProduct;
  onSave: () => void;
  onCancel: () => void;
  setStatusMessage: (message: {
    type: 'success' | 'error' | 'info',
    message: string
  } | null) => void;
}

export default function ProductForm({ 
  product, 
  onSave, 
  onCancel,
  setStatusMessage 
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [benefitInput, setBenefitInput] = useState('');
  
  // Estado do formulário
  const [formData, setFormData] = useState<Omit<AffiliateProduct, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    image_url: '',
    image: '',
    benefits: [],
    price: 0,
    price_display: '',
    category: '',
    featured: false,
    active: true,
    order_index: 0,
    sales_url: '',
    affiliate_link: '',
    commission_rate: 50,
    vendor_name: '',
    platform: 'Hotmart'
  });

  // Carregar dados do produto se estiver editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        image_url: product.image_url || '',
        image: product.image || '',
        benefits: Array.isArray(product.benefits) ? [...product.benefits] : [],
        price: product.price || 0,
        price_display: product.price_display || '',
        category: product.category || '',
        featured: product.featured || false,
        active: product.active || true,
        order_index: product.order_index || 0,
        sales_url: product.sales_url || '',
        affiliate_link: product.affiliate_link || '',
        commission_rate: product.commission_rate || 50,
        vendor_name: product.vendor_name || '',
        platform: product.platform || 'Hotmart'
      });
    }
  }, [product]);

  // Atualizar o formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'price' || name === 'commission_rate') {
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
      
      if (!formData.image_url.trim() && !formData.image) {
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
      if (!formData.image_url && formData.image) {
        formData.image_url = formData.image;
      } else if (!formData.image && formData.image_url) {
        formData.image = formData.image_url;
      }
      
      // Salvar produto
      if (product?.id) {
        // Atualizar produto existente
        const { data, error } = await affiliateProductService.updateProduct(product.id, formData);
        
        if (error) {
          setStatusMessage({ 
            type: 'error', 
            message: `Erro ao atualizar produto: ${error.message || 'Erro desconhecido'}` 
          });
        } else {
          setStatusMessage({ type: 'success', message: 'Produto atualizado com sucesso!' });
          onSave();
        }
      } else {
        // Adicionar novo produto
        const { data, error } = await affiliateProductService.addProduct(formData);
        
        if (error) {
          setStatusMessage({ 
            type: 'error', 
            message: `Erro ao adicionar produto: ${error.message || 'Erro desconhecido'}` 
          });
        } else {
          setStatusMessage({ type: 'success', message: 'Produto adicionado com sucesso!' });
          onSave();
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      setStatusMessage({ 
        type: 'error', 
        message: 'Ocorreu um erro ao salvar o produto. Tente novamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {product ? 'Editar Produto' : 'Adicionar Novo Produto'}
        </h2>
        <p className="text-gray-600 mt-1">
          {product ? 'Atualize as informações do produto' : 'Preencha os detalhes do novo produto'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção Básica */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Produto */}
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto*
                </label>
                <div className="relative">
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
              </div>
              
              {/* Descrição */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição*
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Descrição detalhada do produto"
                    required
                  />
                </div>
              </div>
              
              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria*
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Curso, Ebook, Software"
                    required
                  />
                </div>
              </div>
              
              {/* Plataforma */}
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Plataforma
                </label>
                <div className="relative">
                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Hotmart">Hotmart</option>
                    <option value="Braip">Braip</option>
                    <option value="Eduzz">Eduzz</option>
                    <option value="Monetizze">Monetizze</option>
                    <option value="Kickante">Kickante</option>
                    <option value="PerfectPay">PerfectPay</option>
                    <option value="Ticto">Ticto</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Imagens */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Imagens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* URL da Imagem */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem Principal*
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="URL da imagem principal"
                  />
                </div>
              </div>
              
              {/* URL da Imagem Alternativa */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem Alternativa
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="URL da imagem alternativa"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Preços */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Informações de Preço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preço */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$)*
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="197.00"
                    required
                  />
                </div>
              </div>
              
              {/* Formato de Exibição do Preço */}
              <div>
                <label htmlFor="price_display" className="block text-sm font-medium text-gray-700 mb-1">
                  Formato de Exibição do Preço*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="price_display"
                    name="price_display"
                    value={formData.price_display}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: R$ 197/única"
                    required
                  />
                </div>
              </div>
              
              {/* Comissão */}
              <div>
                <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa de Comissão (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="commission_rate"
                    name="commission_rate"
                    value={formData.commission_rate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="50"
                  />
                </div>
              </div>
              
              {/* Nome do Vendedor/Criador */}
              <div>
                <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Vendedor/Criador
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="vendor_name"
                    name="vendor_name"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nome do produtor/criador"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Links */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* URL de Vendas */}
              <div>
                <label htmlFor="sales_url" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Vendas
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="sales_url"
                    name="sales_url"
                    value={formData.sales_url}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="URL da página de vendas"
                  />
                </div>
              </div>
              
              {/* Link de Afiliado */}
              <div>
                <label htmlFor="affiliate_link" className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Afiliado
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="affiliate_link"
                    name="affiliate_link"
                    value={formData.affiliate_link}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Link do programa de afiliados"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de Benefícios */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Benefícios</h3>
            
            <div className="flex items-start gap-2 mb-4">
              <input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Adicionar benefício..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {formData.benefits.length > 0 ? (
              <ul className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-700">{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum benefício adicionado.</p>
            )}
          </div>
          
          {/* Seção de Configurações */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Configurações</h3>
            
            <div className="flex flex-col gap-4">
              {/* Status Ativo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Produto Ativo
                </label>
              </div>
              
              {/* Destaque */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 flex items-center text-sm text-gray-700">
                  Destacar Produto <Star className="ml-1 h-4 w-4 text-yellow-500" />
                </label>
              </div>
              
              {/* Índice de Ordem */}
              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-1">
                  Índice de Ordem
                </label>
                <input
                  type="number"
                  id="order_index"
                  name="order_index"
                  value={formData.order_index}
                  onChange={handleChange}
                  min="0"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-500">Números menores aparecem primeiro</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            disabled={isSubmitting}
          >
            <X size={18} className="mr-1" />
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} className="mr-1" />
                {product ? 'Atualizar Produto' : 'Adicionar Produto'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 