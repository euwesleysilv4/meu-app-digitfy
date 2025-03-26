import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Upgrade from './pages/Upgrade';
import Affiliate from './pages/Affiliate';
import Learning from './pages/Learning';
import Community from './pages/Community';
import News from './pages/News';
import Tools from './pages/Tools';
import Links from './pages/Links';
import Members from './pages/members/Members';
import Help from './pages/Help';
import Share from './pages/Share';
import RecommendedProducts from './pages/RecommendedProducts';
import Auth from './pages/Auth/Auth';
import ResetPassword from './pages/Auth/ResetPassword';
import Profile from './pages/profile/Profile';
import WhatsAppLinkGenerator from './pages/WhatsAppLinkGenerator';
import SocialProofGenerator from './pages/SocialProofGenerator';
import ProfileStructureGenerator from './pages/ProfileStructureGenerator';
import HashtagGenerator from './pages/HashtagGenerator';
import PersuasiveCopyGenerator from './pages/PersuasiveCopyGenerator';
import CustomCreatives from './pages/CustomCreatives';
import LTVFunnel from './pages/LTVFunnel';
import UsefulSites from './pages/UsefulSites';
import NotificationSimulator from './pages/NotificationSimulator';
import PlatformComparison from './pages/PlatformComparison';
import TopAffiliates from './pages/TopAffiliates';
import FreeCourses from './pages/FreeCourses';
import RelevantContent from './pages/RelevantContent';
import EbooksPdfs from './pages/EbooksPdfs';
import MindMaps from './pages/MindMaps';
import SalesStrategy from './pages/SalesStrategy';
import ProfileStructure from './pages/ProfileStructure';
import WhatsAppGroups from './pages/WhatsAppGroups';
import DiscordServers from './pages/DiscordServers';
import PromoteCommunity from './pages/PromoteCommunity';
import Suggestions from './pages/Suggestions';
import ReportIssue from './pages/ReportIssue';
import PromoteService from './pages/members/PromoteService';
import RequestService from './pages/members/RequestService';
import TrendRush from './pages/TrendRush';
import DigitalGames from './pages/DigitalGames';
import FreePacks from './pages/FreePacks';
import StorytellingGenerator from './pages/StorytellingGenerator';
import OrderBumpGenerator from './pages/OrderBumpGenerator';
import LearningChallenges from './pages/LearningChallenges';
import TelegramChannels from './pages/TelegramChannels';
import AffiliateTestimonials from './pages/AffiliateTestimonials';
import Feed from './pages/Feed';
import UpgradePlans from './pages/UpgradePlans';
import { useAuth } from './contexts/AuthContext';
import UserPermissionsPage from './pages/admin/UserPermissions';
import { userService } from './services/userService';
import AdminDashboard from './pages/admin/Dashboard';
import UpgradePlan from './pages/UpgradePlan';
import FeatureGate from './components/FeatureGate';
import AvailableFeatures from './components/AvailableFeatures';
import PlanPermissions from './components/PlanPermissions';
import { usePermissions } from './services/permissionService';
import SubmitProduct from './pages/SubmitProduct';
import Dashboard from './pages/Dashboard';
import AdminSettings from './pages/admin/Settings';
import ProductsManagement from './pages/admin/ProductsManagement';
import AdminContent from './pages/admin/Content';
import AdminTools from './pages/admin/Tools';
import AdminEbooks from './pages/admin/Ebooks';
import EbookSuggestions from './pages/admin/EbookSuggestions';
import AdminMindMaps from './pages/admin/MindMaps';
import AdminSalesStrategies from './pages/admin/SalesStrategies';
import AdminFreePacks from './pages/admin/FreePacks';
import PublicLayout from './components/PublicLayout';
import TrendRushAdmin from './pages/admin/TrendRushAdmin';
import TopAfiliadosAdmin from './pages/admin/TopAfiliados';
import TestimonialGalleryAdmin from './pages/admin/TestimonialGallery';
import CommunityManagement from './pages/admin/CommunityManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import { NovidadesAdmin } from './pages/admin/NovidadesAdmin';
import PlayersManagement from './pages/admin/PlayersManagement';
import TutorialVideosPage from './pages/admin/tutorial-videos';
import BannerManagement from './pages/admin/BannerManagement';
import ChallengesAdmin from './pages/admin/ChallengesAdmin';
import RepairPlansPage from './pages/admin/RepairPlans';
import AffiliateVideos from './pages/admin/AffiliateVideos';

// Lazy load dos novos componentes
const DashboardTrendRush = lazy(() => import('./pages/dashboard/tools/trend-rush'));
const AffiliateProductsAdmin = lazy(() => import('../app/admin/affiliate-products/AffiliateProductsAdmin'));

