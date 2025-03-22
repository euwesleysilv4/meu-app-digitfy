import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, Zap, Star, Crown, ArrowRight, X, Lock } from 'lucide-react';

const Upgrade = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  // Preços base
  const premiumPrice = 27;
  const businessPrice = 37;
  const cloudPrice = 47;
  
  // Função para calcular preço baseado no período selecionado
  const calculatePrice = (basePrice: number, period: string) => {
    if (period === 'monthly') return basePrice;
    if (period === 'quarterly') return basePrice * 0.7; // 30% de desconto
    if (period === 'yearly') return basePrice * 0.4; // 60% de desconto
    return basePrice;
  };

  return (
    <div>
      <motion.div 
        className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-8 flex items-start gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-emerald-500 mt-1 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div>
          <h3 className="font-semibold text-emerald-700 mb-1">A DigitFy é gratuita!</h3>
          <p className="text-emerald-600 text-sm">
            Você pode usar a versão gratuita e explorar diversas funcionalidades da plataforma. No entanto, caso queira elevar sua experiência ao próximo nível, nossos planos pagos oferecem benefícios exclusivos como maior armazenamento, domínios gratuitos, ferramentas avançadas de marketing e suporte prioritário.
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="flex items-center space-x-2 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Gift className="text-emerald-600" size={32} />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          Escolha o plano ideal para você
        </h1>
      </motion.div>

      {/* Billing Cycle Selector */}
      <motion.div
        className="flex justify-center gap-4 mb-12 bg-white rounded-xl shadow-md border border-emerald-100 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            billingCycle === 'monthly'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setBillingCycle('quarterly')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            billingCycle === 'quarterly'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          } flex items-center`}
        >
          Trimestral <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">-30%</span>
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            billingCycle === 'yearly'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          } flex items-center`}
        >
          Anual <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">-60%</span>
        </button>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Plano Básico - DigitFy Free */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              GRATUITO
            </span>
            <div className="h-6">
              <span className="text-transparent">+2 meses grátis</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">DigitFy Free</h3>
            <p className="text-gray-600">Plano Gratuito – Ideal para iniciantes no digital</p>
          </div>

          <div className="border-t border-b border-gray-100 py-6 mb-6 h-96 overflow-y-auto">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso Completo ao Feed de Notícias</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso ao Marketplace de Infoprodutos</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso ao Marketplace de Afiliados</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso ilimitado às Comunidades</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso ilimitado ao Aprendizado</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Download ilimitado de Ebooks e PDFs</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Download ilimitado de Packs Gratuitos</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso às Novidades e Atualizações</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso ilimitado às Ferramentas Gratuitas</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Solicite e Veja Profissionais Disponíveis</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Central de Ajuda Padrão</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Indique e Ganhe 50%</span>
              </li>
              <li className="flex items-start pt-3">
                <Lock className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm font-medium text-gray-700">Desbloqueie em outros Planos:</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Trend Rush (Áudios e Trends Virais)</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Sem divulgação ou impulsionamento de infoprodutos</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Não envia dados de Afiliados e Ranking</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Sem destaque no ranking e nas recomendações</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Não pode divulgar serviços</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Não pode ver solicitantes</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Atualizações Antecipadas</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Suporte de ajuda prioritário</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Relatório Semanal</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold text-gray-800">R$ 0,00</span>
              <span className="text-gray-600 ml-1 mb-1">/mês</span>
            </div>
            <button className="w-full py-3 rounded-lg font-semibold transition-all bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              Começar Agora <ArrowRight className="inline ml-2" size={18} />
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">Sem compromisso</p>
          </div>
        </motion.div>

        {/* Plano Premium - DigitFy Member */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8 transform scale-105"
        >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-green-300 to-green-400 text-white px-4 py-1 rounded-full text-sm font-semibold">
              RECOMENDADO
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="bg-green-100 text-green-600 text-xs font-medium px-3 py-1 rounded-full">
              PREMIUM
            </span>
            <div className="h-6">
              {billingCycle === 'yearly' && (
                <span className="text-green-500 text-sm font-medium">+2 meses grátis</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">DigitFy Member</h3>
            <p className="text-gray-600">Para quem quer crescer e escalar no digital</p>
          </div>

          <div className="border-t border-b border-gray-100 py-6 mb-6 h-96 overflow-y-auto">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Tudo do DigitFy Free +</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Trend Rush (10 Áudios e Trends Virais)</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Pode divulgar serviços dentro da plataforma</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Pode visualizar solicitantes de serviços</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Envio de dados de Afiliados e Ranking</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Relatórios semanais de tendências de mercado</span>
              </li>
              <li className="flex items-start pt-3">
                <Lock className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm font-medium text-gray-700">Desbloqueie em outros Planos:</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Envio de Posts para o Feed</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Trend Rush Ilimitado</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Impulsionamento de Infoprodutos</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Destaque no Ranking e Recomendações</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Ferramentas Premium</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Atualizações Antecipadas</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Suporte Prioritário</span>
              </li>
            </ul>
          </div>

          <div>
            {billingCycle !== 'monthly' && (
              <div className="flex items-center mb-1">
                <span className="text-sm text-gray-500 line-through mr-2">
                  R$ {premiumPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                  {billingCycle === 'quarterly' ? 'ECONOMIZE 30%' : 'ECONOMIZE 60%'}
                </span>
              </div>
            )}
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold text-gray-800">
                R$ {calculatePrice(premiumPrice, billingCycle).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-600 ml-1 mb-1">/mês</span>
            </div>
            <button className="w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
              Assinar Agora <ArrowRight className="inline ml-2" size={18} />
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Renovação {billingCycle === 'monthly' ? 'mensal' : billingCycle === 'quarterly' ? 'trimestral' : 'anual'}
            </p>
          </div>
        </motion.div>

        {/* Plano Business - DigitFy Pro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              BUSINESS
            </span>
            <div className="h-6">
              {billingCycle === 'yearly' && (
                <span className="text-emerald-500 text-sm font-medium">+2 meses grátis</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">DigitFy Pro</h3>
            <p className="text-gray-600">Para quem quer mais escala e crescimento rápido</p>
          </div>

          <div className="border-t border-b border-gray-100 py-6 mb-6 h-96 overflow-y-auto">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Tudo do DigitFy Member +</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Trend Rush Ilimitado</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Pode enviar infoprodutos recomendados</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Destaque no ranking e recomendações</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso a ferramentas premium</span>
              </li>
              <li className="flex items-start pt-3">
                <Lock className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm font-medium text-gray-700">Desbloqueie em outros Planos:</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Envio de Posts para o Feed</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Suporte de ajuda prioritária</span>
              </li>
              <li className="flex items-start">
                <X className="text-gray-400 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-500">Pode impulsionar Infoprodutos recomendados</span>
              </li>
            </ul>
          </div>

              <div>
            {billingCycle !== 'monthly' && (
              <div className="flex items-center mb-1">
                <span className="text-sm text-gray-500 line-through mr-2">
                  R$ {businessPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {billingCycle === 'quarterly' ? 'ECONOMIZE 30%' : 'ECONOMIZE 60%'}
                </span>
              </div>
            )}
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold text-gray-800">
                R$ {calculatePrice(businessPrice, billingCycle).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-600 ml-1 mb-1">/mês</span>
            </div>
            <button className="w-full py-3 rounded-lg font-semibold transition-all bg-white border border-emerald-500 text-emerald-500 hover:bg-emerald-50">
              Assinar Agora <ArrowRight className="inline ml-2" size={18} />
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Renovação {billingCycle === 'monthly' ? 'mensal' : billingCycle === 'quarterly' ? 'trimestral' : 'anual'}
            </p>
          </div>
        </motion.div>

        {/* Plano Cloud - DigitFy Elite */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              ELITE
            </span>
            <div className="h-6">
              {billingCycle === 'yearly' && (
                <span className="text-emerald-500 text-sm font-medium">+2 meses grátis</span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">DigitFy Elite</h3>
            <p className="text-gray-600">O nível máximo de performance e exclusividade no digital!</p>
          </div>

          <div className="border-t border-b border-gray-100 py-6 mb-6 h-96 overflow-y-auto">
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Tudo do DigitFy Pro +</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Suporte Prioritário e Atendimento VIP</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Relatório semanal completo e personalizado</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Acesso exclusivo a estratégias de tráfego</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Maior alcance nas divulgações</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Badge de membro Elite no perfil</span>
              </li>
              <li className="flex items-start">
                <Check className="text-emerald-500 flex-shrink-0 mt-0.5 mr-2" size={20} />
                <span className="text-sm text-gray-600">Convites exclusivos para masterminds</span>
                </li>
            </ul>
          </div>

          <div>
            {billingCycle !== 'monthly' && (
              <div className="flex items-center mb-1">
                <span className="text-sm text-gray-500 line-through mr-2">
                  R$ {cloudPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {billingCycle === 'quarterly' ? 'ECONOMIZE 30%' : 'ECONOMIZE 60%'}
                </span>
              </div>
            )}
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold text-gray-800">
                R$ {calculatePrice(cloudPrice, billingCycle).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-gray-600 ml-1 mb-1">/mês</span>
            </div>
            <button className="w-full py-3 rounded-lg font-semibold transition-all bg-white border border-emerald-500 text-emerald-500 hover:bg-emerald-50">
              Assinar Agora <ArrowRight className="inline ml-2" size={18} />
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Renovação {billingCycle === 'monthly' ? 'mensal' : billingCycle === 'quarterly' ? 'trimestral' : 'anual'}
            </p>
          </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Upgrade;
