import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Target, 
  Trophy, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  X
} from 'lucide-react';

// Interface para definir uma etapa
interface Step {
  title: string;
  content: string;
}

// Interface para as propriedades do componente
interface ChallengeStepPaginationProps {
  title: string;
  description: string;
  image: string;
  steps: Step[];
  reward: string;
  onClose: () => void;
  difficulty?: string;
  duration?: string;
}

const ChallengeStepPagination: React.FC<ChallengeStepPaginationProps> = ({
  title,
  description,
  image,
  steps,
  reward,
  onClose,
  difficulty,
  duration
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showStepDetails, setShowStepDetails] = useState(true);

  // Resetar o step details ao mudar de etapa
  useEffect(() => {
    setShowStepDetails(true);
  }, [activeStep]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header com imagem e overlay */}
      <div className="relative h-48 md:h-64">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        
        {/* Botão fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
        
        {/* Título e badge */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {difficulty && duration && (
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                {duration}
              </span>
            </div>
          )}
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        </div>
      </div>

      {/* Conteúdo - Paginado */}
      <div className="p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 16rem - 68px)' }}>
        {/* Barra de Progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progresso
            </span>
            <span className="text-sm font-medium text-emerald-600">
              Etapa {activeStep + 1} de {steps.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Descrição - Mostrada apenas na primeira etapa */}
        {activeStep === 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BookOpen className="text-emerald-600 mr-2" size={20} />
              Sobre
            </h3>
            <p className="text-gray-700">{description}</p>
          </div>
        )}
        
        {/* Etapa Atual */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <Target className="text-emerald-600 mr-2" size={20} />
            Etapa {activeStep + 1}: {steps[activeStep].title}
          </h3>
          
          <AnimatePresence mode="wait">
            {showStepDetails && (
              <motion.div
                key={`step-${activeStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-emerald-50 rounded-xl p-5 border border-emerald-100"
              >
                <p className="text-gray-700">
                  {steps[activeStep].content}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Lista de Etapas Compacta */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <CheckCircle className="text-emerald-600 mr-2" size={20} />
            Todas as Etapas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {steps.map((step, index) => (
              <button 
                key={index}
                onClick={() => {
                  setActiveStep(index);
                  setShowStepDetails(false);
                  setTimeout(() => setShowStepDetails(true), 50);
                }}
                className={`
                  p-3 rounded-lg text-left text-sm flex items-center
                  ${index === activeStep 
                    ? 'bg-emerald-100 text-emerald-800 font-medium border border-emerald-200' 
                    : index < activeStep 
                      ? 'bg-gray-100 text-gray-700 border border-gray-200' 
                      : 'bg-gray-50 text-gray-600 border border-gray-100'
                  }
                  transition-colors hover:bg-emerald-50
                `}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                  index === activeStep 
                    ? 'bg-emerald-500 text-white' 
                    : index < activeStep 
                      ? 'bg-emerald-200 text-emerald-700' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < activeStep ? (
                    <CheckCircle size={12} />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="line-clamp-1">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer com botões de navegação */}
      <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex justify-between mt-auto sticky bottom-0 left-0 right-0 z-10">
        <button 
          className={`
            px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors
            flex items-center
            ${activeStep > 0 
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
          onClick={() => {
            if (activeStep > 0) {
              setActiveStep(prev => prev - 1);
              setShowStepDetails(false);
            }
          }}
          disabled={activeStep === 0}
        >
          <ChevronLeft className="mr-1" size={18} />
          <span className="hidden sm:inline">Etapa Anterior</span>
          <span className="sm:hidden">Anterior</span>
        </button>
        
        <button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          onClick={() => {
            if (activeStep < steps.length - 1) {
              setActiveStep(prev => prev + 1);
              setShowStepDetails(false);
            } else {
              // Finalizar desafio
              onClose();
              // Aqui poderia adicionar lógica para marcar como concluído
            }
          }}
        >
          {activeStep === steps.length - 1 ? (
            <>
              <span className="hidden sm:inline">Concluir</span>
              <span className="sm:hidden">Concluir</span>
              <Trophy className="ml-2" size={18} />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Próxima Etapa</span>
              <span className="sm:hidden">Próxima</span>
              <ChevronRight className="ml-2" size={18} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ChallengeStepPagination; 