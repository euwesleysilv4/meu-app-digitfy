import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Zap, Award, BookOpen, Users, Newspaper, 
  Wrench, Link as LinkIcon, User, HelpCircle, Share2, 
  ShoppingBag, ChevronDown, ChevronRight, X, Shield,
  UserCheck, FileText, Headphones, PieChart, Settings,
  ShieldCheck, BookMarked, UsersRound, Megaphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { session, profile } = useAuth();
  const [isSpecificAdmin, setIsSpecificAdmin] = useState(false);
  const manuallyToggled = useRef(false);
  
  // Usar qualquer uma das props disponíveis (para compatibilidade)
  const sidebarOpen = isOpen || isSidebarOpen || false;
  const setSidebarOpen = (value: boolean) => {
    if (setIsOpen) setIsOpen(value);
    if (setIsSidebarOpen) setIsSidebarOpen(value);
  };
  
  // Verificar se o usuário é o administrador específico
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session) return;
      
      try {
        const { isAdmin } = await userService.isSpecificAdmin();
        setIsSpecificAdmin(isAdmin);
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setIsSpecificAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [session]);
  
  // Prefixo para as rotas baseado no status de autenticação
  const routePrefix = session ? '/dashboard' : '';

  // Verificar qual dropdown deve estar aberto com base na rota atual
  useEffect(() => {
    const path = location.pathname;
    
    // Se o dropdown foi alternado manualmente, não atualize automaticamente
    if (!manuallyToggled.current) {
      if (path.includes('/affiliate')) {
        setActiveDropdown('affiliate');
      } else if (path.includes('/learning')) {
        setActiveDropdown('learning');
      } else if (path.includes('/community')) {
        setActiveDropdown('community');
      } else if (path.includes('/news')) {
        setActiveDropdown('news');
      } else if (path.includes('/tools')) {
        setActiveDropdown('tools');
      } else if (path.includes('/members')) {
        setActiveDropdown('members');
      } else if (path.includes('/admin')) {
        setActiveDropdown('admin');
      } else {
        setActiveDropdown(null);
      }
    }
    
    // Resetar a flag quando a localização muda
    manuallyToggled.current = false;
  }, [location]);

  const toggleDropdown = (dropdown: string, e?: React.MouseEvent) => {
    // Se um evento foi passado, impedir propagação para evitar navegação automática
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    manuallyToggled.current = true;
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  // Verificar se um link está ativo
  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path === '/') {
      return currentPath === '/' || currentPath === '/dashboard';
    }
    return currentPath.includes(path);
  };

  // Componente para os itens do menu
  const MenuItem = ({ 
    to, 
    icon: Icon, 
    label, 
    hasDropdown = false,
    dropdownKey = '',
    onClick = () => {},
    disabled = false
  }: { 
    to: string; 
    icon: React.ElementType; 
    label: string;
    hasDropdown?: boolean;
    dropdownKey?: string;
    onClick?: (e?: React.MouseEvent) => void;
    disabled?: boolean;
  }) => {
    const active = isActive(to);
    const isDropdownActive = activeDropdown === dropdownKey;
    
    // Determinar se o item deve ser clicável ou não para usuários não logados
    const isClickable = session || to === '/' || to === '/auth';
    
    // Componente base do item de menu
    const MenuItemContent = ({ dropdownToggle = false }: { dropdownToggle?: boolean }) => (
      <div className={`
        flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300
        ${active || isDropdownActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-105'}
        ${disabled || !isClickable ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        group relative
      `}>
        <div className="flex items-center space-x-3">
          <Icon size={20} className="flex-shrink-0 transition-all duration-300 group-hover:rotate-12" />
          <span className="font-medium transition-all duration-300 group-hover:translate-x-1">{label}</span>
        </div>
        {hasDropdown && !dropdownToggle && (
          <div className="w-6"></div> /* Espaço para o ícone de dropdown */
        )}
      </div>
    );
    
    // Renderizar como link ou botão dependendo se é um dropdown ou não
    if (hasDropdown) {
      return (
        <div className="relative">
          <Link 
            to={`${routePrefix}${to}`} 
            className="block"
            onClick={(e) => {
              // Prevenir navegação padrão apenas se o usuário não estiver logado
              if (!isClickable) {
                e.preventDefault();
              }
            }}
          >
            <MenuItemContent />
          </Link>
          <div 
            className="absolute top-0 right-3 h-full flex items-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(e);
            }}
          >
            {isDropdownActive ? 
              <ChevronDown size={16} className="transition-transform duration-300 text-current" /> : 
              <ChevronRight size={16} className="transition-transform duration-300 text-current" />
            }
          </div>
        </div>
      );
    }
    
    // Se não for clicável, renderizar como div
    if (!isClickable) {
      return (
        <div className="w-full">
          <MenuItemContent />
        </div>
      );
    }
    
    // Caso contrário, renderizar como link
    return (
      <Link to={`${routePrefix}${to}`} className="block">
        <MenuItemContent />
      </Link>
    );
  };

  // Componente para os itens do submenu
  const SubMenuItem = ({ to, label, disabled = false }: { to: string; label: string; disabled?: boolean }) => {
    const active = isActive(to);
    
    // Determinar se o item deve ser clicável ou não para usuários não logados
    const isClickable = session || to === '/' || to === '/auth';
    
    // Componente base do item de submenu
    const SubMenuItemContent = () => (
      <div className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-300
        ${active ? 'bg-emerald-100 text-emerald-600' : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'}
        ${disabled || !isClickable ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}>
        <span>{label}</span>
      </div>
    );
    
    // Se não for clicável, renderizar como div
    if (!isClickable) {
      return (
        <div className="block">
          <SubMenuItemContent />
        </div>
      );
    }
    
    // Caso contrário, renderizar como link
    return (
      <Link 
        to={`${routePrefix}${to}`} 
        className="block"
        onClick={(e) => {
          // Impedir que o dropdown seja fechado ao clicar em itens específicos
          if (to === '/whatsapp-generator' || 
              to === '/social-proof-generator' || 
              to === '/profile-structure-generator' || 
              to === '/hashtag-generator' || 
              to === '/persuasive-copy') {
            e.stopPropagation();
            manuallyToggled.current = true;
          }
        }}
      >
        <SubMenuItemContent />
      </Link>
    );
  };

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-xl md:shadow-none h-full overflow-y-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center md:hidden p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1 rounded-lg">
                <img 
                  src="/novas%20logos/fav-icon-digitfy-esmeralda.png" 
                  alt="DigitFy" 
                  className="w-7 h-7" 
                />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-emerald-500">DigitFy</span>
                <span className="text-xs text-emerald-500 ml-0.5">.com.br</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-all duration-300 hover:rotate-180"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            <MenuItem to="/" icon={Home} label="Início" />
            <MenuItem to="/upgrade" icon={Zap} label="Faça Upgrade" disabled={!session} />
            <MenuItem to="/recommended" icon={ShoppingBag} label="Recomendados" disabled={!session} />
            
            {/* Dropdown Aprendizado */}
            <div>
              <MenuItem 
                to="/learning" 
                icon={BookMarked} 
                label="Aprenda Aqui" 
                hasDropdown 
                dropdownKey="learning"
                onClick={(e) => toggleDropdown('learning', e)}
                disabled={!session}
              />
              {activeDropdown === 'learning' && (
                <div className="pl-8 mt-1 space-y-1">
                  <SubMenuItem to="/learning/free-courses" label="Conteúdos Gratuitos" disabled={!session} />
                  <SubMenuItem to="/learning/ebooks" label="E-books e PDFs" disabled={!session} />
                  <SubMenuItem to="/learning/mind-maps" label="Mapas Mentais" disabled={!session} />
                  <SubMenuItem to="/learning/sales-strategy" label="Estratégia de Vendas" disabled={!session} />
                  <SubMenuItem to="/learning/free-packs" label="Pacotes Gratuitos" disabled={!session} />
                  <SubMenuItem to="/learning/challenges" label="Desafios" disabled={!session} />
                </div>
              )}
            </div>

            {/* Dropdown Ferramentas */}
            <div>
              <MenuItem 
                to="/tools" 
                icon={Settings} 
                label="Ferramentas" 
                hasDropdown 
                dropdownKey="tools"
                onClick={(e) => toggleDropdown('tools', e)}
                disabled={!session}
              />
              {activeDropdown === 'tools' && (
                <div className="pl-8 mt-1 space-y-1">
                  <SubMenuItem to="/tools/trend-rush" label="Trend Rush" disabled={!session} />
                  <SubMenuItem to="/whatsapp-generator" label="Gerador de Link WhatsApp" disabled={!session} />
                  <SubMenuItem to="/profile-structure-generator" label="Gerador de Estrutura de Perfil" disabled={!session} />
                  <SubMenuItem to="/hashtag-generator" label="Gerador de Hashtags" disabled={!session} />
                  <SubMenuItem to="/persuasive-copy" label="Gerador de Copy Persuasiva" disabled={!session} />
                  <SubMenuItem to="/tools/storytelling-generator" label="Gerador de Storytelling" disabled={!session} />
                  <SubMenuItem to="/tools/order-bump-generator" label="Gerador de Order Bump" disabled={!session} />
                  <SubMenuItem to="/tools/ltv-funnel" label="Funil de LTV" disabled={!session} />
                  <SubMenuItem to="/tools/useful-sites" label="Sites Úteis" disabled={!session} />
                  <SubMenuItem to="/tools/notification-simulator" label="Simulador de Notificações" disabled={!session} />
                  <SubMenuItem to="/tools/commission-calculator" label="Comparador de Plataformas" disabled={!session} />
                </div>
              )}
            </div>
            
            {/* Dropdown Afiliados */}
            <div>
              <MenuItem 
                to="/affiliate" 
                icon={Award} 
                label="Área do Afiliado" 
                hasDropdown 
                dropdownKey="affiliate"
                onClick={(e) => toggleDropdown('affiliate', e)}
                disabled={!session}
              />
              {activeDropdown === 'affiliate' && (
                <div className="pl-8 mt-1 space-y-1">
                  <SubMenuItem to="/affiliate/top" label="Top Afiliados" disabled={!session} />
                  <SubMenuItem to="/affiliate/testimonials" label="Depoimentos" disabled={!session} />
                </div>
              )}
            </div>
                
            {/* Dropdown Comunidade */}
            <div>
              <MenuItem 
                to="/community" 
                icon={UsersRound} 
                label="Comunidade" 
                hasDropdown 
                dropdownKey="community"
                onClick={(e) => toggleDropdown('community', e)}
                disabled={!session}
              />
              {activeDropdown === 'community' && (
                <div className="pl-8 mt-1 space-y-1">
                  <SubMenuItem to="/community/whatsapp" label="Grupos de WhatsApp" disabled={!session} />
                  <SubMenuItem to="/community/discord" label="Servidores Discord" disabled={!session} />
                  <SubMenuItem to="/community/telegram" label="Canais Telegram" disabled={!session} />
                  <SubMenuItem to="/community/promote" label="Divulgue sua Comunidade" disabled={!session} />
                </div>
              )}
            </div>
                
            {/* Dropdown Membros */}
            <div>
              <MenuItem 
                to="/members" 
                icon={UserCheck} 
                label="Serviços" 
                hasDropdown 
                dropdownKey="members"
                onClick={(e) => toggleDropdown('members', e)}
                disabled={!session}
              />
              {activeDropdown === 'members' && (
                <div className="pl-8 mt-1 space-y-1">
                  <SubMenuItem to="/members/promote-service" label="Divulgar Serviço" disabled={!session} />
                  <SubMenuItem to="/members/request-service" label="Solicitar Serviço" disabled={!session} />
                </div>
              )}
            </div>
                
            {/* Dropdown Novidades */}
            <div>
              <MenuItem 
                to="/news" 
                icon={Megaphone} 
                label="Novidades" 
                hasDropdown 
                dropdownKey="news"
                onClick={(e) => toggleDropdown('news', e)}
                disabled={!session}
              />
              {activeDropdown === 'news' && (
                <div className="pl-8 mt-1 space-y-1">
                  <SubMenuItem to="/news/suggestions" label="Sugestões" disabled={!session} />
                  <SubMenuItem to="/news/report-issue" label="Reportar Problema" disabled={!session} />
                </div>
              )}
            </div>
            
            <MenuItem to="/help" icon={Headphones} label="Central de Ajuda" disabled={!session} />
            <MenuItem to="/share" icon={Share2} label="Indique e Ganhe" disabled={!session} />
            
            {/* Menu de administração apenas para o administrador específico */}
            {isSpecificAdmin && (
              <div>
                <MenuItem 
                  to="/admin" 
                  icon={ShieldCheck} 
                  label="Administração" 
                  hasDropdown 
                  dropdownKey="admin"
                  onClick={(e) => toggleDropdown('admin', e)}
                  disabled={!session}
                />
                {activeDropdown === 'admin' && (
                  <div className="pl-8 mt-1 space-y-1">
                    <SubMenuItem to="/admin/user-permissions" label="Permissões de Usuários" disabled={!session} />
                    <SubMenuItem to="/admin/dashboard" label="Painel de Controle" disabled={!session} />
                  </div>
                )}
              </div>
            )}
            
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
