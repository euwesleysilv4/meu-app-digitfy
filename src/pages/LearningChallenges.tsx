import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  Star,
  Play,
  Loader
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ChallengeStepPagination from '../components/ChallengeStepPagination';

// Interface para definir um desafio vindo do Supabase
interface Challenge {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  reward: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: string[];
  step_details: string[];
}

const LearningChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Carregar desafios do Supabase quando o componente montar
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Função para buscar desafios do Supabase
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      
      // Buscar apenas desafios ativos da view
      const { data, error } = await supabase
        .from('vw_complete_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log('Desafios carregados:', data);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return <Star className="text-green-600 mr-2" size={18} />;
      case 'Intermediário': return <Star className="text-yellow-600 mr-2" size={18} />;
      case 'Avançado': return <Star className="text-red-600 mr-2" size={18} />;
      default: return <Star className="text-gray-600 mr-2" size={18} />;
    }
  };

  // Converter para o formato esperado pelo componente ChallengeStepPagination
  const convertChallengeToStepFormat = (challenge: Challenge) => {
    return challenge.steps.map((step, index) => ({
      title: step,
      content: challenge.step_details[index] || 'Detalhes não disponíveis'
    }));
  };

  // Estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 mx-auto animate-spin text-emerald-500" />
          <p className="mt-4 text-gray-600">Carregando desafios...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar desafios</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchChallenges}
            className="mt-6 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
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
                      <Clock className="mr-2 text-emerald-500" size={16} />
                      <span>{challenge.duration}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedChallenge(challenge)}
                    className="
                      w-full 
                      bg-emerald-500 
                      text-white 
                      py-3 
                      rounded-lg 
                      flex 
                      items-center 
                      justify-center 
                      hover:bg-emerald-600 
                      transition-colors 
                      duration-300
                    "
                  >
                    <Play className="mr-2" size={20} />
                    Participar do Desafio
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal de Detalhes com Paginação */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedChallenge(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <ChallengeStepPagination 
                title={selectedChallenge.title}
                description={selectedChallenge.description}
                image={selectedChallenge.image_url}
                steps={convertChallengeToStepFormat(selectedChallenge)}
                reward={selectedChallenge.reward}
                onClose={() => setSelectedChallenge(null)}
                difficulty={selectedChallenge.difficulty}
                duration={selectedChallenge.duration}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningChallenges; 