import React, { useState } from 'react';
import { Users as UsersIcon, Award, TrendingUp, Shield, Upload, Lock, AlertCircle } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AffiliateFormModal from '../components/AffiliateFormModal';

const AffiliateArea: React.FC = () => {
  const { hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  
  // Verificar permissão para enviar dados de afiliados
  const canSendAffiliateData = hasAccess('sendAffiliateData');
  const isFreePlan = userPlan === 'gratuito';
  
  // Log para diagnóstico
  console.log("Plano atual:", userPlan);
  console.log("Pode enviar dados de afiliados:", canSendAffiliateData);
  console.log("É plano gratuito:", isFreePlan);
  
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
    },
    { 
      icon: TrendingUp, 
      label: 'Mais Vendidos', 
      value: 'R$ 45.000,00',
      color: 'text-emerald-500'
    },
    { 
      icon: Shield, 
      label: 'Mais Completos', 
      value: '10 Perfis',
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <UsersIcon className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl font-bold text-gray-800">Área do Afiliado</h1>
        </div>
        
        {/* Botão para enviar dados de afiliados */}
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
    </div>
  );
};

export default AffiliateArea; 