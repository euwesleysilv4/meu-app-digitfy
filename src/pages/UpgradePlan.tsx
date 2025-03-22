import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, Shield, Zap, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PlanFeatureComparison from '../components/PlanFeatureComparison';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

/**
 * Página de atualização de plano que permite ao usuário visualizar e selecionar diferentes planos
 */
const UpgradePlan: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [showFullComparison, setShowFullComparison] = useState(false);
  
  const currentPlan = profile?.plano || 'gratuito';
  
  // Configuração dos planos disponíveis
  const plans = [
    {
      id: 'gratuito',
      name: 'Free',
      price: 'R$ 0',
      description: 'Acesso básico para experimentar a plataforma',
      icon: <Shield className="w-6 h-6 text-gray-600" />,
      color: 'border-gray-300 bg-white',
      hoverColor: 'hover:border-gray-400',
      buttonColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      features: [
        'Acesso a ferrametas básicas',
        'Estrutura de perfil simples',
        'Grupos de comunidade limitados',
        '5 downloads por mês'
      ]
    },
    {
      id: 'member',
      name: 'Member',
      price: 'R$ 44,90',
      period: 'por mês',
      description: 'Recursos essenciais para afiliados iniciantes',
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50',
      hoverColor: 'hover:border-blue-600',
      buttonColor: 'bg-blue-600 text-white hover:bg-blue-700',
      features: [
        'Acesso a todas ferramentas básicas',
        'Gerador de estrutura de perfil',
        'Grupos exclusivos no WhatsApp',
        '15 downloads por mês',
        'E-books e conteúdos relevantes'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 67,90',
      period: 'por mês',
      description: 'Para afiliados que buscam resultados consistentes',
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50',
      hoverColor: 'hover:border-emerald-600',
      buttonColor: 'bg-emerald-600 text-white hover:bg-emerald-700',
      popular: true,
      features: [
        'Tudo do plano Member',
        'Gerador de storytelling',
        'Mapas mentais exclusivos',
        '50 downloads por mês',
        'Canais exclusivos do Telegram',
        'Suporte prioritário'
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 'R$ 97,90',
      period: 'por mês',
      description: 'Solução completa para afiliados profissionais',
      icon: <Trophy className="w-6 h-6 text-purple-600" />,
      color: 'border-purple-500 bg-purple-50',
      hoverColor: 'hover:border-purple-600',
      buttonColor: 'bg-purple-600 text-white hover:bg-purple-700',
      features: [
        'Tudo do plano Pro',
        'Acesso a todas as ferramentas',
        'Criativos personalizados',
        'Downloads ilimitados',
        'Suporte premium 24/7',
        'Promoção na comunidade'
      ]
    }
  ];
  
  const updateUserPlan = async (planId: string) => {
    if (planId === currentPlan) {
      toast.success('Você já está inscrito nesse plano!');
      return;
    }
    
    setLoading(planId);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plano: planId })
        .eq('id', profile?.id);
        
      if (error) throw error;
      
      await refreshProfile();
      toast.success(`Plano atualizado para ${plans.find(p => p.id === planId)?.name}!`);
      
      // Simulação de redirecionamento para checkout quando não for gratuito
      if (planId !== 'gratuito') {
        toast.success('Em um ambiente real, você seria redirecionado para a página de checkout.');
      }
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Não foi possível atualizar o plano. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };
  
  const handleSelectPlan = (planId: string) => {
    if (planId === 'gratuito') {
      updateUserPlan(planId);
    } else {
      // Aqui você integraria com gateway de pagamento
      // Por enquanto, apenas atualizamos diretamente
      updateUserPlan(planId);
    }
  };
  
  const isPlanDisabled = (planId: string) => {
    return loading !== null && loading !== planId;
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Escolha o plano ideal para você
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Desbloqueie recursos premium e aumente suas chances de sucesso como afiliado digital
          com um de nossos planos avançados.
        </p>
      </motion.div>
      
      {/* Cards de planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`
              relative rounded-lg p-6 border-2 ${plan.color} ${plan.hoverColor} 
              transition-all duration-300 shadow-sm
              ${currentPlan === plan.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            `}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
            )}
            
            <div className="flex items-center mb-4">
              <div className="mr-3">{plan.icon}</div>
              <h3 className="font-bold text-xl">{plan.name}</h3>
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
            </div>
            
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check size={18} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={isPlanDisabled(plan.id)}
              className={`
                w-full py-2 px-4 rounded font-medium transition-colors duration-200
                ${plan.buttonColor}
                ${isPlanDisabled(plan.id) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading === plan.id ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : currentPlan === plan.id ? (
                'Plano Atual'
              ) : (
                'Selecionar Plano'
              )}
            </button>
            
            {currentPlan === plan.id && (
              <div className="text-xs text-center mt-2 text-blue-600 font-medium">
                Você está utilizando este plano
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Botão para mostrar tabela de comparação completa */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowFullComparison(!showFullComparison)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          {showFullComparison ? 'Mostrar comparação resumida' : 'Mostrar comparação completa de recursos'}
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
      
      {/* Tabela de comparação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <h3 className="font-semibold text-lg text-gray-800">Comparação de Recursos</h3>
        </div>
        <div className="p-4">
          <PlanFeatureComparison 
            showAllFeatures={showFullComparison}
            showCurrentPlanHighlight={true}
          />
        </div>
      </motion.div>
      
      {/* Botão de voltar */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-800 font-medium"
        >
          Voltar para o dashboard
        </button>
      </div>
    </div>
  );
};

export default UpgradePlan; 