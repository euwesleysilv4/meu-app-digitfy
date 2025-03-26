'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  Eye, 
  EyeOff,
  Filter,
  RefreshCw,
  Calendar,
  Tag,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { affiliateProductService, AffiliateProduct } from '../../services/affiliateProductService';
import ProductForm from './ProductForm';
import { submittedProductService, SubmittedProduct } from '../../services/submittedProductService';

// Componente para produtos submetidos
const SubmittedProductsPanel = ({ onProductStatusChange }: { onProductStatusChange: () => void }) => {
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialized(true);
      fetchPendingProducts();
    }, 500);
    
    const interval = setInterval(() => {
      if (initialized) {
        fetchPendingProducts();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [initialized]);

  const fetchPendingProducts = async () => {
    if (!initialized) return;
    
    setLoading(true);
    try {
      const { data, error } = await submittedProductService.listPendingProducts();
      
      if (error) {
        setError('Erro ao carregar produtos pendentes.');
        console.error('Erro ao carregar produtos pendentes:', error);
      } else if (data) {
        setPendingProducts(data);
        console.log('Produtos pendentes carregados:', data);
      }
    } catch (err: any) {
      setError('Erro ao carregar produtos pendentes.');
      console.error('Exceção ao carregar produtos pendentes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para aprovar produto
  const handleApproveProduct = async (productId: string) => {
    setProcessing(true);
    try {
      const { error } = await submittedProductService.approveProduct(productId);
      
      if (error) {
        setStatusMessage({
          type: 'error',
          message: `Erro ao aprovar produto: ${error.message || 'Erro desconhecido'}`
        });
      } else {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        setStatusMessage({
          type: 'success',
          message: 'Produto aprovado com sucesso!'
        });
        // Notificar o componente pai para atualizar a contagem
        onProductStatusChange();
      }
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao aprovar o produto. Tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Função para rejeitar produto
  const handleRejectProduct = async (productId: string, reason: string) => {
    if (!reason.trim()) {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, informe o motivo da rejeição.'
      });
      return;
    }
    
    setProcessing(true);
    try {
      const { error } = await submittedProductService.rejectProduct(productId, reason);
      
      if (error) {
        setStatusMessage({
          type: 'error',
          message: `Erro ao rejeitar produto: ${error.message || 'Erro desconhecido'}`
        });
      } else {
        setPendingProducts(prev => prev.filter(p => p.id !== productId));
        setStatusMessage({
          type: 'success',
          message: 'Produto rejeitado com sucesso.'
        });
        // Notificar o componente pai para atualizar a contagem
        onProductStatusChange();
      }
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao rejeitar o produto. Tente novamente.'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Componente para exibir um produto pendente
  const ProductCard = ({ 
    product, 
    onApprove, 
    onReject 
  }: { 
    product: any, 
    onApprove: (id: string) => void, 
    onReject: (id: string, reason: string) => void 
  }) => {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    
    // Formatar data
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0 md:pr-4">
            <img 
              src={product.image_url || product.image} 
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Sem+Imagem';
              }}
            />
          </div>
          
          <div className="md:w-3/4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-indigo-600 font-medium">{product.price_display}</p>
              </div>
              <span className="text-sm text-gray-500">
                Enviado em: {formatDate(product.submittedAt)}
              </span>
            </div>
            
            <div className="mb-3">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                {product.category}
              </span>
              {product.commission_rate && (
                <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Comissão: {product.commission_rate}%
                </span>
              )}
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{product.description}</p>
            
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Benefícios:</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {product.benefits.slice(0, 3).map((benefit: string, index: number) => (
                    <li key={index}>{benefit}</li>
                  ))}
                  {product.benefits.length > 3 && (
                    <li>+ {product.benefits.length - 3} outros benefícios</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 justify-end mt-4">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => onApprove(product.id)}
                    disabled={processing}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Aprovar
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={processing}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rejeitar
                  </button>
                </>
              ) : (
                <div className="w-full">
                  <div className="mb-2">
                    <label htmlFor={`reject-reason-${product.id}`} className="block text-sm font-medium text-gray-700">
                      Motivo da rejeição
                    </label>
                    <textarea
                      id={`reject-reason-${product.id}`}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Explique por que o produto está sendo rejeitado"
                      rows={3}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRejectForm(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        onReject(product.id, rejectReason);
                        setShowRejectForm(false);
                        setRejectReason('');
                      }}
                      disabled={processing || !rejectReason.trim()}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      Confirmar Rejeição
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white">
      {!initialized || loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Carregando produtos pendentes...</span>
        </div>
      ) : error ? (
        <div className="w-full p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={fetchPendingProducts}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      ) : statusMessage ? (
        <div className="w-full p-4">
          <div className={`px-4 py-3 rounded ${
            statusMessage.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <p>{statusMessage.message}</p>
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => setStatusMessage(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
              >
                Fechar
              </button>
              <button 
                onClick={fetchPendingProducts}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
              >
                Atualizar Lista
              </button>
            </div>
          </div>
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="w-full p-6 text-center">
          <p className="text-gray-600 text-lg">Não há produtos aguardando aprovação.</p>
        </div>
      ) : (
        <div className="w-full p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Produtos Aguardando Aprovação</h3>
            <button 
              onClick={fetchPendingProducts}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {pendingProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onApprove={handleApproveProduct} 
                onReject={handleRejectProduct} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal de administração de produtos de afiliados
export default function AffiliateProductsAdmin() {
  // Estados
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'lista' | 'adicionarProduto' | 'editarProduto' | 'produtosSubmetidos' | 'pendentes'>('lista');
  const [selectedProduct, setSelectedProduct] = useState<AffiliateProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info',
    message: string
  } | null>(null);
  const [pendingProductsCount, setPendingProductsCount] = useState(0);
  const [componentMounted, setComponentMounted] = useState(false);

  // Marcar componente como montado
  useEffect(() => {
    setComponentMounted(true);
  }, []);

  // Buscar produtos ao carregar a página
  useEffect(() => {
    if (componentMounted) {
      if (currentView === 'lista') {
        fetchProducts();
      }
      checkPendingProducts();
    }
  }, [componentMounted, currentView]);

  // Função para verificar produtos pendentes
  const checkPendingProducts = async () => {
    if (!componentMounted) return;
    
    try {
      const { data, error } = await submittedProductService.listPendingProducts();
      
      if (!error && data) {
        setPendingProductsCount(data.length);
      }
    } catch (error: any) {
      console.error('Erro ao buscar produtos pendentes:', error);
    }
  };

  // Função para buscar produtos
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await affiliateProductService.listAllProducts();
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        setStatusMessage({
          type: 'error',
          message: `Erro ao carregar produtos: ${error.message || 'Erro desconhecido'}`
        });
      } else {
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error('Exceção ao buscar produtos:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao carregar os produtos. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar produtos por termo de busca
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para destacar/remover destaque de um produto
  const handleToggleFeatured = async (productId: string, featured: boolean) => {
    setIsProcessing(true);
    
    try {
      const { success, error } = await affiliateProductService.toggleFeaturedStatus(productId, !featured);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: !featured ? 'Produto destacado com sucesso!' : 'Destaque removido com sucesso!'
        });
        
        // Atualizar lista de produtos
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, featured: !featured } 
            : product
        ));
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao atualizar destaque: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar destaque:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao atualizar o destaque. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para ativar/desativar um produto
  const handleToggleStatus = async (productId: string, active: boolean) => {
    setIsProcessing(true);
    
    try {
      const { success, error } = await affiliateProductService.toggleProductStatus(productId, !active);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: !active ? 'Produto ativado com sucesso!' : 'Produto desativado com sucesso!'
        });
        
        // Atualizar lista de produtos
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, active: !active } 
            : product
        ));
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao atualizar status: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao atualizar o status. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para remover um produto
  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { success, error } = await affiliateProductService.removeProduct(productId);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto removido com sucesso!'
        });
        
        // Atualizar lista de produtos
        setProducts(products.filter(product => product.id !== productId));
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao remover produto: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      console.error('Erro ao remover produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao remover o produto. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para editar um produto
  const handleEditProduct = (product: AffiliateProduct) => {
    setSelectedProduct(product);
    setCurrentView('editarProduto');
    window.scrollTo(0, 0);
  };

  // Função para adicionar um produto
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setCurrentView('adicionarProduto');
    window.scrollTo(0, 0);
  };

  // Função para voltar à lista
  const handleBackToList = () => {
    setCurrentView('lista');
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Administração de Produtos de Afiliados</h1>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Abas */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('lista')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'lista'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lista de Produtos
            </button>
            
            <button
              onClick={() => setCurrentView('pendentes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                currentView === 'pendentes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos Aguardando Aprovação
              
              {pendingProductsCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {pendingProductsCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Conteúdo das abas */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-500">Carregando...</p>
          </div>
        ) : componentMounted && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {currentView === 'lista' ? (
              <>
                {/* Formulário de pesquisa e adição de produtos */}
                <div className="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                  <div className="relative mt-1 rounded-md shadow-sm max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar produtos..."
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adicionar Produto
                    </button>
                  </div>
                </div>
                
                {/* Lista de produtos */}
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? 'Tente com outra palavra-chave ou' : 'Comece por'} adicionar um novo produto.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Adicionar Produto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comissão
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded-lg object-cover" 
                                    src={product.image} 
                                    alt={product.name}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Sem+Imagem';
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {product.description.substring(0, 60)}
                                    {product.description.length > 60 ? '...' : ''}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.price_display}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{product.commission_rate}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleRemoveProduct(product.id!)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <SubmittedProductsPanel onProductStatusChange={checkPendingProducts} />
            )}
          </div>
        )}
      </main>
      
      {/* Modal de formulário de produtos */}
      {selectedProduct && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {selectedProduct ? 'Editar Produto' : 'Adicionar Produto'}
                </h3>
                
                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={selectedProduct.name}
                      onChange={(e) => setSelectedProduct(prev => ({ ...prev!, name: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={selectedProduct.description}
                      onChange={(e) => setSelectedProduct(prev => ({ ...prev!, description: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={selectedProduct.price}
                        onChange={(e) => setSelectedProduct(prev => ({ ...prev!, price: Number(e.target.value) }))}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">
                        Taxa de Comissão (%)
                      </label>
                      <input
                        type="number"
                        id="commission_rate"
                        name="commission_rate"
                        value={selectedProduct.commission_rate}
                        onChange={(e) => setSelectedProduct(prev => ({ ...prev!, commission_rate: Number(e.target.value) }))}
                        step="0.1"
                        min="0"
                        max="100"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Categoria
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={selectedProduct.category}
                      onChange={(e) => setSelectedProduct(prev => ({ ...prev!, category: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Marketing Digital">Marketing Digital</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Finanças">Finanças</option>
                      <option value="Saúde e Bem-estar">Saúde e Bem-estar</option>
                      <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                      <option value="Educação">Educação</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      URL da Imagem
                    </label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={selectedProduct.image}
                      onChange={(e) => setSelectedProduct(prev => ({ ...prev!, image: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="affiliate_link" className="block text-sm font-medium text-gray-700">
                      Link de Afiliado
                    </label>
                    <input
                      type="url"
                      id="affiliate_link"
                      name="affiliate_link"
                      value={selectedProduct.affiliate_link}
                      onChange={(e) => setSelectedProduct(prev => ({ ...prev!, affiliate_link: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  {statusMessage && (
                    <div className={`p-3 rounded text-sm ${
                      statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {statusMessage.message}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    fetchProducts();
                    setSelectedProduct(null);
                  }}
                  disabled={isProcessing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 