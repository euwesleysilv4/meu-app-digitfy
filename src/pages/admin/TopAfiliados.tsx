import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import TopAfiliadosManager from '../../admin/components/TopAfiliadosManager';

const AdminTopAfiliados: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  Gerenciamento de Top Afiliados
                </h1>
                <p className="text-emerald-50">
                  Configure os afiliados que aparecem na página principal
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <TopAfiliadosManager />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminTopAfiliados; 