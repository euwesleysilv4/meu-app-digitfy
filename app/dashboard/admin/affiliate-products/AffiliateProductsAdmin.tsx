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
  Inbox
} from 'lucide-react';
import { affiliateProductService, AffiliateProduct } from '../../services/affiliateProductService';
import { affiliateSubmissionService } from '../../services/affiliateSubmissionService';
import ProductForm from './ProductForm';

// Componente principal de administração de produtos de afiliados
export default function AffiliateProductsAdmin() {
  // Estados
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'lista' | 'adicionarProduto' | 'editarProduto'>('lista');
  const [selectedProduct, setSelectedProduct] = useState<AffiliateProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info',
    message: string
  } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Buscar produtos ao carregar a página
  useEffect(() => {
    fetchProducts();
    fetchPendingSubmissionsCount();
  }, []);

  // Buscar o número de submissões pendentes
  const fetchPendingSubmissionsCount = async () => {
    try {
      const { data } = await affiliateSubmissionService.listPendingSubmissions();
      setPendingCount(data?.length || 0);
    } catch (error) {
      console.error('Erro ao buscar contagem de submissões pendentes:', error);
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
    <div className="container mx-auto px-4 py-8">
      {statusMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-800' :
          statusMessage.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center">
            {statusMessage.type === 'success' && <CheckCircle className="mr-2 h-5 w-5" />}
            {statusMessage.type === 'error' && <XCircle className="mr-2 h-5 w-5" />}
            {statusMessage.type === 'info' && <AlertCircle className="mr-2 h-5 w-5" />}
            <span>{statusMessage.message}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <header className="bg-white shadow-sm border-b border-gray-200 mb-6">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Package className="h-6 w-6 text-indigo-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">Gestão de Produtos de Afiliados</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => currentView === 'lista' ? handleAddProduct() : handleBackToList()}
              className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                currentView === 'lista' 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {currentView === 'lista' ? (
                <>
                  <Plus size={18} className="mr-1" />
                  Adicionar Produto
                </>
              ) : (
                <>
                  <XCircle size={18} className="mr-1" />
                  Voltar à Lista
                </>
              )}
            </button>
            
            {currentView === 'lista' && (
              <>
                <a
                  href="/dashboard/admin/affiliate-submissions"
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center hover:bg-amber-200"
                >
                  <Inbox size={18} className="mr-1" />
                  Submissões ({pendingCount})
                </a>
                
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center hover:bg-emerald-200"
                  disabled={isLoading}
                >
                  <RefreshCw size={18} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Adicionar mensagem de erro de banco de dados */}
      {statusMessage && statusMessage.type === 'error' && 
        statusMessage.message.includes('Could not find the') && 
        statusMessage.message.includes('column') && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="mr-2 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Problema com o banco de dados detectado</h3>
              <p className="mt-1">Parece que estão faltando algumas colunas na tabela do banco de dados. Este problema pode ser facilmente corrigido.</p>
              <a 
                href="/admin/affiliate-products/patch-database" 
                className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Corrigir Banco de Dados
              </a>
            </div>
          </div>
        </div>
      )}
      
      {currentView === 'lista' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-auto">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Filter className="mr-1 h-4 w-4" />
                <span>Total: <strong>{filteredProducts.length}</strong> produtos</span>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Nenhum produto encontrado</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm 
                  ? 'Tente modificar sua busca ou limpar o filtro.' 
                  : 'Clique em "Adicionar Produto" para começar.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plataforma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              src={product.image_url || product.image} 
                              alt={product.name} 
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.featured && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Destaque
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.platform || 'Hotmart'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.price_display}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.commission_rate || 50}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleToggleFeatured(product.id!, product.featured!)}
                            className={`p-1 rounded-md ${
                              product.featured
                                ? 'text-yellow-500 hover:bg-yellow-100'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={product.featured ? "Remover destaque" : "Destacar produto"}
                            disabled={isProcessing}
                          >
                            {product.featured ? <StarOff className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                          </button>
                          
                          <button 
                            onClick={() => handleToggleStatus(product.id!, product.active!)}
                            className={`p-1 rounded-md ${
                              product.active
                                ? 'text-green-500 hover:bg-green-100'
                                : 'text-red-500 hover:bg-red-100'
                            }`}
                            title={product.active ? "Desativar produto" : "Ativar produto"}
                            disabled={isProcessing}
                          >
                            {product.active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                          
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-indigo-500 hover:bg-indigo-100 rounded-md"
                            title="Editar produto"
                            disabled={isProcessing}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          
                          <button 
                            onClick={() => handleRemoveProduct(product.id!)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded-md"
                            title="Remover produto"
                            disabled={isProcessing}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {currentView === 'adicionarProduto' && (
        <ProductForm 
          onSave={fetchProducts}
          onCancel={handleBackToList}
          setStatusMessage={setStatusMessage}
        />
      )}
      
      {currentView === 'editarProduto' && selectedProduct && (
        <ProductForm 
          product={selectedProduct}
          onSave={fetchProducts}
          onCancel={handleBackToList}
          setStatusMessage={setStatusMessage}
        />
      )}
    </div>
  );
} 