// Imports temporários para as páginas que ainda serão criadas
const MindMapPageTemp = () => <div>Mapas Mentais</div>;
const AboutTemp = () => <div>Sobre Nós</div>;
const ContactTemp = () => <div>Contato</div>;

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  // Redirecionar para a página de login se não estiver autenticado
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  // Renderizar as rotas protegidas se estiver autenticado
  return <>{children}</>;
};

// Componente para rotas de administrador específico
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session) {
        navigate('/auth');
        return;
      }

      try {
        const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('AdminRoute: Erro ao verificar status de administrador:', error);
          setError('Erro ao verificar permissões de administrador');
          setIsAdmin(false);
          return;
        }

        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setError('Você não tem permissões de administrador para acessar esta página');
        }
      } catch (err) {
        console.error('AdminRoute: Exceção ao verificar status de administrador:', err);
        setError('Erro ao verificar suas permissões');
        setIsAdmin(false);
      }
    };
    
    if (!loading) {
      checkAdminStatus();
    }
  }, [session, loading, navigate]);
  
  // Mostra loading enquanto verifica
  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  // Redireciona para login se não houver sessão
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  // Se não for admin ou houver erro, mostra mensagem e redireciona
  if (!isAdmin || error) {
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
          <p className="text-gray-600 mt-2">{error || 'Você não tem permissões de administrador para acessar esta página'}</p>
          <p className="text-gray-500 mt-4 text-sm">
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    );
  }
  
  // Se chegou aqui, é admin e pode acessar a rota
  return <>{children}</>;
};

// Componente para rotas com verificação de permissão específica
const PermissionRoute = ({ children, featureKey }: { children: React.ReactNode, featureKey: string }) => {
  const { profile, loading } = useAuth();
  const { hasAccess } = usePermissions();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      const hasPermission = hasAccess(featureKey as any);
      console.log(`Verificando permissão para ${featureKey}:`, hasPermission);
      
      if (!hasPermission) {
        navigate('/dashboard/upgrade-plan');
      }
      
      setIsChecking(false);
    }
  }, [loading, hasAccess, featureKey, navigate]);
  
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

