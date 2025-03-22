import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  Star,
  Play
} from 'lucide-react';
import ChallengeStepPagination from '../components/ChallengeStepPagination';

// Interface para definir um desafio
interface Challenge {
  id: string;
  title: string;
  image: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  steps: string[];
  stepDetails: string[]; // Detalhes de cada etapa
  reward: string;
}

const challengesData: Challenge[] = [
  {
    id: 'aquecimento-perfil',
    title: 'Desafio de Aquecimento de Perfil',
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Transforme seu perfil em uma máquina de atração de leads e engajamento em apenas 5 dias!',
    duration: '5 dias',
    difficulty: 'Iniciante',
    steps: [
      'Auditoria do perfil atual',
      'Definição de persona',
      'Otimização de bio e foto',
      'Criação de conteúdo inicial',
      'Estratégias de engajamento',
      'Técnicas de storytelling',
      'Primeiros passos de autoridade'
    ],
    stepDetails: [
      'Realize uma auditoria completa do seu perfil atual, identificando pontos fortes e áreas de melhoria. Analise suas métricas atuais, tipo de conteúdo e engajamento para estabelecer um ponto de partida claro.',
      'Defina claramente sua persona ideal e o posicionamento do seu perfil. Identifique quem é seu público alvo, quais são suas dores, desejos e como você pode ajudá-los.',
      'Otimize sua bio para comunicar claramente seu valor e atrair sua persona ideal. Crie uma foto de perfil profissional que transmita confiança e autoridade.',
      'Crie seus primeiros conteúdos estratégicos focados em valor e engajamento. Desenvolva uma identidade visual consistente e atrativa.',
      'Implemente técnicas de engajamento para aumentar a interação com seu público. Aprenda a responder comentários de forma estratégica e criar chamadas para ação eficientes.',
      'Desenvolva técnicas de storytelling para criar conexão emocional com sua audiência. Aprenda a estruturar histórias que vendem e engajam.',
      'Crie seus primeiros conteúdos que estabelecem você como autoridade no seu nicho. Posicione-se como especialista e comece a construir sua reputação online.'
    ],
    reward: 'Checklist de Perfil Otimizado + Consultoria Rápida'
  },
  {
    id: 'primeira-venda-organico',
    title: 'Desafio 7 Dias para a Primeira Venda no Orgânico',
    image: 'https://images.unsplash.com/photo-1556761175-4b46a3fb44de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    description: 'Transforme seu perfil em um funil de vendas e conquiste sua primeira venda orgânica em apenas 7 dias!',
    duration: '7 dias',
    difficulty: 'Iniciante',
    steps: [
      'Defina seu nicho de atuação',
      'Crie um perfil atrativo nas redes sociais',
      'Desenvolva conteúdo de valor',
      'Aprenda técnicas de engajamento',
      'Implemente estratégias de conversão',
      'Crie uma oferta irresistível',
      'Feche sua primeira venda'
    ],
    stepDetails: [
      'Identifique um nicho específico onde você possui conhecimento e paixão. Pesquise a demanda e a concorrência para validar sua escolha.',
      'Configure seu perfil com elementos profissionais: foto, bio estratégica, links relevantes e identidade visual consistente.',
      'Crie pelo menos 3 conteúdos de alto valor focados nas dores e necessidades do seu público. Priorize a qualidade sobre a quantidade.',
      'Aplique técnicas de engajamento ativo: responda comentários, interaja com perfis relevantes e participe de discussões em sua área.',
      'Implemente CTAs estratégicos em seus conteúdos. Crie uma sequência lógica que leve seu seguidor da descoberta à decisão de compra.',
      'Desenvolva uma oferta inicial acessível e de alto valor percebido. Crie um material de vendas persuasivo destacando benefícios claros.',
      'Aplique técnicas de fechamento: crie urgência, responda objeções e simplifique o processo de compra para facilitar a decisão.'
    ],
    reward: 'Certificado de Primeira Venda + Mentoria Exclusiva'
  },
  {
    id: 'trafego-organico-30-dias',
    title: 'Desafio 30 Dias de Tráfego Orgânico',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Domine as estratégias de geração de tráfego orgânico e expanda sua presença digital em 30 dias!',
    duration: '30 dias',
    difficulty: 'Intermediário',
    steps: [
      'Análise do seu perfil atual',
      'Estratégia de conteúdo',
      'Criação de calendário de postagens',
      'Técnicas de hashtags estratégicas',
      'Engajamento com a comunidade',
      'Otimização de perfis',
      'Métricas e ajustes',
      'Criação de funil de atração'
    ],
    stepDetails: [
      'Faça uma análise detalhada do seu perfil e conteúdo atual. Identifique os pontos fortes e fracos, métricas atuais e oportunidades de melhoria.',
      'Desenvolva uma estratégia de conteúdo alinhada com os objetivos do seu negócio e interesses do seu público. Defina pilares de conteúdo e formatos.',
      'Crie um calendário editorial completo para os próximos 30 dias, com temas, formatos e objetivos de cada publicação.',
      'Pesquise e implemente hashtags estratégicas para aumentar o alcance orgânico do seu conteúdo. Crie grupos de hashtags por nicho e relevância.',
      'Desenvolva uma rotina diária de engajamento com sua comunidade e perfis relevantes. Participe ativamente de discussões no seu nicho.',
      'Otimize todos os aspectos do seu perfil: bio, destaque, feed, conteúdo fixado e links estratégicos para maximizar conversões.',
      'Implemente um sistema de análise de métricas semanais e faça ajustes na sua estratégia com base nos resultados obtidos.',
      'Crie um funil de atração completo: do conteúdo frio até a conversão, com pontos de contato e nurturing estratégico.'
    ],
    reward: 'Relatório Completo de Crescimento + Consultoria'
  },
  {
    id: 'primeira-venda-trafego-pago',
    title: 'Desafio Primeira Venda no Tráfego Pago',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    description: 'Aprenda a criar e otimizar campanhas de ads para conquistar sua primeira venda em tráfego pago!',
    duration: '15 dias',
    difficulty: 'Avançado',
    steps: [
      'Fundamentos de tráfego pago',
      'Definição de público-alvo',
      'Criação de anúncios persuasivos',
      'Configuração de campanhas',
      'Gestão de orçamento',
      'Análise de métricas',
      'Otimização de conversão',
      'Escalonamento de resultados'
    ],
    stepDetails: [
      'Aprenda os conceitos fundamentais do tráfego pago: plataformas disponíveis, tipos de anúncios, métricas principais e estrutura de campanhas.',
      'Desenvolva uma definição precisa do seu público-alvo. Crie personas detalhadas e segmentações específicas para suas campanhas.',
      'Crie anúncios persuasivos com copy, imagem e proposta de valor alinhados. Desenvolva versões diferentes para testes.',
      'Configure sua primeira campanha com todos os parâmetros otimizados: objetivo, público, orçamento, formato e segmentação.',
      'Aprenda a gerenciar seu orçamento de forma eficiente, estabelecendo limites diários, lances adequados e monitoramento constante.',
      'Implemente um sistema de análise diária das métricas principais: CPC, CTR, taxa de conversão e ROAS. Identifique pontos de melhoria.',
      'Otimize sua página de destino e funil de vendas para maximizar as conversões do tráfego pago. Elimine atritos e facilite a compra.',
      'Aprenda a escalonar resultados positivos: aumentando orçamento, expandindo públicos semelhantes e replicando campanhas vencedoras.'
    ],
    reward: 'Bônus de Créditos em Ads + Mentoria Especializada'
  }
];

