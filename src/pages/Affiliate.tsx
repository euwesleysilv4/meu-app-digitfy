import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Star, BarChart, ArrowRight, Lock, AlertCircle, Send, X, User, Link, DollarSign as DollarIcon, Mail, Instagram } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate, useLocation } from 'react-router-dom';
import AffiliateFormModal from '../components/AffiliateFormModal';

const Affiliate = () => {
  const { userPlan, hasAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const isFreePlan = userPlan === 'gratuito';
  const canSendAffiliateData = hasAccess('sendAffiliateData');
  
  // Estado para controlar o modal
  const [showModal, setShowModal] = useState(false);
  
  // Log para diagnóstico
  console.log("Plano atual na página Affiliate:", userPlan);
  console.log("É plano gratuito:", isFreePlan);
  console.log("Pode enviar dados de afiliados:", canSendAffiliateData);
  
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
  
  const products = [
    {
      name: 'Curso Completo de Marketing Digital',
      platform: 'Hotmart',
      commission: '70%',
      price: 'R$ 997,00',
      earnings: 'R$ 697,90',
      ranking: 4.8,
      sales: 1500,
      category: 'Marketing Digital',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      name: 'Programa Expert em SEO',
      platform: 'Hotmart',
      commission: '60%',
      price: 'R$ 1.497,00',
      earnings: 'R$ 898,20',
      ranking: 4.9,
      sales: 2200,
      category: 'SEO',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      name: 'Mentoria Tráfego Pago',
      platform: 'Eduzz',
      commission: '50%',
      price: 'R$ 2.997,00',
      earnings: 'R$ 1.498,50',
      ranking: 4.7,
      sales: 800,
      category: 'Tráfego Pago',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      name: 'Copywriting Avançado',
      platform: 'Hotmart',
      commission: '65%',
      price: 'R$ 797,00',
      earnings: 'R$ 518,05',
      ranking: 4.8,
      sales: 1200,
      category: 'Copywriting',
      image: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      name: 'Programa de Lançamentos',
      platform: 'Monetizze',
      commission: '55%',
      price: 'R$ 1.997,00',
      earnings: 'R$ 1.098,35',
      ranking: 4.9,
      sales: 950,
      category: 'Marketing Digital',
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&q=80&w=300&h=200'
    }
  ];

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

      {/* Products Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <span className="absolute top-4 right-4 bg-white/90 text-emerald-600 px-3 py-1 rounded-full text-sm">
                {product.platform}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="font-medium">{product.ranking}</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço do Produto:</span>
                  <span className="font-semibold text-gray-900">{product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comissão:</span>
                  <span className="font-semibold text-emerald-600">{product.commission}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ganhos por Venda:</span>
                  <span className="font-bold text-emerald-600">{product.earnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Vendas Totais:</span>
                  <span className="font-semibold text-gray-900">{product.sales}</span>
                </div>
              </div>
              <button 
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Tornar-se Afiliado</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Affiliate;
