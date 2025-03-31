import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info, Zap, Shield, Database, Globe, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2 } from 'lucide-react';

type PlanPeriod = 'monthly' | 'quarterly' | 'yearly';

const UpgradePlans: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PlanPeriod>('monthly');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Verificar se é mobile ao carregar e quando a janela for redimensionada
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar inicialmente
    checkIfMobile();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkIfMobile);
    
    // Limpar listener ao desmontar
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Preços base mensais
  const basePrices = {
    basic: 0, // Plano gratuito
    premium: 27.00, // DigitFy Member - preço mensal
    business: 37.00, // DigitFy Pro - preço mensal
    cloud: 47.00 // DigitFy Elite - preço mensal
  };

  // Preços originais para mostrar a economia no plano mensal
  const originalPrices = {
    basic: 0, // Plano gratuito
    premium: 97.99, // DigitFy Member - preço original
    business: 107.99, // DigitFy Pro - preço original
    cloud: 117.99 // DigitFy Elite - preço original
  };

  // Função para calcular o preço com base no período selecionado
  const calculatePrice = (basePrice: number, period: PlanPeriod): number => {
    switch (period) {
      case 'monthly':
        return basePrice; // Preço mensal
      case 'quarterly':
        return parseFloat((basePrice * 3 * 0.7).toFixed(2)); // 30% de desconto no valor trimestral
      case 'yearly':
        return parseFloat((basePrice * 12 * 0.4).toFixed(2)); // 60% de desconto no valor anual
      default:
        return basePrice;
    }
  };

  // Função para obter o preço original (sem desconto) com base no período
  const getOriginalPriceForPeriod = (planId: string, period: PlanPeriod): number => {
    if (planId === 'basic') return 0;
    
    const basePrice = basePrices[planId as keyof typeof basePrices];
    
    switch (period) {
      case 'monthly':
        return originalPrices[planId as keyof typeof originalPrices]; // Preço original mensal
      case 'quarterly':
        return parseFloat((basePrice * 3).toFixed(2)); // Preço trimestral sem desconto
      case 'yearly':
        return parseFloat((basePrice * 12).toFixed(2)); // Preço anual sem desconto
      default:
        return originalPrices[planId as keyof typeof originalPrices];
    }
  };

  // Função para obter a porcentagem de desconto com base no período
  const getDiscountPercentage = (period: PlanPeriod): string => {
    switch (period) {
      case 'monthly':
        return '72%'; // Desconto fixo no plano mensal (em relação ao preço original)
      case 'quarterly':
        return '30%'; // Desconto no plano trimestral
      case 'yearly':
        return '60%'; // Desconto no plano anual
      default:
        return '0%';
    }
  };

  // Função para calcular a porcentagem de economia em relação ao preço original
  const calculateSavings = (originalPrice: number, currentPrice: number): string => {
    if (originalPrice === 0) return '0%';
    const savings = ((originalPrice - currentPrice) / originalPrice) * 100;
    return `${Math.round(savings)}%`;
  };

  // Preços calculados com base no período selecionado
  const prices = {
    basic: calculatePrice(basePrices.basic, selectedPeriod),
    premium: calculatePrice(basePrices.premium, selectedPeriod),
    business: calculatePrice(basePrices.business, selectedPeriod),
    cloud: calculatePrice(basePrices.cloud, selectedPeriod)
  };

  // Função para navegar para o próximo slide
  const nextSlide = () => {
    if (currentSlide < 3) {
      setCurrentSlide(currentSlide + 1);
      if (carouselRef.current) {
        carouselRef.current.scrollTo({
          left: (currentSlide + 1) * carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  // Função para navegar para o slide anterior
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      if (carouselRef.current) {
        carouselRef.current.scrollTo({
          left: (currentSlide - 1) * carouselRef.current.offsetWidth,
          behavior: 'smooth'
        });
      }
    }
  };

  // Função para lidar com o scroll do carrossel
  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollPosition = carouselRef.current.scrollLeft;
      const slideWidth = carouselRef.current.offsetWidth;
      const newSlide = Math.round(scrollPosition / slideWidth);
      if (newSlide !== currentSlide) {
        setCurrentSlide(newSlide);
      }
    }
  };

  // Dentro do componente, antes do return
  const getDiscountMessage = (plan: any, period: PlanPeriod) => {
    // Não mostrar mensagem para o plano gratuito
    if (plan.id === 'basic') return null;
    
    if (period === 'monthly') {
      // No plano mensal, incentivamos o usuário a ir para o trimestral
      return (
        <div className="text-xs text-emerald-600 mb-2">
          Economize 30% no plano trimestral!
        </div>
      );
    } else if (period === 'quarterly') {
      // No plano trimestral, incentivamos o usuário a ir para o anual
      return (
        <div className="text-xs text-emerald-600 mb-2">
          Economize 60% no plano anual!
        </div>
      );
    } else if (period === 'yearly') {
      // No plano anual, mostramos uma mensagem de confirmação mais intuitiva
      return (
        <div className="text-xs font-medium bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full inline-block border border-emerald-100">
          Desconto de 60% Aplicado
        </div>
      );
    }
    return null;
  };

  // Dentro do componente, antes do return
  const getPlanPrice = (planId: string): number => {
    const basePrice = basePrices[planId as keyof typeof basePrices];
    return calculatePrice(basePrice, selectedPeriod);
  };

  // Calcular a economia para cada plano
  const getPlanSavings = (planId: string): string => {
    if (planId === 'basic') return '0%';
    
    const originalPrice = originalPrices[planId as keyof typeof originalPrices];
    const currentPrice = basePrices[planId as keyof typeof basePrices];
    
    return calculateSavings(originalPrice, currentPrice);
  };

  // Array de planos para facilitar a renderização
  const plans = [
    {
      id: 'basic',
      name: 'DigitFy Free',
      description: 'Ideal para iniciantes',
      tag: null,
      icon: <Shield size={20} className="text-emerald-500" />,
      iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      price: 0,
      originalPrice: 0,
      features: [
        { included: true, text: 'Acesso Gratuito a toda a DigitFy.' },
        { included: true, text: 'Downloads e Conteúdos Ilimitados.' },
        { included: true, text: '07 Ferramentas Disponíveis' },
        { included: true, text: 'Trend Rush (Limitado a 03 Usos)' },
        { included: true, text: 'Profissionais Disponíveis.' },
        { included: true, text: 'Central de Ajuda Padrão.' },
        { included: true, text: '50% de Indique e Ganhe.' },
        { type: 'header', text: 'Desbloqueie outras funcionalidades para Infoprodutores e Profissionais nos outros planos!' },
      ],
      freeMonths: false,
      buttonStyle: 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50',
      renewalPrice: '0,00',
      cardBorder: 'border-gray-100 group-hover:border-emerald-200',
      cardBg: 'bg-gradient-to-b from-white to-gray-50/30',
    },
    {
      id: 'premium',
      name: 'DigitFy Member',
      description: 'Crescimento digital',
      tag: { text: 'MAIS POPULAR', color: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
      icon: <Zap size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md',
      features: [
        { included: true, text: 'Todos os Benefícios do Plano Gratuito' },
        { included: true, text: 'Trend Rush (Limitado a 10 Usos por dia)' },
        { included: true, text: 'Envie dados para Área de Afiliados' },
        { included: true, text: 'Todas as Ferramentas Disponíveis' },
        { included: true, text: 'Divulgue sua Comunidade' },
        { included: true, text: 'Destaque-se em conteúdos na Página de Aprendizado' },
        { included: true, text: '60% de Indique e Ganhe' },
        { type: 'header', text: 'Desbloqueie outras funcionalidades para Infoprodutores e Profissionais nos outros planos!' },
      ],
      freeMonths: true,
      buttonStyle: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600',
      renewalPrice: '97,99',
      cardBorder: 'border-emerald-200',
      cardBg: 'bg-gradient-to-b from-white to-emerald-50/20',
      checkBg: 'bg-emerald-100',
      checkColor: 'text-emerald-600',
    },
    {
      id: 'business',
      name: 'DigitFy Pro',
      description: 'Escala e crescimento',
      tag: { text: 'RECOMENDADO', color: 'bg-gradient-to-r from-green-300 to-green-400' },
      icon: <Database size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-green-300 to-green-500 shadow-md',
      features: [
        { included: true, text: 'Todos os Benefícios do Plano Member' },
        { included: true, text: 'Trend Rush (Limitado a 15 Usos por dia)' },
        { included: true, text: 'Veja a lista completa de Solicitantes de Serviços' },
        { included: true, text: 'Divulgue Serviços (Sem Destaque)' },
        { included: true, text: 'Infoprodutos Recomendados (Sem destaque)' },
        { included: true, text: '65% de Indique e Ganhe' },
        { type: 'header', text: 'Desbloqueie mais funcionalidades para Infoprodutores e Profissionais no plano seguinte.' },
      ],
      freeMonths: true,
      buttonStyle: 'border border-green-300 text-green-600 hover:bg-green-50',
      renewalPrice: '107,99',
      cardBorder: 'border-green-200',
      cardBg: 'bg-gradient-to-b from-white to-green-50/20',
      checkBg: 'bg-green-100',
      checkColor: 'text-green-600',
      savingsBg: 'bg-green-50',
      savingsText: 'text-green-600',
      savingsBorder: 'border-green-100',
      freeMonthsBg: 'bg-green-50',
      freeMonthsText: 'text-green-600',
      freeMonthsBorder: 'border-green-100',
    },
    {
      id: 'cloud',
      name: 'DigitFy Elite',
      description: 'Performance máxima',
      tag: null,
      icon: <Globe size={20} className="text-emerald-500" />,
      iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      features: [
        { included: true, text: 'Todos os benefícios do Plano Pro' },
        { included: true, text: 'Trend Rush Ilimitado (Usos Ilimitados de Trends e Áudios)' },
        { included: true, text: 'Atualizações e Novidades Antecipadas' },
        { included: true, text: 'Grupo de Suporte Vip e Prioritário' },
        { included: true, text: 'Destaque Especial de Infoprodutos e Serviços Divulgados' },
        { included: true, text: '70% de Indique e Ganhe' },
        { type: 'unlocked', text: 'Todos os benefícios desbloqueados!' },
      ],
      freeMonths: false,
      buttonStyle: 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50',
      renewalPrice: '117,99',
      cardBorder: 'border-gray-100 group-hover:border-emerald-200',
      cardBg: 'bg-gradient-to-b from-white to-gray-50/30',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-teal-50/20 p-6 md:p-8">
      {/* Container */}
      <div className="container mx-auto">
        {/* Aviso sobre versão gratuita */}
        <motion.div 
          className="mb-12 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 md:p-6 shadow-sm backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 md:gap-5">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl flex-shrink-0 shadow-md">
              <Info size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                A DigitFy é gratuita!
              </h3>
              <p className="text-gray-600">
                Você pode usar a versão gratuita da DigitFy e explorar diversas funcionalidades sem gastar nada. Nosso objetivo é garantir que você aprenda e cresça no digital sem barreiras. Mas se você já fatura e quer escalar ainda mais, nossos planos pagos oferecem benefícios exclusivos, como maior visibilidade, destaque no ranking, acesso antecipado a tendências, ferramentas avançadas e suporte prioritário.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cabeçalho */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Título com gradiente corrigido */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent inline-block">
              Escolha o plano ideal para você
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Descubra recursos exclusivos que impulsionarão sua presença digital. Selecione o plano que melhor atende às suas necessidades.
          </p>
        </motion.div>

        {/* Seletor de Período - Movido para antes dos cards */}
        <motion.div 
          className="mb-10 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-1.5 overflow-hidden">
            <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-1 flex">
              {/* Indicador de seleção animado */}
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md shadow-sm z-0"
                initial={false}
                animate={{ 
                  width: '33.333%', 
                  x: selectedPeriod === 'monthly' ? '0%' : 
                     selectedPeriod === 'quarterly' ? '100%' : '200%'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              
              {/* Botões */}
              <button 
                className={`flex-1 py-2.5 px-3 text-sm rounded-md transition-all relative z-10 ${
                  selectedPeriod === 'monthly' 
                    ? 'text-white font-medium' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
                onClick={() => setSelectedPeriod('monthly')}
              >
                Mensal
              </button>
              <button 
                className={`flex-1 py-2.5 px-3 text-sm rounded-md transition-all relative z-10 ${
                  selectedPeriod === 'quarterly' 
                    ? 'text-white font-medium' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
                onClick={() => setSelectedPeriod('quarterly')}
              >
                Trimestral
                <span className={`text-xs font-bold ml-1 ${
                  selectedPeriod === 'quarterly' ? 'text-white' : 'text-emerald-500'
                }`}>
                  -30%
                </span>
              </button>
              <button 
                className={`flex-1 py-2.5 px-3 text-sm rounded-md transition-all relative z-10 ${
                  selectedPeriod === 'yearly' 
                    ? 'text-white font-medium' 
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
                onClick={() => setSelectedPeriod('yearly')}
              >
                Anual
                <span className={`text-xs font-bold ml-1 ${
                  selectedPeriod === 'yearly' ? 'text-white' : 'text-emerald-500'
                }`}>
                  -60%
                </span>
              </button>
            </div>
          </div>
          
          {/* Mensagem informativa */}
          <div className="text-center mt-3">
            <motion.p 
              key={selectedPeriod} // Força a animação quando o período muda
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-gray-600 bg-gradient-to-r from-emerald-50 to-teal-50 inline-block px-3 py-1.5 rounded-full border border-emerald-100"
            >
              {selectedPeriod === 'yearly' && '🎉 Economize 60% com o plano anual - melhor custo-benefício!'}
              {selectedPeriod === 'quarterly' && '💰 Economize 30% com o plano trimestral.'}
              {selectedPeriod === 'monthly' && '✓ Pagamento mensal sem compromisso de longo prazo.'}
            </motion.p>
          </div>
        </motion.div>

        {/* Cards de Planos */}
        <div className="relative">
          {/* Botões de navegação para mobile */}
          {isMobile && (
            <>
              <button 
                onClick={prevSlide}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 border border-gray-100 shadow-md ${
                  currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
                disabled={currentSlide === 0}
              >
                <ChevronLeft size={24} className="text-emerald-500" />
              </button>
              <button 
                onClick={nextSlide}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 border border-gray-100 shadow-md ${
                  currentSlide === plans.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
                disabled={currentSlide === plans.length - 1}
              >
                <ChevronRight size={24} className="text-emerald-500" />
              </button>
            </>
          )}
          
          {/* Container para os cards - Grid em desktop, Carrossel em mobile */}
          <div 
            ref={carouselRef}
            className={`
              ${isMobile 
                ? 'flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4'
              }
            `}
            onScroll={isMobile ? handleScroll : undefined}
            style={isMobile ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {/* Renderizar os planos */}
            {plans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                className={`
                  flex flex-col h-full
                  ${isMobile ? 'min-w-[90%] snap-center px-2 pb-2' : ''}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
              >
                {/* Container geral para manter alturas iguais */}
                <div className="flex flex-col h-full">
                  {/* Tag ou espaço equivalente - ALTURA FIXA */}
                  <div className={`h-10 flex items-center justify-center ${plan.tag ? plan.tag.color : ''} ${plan.tag ? 'text-white rounded-t-2xl text-sm font-medium' : ''}`}>
                    {plan.tag ? plan.tag.text : ''}
                  </div>
                  
                  {/* Card principal */}
                  <div className={`
                    bg-white 
                    ${plan.tag ? 'border-x border-b' : 'border'} 
                    ${plan.tag ? plan.cardBorder : plan.cardBorder} 
                    ${plan.tag ? 'rounded-b-2xl' : 'rounded-2xl'} 
                    overflow-hidden flex flex-col h-full
                  `}>
                    {/* Ícone e título - altura fixa */}
                    <div className="h-24 p-6 flex items-center border-b border-gray-50">
                      <div className={`${plan.iconBg.replace('shadow-md', '')} p-3 rounded-xl mr-4`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
                        <p className="text-gray-500 text-sm">{plan.description}</p>
                      </div>
                    </div>
                    
                    {/* Lista de recursos - altura ajustada para mobile e desktop, sem rolagem */}
                    <div className={`p-6 border-b border-gray-50 ${isMobile ? 'h-auto' : 'h-[480px]'} ${plan.cardBg}`}>
                      <div className="space-y-4 text-sm">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            {feature.type === 'header' ? (
                              <>
                                <div className="bg-gray-100 p-1 rounded-md mr-3 mt-0.5">
                                  <Lock size={14} className="text-gray-500" />
                                </div>
                                <span className="text-gray-700 font-medium">{feature.text}</span>
                              </>
                            ) : feature.type === 'unlocked' ? (
                              <>
                                <div className="bg-emerald-100 p-1 rounded-md mr-3 mt-0.5">
                                  <Unlock size={14} className="text-emerald-500" />
                                </div>
                                <span className="text-emerald-600 font-medium">{feature.text}</span>
                              </>
                            ) : (
                              <>
                                <div className={`${feature.included 
                                  ? (plan.checkBg || 'bg-emerald-50') 
                                  : 'bg-gray-100'} p-1 rounded-md mr-3 mt-0.5`}
                                >
                                  {feature.included 
                                    ? <Check size={14} className={plan.checkColor || 'text-emerald-500'} />
                                    : <X size={14} className="text-gray-400" />
                                  }
                                </div>
                                <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                  {feature.text}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Seção de preço - com alturas fixas para cada elemento */}
                    <div className="p-6 bg-white">
                      {/* Preço riscado e economia - altura fixa */}
                      <div className="h-8 flex items-center mb-3">
                        {plan.id === 'basic' ? (
                          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium border border-gray-200">
                            GRATUITO
                          </span>
                        ) : (
                          <>
                            <span className="text-gray-400 line-through text-sm mr-2">
                              R$ {getOriginalPriceForPeriod(plan.id, selectedPeriod).toFixed(2).replace('.', ',')}
                            </span>
                            <span className={`${plan.savingsBg || 'bg-emerald-50'} ${plan.savingsText || 'text-emerald-600'} text-xs px-3 py-1 rounded-full font-medium ${plan.savingsBorder || 'border border-emerald-100'}`}>
                              ECONOMIZE {getDiscountPercentage(selectedPeriod)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Preço atual - altura fixa */}
                      <div className="h-16 mb-2">
                        <div className="flex items-baseline">
                          <span className="text-gray-800 font-bold text-4xl">
                            {plan.id === 'basic' ? 'R$ 0,00' : `R$ ${getPlanPrice(plan.id).toFixed(2).replace('.', ',')}`}
                          </span>
                          <span className="text-gray-500 ml-2 text-sm">
                            {selectedPeriod === 'monthly' ? '/mês' : 
                             selectedPeriod === 'quarterly' ? '/trimestre' : '/ano'}
                          </span>
                        </div>
                        {/* Linha de equivalência - sempre presente, mas invisível para o plano gratuito ou mensal */}
                        <div className={`text-xs ${selectedPeriod !== 'monthly' && plan.id !== 'basic' ? 'text-gray-500' : 'text-transparent'} mt-1`}>
                          {selectedPeriod !== 'monthly' && plan.id !== 'basic' 
                            ? `Equivalente a R$ ${(getPlanPrice(plan.id) / (selectedPeriod === 'quarterly' ? 3 : 12)).toFixed(2).replace('.', ',')}/mês`
                            : 'Equivalente a R$ 0,00/mês'}
                        </div>
                      </div>
                      
                      {/* Mensagem de incentivo baseada no período - altura fixa */}
                      <div className="h-6">
                        {getDiscountMessage(plan, selectedPeriod)}
                      </div>
                      
                      {/* Estimativa de gasto - altura fixa */}
                      <div className="h-14 flex items-center">
                        <p className="text-xs text-gray-400">
                          {plan.id === 'basic' 
                            ? 'Plano gratuito sem compromisso.' 
                            : `*${selectedPeriod === 'monthly' ? 'Valor mensal' : 
                                selectedPeriod === 'quarterly' ? 'Valor trimestral com 30% de desconto' : 
                                'Valor anual com 60% de desconto'}. O plano é pago de forma integral.`
                          }
                        </p>
                      </div>
                      
                      {/* Botão - altura fixa */}
                      <div className="h-16 mb-4">
                        <button 
                          onClick={() => {
                            if (plan.id === 'premium') {
                              if (selectedPeriod === 'monthly') {
                                window.location.href = 'https://pay.cakto.com.br/rcznj5h_315121';
                              } else if (selectedPeriod === 'quarterly') {
                                window.location.href = 'https://pay.cakto.com.br/i35vhzu';
                              } else if (selectedPeriod === 'yearly') {
                                window.location.href = 'https://pay.cakto.com.br/347pnd2';
                              }
                            } else if (plan.id === 'business') {
                              if (selectedPeriod === 'monthly') {
                                window.location.href = 'https://pay.cakto.com.br/33vtgs3';
                              } else if (selectedPeriod === 'quarterly') {
                                window.location.href = 'https://pay.cakto.com.br/9j2agmx';
                              } else if (selectedPeriod === 'yearly') {
                                window.location.href = 'https://pay.cakto.com.br/be4tbqg';
                              }
                            } else if (plan.id === 'cloud') {
                              if (selectedPeriod === 'monthly') {
                                window.location.href = 'https://pay.cakto.com.br/fc5vhmk';
                              } else if (selectedPeriod === 'quarterly') {
                                window.location.href = 'https://pay.cakto.com.br/3nnywmn';
                              } else if (selectedPeriod === 'yearly') {
                                window.location.href = 'https://pay.cakto.com.br/ojo545q';
                              }
                            }
                          }}
                          className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium ${
                            plan.buttonStyle.replace(/shadow-\w+/g, '')
                          } transition-all duration-300`}
                        >
                          {plan.id === 'basic' ? 'Começar Agora' : 'Escolher plano'}
                        </button>
                      </div>
                      
                      {/* Informação de renovação - mesma altura para todos */}
                      <div className="h-10 text-xs text-gray-400 text-center w-full">
                        {plan.id === 'basic' 
                          ? 'Sem compromisso' 
                          : 'Renovação automática de acordo com o período escolhido. Cancele a qualquer momento.'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Indicadores de slide para mobile */}
        {isMobile && (
          <div className="flex justify-center mt-4 mb-8">
            {plans.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 mx-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-emerald-500 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => {
                  setCurrentSlide(index);
                  if (carouselRef.current) {
                    carouselRef.current.scrollTo({
                      left: index * carouselRef.current.offsetWidth,
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Aviso de suporte via WhatsApp */}
        <motion.div 
          className="mt-12 max-w-3xl mx-auto text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <div className="bg-white border border-emerald-100 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Precisa de ajuda para escolher o plano ideal?
            </h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para te ajudar a encontrar a melhor solução para o seu projeto.
            </p>
            <a 
              href="https://wa.me/91986300548?text=Ol%C3%A1%2C%20estou%20precisando%20de%20ajuda%20para%20escolher%20um%20plano%20da%20DigitFy." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 transition-all duration-300"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 mr-2 fill-current" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Falar com especialista
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UpgradePlans; 