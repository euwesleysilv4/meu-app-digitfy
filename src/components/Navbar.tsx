import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Menu, Zap, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }: NavbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Mostrar um indicador de carregamento temporário
      const loadingToast = document.createElement('div');
      loadingToast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      loadingToast.textContent = 'Saindo...';
      document.body.appendChild(loadingToast);
      
      // Executar o logout
      await signOut();
      
      // Remover o toast de carregamento
      try {
        document.body.removeChild(loadingToast);
      } catch (e) {
        console.error('Erro ao remover toast:', e);
      }
      
      // Forçar redirecionamento para a página de login
      console.log('Redirecionando para a página de login após logout');
      
      // Limpar qualquer estado local que possa estar causando problemas
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Usar uma abordagem mais direta para o redirecionamento
      setTimeout(() => {
        window.location.replace('/auth');
      }, 100);
    } catch (error) {
      console.error('Exceção ao fazer logout:', error);
      // Garantir que o usuário seja redirecionado mesmo em caso de erro
      window.location.replace('/auth');
    }
  };

  return (
    <header className="bg-gradient-to-r from-emerald-400 to-teal-500 h-16 sticky top-0 z-50">
      <div className="h-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center space-x-2">
            <button 
              className="md:hidden text-white hover:text-emerald-100 transition-all duration-300 hover:rotate-180"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="hidden sm:block bg-white p-2 rounded-lg transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Zap size={24} className="text-emerald-500 transition-all duration-300 group-hover:text-emerald-600" />
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white tracking-tight transition-all duration-300 group-hover:scale-105">DigitFy</span>
                <span className="text-xs text-white/60 ml-0.5">.com.br</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {session ? (
              // Usuário logado - Mostrar notificações e menu de perfil
              <>
                <button className="text-white hover:text-emerald-100 transition-all duration-300 relative group hover:scale-110">
                  <div className="relative">
                    <Bell size={22} className="transform transition-all duration-300 group-hover:rotate-12" />
                    <span className="absolute -top-1 -right-1 bg-white text-emerald-500 text-xs w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      3
                    </span>
                  </div>
                  <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white text-emerald-600 text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg whitespace-nowrap">
                    Notificações
                  </span>
                </button>
                
                {/* Menu do Usuário */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="relative">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.nome} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User size={20} className="transform transition-all duration-300 group-hover:rotate-12" />
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                        profile?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <span className="font-medium max-w-[100px] truncate">
                      {profile?.nome?.split(' ')[0] || 'Perfil'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fade-in-down">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{profile?.nome}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard/profile');
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 w-full text-left"
                        >
                          <User size={16} className="mr-2" />
                          Meu Perfil
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/dashboard/profile/settings');
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 w-full text-left"
                        >
                          <Settings size={16} className="mr-2" />
                          Configurações
                        </button>
                      </div>
                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut size={16} className="mr-2" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Usuário não logado - Mostrar botões de Login e Criar Conta
              <>
                <Link 
                  to="/auth" 
                  className="text-white hover:text-emerald-100 border border-white/30 hover:border-white px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  Login
                </Link>
                <Link 
                  to="/auth?register=true" 
                  className="bg-white text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-emerald-50 font-medium"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
