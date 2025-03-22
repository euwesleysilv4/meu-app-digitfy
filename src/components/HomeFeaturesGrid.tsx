import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePermissions, featureNames, FeatureKey } from '../services/permissionService';
import { 
  TrendingUp, MessageSquare, GraduationCap, Users, Flame,
  Globe, Wrench, Lightbulb, Megaphone, HelpCircle, UserPlus,
  Link, ThumbsUp
} from 'lucide-react';

// Mapeamento de ícones para cada categoria de recurso
const categoryIcons = {
  tools: <Wrench className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
  learning: <GraduationCap className="h-5 w-5" />,
  affiliate: <Flame className="h-5 w-5" />,
  services: <MessageSquare className="h-5 w-5" />,
  news: <Lightbulb className="h-5 w-5" />,
  help: <HelpCircle className="h-5 w-5" />,
  referral: <UserPlus className="h-5 w-5" />,
  recommended: <ThumbsUp className="h-5 w-5" />,
  links: <Link className="h-5 w-5" />,
  trendRush: <TrendingUp className="h-5 w-5" />,
};

// Definição de categorias de recursos
const featureCategories = {
  tools: {
    title: 'Ferramentas',
    description: 'Acesse ferramentas para otimizar seu trabalho',
    icon: categoryIcons.tools,
    color: 'bg-emerald-500',
    path: '/tools',
    features: [
      'whatsappGenerator', 'socialProofGenerator', 'profileStructureGenerator',
      'hashtagGenerator', 'persuasiveCopyGenerator', 'storytellingGenerator',
      'orderBumpGenerator', 'customCreatives', 'ltvFunnel',
      'usefulSites', 'notificationSimulator', 'platformComparison',
      'digitalGames'
    ] as FeatureKey[]
  },
  trendRush: {
    title: 'Trend Rush',
    description: 'Descubra os áudios mais virais do momento',
    icon: categoryIcons.trendRush,
    color: 'bg-purple-500',
    path: '/tools/trend-rush',
    features: ['trendRush'] as FeatureKey[]
  },
  affiliate: {
    title: 'Área do Afiliado',
    description: 'Informações e recursos para afiliados',
    icon: categoryIcons.affiliate,
    color: 'bg-amber-500',
    path: '/affiliate',
    features: [
      'topAffiliates', 'bestSellers', 'mostAffiliates', 
      'mostComplete', 'testimonials'
    ] as FeatureKey[]
  },
  learning: {
    title: 'Área de Aprendizado',
    description: 'Conteúdos educativos para seu desenvolvimento',
    icon: categoryIcons.learning,
    color: 'bg-blue-500',
    path: '/learning',
    features: [
      'freeCourses', 'relevantContent', 'ebooks', 'mindMaps',
      'salesStrategy', 'profileStructure', 'freePacks', 'learningChallenges'
    ] as FeatureKey[]
  },
  community: {
    title: 'Comunidade',
    description: 'Conecte-se com outros profissionais',
    icon: categoryIcons.community,
    color: 'bg-green-500',
    path: '/community',
    features: [
      'whatsappGroups', 'discordServers', 'telegramChannels'
    ] as FeatureKey[]
  },
  services: {
    title: 'Serviços de Marketing',
    description: 'Encontre profissionais e serviços de qualidade',
    icon: categoryIcons.services,
    color: 'bg-indigo-500',
    path: '/services',
    features: [
      'viewServices', 'contractServices', 'requestServices'
    ] as FeatureKey[]
  },
  news: {
    title: 'Novidades',
    description: 'Confira as últimas atualizações e sugestões',
    icon: categoryIcons.news,
    color: 'bg-yellow-500',
    path: '/news',
    features: ['newsSection'] as FeatureKey[]
  },
  help: {
    title: 'Central de Ajuda',
    description: 'Suporte e recursos de ajuda',
    icon: categoryIcons.help,
    color: 'bg-red-500',
    path: '/help',
    features: ['helpCenter'] as FeatureKey[]
  },
  referral: {
    title: 'Indique e Ganhe',
    description: 'Convide amigos e receba recompensas',
    icon: categoryIcons.referral,
    color: 'bg-pink-500',
    path: '/referral',
    features: ['referralProgram'] as FeatureKey[]
  },
  recommended: {
    title: 'Recomendados',
    description: 'Produtos e serviços recomendados',
    icon: categoryIcons.recommended,
    color: 'bg-cyan-500',
    path: '/recommended',
    features: ['recommendedSection'] as FeatureKey[]
  },
  links: {
    title: 'Links',
    description: 'Links úteis para seu negócio',
    icon: categoryIcons.links,
    color: 'bg-teal-500',
    path: '/links',
    features: ['linksSection'] as FeatureKey[]
  },
};

interface HomeFeaturesGridProps {
  showAll?: boolean;
}

const HomeFeaturesGrid: React.FC<HomeFeaturesGridProps> = ({ showAll = false }) => {
  const { hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();

  // Verificar quais categorias o usuário pode acessar
  const accessibleCategories = Object.entries(featureCategories).filter(([_, category]) => {
    // Se showAll for true, mostrar todas as categorias
    if (showAll) return true;
    
    // Verificar se o usuário tem acesso a pelo menos um recurso da categoria
    return category.features.some(feature => hasAccess(feature));
  });

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessibleCategories.map(([key, category], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            onClick={() => navigate(category.path)}
          >
            <div className="flex items-start p-5 cursor-pointer">
              <div className={`${category.color} p-3 rounded-xl text-white mr-4 flex-shrink-0`}>
                {category.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{category.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                
                {/* Status do acesso para categorias parcialmente desbloqueadas */}
                {!showAll && category.features.some(feature => !hasAccess(feature)) && (
                  <div className="mt-2 text-xs">
                    <span className="text-amber-600 font-medium">
                      {userPlan === 'gratuito' ? 'Acesso parcial no plano gratuito' : 'Mais recursos disponíveis em planos superiores'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Convite para fazer upgrade se usuário tiver plano gratuito */}
      {userPlan === 'gratuito' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-emerald-800">Seu plano gratuito inclui diversos recursos!</h3>
              <p className="text-emerald-700 mt-1">
                Aproveite ao máximo e considere fazer upgrade para desbloquear tudo.
              </p>
            </div>
            <button
              onClick={() => navigate('/upgrade-plan')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Megaphone className="h-4 w-4" />
              Ver Planos
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomeFeaturesGrid; 