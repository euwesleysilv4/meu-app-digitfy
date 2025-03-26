import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Star, BarChart, ArrowRight, Lock, AlertCircle, Send, X, User, Link, DollarSign as DollarIcon, Mail, Instagram } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate, useLocation } from 'react-router-dom';
import AffiliateFormModal from '../components/AffiliateFormModal';
import { AffiliateProduct, affiliateProductService } from '../../app/services/affiliateProductService';

const Affiliate = () => {
  const { userPlan, hasAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const isFreePlan = userPlan === 'gratuito';
  const canSendAffiliateData = hasAccess('sendAffiliateData');
  
  // Estado para controlar o modal
  const [showModal, setShowModal] = useState(false);
  // Estado para armazenar os produtos carregados do banco de dados
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Log para diagnóstico
  console.log("Plano atual na página Affiliate:", userPlan);
  console.log("É plano gratuito:", isFreePlan);
  console.log("Pode enviar dados de afiliados:", canSendAffiliateData);
  
  // Carregar produtos da tabela affiliate_products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        // Usar o serviço para buscar produtos ativos
        const { data, error } = await affiliateProductService.listActiveProducts();
        
        if (error) {
          console.error('Erro ao buscar produtos de afiliados:', error);
          setError('Não foi possível carregar os produtos.');
        } else {
          console.log('Produtos carregados:', data);
          setProducts(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Exceção ao buscar produtos de afiliados:', err);
        setError('Ocorreu um erro ao carregar os produtos.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Verificar se o usuário foi redirecionado da página AffiliateArea
  useEffect(() => {
    if (location.state && location.state.openForm && canSendAffiliateData) {
      setShowModal(true);
      
      // Limpar o estado de navegação para evitar que o formulário seja aberto novamente em recargas da página
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, canSendAffiliateData]);
  
  // Função para abrir o modal
  const handleOpenModal = () => {
    if (!canSendAffiliateData) {
      navigate('/upgrade-plan');
      return;
    }
    setShowModal(true);
  };
  
  // Função para fechar o modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Obter categorias únicas dos produtos
  const categories = [...new Set(products.map(product => product.category))];

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Users className="text-emerald-600" size={32} />
        <h1 className="text-4xl font-bold text-gray-900">Marketplace de Afiliados</h1>
      </motion.div>

      {/* Componente modal de formulário */}
      <AffiliateFormModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />

      {/* Descrição atualizada */}
      <motion.div 
        className="bg-emerald-50/50 rounded-xl p-6 shadow-sm border border-emerald-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-emerald-800 mb-2">
              Oportunidades de Afiliação
            </h2>
            <p className="text-emerald-600">
              Explore produtos digitais de alta conversão e comissões atrativas. 
              Nossa curadoria seleciona os melhores infoprodutos do mercado, 
              permitindo que você construa uma renda recorrente como afiliado.
            </p>
          </div>
          
          {/* Botão para Enviar Dados de Afiliados (bloqueado para plano gratuito) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full md:w-auto md:flex-shrink-0"
          >
            <button 
              onClick={handleOpenModal}
              className={`w-full md:w-auto px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                canSendAffiliateData 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-300'
              }`}
            >
              {canSendAffiliateData ? <Send size={16} /> : <AlertCircle size={16} />}
              <span>Enviar Dados de Afiliados</span>
            </button>
          </motion.div>
        </div>
        
        {/* Alerta para usuários do plano gratuito */}
        {!canSendAffiliateData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3"
          >
            <Lock className="text-amber-500 mt-1" size={18} />
            <p className="text-amber-700 text-sm">
              Para compartilhar dados dos seus afiliados e dos seus produtos é necessário fazer upgrade para o plano Member.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Exibir indicador de carregamento */}
      {isLoadingProducts && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Exibir mensagem de erro */}
      {error && !isLoadingProducts && (
        <div className="p-6 bg-red-50 rounded-xl border border-red-100 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-red-800">Erro ao carregar produtos</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há produtos */}
      {!isLoadingProducts && !error && products.length === 0 && (
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-amber-800">Nenhum produto disponível</h3>
              <p className="text-amber-700">Não há produtos disponíveis para divulgação no momento.</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!isLoadingProducts && !error && products.length > 0 && (
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id || index}
              className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all flex flex-col h-full"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <img 
                  src={product.image_url || product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <span className="absolute top-4 right-4 bg-white/90 text-emerald-600 px-3 py-1 rounded-full text-sm">
                  {product.vendor_name || product.platform || 'Hotmart'}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="font-medium">4.8</span>
                  </div>
                </div>
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Preço do Produto:</span>
                    <span className="font-semibold text-gray-900">{product.price_display}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Comissão:</span>
                    <span className="font-semibold text-emerald-600">{`${product.commission_rate || 50}%`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ganhos por Venda:</span>
                    <span className="font-bold text-emerald-600">
                      {`R$ ${((product.price * (product.commission_rate || 50)) / 100).toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vendas Totais:</span>
                    <span className="font-semibold text-gray-900">-</span>
                  </div>
                </div>
                <a 
                  href={product.affiliate_link || product.sales_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Tornar-se Afiliado</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Affiliate;
