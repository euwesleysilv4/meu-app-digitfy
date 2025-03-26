'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Eye, 
  EyeOff,
  Filter,
  RefreshCw,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ExternalLink,
  Tag
} from 'lucide-react';
import { submittedProductService, SubmittedProduct } from '../../services/submittedProductService';

// Componente principal de administração de produtos submetidos
export default function SubmittedProductsAdmin() {
  // Estados
  const [products, setProducts] = useState<SubmittedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'aprovado' | 'rejeitado'>('pendente');
  const [selectedProduct, setSelectedProduct] = useState<SubmittedProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info',
    message: string
  } | null>(null);

  // Buscar produtos ao carregar a página e quando o filtro mudar
  useEffect(() => {
    fetchProducts();
    
    // Configurar uma busca periódica para manter os dados atualizados
    const intervalId = setInterval(() => {
      fetchProducts();
    }, 60000); // Atualiza a cada minuto
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [statusFilter]);

  // Função para buscar produtos
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      console.log('Buscando produtos com filtro:', statusFilter);
      let response;
      
      if (statusFilter === 'pendente') {
        response = await submittedProductService.listPendingProducts();
      } else {
        response = await submittedProductService.listAllSubmittedProducts();
      }
      
      const { data, error } = response;
      
      if (error) {
        console.error('Erro ao buscar produtos enviados:', error);
        setStatusMessage({
          type: 'error',
          message: `Erro ao carregar produtos: ${error.message || 'Erro desconhecido'}`
        });
      } else {
        console.log('Produtos recebidos:', data);
        let filteredData = data || [];
        
        // Filtrar por status se não for 'todos'
        if (statusFilter !== 'todos') {
          filteredData = filteredData.filter(product => product.status === statusFilter);
          console.log('Produtos filtrados:', filteredData);
        }
        
        setProducts(filteredData);
      }
    } catch (error: any) {
      console.error('Exceção ao buscar produtos enviados:', error);
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

  // Função para aprovar produto
  const handleApproveProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja aprovar este produto?')) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { success, error } = await submittedProductService.approveProduct(
        productId, 
        approveComment.trim() || undefined
      );
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto aprovado com sucesso! Foi adicionado à lista de produtos de afiliados.'
        });
        
        // Atualizar lista de produtos
        fetchProducts();
        
        // Limpar campos
        setApproveComment('');
        setSelectedProduct(null);
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao aprovar produto: ${error.message || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      console.error('Erro ao aprovar produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao aprovar o produto. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para rejeitar produto
  const handleRejectProduct = async (productId: string) => {
    if (!rejectReason.trim()) {
      setStatusMessage({
        type: 'error',
        message: 'Por favor, forneça um motivo para a rejeição.'
      });
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja rejeitar este produto?')) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { success, error } = await submittedProductService.rejectProduct(
        productId, 
        rejectReason.trim()
      );
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto rejeitado com sucesso!'
        });
        
        // Atualizar lista de produtos
        fetchProducts();
        
        // Limpar campos
        setRejectReason('');
        setSelectedProduct(null);
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao rejeitar produto: ${error.message || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      console.error('Erro ao rejeitar produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao rejeitar o produto. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Package className="h-6 w-6 text-indigo-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">Produtos Enviados por Afiliados</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="/admin/affiliate-products"
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-50"
            >
              <ExternalLink size={18} className="mr-1" />
              Ir para Produtos
            </a>
            
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center hover:bg-emerald-200"
              disabled={isLoading}
            >
              <RefreshCw size={18} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </header>
      
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          statusMessage.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {statusMessage.message}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filtro de Status */}
            <div className="flex items-center">
              <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="aprovado">Aprovados</option>
                <option value="rejeitado">Rejeitados</option>
              </select>
            </div>
            
            {/* Pesquisa */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Carregando produtos...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Nenhum produto encontrado.</p>
            <p className="text-sm text-gray-400">
              {searchTerm
                ? 'Tente modificar sua busca.'
                : statusFilter === 'pendente'
                ? 'Não há produtos pendentes para aprovação.'
                : statusFilter === 'aprovado'
                ? 'Não há produtos aprovados.'
                : statusFilter === 'rejeitado'
                ? 'Não há produtos rejeitados.'
                : 'Não há produtos enviados por afiliados.'
              }
            </p>
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
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Enviado em
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Categoria
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-gray-50 ${selectedProduct?.id === product.id ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-lg object-cover" 
                            src={product.image_url || product.image} 
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
                          <div className="text-sm text-gray-500">
                            {product.price_display}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.submittedAt)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.status === 'pendente' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </span>
                      )}
                      {product.status === 'aprovado' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprovado
                        </span>
                      )}
                      {product.status === 'rejeitado' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejeitado
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                          className={`p-1 rounded-full ${
                            selectedProduct?.id === product.id
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'text-gray-400 hover:text-indigo-600'
                          }`}
                          title="Ver detalhes"
                        >
                          {selectedProduct?.id === product.id ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                        
                        {product.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => handleApproveProduct(product.id!)}
                              className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-100"
                              title="Aprovar produto"
                              disabled={isProcessing}
                            >
                              <ThumbsUp className="h-5 w-5" />
                            </button>
                            
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                document.getElementById('rejectReason')?.focus();
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"
                              title="Rejeitar produto"
                              disabled={isProcessing}
                            >
                              <ThumbsDown className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Detalhes do Produto Selecionado */}
      {selectedProduct && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 p-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Detalhes do Produto</h2>
            <button
              onClick={() => setSelectedProduct(null)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coluna da Esquerda - Imagem */}
              <div className="md:col-span-1">
                <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={selectedProduct.image_url || selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Sem+Imagem';
                    }}
                  />
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Plataforma</h3>
                    <p className="text-sm text-gray-900">{selectedProduct.platform || 'Não informada'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Categoria</h3>
                    <p className="text-sm text-gray-900">{selectedProduct.category}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Vendedor/Produtor</h3>
                    <p className="text-sm text-gray-900">{selectedProduct.vendor_name || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Enviado em</h3>
                    <p className="text-sm text-gray-900">{formatDate(selectedProduct.submittedAt)}</p>
                  </div>
                  
                  {selectedProduct.reviewedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Revisado em</h3>
                      <p className="text-sm text-gray-900">{formatDate(selectedProduct.reviewedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Coluna Central - Detalhes */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedProduct.name}</h2>
                  <div className="mt-1 flex items-center">
                    <span className="text-lg font-medium text-indigo-600">{selectedProduct.price_display}</span>
                    {selectedProduct.commission_rate && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Comissão: {selectedProduct.commission_rate}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedProduct.description}</p>
                </div>
                
                {/* Benefícios */}
                {selectedProduct.benefits && selectedProduct.benefits.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Benefícios</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-900 space-y-1">
                      {selectedProduct.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Links */}
                <div className="space-y-2">
                  {selectedProduct.sales_url && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">URL de Vendas</h3>
                      <a 
                        href={selectedProduct.sales_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500 break-all"
                      >
                        {selectedProduct.sales_url}
                      </a>
                    </div>
                  )}
                  
                  {selectedProduct.affiliate_link && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Link de Afiliado</h3>
                      <a 
                        href={selectedProduct.affiliate_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500 break-all"
                      >
                        {selectedProduct.affiliate_link}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Comentários de aprovação/rejeição */}
                {selectedProduct.reviewerComments && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comentários da Revisão
                    </h3>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {selectedProduct.reviewerComments}
                    </p>
                  </div>
                )}
                
                {/* Formulário de Aprovação/Rejeição para produtos pendentes */}
                {selectedProduct.status === 'pendente' && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="space-y-4">
                      {/* Comentários de Aprovação */}
                      <div>
                        <label htmlFor="approveComment" className="block text-sm font-medium text-gray-700">
                          Comentários para Aprovação (Opcional)
                        </label>
                        <textarea
                          id="approveComment"
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Adicione comentários para o afiliado (opcional)"
                          value={approveComment}
                          onChange={(e) => setApproveComment(e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveProduct(selectedProduct.id!)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                              Processando
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Aprovar Produto
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Razão de Rejeição */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700">
                          Motivo da Rejeição
                        </label>
                        <textarea
                          id="rejectReason"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="Explique por que o produto está sendo rejeitado"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        ></textarea>
                        
                        <button
                          type="button"
                          onClick={() => handleRejectProduct(selectedProduct.id!)}
                          className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          disabled={isProcessing || !rejectReason.trim()}
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                              Processando
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Rejeitar Produto
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 