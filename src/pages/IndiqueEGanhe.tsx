import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Gift, Users, CheckCircle } from 'lucide-react';

const IndiqueEGanhe = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6"
    >
      {/* Título Centralizado com Ícone */}
      <div className="flex flex-col items-center justify-center mb-8">
        <Share2 size={40} className="text-emerald-600 mb-2" />
        <h1 className="text-3xl font-bold text-emerald-600 text-center">Indique e Ganhe</h1>
      </div>

      {/* Descrição */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8">
        <p className="text-sm text-gray-600 text-center">
          Indique a Digitalfy para seus amigos e ganhe recompensas incríveis! Compartilhe seu link exclusivo e comece a ganhar hoje mesmo.
        </p>
      </div>

      {/* Passos para Indicação */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Passo 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <Users size={24} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-600">Passo 1</h3>
          </div>
          <p className="text-gray-600">
            Compartilhe seu link exclusivo com amigos, colegas ou em suas redes sociais.
          </p>
        </div>

        {/* Passo 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <CheckCircle size={24} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-600">Passo 2</h3>
          </div>
          <p className="text-gray-600">
            Seus amigos se cadastram na Digitalfy usando seu link.
          </p>
        </div>

        {/* Passo 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <Gift size={24} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-600">Passo 3</h3>
          </div>
          <p className="text-gray-600">
            Ganhe recompensas exclusivas a cada novo usuário indicado.
          </p>
        </div>
      </div>

      {/* Link de Indicação */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mt-8">
        <h2 className="text-2xl font-bold text-emerald-600 mb-4">Seu Link de Indicação</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value="https://digitalfy.com/indique/seusuario"
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Copiar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default IndiqueEGanhe; 