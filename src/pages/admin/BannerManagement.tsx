import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';
import BannerManager from '../../admin/components/BannerManager';

const BannerManagement: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center mb-6">
          <div className="bg-emerald-500 text-white p-3 rounded-lg shadow-md mr-4">
            <ImageIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gerenciamento de Banners
            </h1>
            <p className="text-gray-600 mt-1">
              Configure os banners promocionais exibidos no dashboard dos usuários
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações Importantes</h2>
          
          <div className="text-gray-600 space-y-2 text-sm">
            <p>
              Os banners serão exibidos no topo do dashboard para todos os usuários logados.
            </p>
            <p>
              <span className="font-medium">Dimensões recomendadas:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">Desktop:</span> 1200x250 pixels
              </li>
              <li>
                <span className="font-medium">Mobile:</span> 640x250 pixels
              </li>
            </ul>
            <p>
              <span className="font-medium">Dicas:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Você pode definir um período de exibição para os banners, ideal para promoções temporárias.
              </li>
              <li>
                A ordem de exibição (menor número = maior prioridade) determina qual banner será mostrado caso haja múltiplos banners ativos.
              </li>
              <li>
                Utilize URLs completas para as imagens (começando com http:// ou https://).
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <BannerManager />
    </div>
  );
};

export default BannerManagement; 