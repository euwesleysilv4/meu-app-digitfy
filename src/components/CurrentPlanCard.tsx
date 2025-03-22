import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Sparkles, Trophy, ArrowUpRight } from 'lucide-react';
import { UserPlan } from '../lib/supabase';

interface CurrentPlanCardProps {
  currentPlan: UserPlan;
  className?: string;
}

const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ currentPlan, className = '' }) => {
  const navigate = useNavigate();

  // Configuração de informações dos planos
  const planInfo = {
    gratuito: {
      name: 'Free',
      description: 'Acesso básico para experimentar a plataforma',
      icon: <Shield className="w-6 h-6 text-gray-600" />,
      color: 'bg-gray-50 border-gray-200',
      buttonClass: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    member: {
      name: 'Member',
      description: 'Recursos essenciais para afiliados iniciantes',
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      buttonClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
    },
    pro: {
      name: 'Pro',
      description: 'Para afiliados que buscam resultados consistentes',
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200',
      buttonClass: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    },
    elite: {
      name: 'Elite',
      description: 'Solução completa para afiliados profissionais',
      icon: <Trophy className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      buttonClass: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
    }
  };
  
  const plan = planInfo[currentPlan];
  const canUpgrade = currentPlan !== 'elite';
  
  const nextPlan = currentPlan === 'gratuito' 
    ? 'member' 
    : currentPlan === 'member' 
      ? 'pro' 
      : currentPlan === 'pro' 
        ? 'elite' 
        : null;
        
  const nextPlanName = nextPlan ? planInfo[nextPlan].name : null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-lg overflow-hidden shadow-sm ${plan.color} ${className}`}
    >
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="mr-3">{plan.icon}</div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              Plano {plan.name}
            </h3>
            <p className="text-sm text-gray-600">{plan.description}</p>
          </div>
        </div>
        
        {canUpgrade ? (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-gray-600">
              Atualize para o plano {nextPlanName} e desbloqueie ainda mais recursos!
            </p>
            <button
              onClick={() => navigate('/upgrade-plan')}
              className={`w-full py-2 px-4 rounded text-sm font-medium text-white flex items-center justify-center ${plan.buttonClass}`}
            >
              Atualizar meu plano
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700 flex items-start">
              <div className="flex-shrink-0 mr-2 mt-0.5">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Você já possui o plano mais completo!</p>
                <p className="mt-1">Aproveite todos os recursos premium disponíveis.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CurrentPlanCard; 