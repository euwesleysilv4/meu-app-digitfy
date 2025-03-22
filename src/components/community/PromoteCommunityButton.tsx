import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../services/permissionService';
import FeatureGate from '../FeatureGate';

const PromoteCommunityButton: React.FC = () => {
  const navigate = useNavigate();
  const { hasAccess } = usePermissions();
  const canPromoteCommunity = hasAccess('promoteCommunity');

  // Redirecionamento para a página de promoção da comunidade
  const handleClick = () => {
    if (canPromoteCommunity) {
      navigate('/community/promote');
    }
  };

  return (
    <FeatureGate
      featureKey="promoteCommunity"
      fallback={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full bg-white border border-gray-200 rounded-xl p-5 flex items-start opacity-70 hover:opacity-80 transition-all"
          onClick={() => navigate('/upgrade-plan')}
        >
          <div className="absolute top-3 right-3">
            <div className="bg-amber-100 p-1.5 rounded-full">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="bg-green-100 text-green-600 p-3 rounded-xl mr-4">
            <Share2 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1 line-through decoration-gray-400">
              Divulgue sua comunidade
            </h3>
            <p className="text-gray-500 text-sm">
              Promova seu grupo ou canal para outros profissionais
            </p>
            <p className="mt-2 text-xs text-amber-600 font-medium">
              Disponível a partir do plano Member
            </p>
          </div>
        </motion.button>
      }
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md flex items-start transition-all"
      >
        <div className="bg-green-100 text-green-600 p-3 rounded-xl mr-4">
          <Share2 size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">
            Divulgue sua comunidade
          </h3>
          <p className="text-gray-500 text-sm">
            Promova seu grupo ou canal para outros profissionais
          </p>
        </div>
      </motion.button>
    </FeatureGate>
  );
};

export default PromoteCommunityButton; 