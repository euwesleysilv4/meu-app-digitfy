import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePermissions, getFeatureName } from '../services/permissionService';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface AvailableFeaturesProps {
  maxFeaturesToShow?: number;
  showUpgradeButton?: boolean;
}

/**
 * Componente que exibe os recursos disponíveis no plano atual do usuário
 */
const AvailableFeatures: React.FC<AvailableFeaturesProps> = ({ 
  maxFeaturesToShow = 8,
  showUpgradeButton = true
}) => {
  const { getAvailableFeatures, getCurrentPlan } = usePermissions();
  const navigate = useNavigate();
  
  // Obter recursos disponíveis no plano atual
  const availableFeatures = getAvailableFeatures().slice(0, maxFeaturesToShow);
  const currentPlan = getCurrentPlan();
  
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Recursos Disponíveis</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Seu plano atual <span className="font-semibold text-emerald-600">{currentPlan.toUpperCase()}</span> dá 
            acesso às seguintes ferramentas e conteúdos:
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableFeatures.map((feature) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-gray-800">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>{getFeatureName(feature)}</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {showUpgradeButton && (
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/upgrade-plan')} 
              className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
            >
              Ver todos os planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableFeatures; 