function App() {
  const { session } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas com Layout normal (login/cadastro) */}
        <Route path="/" element={<Layout />}>
          <Route path="auth" element={<Auth />} />
          <Route path="reset-password" element={<ResetPassword />} />
          
          {/* Redirecionar para dashboard se já estiver logado */}
          {session && (
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          )}
          
          {/* Rota inicial para usuários não logados dentro do layout principal */}
          {!session && (
            <Route index element={<Home />} />
          )}
        </Route>

        {/* Rotas públicas com PublicLayout - apenas para páginas totalmente públicas que não precisam do Layout principal */}
        <Route element={<PublicLayout />}>
          {/* Removido rota index para não conflitar com a nova rota home dentro do Layout */}
          <Route path="sobre" element={<AboutTemp />} />
          <Route path="contato" element={<ContactTemp />} />
          <Route path="mapas-mentais/:id?" element={<MindMapPageTemp />} />
          <Route path="estrategias-vendas/:id?" element={<SalesStrategy />} />
        </Route>

        {/* Rotas protegidas com Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="upgrade" element={<UpgradePlans />} />
          <Route path="upgrade-plan" element={<UpgradePlan />} />
          <Route path="feature-test" element={
            <div className="container mx-auto p-8">
              <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Teste de Recursos por Plano</h1>
              <p className="text-gray-600 mb-8">Esta página exibe diferentes recursos com base no seu plano atual para fins de teste.</p>
              
              {/* Plano Gratuito */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-gray-300 rounded-full mr-2"></div>
                  Recursos do Plano Gratuito
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">WhatsApp Generator</h3>
                    <FeatureGate featureKey="whatsappGenerator">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Hashtag Generator</h3>
                    <FeatureGate featureKey="hashtagGenerator">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Sites Úteis</h3>
                    <FeatureGate featureKey="usefulSites">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                </div>
              </div>
              
              {/* Plano Member */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-blue-400 rounded-full mr-2"></div>
                  Recursos do Plano Member
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Social Proof Generator</h3>
                    <FeatureGate featureKey="socialProofGenerator">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Discord Servers</h3>
                    <FeatureGate featureKey="discordServers">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Top Affiliates</h3>
                    <FeatureGate featureKey="topAffiliates">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                </div>
              </div>
              
              {/* Plano Pro */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full mr-2"></div>
                  Recursos do Plano Pro
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Storytelling Generator</h3>
                    <FeatureGate featureKey="storytellingGenerator">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Custom Creatives</h3>
                    <FeatureGate featureKey="customCreatives">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Telegram Channels</h3>
                    <FeatureGate featureKey="telegramChannels">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                </div>
              </div>
              
              {/* Plano Elite */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-purple-500 rounded-full mr-2"></div>
                  Recursos Exclusivos do Plano Elite
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Order Bump Generator</h3>
                    <FeatureGate featureKey="orderBumpGenerator">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Promote Community</h3>
                    <FeatureGate featureKey="promoteCommunity">
                      <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                        <p>✓ Disponível no seu plano</p>
                      </div>
                    </FeatureGate>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
                    <h3 className="font-medium mb-2 text-gray-700">Downloads Ilimitados</h3>
                    <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                      <p>✓ Disponível apenas no plano Elite</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ver Permissões Detalhadas */}
              <div className="mt-12 text-center">
                <Link 
                  to="/plan-permissions" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                >
                  Ver Todas as Permissões do Meu Plano
                </Link>
              </div>
            </div>
          } />
          <Route path="affiliate" element={<Affiliate />} />
          <Route path="affiliate/top" element={<TopAffiliates />} />
          <Route path="learning" element={<Learning />} />
          <Route path="learning/free-courses" element={<FreeCourses />} />
          <Route path="learning/relevant-content" element={<RelevantContent />} />
          <Route path="learning/ebooks" element={
            <FeatureGate featureKey="ebooks">
              <EbooksPdfs />
            </FeatureGate>
          } />
          <Route path="learning/mind-maps" element={
            <FeatureGate featureKey="mindMaps">
              <MindMaps />
            </FeatureGate>
          } />
          <Route path="learning/sales-strategy" element={
            <FeatureGate featureKey="salesStrategy">
              <SalesStrategy />
            </FeatureGate>
          } />
          <Route path="learning/profile-structure" element={<ProfileStructure />} />
          <Route path="learning/free-packs" element={<FreePacks />} />
          <Route path="learning/challenges" element={
            <FeatureGate featureKey="learningChallenges">
              <LearningChallenges />
            </FeatureGate>
          } />
          <Route path="community" element={<Community />} />
          <Route path="community/whatsapp" element={<WhatsAppGroups />} />
          <Route path="community/discord" element={
            <FeatureGate featureKey="discordServers">
              <DiscordServers />
            </FeatureGate>
          } />
          <Route path="community/promote" element={
            <FeatureGate featureKey="promoteCommunity">
              <PromoteCommunity />
            </FeatureGate>
          } />
          <Route path="community/telegram" element={
            <FeatureGate featureKey="telegramChannels">
              <TelegramChannels />
            </FeatureGate>
          } />
          <Route path="news" element={<News />} />
          <Route path="news/suggestions" element={<Suggestions />} />
          <Route path="news/report-issue" element={<ReportIssue />} />
          <Route path="tools" element={<Tools />} />
          <Route path="links" element={<Links />} />
          <Route path="members" element={<Members />} />
          <Route path="help" element={<Help />} />
          <Route path="share" element={<Share />} />
          <Route path="recommended" element={<RecommendedProducts />} />
          <Route path="submit-product" element={
            <FeatureGate featureKey="recommendedSection">
              <SubmitProduct />
            </FeatureGate>
          } />
          <Route path="profile" element={<Profile />} />
          <Route path="plan-permissions" element={<PlanPermissions />} />
          <Route path="whatsapp-generator" element={<WhatsAppLinkGenerator />} />
          <Route path="social-proof-generator" element={
            <FeatureGate featureKey="socialProofGenerator">
              <SocialProofGenerator />
            </FeatureGate>
          } />
          <Route path="profile-structure-generator" element={
            <FeatureGate featureKey="profileStructureGenerator">
              <ProfileStructureGenerator />
            </FeatureGate>
          } />
          <Route path="hashtag-generator" element={
            <FeatureGate featureKey="hashtagGenerator">
              <HashtagGenerator />
            </FeatureGate>
          } />
          <Route path="persuasive-copy" element={
            <FeatureGate featureKey="persuasiveCopyGenerator">
              <PersuasiveCopyGenerator />
            </FeatureGate>
          } />
          <Route path="tools/custom-creatives" element={
            <FeatureGate featureKey="customCreatives">
              <CustomCreatives />
            </FeatureGate>
          } />
          <Route path="tools/ltv-funnel" element={
            <FeatureGate featureKey="ltvFunnel">
              <LTVFunnel />
            </FeatureGate>
          } />
          <Route path="tools/useful-sites" element={
            <FeatureGate featureKey="usefulSites">
              <UsefulSites />
            </FeatureGate>
          } />
          <Route path="tools/notification-simulator" element={
            <FeatureGate featureKey="notificationSimulator">
              <NotificationSimulator />
            </FeatureGate>
          } />
          <Route path="tools/commission-calculator" element={
            <FeatureGate featureKey="platformComparison">
              <PlatformComparison />
            </FeatureGate>
          } />
          <Route path="tools/trend-rush" element={
            <FeatureGate featureKey="trendRush">
              <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div></div>}>
                <DashboardTrendRush />
              </Suspense>
            </FeatureGate>
          } />
          <Route path="tools/digital-games" element={
            <FeatureGate featureKey="digitalGames">
              <DigitalGames />
            </FeatureGate>
          } />
          <Route path="members/promote-service" element={
            <FeatureGate featureKey="promoteServices">
              <PromoteService />
            </FeatureGate>
          } />
          <Route path="members/request-service" element={
            <FeatureGate featureKey="requestServices">
              <RequestService />
            </FeatureGate>
          } />
          <Route path="tools/storytelling-generator" element={
            <FeatureGate featureKey="storytellingGenerator">
              <StorytellingGenerator />
            </FeatureGate>
          } />
          <Route path="tools/order-bump-generator" element={
            <FeatureGate featureKey="orderBumpGenerator">
              <OrderBumpGenerator />
            </FeatureGate>
          } />
          <Route path="affiliate/testimonials" element={
            <FeatureGate featureKey="testimonials">
              <AffiliateTestimonials />
            </FeatureGate>
          } />
          <Route path="feed" element={<Feed />} />
          <Route path="admin" element={<ProtectedRoute><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
          <Route path="admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="admin/user-permissions" element={<AdminRoute><UserPermissionsPage /></AdminRoute>} />
          <Route path="admin/permissions" element={<AdminRoute><UserPermissionsPage /></AdminRoute>} />
          <Route path="admin/products" element={<AdminRoute><ProductsManagement /></AdminRoute>} />
          <Route path="admin/tutorial-videos" element={<AdminRoute><TutorialVideosPage /></AdminRoute>} />
          <Route path="admin/affiliate-products" element={
            <AdminRoute>
              <Suspense fallback={<div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>}>
                <AffiliateProductsAdmin />
              </Suspense>
            </AdminRoute>
          } />
          <Route path="admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
          <Route path="admin/tools" element={<AdminRoute><AdminTools /></AdminRoute>} />
          <Route path="admin/ebooks" element={<AdminRoute><AdminEbooks /></AdminRoute>} />
          <Route path="admin/ebook-suggestions" element={<AdminRoute><EbookSuggestions /></AdminRoute>} />
          <Route path="admin/mind-maps" element={<AdminRoute><AdminMindMaps /></AdminRoute>} />
          <Route path="admin/sales-strategies" element={<AdminRoute><AdminSalesStrategies /></AdminRoute>} />
          <Route path="admin/free-packs" element={<AdminRoute><AdminFreePacks /></AdminRoute>} />
          <Route path="admin/trend-rush" element={<AdminRoute><TrendRushAdmin /></AdminRoute>} />
          <Route path="admin/top-afiliados" element={<AdminRoute><TopAfiliadosAdmin /></AdminRoute>} />
          <Route path="admin/top-affiliates" element={<AdminRoute><TopAfiliadosAdmin /></AdminRoute>} />
          <Route path="admin/testimonial-gallery" element={<AdminRoute><TestimonialGalleryAdmin /></AdminRoute>} />
          <Route path="admin/testimonials" element={<AdminRoute><TestimonialGalleryAdmin /></AdminRoute>} />
          <Route path="admin/community-management" element={<AdminRoute><CommunityManagement /></AdminRoute>} />
          <Route path="admin/service-management" element={<AdminRoute><ServiceManagement /></AdminRoute>} />
          <Route path="admin/novidades" element={<AdminRoute><NovidadesAdmin /></AdminRoute>} />
          <Route path="admin/players" element={<AdminRoute><PlayersManagement /></AdminRoute>} />
          <Route path="admin/banner-management" element={<AdminRoute><BannerManagement /></AdminRoute>} />
          <Route path="admin/challenges" element={<AdminRoute><ChallengesAdmin /></AdminRoute>} />
          <Route path="admin/affiliate-videos" element={<AdminRoute><AffiliateVideos /></AdminRoute>} />
          <Route path="admin/users" element={<UserPermissionsPage />} />
          <Route path="admin/repair-plans" element={<RepairPlansPage />} />
        </Route>
        
        {/* Redirecionamento para garantir compatibilidade com o link no Dashboard */}
        <Route path="/dashboard/dashboard/admin/testimonial-gallery" element={<Navigate to="/dashboard/admin/testimonial-gallery" replace />} />
        <Route path="/dashboard/dashboard/admin/community-management" element={<Navigate to="/dashboard/admin/community-management" replace />} />

        {/* Redirecionar qualquer rota não encontrada para a página inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