const LearningChallenges: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

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
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return <Star className="text-green-600 mr-2" size={18} />;
      case 'Intermediário': return <Star className="text-yellow-600 mr-2" size={18} />;
      case 'Avançado': return <Star className="text-red-600 mr-2" size={18} />;
    }
  };

  // Converter para o formato esperado pelo componente ChallengeStepPagination
  const convertChallengeToStepFormat = (challenge: Challenge) => {
    return challenge.steps.map((step, index) => ({
      title: step,
      content: challenge.stepDetails[index]
    }));
  };

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
          {challengesData.map((challenge) => (
            <motion.div 
              key={challenge.id}
              variants={cardVariants}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col"
            >
              {/* Imagem */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={challenge.image} 
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
      </div>

      {/* Modal de Detalhes com Paginação */}
      <AnimatePresence>
        {selectedChallenge && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setSelectedChallenge(null)}
          >
            <ChallengeStepPagination
              title={selectedChallenge.title}
              description={selectedChallenge.description}
              image={selectedChallenge.image}
              steps={convertChallengeToStepFormat(selectedChallenge)}
              reward={selectedChallenge.reward}
              difficulty={selectedChallenge.difficulty}
              duration={selectedChallenge.duration}
              onClose={() => setSelectedChallenge(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningChallenges; 