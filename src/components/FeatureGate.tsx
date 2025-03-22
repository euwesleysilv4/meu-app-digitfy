import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureKey, usePermissions } from '../services/permissionService';
import { UserPlan } from '../lib/supabase';
import { motion } from 'framer-motion';
import { LockKeyhole, X, ArrowUpRight } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-white rounded-lg p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto text-center"
    >
      <button 
        onClick={() => window.history.back()} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>
      
      <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <LockKeyhole className="h-8 w-8 text-amber-400" />
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-2">Funcionalidade Bloqueada</h2>
      
      <p className="text-gray-600 mb-6">
        {upgradeMessage}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={() => navigate('/upgrade-plan')}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowUpRight size={18} />
          Fazer Upgrade
        </button>
        
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          Voltar
        </button>
      </div>
    </motion.div>
  );
};

export default FeatureGate; 