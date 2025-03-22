import React from 'react';
import { Check, X, Info } from 'lucide-react';
import { 
  featurePermissions, 
  FeatureKey, 
  featureNames,
  downloadLimits
} from '../services/permissionService';
import { UserPlan } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlanFeatureComparisonProps {
  showCurrentPlanHighlight?: boolean;
  showAllFeatures?: boolean;
  className?: string;
}

/**
 * Componente que mostra uma tabela comparativa dos recursos disponíveis em cada plano.
 */
const PlanFeatureComparison: React.FC<PlanFeatureComparisonProps> = ({
  showCurrentPlanHighlight = true,
  showAllFeatures = true,
  className = ''
}) => {
  const { profile } = useAuth();
  const currentPlan = profile?.plano || 'gratuito';
  
  // Agrupar features por categoria
  const featureCategories: Record<string, FeatureKey[]> = {
    'Ferramentas': [
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
    ],
    'Comunidade': [
      'whatsappGroups',
      'discordServers',
      'promoteCommunity',
      'telegramChannels'
    ],
    'Aprendizado': [
      'freeCourses',
      'relevantContent',
      'ebooks',
      'mindMaps',
      'salesStrategy',
      'profileStructure',
      'freePacks',
      'learningChallenges'
    ],
    'Afiliados': [
      'topAffiliates',
      'bestSellers',
      'mostAffiliates',
      'mostComplete',
      'testimonials'
    ],
    'Limites e Suporte': [
      'maxDownloads',
      'accessToSupport',
      'customizationOptions'
    ]
  };
  
  // Informações de cada plano
  const plans: { id: UserPlan; name: string; color: string }[] = [
    { id: 'gratuito', name: 'Free', color: 'border-gray-300' },
    { id: 'member', name: 'Member', color: 'border-blue-500' },
    { id: 'pro', name: 'Pro', color: 'border-emerald-500' },
    { id: 'elite', name: 'Elite', color: 'border-purple-500' }
  ];
  
  // Renderiza um check ou X com base no acesso à funcionalidade
  const renderAccessStatus = (plan: UserPlan, feature: FeatureKey) => {
    const hasAccess = featurePermissions[plan][feature];
    
    if (feature === 'maxDownloads') {
      const limit = downloadLimits[plan];
      return (
        <span className={`font-medium ${hasAccess ? 'text-green-600' : 'text-red-500'}`}>
          {limit === -1 ? 'Ilimitado' : limit}
        </span>
      );
    }
    
    return hasAccess ? (
      <Check className="h-5 w-5 text-green-600 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-red-500 mx-auto" />
    );
  };
  
  // Filtra as features para mostrar todas ou apenas as mais importantes
  const getFeaturesToShow = (category: string, keys: FeatureKey[]): FeatureKey[] => {
    if (showAllFeatures) return keys;
    
    // Mostra apenas as features mais importantes quando showAllFeatures=false
    const importantFeatures: Record<string, FeatureKey[]> = {
      'Ferramentas': ['whatsappGenerator', 'profileStructureGenerator', 'customCreatives', 'storytellingGenerator'],
      'Comunidade': ['whatsappGroups', 'telegramChannels'],
      'Aprendizado': ['freeCourses', 'ebooks', 'mindMaps'],
      'Afiliados': ['bestSellers', 'topAffiliates'],
      'Limites e Suporte': ['maxDownloads', 'accessToSupport']
    };
    
    return importantFeatures[category] || [];
  };
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 bg-gray-100 text-left w-1/3 text-sm font-semibold text-gray-700 rounded-tl-lg">
              Recursos por Plano
            </th>
            {plans.map((plan) => (
              <th 
                key={plan.id} 
                className={`p-3 text-center font-semibold ${
                  showCurrentPlanHighlight && currentPlan === plan.id 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-gray-100 text-gray-700'
                } ${plan.id === 'elite' ? 'rounded-tr-lg' : ''}`}
              >
                <div className={`
                  text-lg pb-1 border-b-2 ${plan.color} 
                  ${showCurrentPlanHighlight && currentPlan === plan.id ? 'border-emerald-500' : ''}
                `}>
                  {plan.name}
                  {showCurrentPlanHighlight && currentPlan === plan.id && (
                    <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 py-0.5 px-2 rounded-full">
                      Atual
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(featureCategories).map(([category, features]) => {
            const featuresToShow = getFeaturesToShow(category, features);
            if (featuresToShow.length === 0) return null;
            
            return (
              <React.Fragment key={category}>
                <tr>
                  <td 
                    colSpan={5} 
                    className="p-3 bg-gray-50 font-medium text-gray-700 border-t border-gray-200"
                  >
                    {category}
                  </td>
                </tr>
                {featuresToShow.map((feature) => (
                  <tr key={feature} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-gray-700 flex items-center gap-1">
                      {featureNames[feature]}
                      {feature === 'maxDownloads' && (
                        <div className="relative group">
                          <Info 
                            size={16} 
                            className="text-gray-400 cursor-help"
                          />
                          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs p-2 rounded shadow-lg -top-1 left-6 w-48">
                            Número máximo de downloads permitidos por mês
                          </div>
                        </div>
                      )}
                    </td>
                    {plans.map((plan) => (
                      <td 
                        key={`${plan.id}-${feature}`} 
                        className={`p-3 text-center ${
                          showCurrentPlanHighlight && currentPlan === plan.id 
                            ? 'bg-emerald-50' 
                            : ''
                        }`}
                      >
                        {renderAccessStatus(plan.id, feature)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlanFeatureComparison; 