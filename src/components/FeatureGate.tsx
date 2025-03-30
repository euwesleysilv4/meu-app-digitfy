import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureKey, usePermissions } from '../services/permissionService';
import { UserPlan } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LockKeyhole, X, ArrowUpRight, Zap, ChevronLeft } from 'lucide-react';

interface FeatureGateProps {
  /**
   * A chave da funcionalidade que se deseja verificar acesso
   */
  featureKey: FeatureKey;
  
  /**
   * Plano mínimo necessário para acessar o recurso (opcional)
   * Se não for fornecido, o componente usará o mapeamento interno
   */
  minimumPlan?: UserPlan;
  
  /**
   * Conteúdo a ser renderizado se o usuário tiver acesso
   */
  children: React.ReactNode;
  
  /**
   * Conteúdo alternativo a ser renderizado se o usuário não tiver acesso
   * Se não for fornecido, será mostrado um componente padrão de bloqueio
   */
  fallback?: React.ReactNode;
}

/**
 * Componente que controla o acesso a funcionalidades com base no plano do usuário
 */
const FeatureGate: React.FC<FeatureGateProps> = ({ 
  featureKey, 
  minimumPlan, 
  children,
  fallback
}) => {
  const { hasAccess, getUpgradeMessage } = usePermissions();
  const navigate = useNavigate();
  
  // Verifica se o usuário tem acesso à funcionalidade
  const userHasAccess = hasAccess(featureKey);
  
  // Se tiver acesso, renderiza normalmente o conteúdo
  if (userHasAccess) {
    return <>{children}</>;
  }
  
  // Se tiver um conteúdo alternativo, mostra ele
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Obtém a mensagem personalizada de upgrade
  const upgradeMessage = getUpgradeMessage(featureKey);
  
  // Renderiza o componente padrão de bloqueio
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl overflow-hidden"
      >
        {/* Card principal com gradiente */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Faixa decorativa no topo */}
          <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          
          {/* Conteúdo do card */}
          <div className="relative p-8">
            {/* Círculos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full opacity-10 -mt-20 -mr-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-100 rounded-full opacity-10 -mb-10 -ml-10"></div>
            
            {/* Botão para voltar */}
            <button 
              onClick={() => window.history.back()} 
              className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-600 transition-colors p-1"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            
            {/* Ícone principal */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                <LockKeyhole className="h-9 w-9 text-white" />
              </div>
              
              {/* Reflexo/brilho no ícone */}
              <div className="absolute top-3 left-1/2 -translate-x-[14px] w-3 h-3 bg-white opacity-40 rounded-full"></div>
            </div>
            
            {/* Informações sobre o bloqueio */}
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-emerald-800">Funcionalidade Bloqueada</h2>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-2"
              >
                <p className="text-emerald-700 font-medium">
                  {upgradeMessage}
                </p>
              </motion.div>
              
              {/* Botões de ação */}
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/upgrade')}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-md shadow-emerald-100/50 transition-all duration-300 hover:shadow-lg"
                >
                  <Zap size={18} className="animate-pulse" />
                  Fazer Upgrade Agora
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <ChevronLeft size={18} />
                  Voltar
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mensagem informativa abaixo do card */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-emerald-600 mt-4"
        >
          Desbloqueie esta e outras funcionalidades exclusivas 
          atualizando seu plano para Member ou superior
        </motion.p>
      </motion.div>
    </div>
  );
};

export default FeatureGate; 