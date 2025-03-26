import { useMemo } from 'react';
import { UserPlan } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Tipos para chaves de recursos
export type FeatureKey = 
  // Ferramentas
  | 'whatsappGenerator'
  | 'socialProofGenerator' 
  | 'profileStructureGenerator'
  | 'hashtagGenerator'
  | 'persuasiveCopyGenerator'
  | 'customCreatives'
  | 'ltvFunnel'
  | 'usefulSites'
  | 'notificationSimulator'
  | 'platformComparison'
  | 'trendRush'
  | 'digitalGames'
  | 'storytellingGenerator'
  | 'orderBumpGenerator'
  // Comunidade
  | 'whatsappGroups'
  | 'discordServers'
  | 'promoteCommunity'
  | 'telegramChannels'
  // Aprendizado
  | 'freeCourses'
  | 'relevantContent'
  | 'ebooks'
  | 'mindMaps'
  | 'salesStrategy'
  | 'profileStructure'
  | 'freePacks'
  | 'learningChallenges'
  | 'submitLearningContent'
  // Afiliados
  | 'topAffiliates'
  | 'bestSellers'
  | 'mostAffiliates'
  | 'mostComplete'
  | 'testimonials'
  | 'sendAffiliateData'
  // Serviços de Marketing Digital
  | 'viewServices'
  | 'contractServices'  
  | 'viewServiceRequests'
  | 'promoteServices'
  | 'requestServices'
  | 'featuredServiceListing'  // Nova chave para destaque na divulgação de serviços
  // Outras áreas
  | 'homepage'
  | 'upgradePage'
  | 'newsSection'
  | 'helpCenter'
  | 'referralProgram'
  | 'recommendedSection'
  | 'featuredProductListing' // Nova chave para destaque em produtos recomendados
  | 'linksSection'
  // Limites e Suporte
  | 'maxDownloads'
  | 'accessToSupport'
  | 'customizationOptions'
  | 'trendRushLimit';

// Nome amigável para cada feature
export const featureNames: Record<FeatureKey, string> = {
  // Ferramentas
  whatsappGenerator: 'Gerador de Links WhatsApp',
  socialProofGenerator: 'Gerador de Provas Sociais',
  profileStructureGenerator: 'Gerador de Estrutura de Perfil',
  hashtagGenerator: 'Gerador de Hashtags',
  persuasiveCopyGenerator: 'Gerador de Textos Persuasivos',
  customCreatives: 'Criativos Personalizados',
  ltvFunnel: 'Funil LTV',
  usefulSites: 'Sites Úteis',
  notificationSimulator: 'Simulador de Notificações',
  platformComparison: 'Comparação de Plataformas',
  trendRush: 'Análise de Tendências',
  digitalGames: 'Jogos Digitais',
  storytellingGenerator: 'Gerador de Storytelling',
  orderBumpGenerator: 'Gerador de Order Bump',
  // Comunidade
  whatsappGroups: 'Grupos de WhatsApp',
  discordServers: 'Servidores no Discord',
  promoteCommunity: 'Promoção na Comunidade',
  telegramChannels: 'Canais no Telegram',
  // Aprendizado
  freeCourses: 'Cursos Gratuitos',
  relevantContent: 'Conteúdos Relevantes',
  ebooks: 'E-books e PDFs',
  mindMaps: 'Mapas Mentais',
  salesStrategy: 'Estratégias de Vendas',
  profileStructure: 'Estrutura de Perfil',
  freePacks: 'Pacotes Gratuitos',
  learningChallenges: 'Desafios de Aprendizado',
  submitLearningContent: 'Enviar Conteúdo',
  // Afiliados
  topAffiliates: 'Top Afiliados',
  bestSellers: 'Mais Vendidos',
  mostAffiliates: 'Mais Afiliados',
  mostComplete: 'Mais Completos',
  testimonials: 'Depoimentos',
  sendAffiliateData: 'Enviar Dados de Afiliados',
  // Serviços de Marketing Digital
  viewServices: 'Visualizar Profissionais Disponíveis',
  contractServices: 'Contratar Serviços',
  viewServiceRequests: 'Visualizar Solicitações de Serviços',
  promoteServices: 'Divulgar Serviços',
  requestServices: 'Solicitar Serviços',
  featuredServiceListing: 'Destaque na Divulgação de Serviços',
  // Outras áreas
  homepage: 'Tela Inicial',
  upgradePage: 'Página de Upgrade',
  newsSection: 'Seção de Novidades',
  helpCenter: 'Central de Ajuda',
  referralProgram: 'Indique e Ganhe',
  recommendedSection: 'Seção Recomendados',
  featuredProductListing: 'Destaque em Produtos Recomendados',
  linksSection: 'Seção de Links',
  // Limites específicos
  trendRushLimit: 'Limite de Áudios no Trend Rush',
  // Limites e Suporte
  maxDownloads: 'Limite de Downloads',
  accessToSupport: 'Acesso ao Suporte',
  customizationOptions: 'Opções de Personalização'
};

