import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Instagram, Music } from 'lucide-react';
import TrendRushList from '../../components/TrendRush/TrendRushList';
import { usePermissions } from '../../services/permissionService';
import { useNavigate } from 'react-router-dom';

const TrendRush: React.FC = () => {
  const [currentPlatform, setCurrentPlatform] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const { userPlan, getTrendRushLimit } = usePermissions();
  const audioLimit = getTrendRushLimit();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabeçalho com título e descrição */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-gray-800">Trend Rush</h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Descubra os áudios mais virais do momento para usar em seus conteúdos. 
          Acompanhe as tendências do Instagram e TikTok para criar conteúdo relevante e atrativo.
        </p>
      </motion.div>

      {/* Informação sobre o limite para plano gratuito */}
      {userPlan === 'gratuito' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-medium text-amber-800 text-lg">Limite do plano gratuito:</h3>
              <p className="text-amber-700">
                Você tem acesso a apenas <span className="font-bold">{audioLimit} áudios em tendência por dia</span>. 
                <button 
                  onClick={() => navigate('/upgrade-plan')}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium underline"
                >
                  Faça upgrade para ver mais!
                </button>
              </p>
            </div>
          </div>
          <div className="mt-3 bg-white rounded-lg p-3 border border-amber-100">
            <div className="flex items-center text-amber-800">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <span className="text-sm font-medium whitespace-nowrap">{audioLimit}/20</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Plano Member oferece 20 áudios por dia</p>
          </div>
        </motion.div>
      )}
      
      {/* Exibir mensagem também para outros planos */}
      {(userPlan === 'member' || userPlan === 'pro') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-medium text-emerald-800">Seu plano {userPlan} inclui:</h3>
              <p className="text-emerald-700">
                Acesso a <span className="font-bold">{audioLimit} áudios</span> em tendência por dia. 
                <button 
                  onClick={() => navigate('/upgrade-plan')}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Upgrade para Elite = Áudios ilimitados!
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filtros de plataforma */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 flex flex-wrap gap-3"
      >
        <button
          onClick={() => setCurrentPlatform('all')}
          className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors ${
            currentPlatform === 'all'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Todas as plataformas
        </button>
        <button
          onClick={() => setCurrentPlatform('instagram')}
          className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors ${
            currentPlatform === 'instagram'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Instagram className="h-4 w-4" />
          Instagram Reels
        </button>
        <button
          onClick={() => setCurrentPlatform('tiktok')}
          className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors ${
            currentPlatform === 'tiktok'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Music className="h-4 w-4" />
          TikTok
        </button>
      </motion.div>

      {/* Componente de lista de áudios */}
      <TrendRushList platform={currentPlatform} />
    </div>
  );
};

export default TrendRush; 