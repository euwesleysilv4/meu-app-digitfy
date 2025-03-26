import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  ShoppingBag, 
  Clock, 
  User,
  Filter,
  Trash2,
  Edit,
  Eye,
  ArrowLeftRight,
  Loader,
  X,
  Copy,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService, PendingProduct } from '../../services/productService';
import { Product } from '../../types/product';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

const ProductsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'aprovados'>('pendentes');
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'lista' | 'adicionarProduto'>('lista');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info',
    message: string
  } | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Verificar permissões de administrador
  useEffect(() => {
    // Verificar permissões de administrador
    const checkAdmin = async () => {
      try {
        // Usar o método correto do userService
        const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
        setIsAdmin(adminStatus);
        
        if (error || !adminStatus) {
          console.error('Usuário não é administrador, redirecionando...');
          navigate('/dashboard');
        } else {
          console.log('Usuário é administrador, carregando produtos...');
          // Aguardar antes de tentar buscar produtos para permitir que 
          // a sessão do supabase seja inicializada completamente
          setTimeout(() => {
            fetchProducts();
          }, 500);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        navigate('/dashboard');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  // Função para buscar produtos
  const fetchProducts = async () => {
    setIsLoading(true);
    
    try {
      console.log('Iniciando busca de produtos...');
      
      // SOLUÇÃO ALTERNATIVA: Tentativa direta de buscar produtos pendentes do Supabase
      // Contornar possíveis problemas no serviço fazendo uma consulta direta
      console.log('Realizando consulta direta à tabela submitted_products...');
      
      // Primeira tentativa: buscar todos os produtos na tabela submitted_products
      const { data: allSubmittedProducts, error: submittedError } = await supabase
        .from('submitted_products')
        .select('*');
        
      if (submittedError) {
        console.error('Erro ao consultar a tabela submitted_products:', submittedError);
        
        // Segunda tentativa com a consulta original
        const { data: directPendingData, error: directPendingError } = await supabase
          .from('submitted_products')
          .select('*')
          .or('status.eq.pendente,status.is.null,status.ilike.%pend%');
        
        if (directPendingError) {
          console.error('Erro na consulta direta a submitted_products:', directPendingError);
          
          // Tentar a abordagem original através do serviço
          const { data: pendingData, error: pendingError } = await productService.listPendingProducts();
          
          if (pendingError) {
            console.error('Erro ao buscar produtos pendentes através do serviço:', pendingError);
            setStatusMessage({
              type: 'error',
              message: `Erro ao carregar produtos pendentes: ${pendingError.message || 'Erro desconhecido'}`
            });
            
            // Armazenar informações diagnósticas para ajudar na depuração
            setDiagnosticData({
              errorType: 'pendingProducts',
              errorDetails: pendingError,
              timestamp: new Date().toISOString()
            });
          } else {
            console.log(`Produtos pendentes carregados pelo serviço: ${pendingData?.length || 0}`);
            setPendingProducts(pendingData || []);
          }
        } else {
          // Processar dados obtidos diretamente
          console.log(`Produtos pendentes carregados diretamente: ${directPendingData?.length || 0}`);
          
          // Formatar os dados para o formato esperado pelo componente
          const formattedData = directPendingData?.map(item => ({
            ...item,
            id: item.id,
            userId: item.userId || item.user_id,
            submittedAt: item.submittedAt || item.submitted_at || new Date().toISOString(),
            updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
            userName: 'Usuário',
            userEmail: 'Sem email',
            status: item.status || 'pendente'
          })) || [];
          
          setPendingProducts(formattedData);
          
          // Diagnóstico detalhado dos produtos pendentes
          console.log('Detalhes dos produtos pendentes encontrados:', 
            formattedData.map(p => ({id: p.id, name: p.name, status: p.status})));
          
          // Se não há produtos pendentes, mostrar uma mensagem informativa
          if (formattedData.length === 0) {
            console.log('Nenhum produto pendente encontrado');
          }
        }
      } else {
        // Processar dados obtidos diretamente
        console.log(`Produtos pendentes carregados diretamente: ${allSubmittedProducts?.length || 0}`);
        
        // Formatar os dados para o formato esperado pelo componente
        const formattedData = allSubmittedProducts?.map(item => ({
          ...item,
          id: item.id,
          userId: item.userId || item.user_id,
          submittedAt: item.submittedAt || item.submitted_at || new Date().toISOString(),
          updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
          userName: 'Usuário',
          userEmail: 'Sem email',
          status: item.status || 'pendente'
        })) || [];
        
        setPendingProducts(formattedData);
        
        // Diagnóstico detalhado dos produtos pendentes
        console.log('Detalhes dos produtos pendentes encontrados:', 
          formattedData.map(p => ({id: p.id, name: p.name, status: p.status})));
        
        // Se não há produtos pendentes, mostrar uma mensagem informativa
        if (formattedData.length === 0) {
          console.log('Nenhum produto pendente encontrado');
        }
      }
      
      // Buscar produtos aprovados
      console.log('Buscando produtos aprovados...');
      const { data: approvedData, error: approvedError } = await productService.listAllProducts();
      
      if (approvedError) {
        console.error('Erro ao buscar produtos aprovados:', approvedError);
        setStatusMessage({
          type: 'error',
          message: `Erro ao carregar produtos aprovados: ${approvedError.message || 'Erro desconhecido'}`
        });
      } else {
        console.log(`Produtos aprovados carregados: ${approvedData?.length || 0}`);
        setApprovedProducts(approvedData || []);
        
        // Se não há produtos aprovados, mostrar uma mensagem mais informativa
        if (approvedData && approvedData.length === 0) {
          setStatusMessage({
            type: 'info',
            message: 'Não há produtos aprovados ainda. Adicione novos produtos ou aprove produtos pendentes.'
          });
        } else if (approvedData && approvedData.length > 0) {
          // Limpar mensagens de erro anteriores se há produtos
          if (statusMessage?.type === 'error' && statusMessage.message.includes('produtos aprovados')) {
            setStatusMessage(null);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao buscar os produtos. Tente novamente.'
      });
      
      // Armazenar informações diagnósticas para ajudar na depuração
      setDiagnosticData({
        errorType: 'fetchProducts',
        errorDetails: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Aprovar produto
  const handleApproveProduct = async (productId: string) => {
    setIsProcessing(true);
    
    try {
      const { success, error } = await productService.approveProduct(productId);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto aprovado com sucesso!'
        });
        
        // Atualizar listas
        await fetchProducts();
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao aprovar produto: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Erro ao aprovar produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao aprovar o produto. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Rejeitar produto
  const handleRejectProduct = async (productId: string) => {
    setIsProcessing(true);
    
    try {
      const { success, error } = await productService.rejectProduct(productId);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto rejeitado com sucesso!'
        });
        
        // Atualizar lista de produtos pendentes
        const updatedPendingProducts = pendingProducts.filter(
          product => product.id !== productId
        );
        setPendingProducts(updatedPendingProducts);
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao rejeitar produto: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Erro ao rejeitar produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao rejeitar o produto. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Remover produto da lista de aprovados
  const handleRemoveProduct = async (productId: string) => {
    setIsProcessing(true);
    
    try {
      const { success, error } = await productService.removeProduct(productId);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto removido com sucesso!'
        });
        
        // Atualizar lista de produtos aprovados
        const updatedApprovedProducts = approvedProducts.filter(
          product => product.id !== productId
        );
        setApprovedProducts(updatedApprovedProducts);
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao remover produto: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao remover o produto. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtrar produtos por termo de busca
  const filteredPendingProducts = pendingProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApprovedProducts = approvedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Botão para executar diagnóstico do sistema
  const runDiagnostic = async () => {
    setIsDiagnosing(true);
    
    try {
      console.log('Iniciando diagnóstico do sistema...');
      
      // Obter informações detalhadas sobre as tabelas e a sessão
      const diagData = await productService.debugProductsAccess();
      
      // Adicionar informações extras do navegador
      const diagnosticInfo = {
        ...diagData,
        browser: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        pendingProductsCount: pendingProducts.length,
        approvedProductsCount: approvedProducts.length,
        isAdmin: isAdmin
      };
      
      setDiagnosticData(diagnosticInfo);
      setShowDiagnostic(true);
      
      console.log('Diagnóstico concluído:', diagnosticInfo);
    } catch (error: any) {
      console.error('Erro ao executar diagnóstico:', error);
      
      // Mesmo com erro, mostrar informações básicas
      setDiagnosticData({
        timestamp: new Date().toISOString(),
        error: error,
        errorMessage: error?.message || 'Erro desconhecido',
        browser: navigator.userAgent,
        pendingProductsCount: pendingProducts.length,
        approvedProductsCount: approvedProducts.length
      });
      
      setShowDiagnostic(true);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Função para corrigir problemas detectados
  const fixDetectedIssues = async () => {
    setIsProcessing(true);
    
    try {
      setStatusMessage({
        type: 'info',
        message: 'Executando correções automáticas...'
      });
      
      // Verificar que problemas foram detectados
      const issues = [];
      
      if (diagnosticData?.submitted?.error) {
        issues.push('Erro na tabela submitted_products');
      }
      
      if (diagnosticData?.recommended?.error) {
        issues.push('Erro na tabela recommended_products');
      }
      
      // Tentar executar o script de correção
      const { success, error } = await productService.runFixScript();
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: `Correções aplicadas com sucesso! Problemas corrigidos: ${issues.join(', ')}`
        });
        
        // Fechar o painel de diagnóstico
        setShowDiagnostic(false);
        
        // Atualizar a lista de produtos
        fetchProducts();
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao aplicar correções: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        message: `Erro ao tentar corrigir problemas: ${error?.message || 'Erro desconhecido'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Componente de diagnóstico para debbuging
  const DiagnosticPanel = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowDiagnostic(false)}
    >
      <div 
        className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Diagnóstico do Sistema</h2>
          <button 
            onClick={() => setShowDiagnostic(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Informações Gerais</h3>
            <div className="text-sm space-y-1">
              <p>Timestamp: {diagnosticData?.timestamp || 'N/A'}</p>
              <p>Admin: {isAdmin ? 'Sim' : 'Não'}</p>
              <p>Produtos Pendentes: {pendingProducts.length}</p>
              <p>Produtos Aprovados: {approvedProducts.length}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Dados Técnicos</h3>
            <div className="text-sm space-y-1">
              <p>Navegador: {diagnosticData?.browser || navigator.userAgent}</p>
              <p>Tamanho da Tela: {diagnosticData?.screenSize || `${window.innerWidth}x${window.innerHeight}`}</p>
            </div>
          </div>
          
          {/* Tabela recommended_products */}
          {diagnosticData?.recommended && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Tabela recommended_products</h3>
              <div className="text-sm space-y-1">
                <p>Existe: {diagnosticData.recommended.exists ? 
                  <span className="text-green-600">Sim</span> : 
                  <span className="text-red-600">Não</span>}
                </p>
                <p>Registros: {diagnosticData.recommended.count || 0}</p>
                {diagnosticData.recommended.error && (
                  <p className="text-red-600">
                    Erro: {diagnosticData.recommended.error.message || 'Erro desconhecido'}
                  </p>
                )}
                {diagnosticData.recommended.firstProduct && (
                  <div>
                    <p className="mt-1 font-medium">Colunas disponíveis:</p>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                      {Object.keys(diagnosticData.recommended.firstProduct).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tabela submitted_products */}
          {diagnosticData?.submitted && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Tabela submitted_products</h3>
              <div className="text-sm space-y-1">
                <p>Existe: {diagnosticData.submitted.exists ? 
                  <span className="text-green-600">Sim</span> : 
                  <span className="text-red-600">Não</span>}
                </p>
                <p>Registros: {diagnosticData.submitted.count || 0}</p>
                {diagnosticData.submitted.error && (
                  <p className="text-red-600">
                    Erro: {diagnosticData.submitted.error.message || 'Erro desconhecido'}
                  </p>
                )}
                {diagnosticData.submitted.firstProduct && (
                  <div>
                    <p className="mt-1 font-medium">Colunas disponíveis:</p>
                    <p className="text-xs font-mono bg-gray-100 p-2 rounded mt-1">
                      {Object.keys(diagnosticData.submitted.firstProduct).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Informações de sessão */}
          {diagnosticData?.session && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Informações de Sessão</h3>
              <div className="text-sm">
                <p>Autenticado: {diagnosticData.session.session?.user ? 
                  <span className="text-green-600">Sim</span> : 
                  <span className="text-red-600">Não</span>}
                </p>
                {diagnosticData.session.session?.user && (
                  <p>ID do Usuário: {diagnosticData.session.session.user.id}</p>
                )}
              </div>
            </div>
          )}
          
          {diagnosticData?.errorType && (
            <div className="bg-red-50 p-3 rounded-md">
              <h3 className="font-medium text-red-700 mb-2">Erro Detectado</h3>
              <div className="text-sm space-y-1">
                <p>Tipo: {diagnosticData.errorType}</p>
                <p>Mensagem: {diagnosticData.errorDetails?.message || 'N/A'}</p>
                <p>Código: {diagnosticData.errorDetails?.code || 'N/A'}</p>
              </div>
            </div>
          )}
          
          {diagnosticData?.errorMessage && (
            <div className="bg-red-50 p-3 rounded-md">
              <h3 className="font-medium text-red-700 mb-2">Erro</h3>
              <div className="text-sm">
                <p>{diagnosticData.errorMessage}</p>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 p-3 rounded-md">
            <h3 className="font-medium text-blue-700 mb-2">Passos de Solução</h3>
            <ol className="text-sm list-decimal pl-5 space-y-1">
              <li>Verifique se você tem permissões de administrador</li>
              <li>Verifique se as tabelas existem e estão com a estrutura correta</li>
              <li>Verifique se os campos nas tabelas estão com os nomes corretos (camelCase vs snake_case)</li>
              <li>Verifique se as políticas RLS estão configuradas corretamente</li>
              <li>Execute o script <code className="bg-blue-100 px-1 rounded">supabase/migrations/fix_submitted_products.sql</code> para correções</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-6 pt-3 border-t flex justify-end gap-3">
          <button
            onClick={fixDetectedIssues}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1"
          >
            {isProcessing ? (
              <>
                <Loader className="animate-spin h-4 w-4" />
                Corrigindo...
              </>
            ) : (
              <>
                <RefreshCw size={16} /> 
                Corrigir Problemas
              </>
            )}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(diagnosticData, null, 2));
              setStatusMessage({
                type: 'success',
                message: 'Informações de diagnóstico copiadas para a área de transferência!'
              });
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
          >
            <Copy size={16} /> Copiar Dados
          </button>
          <button
            onClick={() => setShowDiagnostic(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    </motion.div>
  );
  
  // Botão de diagnóstico no canto inferior direito
  const DiagnosticButton = () => (
    <button
      onClick={runDiagnostic}
      disabled={isDiagnosing}
      className="fixed right-4 bottom-4 bg-white border border-gray-200 shadow-md rounded-full p-3 hover:bg-gray-50 z-10"
      title="Executar Diagnóstico do Sistema"
    >
      {isDiagnosing ? (
        <Loader className="h-5 w-5 text-gray-500 animate-spin" />
      ) : (
        <AlertCircle className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );

  // Se o admin não estiver autenticado, mostrar tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não for admin, redirecionar
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissões para acessar esta página. 
            Redirecionando para a página inicial...
          </p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-full animate-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar card de produto pendente
  const renderPendingProductCard = (product: PendingProduct) => {
    // Garantir que temos valores corretos independente do formato dos campos
    const userName = product.userName || 'Usuário';
    const submittedDate = product.submittedAt || product.submitted_at || new Date().toISOString();
    const benefits = Array.isArray(product.benefits) ? product.benefits : [];
    
    return (
      <motion.div 
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{product.category}</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              Pendente
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <User size={16} className="mr-1" />
            <span>{userName}</span>
          </div>
          
          <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
          
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Benefícios:</div>
            <ul className="text-sm text-gray-700 space-y-1">
              {benefits.length > 0 ? (
                benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-emerald-500 mr-1">•</span> {benefit}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">Nenhum benefício listado</li>
              )}
            </ul>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-800">{product.price}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Clock size={14} className="mr-1" />
              {new Date(submittedDate).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 p-4 flex justify-between gap-2">
          <button
            onClick={() => handleApproveProduct(product.id)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 px-4 rounded transition-colors"
          >
            <CheckCircle size={16} />
            Aprovar
          </button>
          
          <button
            onClick={() => handleRejectProduct(product.id)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded transition-colors"
          >
            <XCircle size={16} />
            Rejeitar
          </button>
        </div>
      </motion.div>
    );
  };

  // Renderizar card de produto aprovado
  const renderApprovedProductCard = (product: Product & { id?: string }) => (
    <motion.div 
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{product.category}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
            Aprovado
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Benefícios:</div>
          <ul className="text-sm text-gray-700 space-y-1">
            {product.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-emerald-500 mr-1">•</span> {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-800">{product.price}</div>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < Math.floor(product.rating)} />
            ))}
            <span className="text-sm text-gray-600 ml-1">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex space-x-2">
        <button 
          onClick={() => window.open(product.image, '_blank')}
          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          <Eye size={16} className="mr-1" />
          Ver Imagem
        </button>
        
        <button 
          onClick={() => product.id && handleRemoveProduct(product.id)}
          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg flex items-center justify-center transition-colors"
        >
          <Trash2 size={16} className="mr-1" />
          Remover
        </button>
        
        {product.salesUrl && (
          <button 
            onClick={() => window.open(product.salesUrl, '_blank')}
            className="flex-1 bg-teal-100 hover:bg-teal-200 text-teal-700 py-2 rounded-lg flex items-center justify-center transition-colors"
          >
            <ExternalLink size={16} className="mr-1" />
            Ver Vendas
          </button>
        )}
      </div>
    </motion.div>
  );

  // Componente interno para mostrar estrelas de avaliação
  const Star = ({ filled }: { filled: boolean }) => (
    <svg className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {!isAdmin && !isLoading ? (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h1>
            <p className="text-gray-600 mb-6">
              Esta página é restrita a administradores. Você não tem permissão para acessá-la.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para o Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <Package className="h-6 w-6 text-indigo-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-800">Gestão de Produtos</h1>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => currentView === 'lista' ? setCurrentView('adicionarProduto') : setCurrentView('lista')}
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
                      <ArrowLeftRight size={18} className="mr-1" />
                      Voltar à Lista
                    </>
                  )}
                </button>
                
                <button
                  onClick={runDiagnostic}
                  disabled={isDiagnosing}
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center"
                >
                  {isDiagnosing ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-1" />
                      Diagnosticando...
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} className="mr-1" />
                      Diagnóstico
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {currentView === 'adicionarProduto' ? (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <AddProductForm 
                onAddProduct={() => {
                  fetchProducts();
                  setCurrentView('lista');
                }} 
                onCancel={() => setCurrentView('lista')}
                setStatusMessage={setStatusMessage}
              />
            </div>
          ) : (
            <>
              <div className="container mx-auto px-4 py-6">
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg flex items-start ${
                      statusMessage.type === 'success' ? 'bg-green-50 text-green-800' :
                      statusMessage.type === 'error' ? 'bg-red-50 text-red-800' :
                      'bg-blue-50 text-blue-800'
                    }`}
                  >
                    {statusMessage.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : statusMessage.type === 'error' ? (
                      <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      {statusMessage.message}
                    </div>
                    <button
                      onClick={() => setStatusMessage(null)}
                      className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
                
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                  <div className="border-b border-gray-200">
                    <div className="flex flex-wrap">
                      <button
                        onClick={() => setActiveTab('pendentes')}
                        className={`px-6 py-3 text-sm font-medium ${
                          activeTab === 'pendentes'
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Clock size={16} className="inline mr-1" />
                        Produtos Pendentes
                      </button>
                      <button
                        onClick={() => setActiveTab('aprovados')}
                        className={`px-6 py-3 text-sm font-medium ${
                          activeTab === 'aprovados'
                            ? 'border-b-2 border-indigo-500 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <CheckCircle size={16} className="inline mr-1" />
                        Produtos Aprovados
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Carregando produtos...</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      {activeTab === 'pendentes' && (
                        <>
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-800">
                              Produtos Pendentes para Aprovação
                            </h3>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={async () => {
                                  try {
                                    // Consulta direta sem filtros para mostrar todos os produtos
                                    const { data, error } = await supabase
                                      .from('submitted_products')
                                      .select('*');
                                      
                                    if (error) {
                                      console.error('Erro diagnóstico:', error);
                                      alert(`Erro na consulta: ${error.message}`);
                                    } else {
                                      // Formatar dados para o componente
                                      const formattedData = data?.map(item => ({
                                        ...item,
                                        id: item.id,
                                        userId: item.userId || item.user_id,
                                        submittedAt: item.submittedAt || item.submitted_at || new Date().toISOString(),
                                        updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
                                        userName: 'Usuário',
                                        userEmail: 'Sem email',
                                        status: item.status || 'pendente'
                                      })) || [];
                                      
                                      setPendingProducts(formattedData);
                                      alert(`Encontrados ${formattedData.length} produtos na tabela. Verificar no console.`);
                                      console.log('Dados brutos de todos produtos:', data);
                                    }
                                  } catch (e) {
                                    console.error('Erro no diagnóstico:', e);
                                    alert('Erro ao executar diagnóstico. Veja o console.');
                                  }
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <AlertCircle size={16} />
                                <span>Diagnóstico Rápido</span>
                              </button>
                            
                              <button 
                                onClick={() => fetchProducts()}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <span>Atualizando...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw size={16} />
                                    <span>Atualizar Lista</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {filteredPendingProducts.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-700 mb-2">
                                Nenhum produto pendente
                              </h3>
                              <p className="text-gray-500 max-w-md mx-auto mb-4">
                                Não há produtos pendentes para aprovação no momento.
                              </p>
                              <button 
                                onClick={() => fetchProducts()}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-colors"
                              >
                                <RefreshCw size={16} />
                                <span>Verificar novamente</span>
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredPendingProducts.map(product => renderPendingProductCard(product))}
                            </div>
                          )}
                        </>
                      )}
                      
                      {activeTab === 'aprovados' && (
                        <>
                          {filteredApprovedProducts.length === 0 ? (
                            <div className="text-center py-12">
                              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-700 mb-2">
                                Nenhum produto aprovado
                              </h3>
                              <p className="text-gray-500 max-w-md mx-auto">
                                Não há produtos aprovados para exibição no momento.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredApprovedProducts.map(product => renderApprovedProductCard(product))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Modal de Diagnóstico */}
          {showDiagnostic && <DiagnosticPanel />}
        </>
      )}
      
      {/* Botão de diagnóstico flutuante apenas quando estiver visualizando a lista */}
      {currentView === 'lista' && !showDiagnostic && <DiagnosticButton />}
    </div>
  );
};

// Componente de formulário para adicionar produto
interface AddProductFormProps {
  onAddProduct: () => void;
  onCancel: () => void;
  setStatusMessage: (message: {
    type: 'success' | 'error' | 'info';
    message: string;
  } | null) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, onCancel, setStatusMessage }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'rating'>>({
    name: '',
    description: '',
    price: '',
    category: 'Infoproduto',
    image: '',
    benefits: ['', '', '', ''],
    salesUrl: ''
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
    setIsSubmitting(true);
    
    try {
      // Verificar se os campos obrigatórios estão preenchidos
      if (!formData.name || !formData.description || !formData.price || !formData.image) {
        setStatusMessage({
          type: 'error',
          message: 'Preencha todos os campos obrigatórios.'
        });
        return;
      }
      
      // Filtrar benefícios vazios
      const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
      
      if (filteredBenefits.length < 1) {
        setStatusMessage({
          type: 'error',
          message: 'Adicione pelo menos um benefício para o produto.'
        });
        return;
      }
      
      const productToAdd = {
        ...formData,
        benefits: filteredBenefits
      };
      
      const { success, error } = await productService.addProduct(productToAdd);
      
      if (success) {
        setStatusMessage({
          type: 'success',
          message: 'Produto adicionado com sucesso!'
        });
        
        // Resetar formulário
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Infoproduto',
          image: '',
          benefits: ['', '', '', ''],
          salesUrl: ''
        });
        
        // Atualizar lista e voltar para visualização
        onAddProduct();
        onCancel();
      } else {
        setStatusMessage({
          type: 'error',
          message: `Erro ao adicionar produto: ${error?.message || 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      setStatusMessage({
        type: 'error',
        message: 'Ocorreu um erro ao adicionar o produto. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Adicionar Novo Produto</h2>
        <p className="text-gray-600">
          Preencha as informações abaixo para adicionar um novo produto à lista de recomendados.
        </p>
      </div>
      
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
              <option value="Ferramenta">Ferramenta</option>
              <option value="Template">Template</option>
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
            placeholder="Descreva brevemente o produto (máximo 150 caracteres)"
            maxLength={150}
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            URL da Imagem *
          </label>
          <input 
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Ex: https://exemplo.com/imagem.jpg"
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
            URL da Página de Vendas *
          </label>
          <input 
            type="url"
            name="salesUrl"
            value={formData.salesUrl}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Ex: https://exemplo.com/pagina-de-vendas"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Benefícios *
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
                required={index === 0} // Pelo menos 1 benefício obrigatório
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
              isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Adicionando...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Adicionar Produto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductsManagement; 