// Mapeamento de permissões de recursos por plano
export const featurePermissions: Record<UserPlan, Record<FeatureKey, boolean>> = {
  gratuito: {
    // Ferramentas - Tudo liberado conforme solicitado
    whatsappGenerator: true,
    socialProofGenerator: true,
    profileStructureGenerator: true,
    hashtagGenerator: true,
    persuasiveCopyGenerator: true,
    customCreatives: true,
    ltvFunnel: true,
    usefulSites: true,
    notificationSimulator: true,
    platformComparison: true,
    trendRush: true,
    digitalGames: true,
    storytellingGenerator: true,
    orderBumpGenerator: true,
    // Comunidade - Tudo liberado exceto promoção
    whatsappGroups: true,
    discordServers: true,
    promoteCommunity: false,
    telegramChannels: true,
    // Aprendizado - Tudo liberado
    freeCourses: true,
    relevantContent: true,
    ebooks: true,
    mindMaps: true,
    salesStrategy: true,
    profileStructure: true,
    freePacks: true,
    learningChallenges: true,
    submitLearningContent: false,
    // Afiliados - Tudo liberado
    topAffiliates: true,
    bestSellers: true,
    mostAffiliates: true,
    mostComplete: true,
    testimonials: true,
    sendAffiliateData: false,
    // Serviços de Marketing Digital - Limitações específicas
    viewServices: true,       // Pode ver profissionais
    contractServices: true,   // Pode contratar serviços
    viewServiceRequests: false, // Não pode acessar solicitações de serviços
    promoteServices: false,   // Não pode divulgar serviços
    requestServices: true,    // Pode solicitar serviços
    featuredServiceListing: false, // Não tem destaque nos serviços
    // Outras áreas - Tudo liberado
    homepage: true,
    upgradePage: true,
    newsSection: true,
    helpCenter: true,
    referralProgram: true,
    recommendedSection: true,
    featuredProductListing: false, // Não tem destaque em produtos
    linksSection: true,
    // Limites e Suporte
    maxDownloads: true,
    accessToSupport: true,
    customizationOptions: false,
    trendRushLimit: true      // Limite de 10 audios por dia (atualizado)
  },
  member: {
    // Ferramentas
    whatsappGenerator: true,
    socialProofGenerator: true,
    profileStructureGenerator: true,
    hashtagGenerator: true,
    persuasiveCopyGenerator: true,
    customCreatives: false,
    ltvFunnel: true,
    usefulSites: true,
    notificationSimulator: true,
    platformComparison: true,
    trendRush: true,
    digitalGames: true,
    storytellingGenerator: true,
    orderBumpGenerator: true,
    // Comunidade
    whatsappGroups: true,
    discordServers: true,
    promoteCommunity: true,   // Atualizado: Divulgue sua comunidade desbloqueado
    telegramChannels: true,
    // Aprendizado
    freeCourses: true,
    relevantContent: true,
    ebooks: true,
    mindMaps: true,
    salesStrategy: true,
    profileStructure: true,
    freePacks: true,
    learningChallenges: true, // Corrigido: Os desafios devem estar disponíveis para o plano Member
    submitLearningContent: true, // Nova funcionalidade: Enviar Conteúdo na Área de Aprendizado
    // Afiliados
    topAffiliates: true,
    bestSellers: true,
    mostAffiliates: true,
    mostComplete: true,
    testimonials: true,
    sendAffiliateData: true,  // Nova funcionalidade: Enviar Dados de Afiliados
    // Serviços de Marketing Digital
    viewServices: true,
    contractServices: true,
    viewServiceRequests: true,
    promoteServices: false,
    requestServices: true,
    featuredServiceListing: false, // Não tem destaque nos serviços
    // Outras áreas
    homepage: true,
    upgradePage: true,
    newsSection: true,
    helpCenter: true,
    referralProgram: true,
    recommendedSection: true,
    featuredProductListing: false, // Não tem destaque em produtos
    linksSection: true,
    // Limites e Suporte
    maxDownloads: true,
    accessToSupport: true,
    customizationOptions: false,
    trendRushLimit: true
  },
  pro: {
    // Ferramentas - Todas as funções do plano Gratuito e Member
    whatsappGenerator: true,
    socialProofGenerator: true,
    profileStructureGenerator: true,
    hashtagGenerator: true,
    persuasiveCopyGenerator: true,
    customCreatives: true,
    ltvFunnel: true,
    usefulSites: true,
    notificationSimulator: true,
    platformComparison: true,
    trendRush: true,
    digitalGames: true,
    storytellingGenerator: true,
    orderBumpGenerator: true,
    // Comunidade - Todas as funções do plano Gratuito e Member
    whatsappGroups: true,
    discordServers: true,
    promoteCommunity: true,
    telegramChannels: true,
    // Aprendizado - Todas as funções do plano Gratuito e Member
    freeCourses: true,
    relevantContent: true,
    ebooks: true,
    mindMaps: true,
    salesStrategy: true,
    profileStructure: true,
    freePacks: true,
    learningChallenges: true,
    submitLearningContent: true,
    // Afiliados - Todas as funções do plano Gratuito e Member
    topAffiliates: true,
    bestSellers: true,
    mostAffiliates: true,
    mostComplete: true,
    testimonials: true,
    sendAffiliateData: true,
    // Serviços de Marketing Digital - Com novas permissões específicas
    viewServices: true,
    contractServices: true,
    viewServiceRequests: true, // Ver quem está solicitando serviços (já estava correto)
    promoteServices: true,     // Divulgar serviços
    requestServices: true,
    featuredServiceListing: false, // Não tem destaque nos serviços
    // Outras áreas - Todas as funções do plano Gratuito e Member
    homepage: true,
    upgradePage: true,
    newsSection: true,
    helpCenter: true,
    referralProgram: true,
    recommendedSection: true,  // Enviar produtos para a Página de Produtos Recomendados
    featuredProductListing: false, // Não tem destaque em produtos
    linksSection: true,
    // Limites e Suporte
    maxDownloads: true,
    accessToSupport: true,
    customizationOptions: true,
    trendRushLimit: false
  },
  elite: {
    // Ferramentas - Todas as funções do plano Gratuito, Member e Pro
    whatsappGenerator: true,
    socialProofGenerator: true,
    profileStructureGenerator: true,
    hashtagGenerator: true,
    persuasiveCopyGenerator: true,
    customCreatives: true,
    ltvFunnel: true,
    usefulSites: true,
    notificationSimulator: true,
    platformComparison: true,
    trendRush: true,
    digitalGames: true,
    storytellingGenerator: true,
    orderBumpGenerator: true,
    // Comunidade - Todas as funções do plano Gratuito, Member e Pro
    whatsappGroups: true,
    discordServers: true,
    promoteCommunity: true,
    telegramChannels: true,
    // Aprendizado - Todas as funções do plano Gratuito, Member e Pro
    freeCourses: true,
    relevantContent: true,
    ebooks: true,
    mindMaps: true,
    salesStrategy: true,
    profileStructure: true,
    freePacks: true,
    learningChallenges: true,
    submitLearningContent: true,
    // Afiliados - Todas as funções do plano Gratuito, Member e Pro
    topAffiliates: true,
    bestSellers: true,
    mostAffiliates: true,
    mostComplete: true,
    testimonials: true,
    sendAffiliateData: true,
    // Serviços de Marketing Digital - Todas as funções + Destaque
    viewServices: true,
    contractServices: true,
    viewServiceRequests: true,
    promoteServices: true,
    requestServices: true,
    featuredServiceListing: true, // NOVA FUNCIONALIDADE: Destaque na divulgação de serviços
    // Outras áreas - Todas as funções + Destaque em produtos
    homepage: true,
    upgradePage: true,
    newsSection: true,
    helpCenter: true,
    referralProgram: true,
    recommendedSection: true,
    featuredProductListing: true, // NOVA FUNCIONALIDADE: Destaque em produtos recomendados
    linksSection: true,
    // Limites e Suporte - Todos ilimitados
    maxDownloads: true,
    accessToSupport: true,
    customizationOptions: true,
    trendRushLimit: false // Trend Rush ilimitado
  }
};

