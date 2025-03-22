import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Award,
  Play,
  Sparkles
} from 'lucide-react';
import ChallengeStepPagination from '../components/ChallengeStepPagination';

// Interface para definir um curso
interface Course {
  id: string;
  title: string;
  image: string;
  description: string;
  duration: string;
  level: string;
  lessons: {
    title: string;
    content: string;
  }[];
  certification: string;
}

const courseData: Course = {
  id: 'marketing-digital-iniciantes',
  title: 'Marketing Digital para Iniciantes',
  image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop',
  description: 'Domine os fundamentos do marketing digital e comece a criar campanhas de sucesso em apenas 7 lições práticas!',
  duration: '7 horas',
  level: 'Iniciante',
  lessons: [
    {
      title: 'Introdução ao Marketing Digital',
      content: 'Nesta primeira lição, você aprenderá os conceitos fundamentais do marketing digital, sua evolução histórica e como ele se diferencia do marketing tradicional. Vamos explorar o ecossistema digital, principais canais e como eles se integram para formar uma estratégia coesa. Ao final, você compreenderá o panorama completo do marketing digital e estará pronto para aprofundar em cada canal específico.'
    },
    {
      title: 'Estratégia de Conteúdo',
      content: 'A criação de conteúdo relevante é a base de qualquer estratégia de marketing digital bem-sucedida. Nesta lição, você aprenderá a desenvolver uma estratégia de conteúdo eficaz, incluindo pesquisa de persona, definição de voz da marca, planejamento editorial e métricas de sucesso. Veremos exemplos práticos de conteúdos que engajam e convertem em diferentes plataformas.'
    },
    {
      title: 'SEO: Otimização para Mecanismos de Busca',
      content: 'Nesta lição, você aprenderá os fundamentos do SEO (Search Engine Optimization) e como tornar seu site e conteúdo mais visíveis nos resultados de busca orgânica. Abordaremos SEO on-page, off-page e técnico, além de ferramentas essenciais para análise e monitoramento. Ao final, você saberá implementar práticas de SEO para aumentar o tráfego orgânico do seu site.'
    },
    {
      title: 'Marketing de Mídias Sociais',
      content: 'As redes sociais são canais fundamentais para qualquer estratégia de marketing digital. Nesta aula, você conhecerá as principais plataformas (Instagram, Facebook, LinkedIn, Twitter, TikTok), suas particularidades e públicos. Aprenderá a criar uma estratégia específica para cada rede, tipos de conteúdos que performam melhor e melhores práticas para crescimento orgânico e engajamento.'
    },
    {
      title: 'Email Marketing',
      content: 'O email marketing continua sendo uma das estratégias com melhor ROI no marketing digital. Nesta lição, você aprenderá a construir e segmentar listas de email, criar campanhas eficazes, escrever assuntos que aumentam a taxa de abertura e desenvolver automações de email. Abordaremos também as métricas essenciais e como otimizar suas campanhas com base em dados.'
    },
    {
      title: 'Marketing de Conteúdo Avançado',
      content: 'Nesta lição, aprofundaremos nas estratégias avançadas de marketing de conteúdo, incluindo storytelling, conteúdo interativo, webinars, podcasts e vídeos. Você aprenderá a criar um funil de conteúdo completo, desde a atração até a conversão e fidelização. Estudaremos casos de sucesso e aplicaremos técnicas para mensurar o ROI do seu conteúdo.'
    },
    {
      title: 'Análise de Dados e Otimização',
      content: 'Na lição final, você aprenderá a utilizar dados para otimizar sua estratégia de marketing digital. Abordaremos as principais ferramentas analíticas, como configurar objetivos e conversões, interpretar métricas-chave e tomar decisões baseadas em dados. Ao final desta lição, você estará apto a implementar um ciclo contínuo de análise e melhoria em todas as suas campanhas digitais.'
    }
  ],
  certification: 'Certificado de Especialista em Marketing Digital'
};

const CourseLesson: React.FC = () => {
  const [showCourse, setShowCourse] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8 justify-center"
        >
          <Book className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
            Cursos Disponíveis
          </h1>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl"
          >
            {/* Imagem */}
            <div className="h-64 overflow-hidden relative">
              <img 
                src={courseData.image} 
                alt={courseData.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {courseData.level}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{courseData.title}</h2>
                  <div className="flex items-center text-sm">
                    <Award className="mr-2 text-yellow-400" size={16} />
                    <span>{courseData.certification}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">{courseData.description}</p>
              
              <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Sparkles className="mr-2 text-emerald-500" size={16} />
                  <span>{courseData.lessons.length} lições</span>
                </div>
                <div className="flex items-center">
                  <Play className="mr-2 text-emerald-500" size={16} />
                  <span>{courseData.duration}</span>
                </div>
              </div>

              <button 
                onClick={() => setShowCourse(true)}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors duration-300"
              >
                <Play className="mr-2" size={20} />
                Iniciar Curso
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal do Curso com Paginação */}
      <AnimatePresence>
        {showCourse && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setShowCourse(false)}
          >
            <ChallengeStepPagination
              title={courseData.title}
              description={courseData.description}
              image={courseData.image}
              steps={courseData.lessons}
              reward={courseData.certification}
              difficulty={courseData.level}
              duration={courseData.duration}
              onClose={() => setShowCourse(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseLesson; 