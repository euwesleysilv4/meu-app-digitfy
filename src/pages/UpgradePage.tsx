import React from 'react';
import { Gift } from 'lucide-react';

const UpgradePage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Gift className="mr-4 text-emerald-500" size={40} />
        <h1 className="text-3xl font-bold text-gray-800">Faça Upgrade</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>Conteúdo da página de Upgrade</p>
      </div>
    </div>
  );
};

export default UpgradePage; 