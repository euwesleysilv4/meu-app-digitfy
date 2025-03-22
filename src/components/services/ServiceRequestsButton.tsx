import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../services/permissionService';
import { useAuth } from '../../contexts/AuthContext';

const ServiceRequestsButton: React.FC = () => {
  const navigate = useNavigate();
  const { hasAccess, userPlan } = usePermissions();
  const { profile } = useAuth();
  const [canViewRequests, setCanViewRequests] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  
  // Verificar permissões quando o componente montar ou quando profile/userPlan mudar
  useEffect(() => {
    // Logs para depuração
    console.log("Plano atual no botão:", userPlan);
    console.log("Perfil do usuário:", profile);
    
    // Usar hasAccess para verificar permissão
    const hasServiceRequestsAccess = hasAccess('viewServiceRequests');
    console.log("Tem acesso a solicitações de serviços:", hasServiceRequestsAccess);
    
    setCanViewRequests(hasServiceRequestsAccess);
    setIsCheckingPermissions(false);
  }, [hasAccess, userPlan, profile]);
  
  // Redirecionamento para a página de solicitações de serviços
  const handleClick = () => {
    if (canViewRequests) {
      navigate('/dashboard/services/requests');
    } else {
      // Redirecionar para página de upgrade para usuários sem permissão
      navigate('/dashboard/upgrade-plan');
    }
  };
  
  if (isCheckingPermissions) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-center h-[120px]">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Renderizar versão bloqueada para usuários sem permissão
  if (!canViewRequests) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full bg-white border border-gray-200 rounded-xl p-5 flex items-start opacity-80 hover:opacity-90 transition-all"
        onClick={handleClick}
      >
        <div className="absolute top-3 right-3">
          <div className="bg-amber-100 p-1.5 rounded-full">
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4">
          <Search size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1 line-through decoration-gray-400">
            Solicitações de Serviços
          </h3>
          <p className="text-gray-500 text-sm">
            Veja quem está precisando de serviços de marketing digital
          </p>
          <p className="mt-2 text-xs text-amber-600 font-medium">
            Disponível no plano Member ou superior
          </p>
        </div>
      </motion.button>
    );
  }
  
  // Renderizar versão desbloqueada para usuários com permissão
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md flex items-start transition-all"
    >
      <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4">
        <Search size={24} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">
          Solicitações de Serviços
        </h3>
        <p className="text-gray-500 text-sm">
          Veja quem está precisando de serviços de marketing digital
        </p>
      </div>
    </motion.button>
  );
};

export default ServiceRequestsButton; 