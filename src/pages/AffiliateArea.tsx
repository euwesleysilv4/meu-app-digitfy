import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Award, TrendingUp, Shield, Upload, Lock, AlertCircle, ShoppingBag } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AffiliateFormModal from '../components/AffiliateFormModal';
import { AffiliateProduct, affiliateProductService } from '../../app/services/affiliateProductService';

const AffiliateArea: React.FC = () => {
  const { hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // Verificar permissão para enviar dados de afiliados
  const canSendAffiliateData = hasAccess('sendAffiliateData');
  const isFreePlan = userPlan === 'gratuito';
  
  // Log para diagnóstico
  console.log("Plano atual:", userPlan);
  console.log("Pode enviar dados de afiliados:", canSendAffiliateData);
  console.log("É plano gratuito:", isFreePlan);
  
  // Carregar produtos de afiliados
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const { data, error } = await affiliateProductService.listActiveProducts();
        
        if (error) {
          console.error('Erro ao buscar produtos de afiliados:', error);
          setProductsError('Não foi possível carregar os produtos.');
        } else {
          setProducts(data || []);
          setProductsError(null);
        }
      } catch (err) {
        console.error('Erro ao carregar produtos de afiliados:', err);
        setProductsError('Ocorreu um erro ao carregar os produtos.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);
  
  const handleSendAffiliateData = () => {
    if (!canSendAffiliateData) {
      navigate('/upgrade-plan');
      return;
    }
    
    setShowAffiliateModal(true);
  };
  
  const handleCloseAffiliateModal = () => {
    setShowAffiliateModal(false);
  };

  const affiliateStats = [
    { 
      icon: Award, 
      label: 'Top Afiliados', 
      value: '15 Afiliados',
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <UsersIcon className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl font-bold text-gray-800">Área do Afiliado</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Botão para enviar produtos para afiliação */}
          <button
            onClick={() => {
              if (canSendAffiliateData) {
                setShowAffiliateModal(true);
                // Predefinir o tipo como produto_afiliado
                // Esta configuração deve ser gerenciada pelo componente AffiliateFormModal
              } else {
                navigate('/upgrade-plan');
              }
            }}
            disabled={isLoading}
            className={`w-full md:w-auto px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              canSendAffiliateData
                ? 'bg-indigo-500 hover:bg-indigo-600 hover:scale-105 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : canSendAffiliateData ? (
              <ShoppingBag size={18} />
            ) : (
              <Lock size={18} />
            )}
            <span>Enviar Dados de Produto</span>
          </button>
          
          {/* Botão original para enviar dados de afiliados */}
          <button
            onClick={handleSendAffiliateData}
            disabled={isLoading}
            className={`w-full md:w-auto px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
              canSendAffiliateData
                ? 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : canSendAffiliateData ? (
              <Upload size={18} />
            ) : (
              <Lock size={18} />
            )}
            <span>Enviar Dados de Afiliados</span>
          </button>
        </div>
      </div>
      
      {/* Componente AffiliateFormModal */}
      <AffiliateFormModal 
        isOpen={showAffiliateModal} 
        onClose={handleCloseAffiliateModal} 
      />
      
      {/* Alerta para usuários no plano gratuito - garantimos que sempre aparece para planos gratuitos */}
      {isFreePlan && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="bg-amber-200 text-amber-600 p-2 rounded-lg">
              <AlertCircle size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 mb-1">Recurso Disponível no Plano Member</h3>
              <p className="text-amber-700 mb-4">
                Com o plano Member você pode enviar dados de afiliados e conseguir mais visibilidade para seus produtos.
              </p>
              
              <button 
                onClick={() => navigate('/upgrade-plan')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-fit"
              >
                <Upload size={16} />
                Fazer Upgrade para Member
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {affiliateStats.map((stat) => (
          <div 
            key={stat.label}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`${stat.color} w-10 h-10`} />
              <span className="text-xl font-bold text-gray-700">{stat.value}</span>
            </div>
            <h3 className="text-gray-600 font-medium">{stat.label}</h3>
          </div>
        ))}
      </div>

      {/* Mensagem para usuários sem permissão (mantemos a versão original também) */}
      {isFreePlan && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="text-amber-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-amber-800">Recurso Bloqueado</h3>
              <p className="text-amber-700 text-sm">
                Faça upgrade para o plano Member ou superior para poder enviar dados de afiliados.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-emerald-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-emerald-800 mb-4">
          Seu Desempenho
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-600 mb-2">Total de Vendas</h3>
            <p className="text-2xl font-bold text-emerald-600">R$ 75.320,00</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-600 mb-2">Comissões</h3>
            <p className="text-2xl font-bold text-emerald-600">R$ 22.596,00</p>
          </div>
        </div>
      </div>

      {/* Seção de Produtos para Afiliados */}
      <div className="mt-8">
        <div className="flex items-center mb-6">
          <ShoppingBag className="text-emerald-500 mr-3" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Produtos para Divulgação</h2>
        </div>

        {isLoadingProducts ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : productsError ? (
          <div className="p-6 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-red-800">Erro ao carregar produtos</h3>
                <p className="text-red-700">{productsError}</p>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-amber-800">Nenhum produto disponível</h3>
                <p className="text-amber-700">Não há produtos disponíveis para divulgação no momento.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
              >
                {/* Imagem do produto */}
                <div 
                  className="h-48 w-full overflow-hidden bg-gray-100 bg-center bg-cover" 
                  style={{ backgroundImage: `url(${product.image_url || product.image})` }}
                >
                  {/* Badge de destaque */}
                  {product.featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                      Destaque
                    </div>
                  )}
                  
                  {/* Badge de plataforma */}
                  {(product.vendor_name || product.platform) && (
                    <div className="absolute top-3 left-3 bg-white/90 text-emerald-600 text-xs font-medium py-1 px-2 rounded-full">
                      {product.vendor_name || product.platform || "Hotmart"}
                    </div>
                  )}
                </div>
                
                {/* Conteúdo do produto */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  {/* Benefícios */}
                  {product.benefits && product.benefits.length > 0 && (
                    <ul className="mt-3 space-y-1 mb-4">
                      {product.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-emerald-500 font-bold mr-2">✓</span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                      {product.benefits.length > 3 && (
                        <li className="text-xs text-gray-500 italic pl-5">
                          +{product.benefits.length - 3} outros benefícios
                        </li>
                      )}
                    </ul>
                  )}
                  
                  {/* Preço, comissão e categoria */}
                  <div className="flex items-center justify-between mt-4 mb-5">
                    <div className="flex flex-col">
                      <span className="text-emerald-600 font-bold">{product.price_display}</span>
                      {product.commission_rate && (
                        <span className="text-xs text-emerald-500">
                          Comissão: {product.commission_rate}%
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  
                  {/* Botão para acessar */}
                  <a 
                    href={product.affiliate_link || product.sales_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto flex items-center justify-center w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    <span>Tornar-se Afiliado</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateArea; 