// Limites de download por plano
export const downloadLimits: Record<UserPlan, number> = {
  gratuito: 5,
  member: 20,
  pro: 50,
  elite: Infinity // Infinity representa ilimitado
};

// Definição do limite de áudios do Trend Rush para cada plano
export const trendRushLimits: Record<UserPlan, number> = {
  gratuito: 5,      // Corrigido: 5 áudios por dia para plano gratuito
  member: 10,       // 10 áudios por dia para plano member
  pro: 15,          // Atualizado: 15 áudios por dia para plano pro (antes era 50)
  elite: Infinity   // Ilimitado para plano elite
};

// Plano mínimo necessário para cada recurso
export const minimumPlans: Record<FeatureKey, UserPlan> = {
  // Ferramentas
  whatsappGenerator: 'gratuito',
  socialProofGenerator: 'member',
  profileStructureGenerator: 'gratuito',
  hashtagGenerator: 'gratuito',
  persuasiveCopyGenerator: 'member',
  customCreatives: 'pro',
  ltvFunnel: 'gratuito',
  usefulSites: 'gratuito',
  notificationSimulator: 'member',
  platformComparison: 'member',
  trendRush: 'member',
  digitalGames: 'member',
  storytellingGenerator: 'gratuito',
  orderBumpGenerator: 'gratuito',
  // Comunidade
  whatsappGroups: 'gratuito',
  discordServers: 'member',
  promoteCommunity: 'elite',
  telegramChannels: 'gratuito',
  // Aprendizado
  freeCourses: 'gratuito',
  relevantContent: 'gratuito',
  ebooks: 'member',
  mindMaps: 'member',
  salesStrategy: 'member',
  profileStructure: 'gratuito',
  freePacks: 'gratuito',
  learningChallenges: 'pro',
  submitLearningContent: 'pro',
  // Afiliados
  topAffiliates: 'member',
  bestSellers: 'gratuito',
  mostAffiliates: 'member',
  mostComplete: 'member',
  testimonials: 'member',
  sendAffiliateData: 'member',
  // Serviços de Marketing Digital
  viewServices: 'gratuito',
  contractServices: 'gratuito',
  viewServiceRequests: 'member',
  promoteServices: 'pro',
  requestServices: 'gratuito',
  featuredServiceListing: 'elite', // Nova funcionalidade exclusiva Elite
  // Outras áreas
  homepage: 'gratuito',
  upgradePage: 'gratuito',
  newsSection: 'gratuito',
  helpCenter: 'gratuito',
  referralProgram: 'gratuito',
  recommendedSection: 'gratuito',
  featuredProductListing: 'elite', // Nova funcionalidade exclusiva Elite
  linksSection: 'gratuito',
  trendRushLimit: 'gratuito',
  // Limites e Suporte
  maxDownloads: 'gratuito',
  accessToSupport: 'member',
  customizationOptions: 'pro'
};

