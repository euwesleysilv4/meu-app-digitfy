import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ajuste o caminho conforme sua estrutura
import { motion } from 'framer-motion';
import { Flame, Clock, Star, Play } from 'lucide-react';
import ChallengeStepPagination from '../components/ChallengeStepPagination';

const LearningChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Buscar desafios do Supabase ao carregar o componente
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Função para buscar desafios
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      // Buscar desafios ativos usando a view
      const { data, error } = await supabase
        .from('vw_complete_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setChallenges(data);
    } catch (err) {
      console.error('Erro ao buscar desafios:', err);
      setError('Não foi possível carregar os desafios. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Bloquear scroll quando modal estiver aberto
  useEffect(() => {
    if (selectedChallenge) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedChallenge]);

  const cardVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'Iniciante': return <Star className="text-green-600 mr-2" size={18} />;
      case 'Intermediário': return <Star className="text-yellow-600 mr-2" size={18} />;
      case 'Avançado': return <Star className="text-red-600 mr-2" size={18} />;
      default: return <Star className="text-gray-600 mr-2" size={18} />;
    }
  };

  // Converter para o formato esperado pelo componente ChallengeStepPagination
  const convertChallengeToStepFormat = (challenge) => {
    if (!challenge || !challenge.steps || !challenge.step_details) {
      return [];
    }
    
    return challenge.steps.map((step, index) => ({
      title: step,
      content: challenge.step_details[index] || ''
    }));
  };

  // Renderizar o estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600">Carregando desafios...</p>
        </div>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-700 mb-2">Ocorreu um erro</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchChallenges}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8 justify-center"
        >
          <Flame className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
            Desafios de Crescimento
          </h1>
        </motion.div>

        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum desafio disponível no momento.</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {challenges.map((challenge) => (
              <motion.div 
                key={challenge.id}
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
              >
                {/* Imagem */}
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={challenge.image_url} 
                    alt={challenge.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${getDifficultyColor(challenge.difficulty)}
                    `}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-12">
                    {challenge.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{challenge.duration}</span>
                    </div>
                    <div className="flex items-center">
                      {getDifficultyIcon(challenge.difficulty)}
                      <span>{challenge.difficulty}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedChallenge(challenge)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Play size={18} className="mr-2" />
                    Iniciar Desafio
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal do Desafio */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <ChallengeStepPagination
            steps={convertChallengeToStepFormat(selectedChallenge)}
            title={selectedChallenge.title}
            onClose={() => setSelectedChallenge(null)}
          />
        </div>
      )}
    </div>
  );
};

export default LearningChallenges; 