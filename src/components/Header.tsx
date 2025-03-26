import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Zap, 
  BrainCircuit, 
  DollarSign, 
  Mail, 
  Info, 
  LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Verificar se o link está ativo
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  // Links do menu
  const menuLinks = [
    { path: '/', label: 'Início', icon: Zap },
    { path: '/mapas-mentais', label: 'Mapas Mentais', icon: BrainCircuit },
    { path: '/estrategias-vendas', label: 'Estratégias de Vendas', icon: DollarSign },
    { path: '/sobre', label: 'Sobre', icon: Info },
    { path: '/contato', label: 'Contato', icon: Mail },
  ];
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
              <Zap size={20} className="text-white transition-all duration-300" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent tracking-tight transition-all duration-300 group-hover:scale-105">DigitFy</span>
              <span className="text-xs text-gray-400 ml-0.5">.com.br</span>
            </div>
          </Link>
          
          {/* Menu para telas maiores */}
          <nav className="hidden md:flex items-center space-x-6">
            {menuLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    active 
                      ? 'text-emerald-600 bg-emerald-50 font-medium'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Botão de login */}
          <div className="hidden md:block">
            <Link 
              to="/auth" 
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              <span>Entrar</span>
              <LogIn size={18} />
            </Link>
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-emerald-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Menu mobile expandido */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white border-t border-gray-100"
        >
          <div className="px-4 py-3 space-y-1">
            {menuLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-3 rounded-lg transition-all ${
                    active 
                      ? 'text-emerald-600 bg-emerald-50 font-medium'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <Link 
              to="/auth" 
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-3 rounded-lg mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Entrar na Plataforma</span>
              <LogIn size={18} />
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header; 