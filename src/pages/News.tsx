import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowRight, Bell, ThumbsUp, MessageSquare } from 'lucide-react';
import { novidadesService } from '../services/novidadesService';
import { Novidade } from '../types/novidades';
import { NovidadeModal } from '../components/NovidadeModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const News: React.FC = () => {
  const [novidades, setNovidades] = useState<Novidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNovidade, setSelectedNovidade] = useState<Novidade | null>(null);

  useEffect(() => {
    const loadNovidades = async () => {
      try {
        const data = await novidadesService.getNovidadesAtivas();
        setNovidades(data);
      } catch (err) {
        setError('Erro ao carregar novidades');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadNovidades();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles className="text-emerald-600" size={32} />
        <h1 className="text-4xl font-bold text-gray-900">Novidades</h1>
      </motion.div>

      {/* Descrição */}
      <motion.div 
        className="bg-emerald-50/50 rounded-xl p-6 shadow-sm border border-emerald-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-emerald-800 mb-2">
            Fique por Dentro das Atualizações
          </h2>
          <p className="text-emerald-600">
            Acompanhe as últimas atualizações, melhorias e novos recursos da plataforma. 
            Mantemos você informado sobre tudo que está acontecendo para melhorar sua experiência.
          </p>
        </div>
      </motion.div>

      {/* Grid de Novidades */}
      <motion.div 
        className="grid grid-cols-1 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {novidades.map((novidade, index) => (
          <motion.div
            key={novidade.id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            whileHover={{ y: -2 }}
          >
            <div className="md:flex">
              {novidade.imagem_url && (
                <div className="md:w-1/3 h-full">
                  <img 
                    src={novidade.imagem_url} 
                    alt={novidade.titulo}
                    className="w-full h-full object-cover min-h-[200px]"
                  />
                </div>
              )}
              <div className="p-6 md:w-2/3">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-gray-500 text-sm flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {format(new Date(novidade.data_publicacao), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {novidade.titulo}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {novidade.descricao_curta}
                </p>

                <button
                  onClick={() => setSelectedNovidade(novidade)}
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Ler mais <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bell className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">Ative as Notificações</h3>
              <p className="text-emerald-100">Receba alertas sobre novas atualizações</p>
            </div>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-emerald-600 px-6 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center space-x-2">
            <span>Ativar Agora</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>

      {selectedNovidade && (
        <NovidadeModal
          novidade={selectedNovidade}
          onClose={() => setSelectedNovidade(null)}
        />
      )}
    </div>
  );
};

export default News;