// Mensagens de upgrade para cada recurso
export const upgradeMessages: Record<FeatureKey, string> = {
  // Ferramentas
  whatsappGenerator: 'Este recurso já está disponível no seu plano atual.',
  socialProofGenerator: 'Este recurso já está disponível no seu plano Member.',
  profileStructureGenerator: 'Este recurso já está disponível no seu plano atual.',
  hashtagGenerator: 'Este recurso já está disponível no seu plano atual.',
  persuasiveCopyGenerator: 'Este recurso já está disponível no seu plano Member.',
  customCreatives: 'Atualize para o plano Pro para acessar criativos personalizados.',
  ltvFunnel: 'Este recurso já está disponível no seu plano atual.',
  usefulSites: 'Este recurso já está disponível no seu plano atual.',
  notificationSimulator: 'Este recurso já está disponível no seu plano Member.',
  platformComparison: 'Este recurso já está disponível no seu plano Member.',
  trendRush: 'Este recurso já está disponível no seu plano Member. Limite diário: 15 áudios.',
  digitalGames: 'Este recurso já está disponível no seu plano Member.',
  storytellingGenerator: 'Este recurso já está disponível no seu plano atual.',
  orderBumpGenerator: 'Este recurso já está disponível no seu plano atual.',
  // Comunidade
  whatsappGroups: 'Este recurso já está disponível no seu plano atual.',
  discordServers: 'Este recurso já está disponível no seu plano Member.',
  promoteCommunity: 'Este recurso está disponível apenas no plano Elite. Faça upgrade para ter acesso completo a todos os recursos.',
  telegramChannels: 'Este recurso já está disponível no seu plano atual.',
  // Aprendizado
  freeCourses: 'Este recurso já está disponível no seu plano atual.',
  relevantContent: 'Este recurso já está disponível no seu plano atual.',
  ebooks: 'Este recurso já está disponível no seu plano Member.',
  mindMaps: 'Este recurso já está disponível no seu plano Member.',
  salesStrategy: 'Este recurso já está disponível no seu plano Member.',
  profileStructure: 'Este recurso já está disponível no seu plano atual.',
  freePacks: 'Este recurso já está disponível no seu plano atual.',
  learningChallenges: 'Atualize para o plano Pro para participar de desafios de aprendizado.',
  // Afiliados
  topAffiliates: 'Este recurso já está disponível no seu plano Member.',
  bestSellers: 'Este recurso já está disponível no seu plano atual.',
  mostAffiliates: 'Este recurso já está disponível no seu plano Member.',
  mostComplete: 'Este recurso já está disponível no seu plano Member.',
  testimonials: 'Este recurso já está disponível no seu plano Member.',
  // Serviços de Marketing Digital
  viewServices: 'Este recurso já está disponível no seu plano atual.',
  contractServices: 'Este recurso já está disponível no seu plano atual.',
  viewServiceRequests: 'Este recurso já está disponível no seu plano Member.',
  promoteServices: 'Atualize para o plano Pro para divulgar seus próprios serviços de marketing digital.',
  requestServices: 'Este recurso já está disponível no seu plano atual.',
  // Outras áreas
  homepage: 'Este recurso já está disponível no seu plano atual.',
  upgradePage: 'Este recurso já está disponível no seu plano atual.',
  newsSection: 'Este recurso já está disponível no seu plano atual.',
  helpCenter: 'Este recurso já está disponível no seu plano atual.',
  referralProgram: 'Este recurso já está disponível no seu plano atual.',
  recommendedSection: 'Este recurso já está disponível no seu plano atual.',
  linksSection: 'Este recurso já está disponível no seu plano atual.',
  trendRushLimit: 'Atualize para o plano Pro ou Elite para aumentar o limite de áudios no Trend Rush.',
  // Limites e Suporte
  maxDownloads: 'Atualize seu plano para aumentar seu limite de downloads mensais.',
  accessToSupport: 'Este recurso já está disponível no seu plano Member.',
  customizationOptions: 'Atualize para o plano Pro para personalizar sua experiência.',
  // Novos recursos
  submitLearningContent: 'Atualize para o plano Member ou superior para poder enviar conteúdo para a área de aprendizado.',
  sendAffiliateData: 'Atualize para o plano Member ou superior para poder enviar dados de afiliados.',
  // Novas funcionalidades Elite
  featuredServiceListing: 'Faça upgrade para o plano Elite para ter destaque ao divulgar seus serviços.',
  featuredProductListing: 'Faça upgrade para o plano Elite para ter destaque na página de produtos recomendados.'
};

