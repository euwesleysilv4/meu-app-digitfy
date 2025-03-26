import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Zap, 
  Mail, 
  Phone, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Coluna 1 - Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                <Zap size={20} className="text-white" />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-white tracking-tight">DigitFy</span>
                <span className="text-xs text-gray-400 ml-0.5">.com.br</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mt-2">
              Plataforma dedicada ao compartilhamento de conhecimentos e recursos 
              para profissionais do marketing digital e vendas.
            </p>
            <div className="pt-2">
              <p className="text-sm text-gray-400 flex items-center">
                <Heart size={16} className="mr-2 text-emerald-400" />
                Feito com dedicação no Brasil
              </p>
            </div>
          </div>
          
          {/* Coluna 2 - Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/mapas-mentais" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Mapas Mentais
                </Link>
              </li>
              <li>
                <Link to="/estrategias-vendas" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Estratégias de Vendas
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Coluna 3 - Contato */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <Mail size={16} className="text-emerald-400 mr-2 mt-0.5" />
                <span className="text-gray-400">contato@digitalfy.com</span>
              </li>
              <li className="flex items-start">
                <Phone size={16} className="text-emerald-400 mr-2 mt-0.5" />
                <span className="text-gray-400">(11) 9999-8888</span>
              </li>
            </ul>
          </div>
          
          {/* Coluna 4 - Redes Sociais */}
          <div>
            <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
            <div className="flex space-x-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-emerald-500 text-white p-2 rounded-full transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Linha do Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} DigitalFy. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/termos" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 