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
import Members from './pages/Members';
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
import BestSellers from './pages/BestSellers';
import MostAffiliates from './pages/MostAffiliates';
import MostComplete from './pages/MostComplete';
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

// Lazy load dos novos componentes
const DashboardTrendRush = lazy(() => import('./pages/dashboard/tools/trend-rush'));
const DashboardServices = lazy(() => import('./pages/dashboard/services/index'));
const ServiceRequests = lazy(() => import('./pages/dashboard/services/requests'));

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session) {
        setIsChecking(false);
        return;
      }
      
      try {
        const { isAdmin, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setIsAdmin(false);
          setIsChecking(false);
          return;
        }
        
        setIsAdmin(isAdmin);
        setIsChecking(false);
        
        if (!isAdmin) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setIsAdmin(false);
        setIsChecking(false);
      }
    };
    
    checkAdminStatus();
  }, [session, navigate]);
  
  // Mostrar um indicador de carregamento enquanto verifica as permissões
  if (loading || isChecking) {
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
  
  // Redirecionar para o dashboard se não for o administrador específico
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
          <p className="text-gray-600 mt-2">
            Você não tem permissões para acessar esta área. Apenas o administrador autorizado pode acessar.
          </p>
          <p className="text-gray-500 mt-4 text-sm">
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    );
  }
  
  // Renderizar as rotas de administrador se estiver autorizado
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
        {/* Rotas públicas com Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="reset-password" element={<ResetPassword />} />
          
          {/* Redirecionar para dashboard se já estiver logado */}
          {session && (
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          )}
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
          <Route path="affiliate/best-sellers" element={<BestSellers />} />
          <Route path="affiliate/most-affiliates" element={<MostAffiliates />} />
          <Route path="affiliate/most-complete" element={<MostComplete />} />
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
          <Route path="services" element={
            <FeatureGate featureKey="viewServices">
              <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div></div>}>
                <DashboardServices />
              </Suspense>
            </FeatureGate>
          } />
          <Route path="services/requests" element={
            <PermissionRoute featureKey="viewServiceRequests">
              <Suspense fallback={<div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div></div>}>
                <ServiceRequests />
              </Suspense>
            </PermissionRoute>
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
          <Route path="admin/user-permissions" element={
            <AdminRoute>
              <UserPermissionsPage />
            </AdminRoute>
          } />
          <Route path="admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Route>

        {/* Redirecionar qualquer rota não encontrada para a página inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
