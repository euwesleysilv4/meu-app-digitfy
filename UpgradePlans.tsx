import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, X } from 'lucide-react';
import { Info } from 'lucide-react';

const UpgradePlans: React.FC = () => {
  // Função para calcular preço baseado no período selecionado
  const calculatePrice = (basePrice: number, period: string) => {
    if (period === 'monthly') return basePrice;
    if (period === 'quarterly') return basePrice * 0.7; // 30% de desconto
    if (period === 'yearly') return basePrice * 0.4; // 60% de desconto
    return basePrice;
  };

  // Preços base
  const basicPrice = 0;
  const premiumPrice = 27;
  const businessPrice = 37;
  const cloudPrice = 47;

  // Estado para controlar o período selecionado
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 py-12">
      <div className="container mx-auto px-4">
        {/* Banner informativo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg shadow-sm flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-emerald-700 mb-1">A DigitFy é gratuita!</h3>
            <p className="text-emerald-600 text-sm">
              Você pode utilizar a versão gratuita e explorar diversas funcionalidades. Nossos planos pagos oferecem benefícios exclusivos como maior armazenamento, domínios gratuitos, ferramentas avançadas de marketing e suporte prioritário.
            </p>
          </div>
        </motion.div>

        {/* Título principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Escolha o plano ideal para você
          </h2>
        </motion.div>

        {/* Seletor de período de pagamento */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative mx-auto max-w-2xl"
        >
          <div className="flex relative">
            {/* Indicador de seleção animado */}
            <motion.div 
              className="absolute h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md z-0"
              initial={false}
              animate={{
                left: selectedPeriod === 'monthly' ? '0%' : selectedPeriod === 'quarterly' ? '33.33%' : '66.66%',
                width: '33.33%'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            {/* Botões de período */}
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`flex-1 py-3 px-4 z-10 relative font-medium transition-colors duration-200 text-center ${
                selectedPeriod === 'monthly' ? 'text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setSelectedPeriod('quarterly')}
              className={`flex-1 py-3 px-4 z-10 relative font-medium transition-colors duration-200 text-center ${
                selectedPeriod === 'quarterly' ? 'text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Trimestral <span className="font-bold">-30%</span>
            </button>
            <button
              onClick={() => setSelectedPeriod('yearly')}
              className={`flex-1 py-3 px-4 z-10 relative font-medium transition-colors duration-200 text-center ${
                selectedPeriod === 'yearly' ? 'text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Anual <span className="font-bold">-60%</span>
            </button>
          </div>
          
          {/* Mensagem informativa */}
          <motion.div 
            key={selectedPeriod}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 text-center text-sm bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700"
          >
            {selectedPeriod === 'monthly' && "Pagamento mensal sem compromisso 🔄"}
            {selectedPeriod === 'quarterly' && "Economize 30% com o plano trimestral! 💰"}
            {selectedPeriod === 'yearly' && "Melhor valor! Economize 60% com o plano anual! 🎉"}
          </motion.div>
        </motion.div>

        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Plano Básico */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Tag do plano */}
            <div className="h-10 flex items-center justify-center bg-gray-100">
              <span className="text-sm font-medium text-gray-600">Plano Gratuito</span>
            </div>
            
            {/* Título e descrição */}
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-1">DigitFy Free</h3>
              <p className="text-gray-600">Ideal para iniciantes no digital</p>
            </div>
            
            {/* Lista de recursos */}
            <div className="p-5 h-[450px] overflow-y-auto border-b border-gray-200">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso Completo ao Feed de Notícias</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso ao Marketplace de Infoprodutos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso ao Marketplace de Afiliados</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso ilimitado às Comunidades</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso ilimitado ao Aprendizado</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Download ilimitado de Ebooks e PDFs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Download ilimitado de Packs Gratuitos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso às Novidades e Atualizações</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso ilimitado às Ferramentas Gratuitas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Solicite e Veja Profissionais Disponíveis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Central de Ajuda Padrão</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Indique e Ganhe 50%</span>
                </li>
                <li className="pt-2 pb-1">
                  <span className="text-gray-800 font-medium flex items-center">
                    <Lock className="h-4 w-4 text-gray-500 mr-1" />
                    Desbloqueie em outros Planos:
                  </span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Trend Rush (Áudios e Trends Virais)</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Sem divulgação ou impulsionamento de infoprodutos</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Não envia dados de Afiliados e Ranking</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Sem destaque no ranking e nas recomendações</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Não pode divulgar serviços</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Não pode ver solicitantes</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Atualizações Antecipadas</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Suporte de ajuda prioritário</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Relatório Semanal</span>
                </li>
              </ul>
            </div>
            
            {/* Preço e botão */}
            <div className="p-5">
              <div className="mb-4">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">R$ 0,00</span>
                  <span className="text-gray-600 ml-2">/ Mês</span>
                </div>
                {/* Espaço invisível para manter alinhamento */}
                <div className="h-6 flex items-center justify-center">
                  <span className="text-transparent">+2 meses grátis</span>
                </div>
              </div>
              <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors duration-200">
                Começar Grátis
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">Sem necessidade de cartão</p>
            </div>
          </motion.div>

          {/* Plano Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Tag do plano */}
            <div className="h-10 flex items-center justify-center bg-blue-100">
              <span className="text-sm font-medium text-blue-600">Mais Popular</span>
            </div>
            
            {/* Título e descrição */}
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-1">DigitFy Member</h3>
              <p className="text-gray-600">Para quem quer crescer e escalar no digital</p>
            </div>
            
            {/* Lista de recursos */}
            <div className="p-5 h-[450px] overflow-y-auto border-b border-gray-200">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Tudo do DigitFy Free +</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Trend Rush (10 Áudios e Trends Virais)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Pode divulgar serviços dentro da plataforma</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Pode visualizar solicitantes de serviços</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Envio de dados de Afiliados e Ranking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Relatórios semanais de tendências de mercado</span>
                </li>
                <li className="pt-2 pb-1">
                  <span className="text-gray-800 font-medium flex items-center">
                    <Lock className="h-4 w-4 text-gray-500 mr-1" />
                    Desbloqueie em outros Planos:
                  </span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Envio de Posts para o Feed</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Trend Rush Ilimitado</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Impulsionamento de Infoprodutos</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Destaque no Ranking e Recomendações</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Ferramentas Premium</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Atualizações Antecipadas</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Suporte Prioritário</span>
                </li>
              </ul>
            </div>
            
            {/* Preço e botão */}
            <div className="p-5">
              <div className="mb-4">
                {selectedPeriod !== 'monthly' && (
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-gray-500 line-through mr-2">R$ {premiumPrice.toFixed(2)}</span>
                    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {selectedPeriod === 'quarterly' ? 'ECONOMIZE 30%' : 'ECONOMIZE 60%'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">
                    R$ {calculatePrice(premiumPrice, selectedPeriod).toFixed(2)}
                  </span>
                  <span className="text-gray-600 ml-2">/ Mês</span>
                </div>
                {selectedPeriod === 'yearly' && (
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-blue-500 text-sm font-medium">+2 meses grátis</span>
                  </div>
                )}
                {selectedPeriod !== 'yearly' && (
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-transparent">+2 meses grátis</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  if (selectedPeriod === 'monthly') {
                    window.location.href = 'https://lastlink.com/p/CB27B7BCF/checkout-payment/';
                  }
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Assinar Agora
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                {selectedPeriod === 'monthly' ? 'Renovação mensal' : 
                 selectedPeriod === 'quarterly' ? 'Renovação trimestral' : 
                 'Renovação anual'}
              </p>
            </div>
          </motion.div>

          {/* Plano Business */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Tag do plano */}
            <div className="h-10 flex items-center justify-center bg-green-100">
              <span className="text-sm font-medium text-green-600">Recomendado</span>
            </div>
            
            {/* Título e descrição */}
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-1">DigitFy Pro</h3>
              <p className="text-gray-600">Para quem quer mais escala e crescimento rápido</p>
            </div>
            
            {/* Lista de recursos */}
            <div className="p-5 h-[450px] overflow-y-auto border-b border-gray-200">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Tudo do DigitFy Member +</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Trend Rush Ilimitado</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Pode enviar infoprodutos recomendados</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Destaque no ranking e recomendações</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Acesso a ferramentas premium</span>
                </li>
                <li className="pt-2 pb-1">
                  <span className="text-gray-800 font-medium flex items-center">
                    <Lock className="h-4 w-4 text-gray-500 mr-1" />
                    Desbloqueie em outros Planos:
                  </span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Envio de Posts para o Feed</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Suporte de ajuda prioritária</span>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-500">Pode impulsionar Infoprodutos recomendados</span>
                </li>
              </ul>
            </div>
            
            {/* Preço e botão */}
            <div className="p-5">
              <div className="mb-4">
                {selectedPeriod !== 'monthly' && (
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-gray-500 line-through mr-2">R$ {businessPrice.toFixed(2)}</span>
                    <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {selectedPeriod === 'quarterly' ? 'ECONOMIZE 30%' : 'ECONOMIZE 60%'}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">
                    R$ {calculatePrice(businessPrice, selectedPeriod).toFixed(2)}
                  </span>
                  <span className="text-gray-600 ml-2">/ Mês</span>
                </div>
                {selectedPeriod === 'yearly' && (
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-green-500 text-sm font-medium">+2 meses grátis</span>
                  </div>
                )}
                {selectedPeriod !== 'yearly' && (
                  <div className="h-6 flex items-center justify-center">
                    <span className="text-transparent">+2 meses grátis</span>
                  </div>
                )}
              </div>
              <button 
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                onClick={() => {
                  if (selectedPeriod === 'monthly') {
                    window.location.href = 'https://lastlink.com/p/CC752B3E1/checkout-payment/';
                  }
                }}
              >
                Assinar Agora
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                {selectedPeriod === 'monthly' ? 'Renovação mensal' : 
                 selectedPeriod === 'quarterly' ? 'Renovação trimestral' : 
                 'Renovação anual'}
              </p>
            </div>
          </motion.div>

          {/* Plano Cloud */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            {/* Tag do plano */}
            <div className="h-10 flex items-center justify-center bg-purple-100">
              <span className="text-sm font-medium text-purple-600">Elite</span>
            </div>
            
            {/* Título e descrição */}
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-1">DigitFy Elite</h3>
              <p className="text-gray-600">
                Descrição do plano Cloud
              </p>
            </div>
            
            {/* Preço e botão */}
            <div className="p-5">
              <div className="mb-4">
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">R$ {cloudPrice.toFixed(2)}</span>
                  <span className="text-gray-600 ml-2">/ Mês</span>
                </div>
              </div>
              <button 
                className="w-full py-3 px-4 bg-purple-500 text-white font-medium rounded-lg transition-colors duration-200"
                onClick={() => {
                  if (selectedPeriod === 'monthly') {
                    window.location.href = 'https://lastlink.com/p/C64A61C51/checkout-payment/';
                  }
                }}
              >
                Assinar Agora
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlans; 