/**
 * Hook para gerenciar permissões de recursos com base no plano do usuário
 */
export const usePermissions = () => {
  const { profile } = useAuth();
  const userPlan = profile?.plano || 'gratuito';
  
  // Verificar se o usuário tem acesso a um recurso específico
  const hasAccess = (featureKey: FeatureKey): boolean => {
    // Se não tiver um perfil, assumir plano gratuito
    if (!profile) {
      return featurePermissions.gratuito[featureKey];
    }
    
    // Admin tem acesso a tudo
    if (profile.role === 'admin') {
      return true;
    }

    return featurePermissions[userPlan][featureKey];
  };

  // Obter todas as funcionalidades disponíveis para o plano atual
  const getAvailableFeatures = (): FeatureKey[] => {
    if (!profile) {
      return Object.entries(featurePermissions.gratuito)
        .filter(([_, hasAccess]) => hasAccess)
        .map(([key]) => key as FeatureKey);
    }

    if (profile.role === 'admin') {
      return Object.keys(featureNames) as FeatureKey[];
    }

    return Object.entries(featurePermissions[userPlan])
      .filter(([_, hasAccess]) => hasAccess)
      .map(([key]) => key as FeatureKey);
  };

  // Obter limite de downloads de acordo com o plano
  const getDownloadLimit = (): number => {
    return downloadLimits[userPlan];
  };

  // Verificar se o usuário tem downloads ilimitados
  const hasUnlimitedDownloads = (): boolean => {
    return userPlan === 'elite';
  };

  // Obter o limite de áudios do Trend Rush
  const getTrendRushLimit = (): number => {
    return trendRushLimits[userPlan];
  };

  // Verificar se o usuário tem acesso ilimitado ao Trend Rush
  const hasUnlimitedTrendRush = (): boolean => {
    return userPlan === 'elite';
  };

  // Verificar se o usuário tem destaque nos produtos
  const hasFeaturedProducts = (): boolean => {
    return userPlan === 'elite';
  };

  // Verificar se o usuário tem destaque nos serviços
  const hasFeaturedServices = (): boolean => {
    return userPlan === 'elite';
  };

  // Mensagens específicas de upgrade para cada recurso
  const getUpgradeMessage = (featureKey: FeatureKey): string => {
    const featureName = featureNames[featureKey];

    switch (featureKey) {
      case 'promoteServices':
        return `Para divulgar seus serviços, faça upgrade para o plano Pro ou Elite.`;
      case 'viewServiceRequests':
        return `Para ver todas as solicitações de serviços, faça upgrade para o plano Member ou superior.`;
      case 'customCreatives':
        return `Para acessar criativos personalizados, faça upgrade para o plano Pro ou Elite.`;
      case 'trendRush':
        if (userPlan === 'gratuito') {
          return `No plano gratuito você tem acesso a apenas 5 áudios por dia. Faça upgrade para ver mais!`;
        } else if (userPlan === 'member') {
          return `No plano Member você tem acesso a 10 áudios por dia. Faça upgrade para o plano Pro e tenha acesso a 15 áudios por dia!`;
        } else if (userPlan === 'pro') {
          return `No plano Pro você tem acesso a 15 áudios por dia. Faça upgrade para o plano Elite e tenha acesso ilimitado!`;
        }
        return `Faça upgrade para ter acesso a mais áudios por dia!`;
      case 'recommendedSection':
        return `Para enviar produtos para a Página de Produtos Recomendados, faça upgrade para o plano Pro ou Elite.`;
      case 'featuredProductListing':
        return `Para ter destaque na página de produtos recomendados, faça upgrade para o plano Elite.`;
      case 'featuredServiceListing':
        return `Para ter destaque ao divulgar seus serviços, faça upgrade para o plano Elite.`;
      default:
        return `Para acessar ${featureName}, faça upgrade para um plano superior.`;
    }
  };

  return {
    hasAccess,
    getAvailableFeatures,
    getDownloadLimit,
    hasUnlimitedDownloads,
    getTrendRushLimit,
    hasUnlimitedTrendRush,
    hasFeaturedProducts,
    hasFeaturedServices,
    getUpgradeMessage,
    userPlan
  };
};

// Também exportar uma versão não-hook para componentes classe ou contextos
export const hasFeatureAccess = (plan: UserPlan, featureKey: FeatureKey): boolean => {
  const requiredPlan = minimumPlans[featureKey];
  const planOrder: UserPlan[] = ['gratuito', 'member', 'pro', 'elite'];
  const currentPlanIndex = planOrder.indexOf(plan);
  const requiredPlanIndex = planOrder.indexOf(requiredPlan);
  
  return currentPlanIndex >= requiredPlanIndex;
};

export const getFeatureName = (featureKey: FeatureKey): string => {
  return featureNames[featureKey];
};

export const getUpgradeMessage = (currentPlan: UserPlan, featureKey: FeatureKey): string => {
  if (hasFeatureAccess(currentPlan, featureKey)) {
    return 'Este recurso já está disponível no seu plano atual.';
  }
  return upgradeMessages[featureKey];
}; 