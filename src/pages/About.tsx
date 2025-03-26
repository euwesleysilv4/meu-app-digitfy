import React from 'react';
import { motion } from 'framer-motion';
import { Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-32 flex items-center justify-center">
          <Info className="h-16 w-16 text-white" />
        </div>
        
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Sobre Nós</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Somos uma plataforma dedicada ao crescimento profissional e ao compartilhamento de 
              conhecimento no campo do marketing digital e vendas. Nossa missão é fornecer recursos 
              valiosos para profissionais em diferentes estágios de suas carreiras.
            </p>
            
            <p className="text-gray-600 mb-4">
              Através da nossa plataforma, disponibilizamos materiais educacionais, estratégias 
              práticas e ferramentas inovadoras que ajudam nossos usuários a se destacarem em 
              suas áreas de atuação.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">O que oferecemos:</h2>
            
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Estratégias de vendas baseadas em metodologias comprovadas</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Mapas mentais para visualização e organização de conceitos</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Recursos educacionais atualizados e relevantes</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Comunidade de profissionais dedicados ao aprendizado contínuo</span>
              </li>
            </ul>
            
            <div className="mt-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Entre em contato</h3>
              <p className="text-gray-600 mb-4">
                Se você tiver dúvidas ou quiser saber mais sobre nossos serviços, 
                não hesite em entrar em contato conosco.
              </p>
              <Link 
                to="/contato" 
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700"
              >
                <span>Página de contato</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About; 