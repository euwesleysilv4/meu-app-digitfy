import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Info, 
  ChevronRight,
  LockKeyhole,
  Calendar,
  BarChart3,
  Hash
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions, FeatureKey, featureNames } from '../services/permissionService';

type PermissionCategoryType = {
  title: string;
  icon: React.ElementType;
  features: FeatureKey[];
};

const PlanPermissions: React.FC = () => {
  const { profile } = useAuth();
  const { 
    hasAccess: hasFeatureAccess, 
    userPlan, 
    getUpgradeMessage,
    getTrendRushLimit,
    getDownloadLimit,
    hasUnlimitedDownloads,
    hasUnlimitedTrendRush
  } = usePermissions();
  
  const currentPlan = userPlan;
  const planTitle = {
    gratuito: 'Plano Gratuito',
    member: 'Plano Member',
    pro: 'Plano Pro',
    elite: 'Plano Elite'
  }[currentPlan];

  const permissionCategories: PermissionCategoryType[] = [
    {
      title: 'Ferramentas',
      icon: BarChart3,
      features: [
        'whatsappGenerator',
        'socialProofGenerator',
        'profileStructureGenerator',
        'hashtagGenerator',
        'persuasiveCopyGenerator',
        'customCreatives',
        'ltvFunnel',
        'usefulSites',
        'notificationSimulator',
        'platformComparison',
        'trendRush',
        'digitalGames',
        'storytellingGenerator',
        'orderBumpGenerator'
      ]
    },
    {
      title: 'Comunidade',
      icon: Calendar,
      features: [
        'whatsappGroups',
        'discordServers',
        'telegramChannels',
        'promoteCommunity'
      ]
    },
    {
      title: 'Aprendizado',
      icon: Hash,
      features: [
        'freeCourses',
        'relevantContent',
        'ebooks',
        'mindMaps',
        'salesStrategy',
        'profileStructure',
        'freePacks',
        'learningChallenges'
      ]
    },
    {
      title: 'Afiliados',
      icon: Calendar,
      features: [
        'topAffiliates',
        'bestSellers',
        'mostAffiliates',
        'mostComplete',
        'testimonials'
      ]
    },
    {
      title: 'Serviços de Marketing',
      icon: Calendar,
      features: [
        'viewServices',
        'contractServices',
        'viewServiceRequests',
        'promoteServices',
        'requestServices'
      ]
    },
    {
      title: 'Áreas da Plataforma',
      icon: Calendar,
      features: [
        'homepage',
        'upgradePage',
        'newsSection',
        'helpCenter',
        'referralProgram',
        'recommendedSection',
        'linksSection'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{planTitle}</h1>
        <p className="text-gray-600">
          Confira abaixo seus recursos disponíveis e limites de uso.
        </p>
      </motion.div>

      {/* Limites especiais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-8 border border-emerald-100"
      >
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">Limites de uso do seu plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
              <Calendar className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Downloads mensais</p>
              <p className="text-xl font-semibold text-emerald-600">
                {hasUnlimitedDownloads() ? 'Ilimitado' : `${getDownloadLimit()} downloads/mês`}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Trend Rush (áudios por dia)</p>
              <p className="text-xl font-semibold text-emerald-600">
                {hasUnlimitedTrendRush() ? 'Ilimitado' : `${getTrendRushLimit()} áudios/dia`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de categorias */}
      {permissionCategories.map((category, categoryIndex) => (
        <motion.div
          key={category.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + (categoryIndex * 0.05) }}
          className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <category.icon className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{category.title}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${hasFeatureAccess(feature) ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {hasFeatureAccess(feature) ? (
                    <Check size={16} />
                  ) : (
                    <LockKeyhole size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${hasFeatureAccess(feature) ? 'text-gray-800' : 'text-gray-400'}`}>
                    {featureNames[feature]}
                  </p>
                </div>
                {!hasFeatureAccess(feature) && (
                  <button
                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center font-medium"
                    onClick={() => alert(getUpgradeMessage(feature))}
                  >
                    Upgrade <ChevronRight size={14} />
                  </button>
                )}
                {feature === 'trendRush' && hasFeatureAccess(feature) && (
                  <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full font-medium">
                    {hasUnlimitedTrendRush() ? 'Ilimitado' : `${getTrendRushLimit()} áudios/dia`}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Botão de upgrade */}
      {currentPlan !== 'elite' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <a
            href="/upgrade-plan"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
          >
            Fazer upgrade do meu plano
            <ChevronRight className="ml-2" />
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default PlanPermissions; 