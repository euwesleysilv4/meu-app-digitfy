import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Instagram, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Affiliate {
  id: string;
  rank: number;
  name: string;
  instagram: string;
  profileImage: string;
  sales: number;
  commission: string;
  isTop5: boolean;
}

const TopAffiliates: React.FC = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        setLoading(true);
        console.log('Buscando afiliados na página pública...');
        
        // Buscar afiliados usando a função RPC
        const { data, error } = await supabase.rpc('list_top_afiliados');
        
        console.log('Resposta do Supabase (página pública):', { data, error });
        
        if (error) {
          throw error;
        }

        // Converter dados do banco para o formato da interface
        const formattedAffiliates = data.map((item: any) => ({
          id: item.id,
          rank: item.posicao,
          name: item.nome,
          instagram: item.instagram,
          profileImage: item.profile_image,
          sales: item.vendas,
          commission: item.comissao_formatada,
          isTop5: item.is_top5
        }));

        console.log('Afiliados formatados:', formattedAffiliates);
        setAffiliates(formattedAffiliates);
      } catch (err: any) {
        setError(err.message);
        console.error('Erro ao buscar afiliados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliates();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Animado */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-12 bg-gradient-to-br from-emerald-50 to-transparent rounded-2xl overflow-hidden"
      >
        <div className="p-8">
          {/* Conteúdo do Header */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col justify-center"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-4"
            >
              <Trophy className="w-8 h-8 text-emerald-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Top Afiliados
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg mb-6"
            >
              Conheça os afiliados que estão revolucionando o mercado digital e gerando resultados extraordinários
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <Trophy className="w-4 h-4 mr-1" />
                <span>Reconhecimento</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-1" />
                <span>Resultados</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          Ocorreu um erro ao carregar os afiliados. Por favor, tente novamente mais tarde.
        </div>
      ) : (
        <>
          {/* Top 5 Afiliados */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12"
          >
            {affiliates.filter(a => a.isTop5).map((affiliate, index) => (
              <motion.div
                key={affiliate.id}
                initial={{ scale: 0.9 }}
                animate={{ scale: affiliate.rank === 1 ? 1.05 : 1 }}
                transition={{ delay: 0.2 * index }}
                className="relative"
              >
                <div className={`
                  ${affiliate.rank === 1 ? 'bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-lg shadow-emerald-100' : 
                    affiliate.rank <= 3 ? 'bg-gradient-to-b from-emerald-50/70 to-white border-2 border-emerald-200 shadow-md shadow-emerald-100/50' : 
                    'bg-white border border-gray-100'}
                  rounded-2xl p-4 h-full
                `}>
                  {affiliate.rank === 1 && (
                    <div className="absolute -top-4 -right-4">
                      <Trophy className="w-10 h-10 text-emerald-500" />
                    </div>
                  )}
                  
                  <div className="flex flex-row items-start gap-4 sm:flex-col sm:items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={affiliate.profileImage}
                        alt={affiliate.name}
                        className={`
                          rounded-full border-4
                          ${affiliate.rank === 1 ? 'w-20 h-20 sm:w-24 sm:h-24 border-emerald-200' : 
                            affiliate.rank <= 3 ? 'w-16 h-16 sm:w-20 sm:h-20 border-emerald-100' : 
                            'w-16 h-16 sm:w-20 sm:h-20 border-gray-100'}
                        `}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:items-center flex-grow">
                      <span className={`
                        inline-block px-3 py-1 rounded-full text-sm font-medium mb-2
                        ${affiliate.rank === 1 ? 'bg-emerald-100 text-emerald-500' : 
                          affiliate.rank <= 3 ? 'bg-emerald-100 text-emerald-600' : 
                          'bg-gray-100 text-gray-600'}
                      `}>
                        {affiliate.rank}º Lugar
                      </span>
                      
                      <h3 className={`font-semibold text-gray-800 ${affiliate.rank === 1 ? 'text-lg' : ''} mb-1 sm:text-center`}>
                        {affiliate.name}
                      </h3>
                      
                      <p className={`mb-2 sm:text-center ${
                        affiliate.rank === 1 ? 'text-emerald-500' : 
                        affiliate.rank <= 3 ? 'text-emerald-600' : 
                        'text-gray-600'
                      }`}>
                        {affiliate.instagram}
                      </p>
                      
                      <p className="text-sm text-gray-500 mb-4 sm:text-center">
                        {affiliate.commission}
                      </p>
                      
                      <a
                        href={`https://instagram.com/${affiliate.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Seguir</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Lista Completa com Paginação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Ranking Completo</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {affiliates.filter(a => !a.isTop5).map((affiliate, index) => (
                <motion.div
                  key={affiliate.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`
                    rounded-xl p-4
                    ${affiliate.rank <= 10 ? 'bg-gradient-to-b from-emerald-50/30 to-white' : 'bg-white'}
                  `}>
                    <div className="flex flex-row items-start gap-4">
                      <div className="flex-shrink-0 relative">
                        <span className="absolute -top-2 -left-2 text-lg font-bold text-gray-400 bg-white w-8 h-8 flex items-center justify-center rounded-full border border-gray-100">
                          {affiliate.rank}º
                        </span>
                        <img
                          src={affiliate.profileImage}
                          alt={affiliate.name}
                          className={`
                            rounded-full border-2
                            ${affiliate.rank <= 10 ? 'w-20 h-20 border-emerald-200' : 'w-20 h-20 border-gray-100'}
                          `}
                        />
                      </div>

                      <div className="flex flex-col flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                              {affiliate.name}
                            </h3>
                            
                            <p className={`${
                              affiliate.rank <= 10 ? 'text-emerald-600' : 'text-gray-600'
                            }`}>
                              {affiliate.instagram}
                            </p>
                          </div>

                          <div className="flex items-center gap-6 mt-2 sm:mt-0">
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Vendas</div>
                              <div className="font-semibold text-gray-800">{affiliate.sales.toLocaleString()}</div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Comissão</div>
                              <div className="font-semibold text-emerald-600">{affiliate.commission}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <a
                            href={`https://instagram.com/${affiliate.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-6 rounded-lg transition-all duration-300"
                          >
                            <Instagram className="w-4 h-4" />
                            <span>Seguir</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:px-6 bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3 sm:mb-0">
                Mostrando {affiliates.length} afiliados
              </p>
              <div className="flex space-x-2">
                <button className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Anterior
                </button>
                <button className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600">
                  Próxima
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default TopAffiliates; 