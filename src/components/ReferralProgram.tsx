import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, CheckCircle, Users, DollarSign, Share2, ArrowRight } from 'lucide-react';

const ReferralProgram: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Link de referência fictício - substitua pelo real
  const referralLink = 'https://digitalfy.com.br/ref/seunome123';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showCopyTooltip = () => {
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className="py-16 bg-gradient-to-b from-white via-emerald-50/30 to-teal-50/20">
      <div className="container mx-auto px-4">
        {/* Cabeçalho da seção */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-3 rounded-2xl shadow-md">
              <Gift size={28} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Indique e Ganhe
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Indique a Digitalfy para seus amigos e ganhe recompensas em dinheiro para cada nova assinatura paga.
          </p>
        </motion.div>

        {/* Card principal */}
        <motion.div 
          className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Seção explicativa */}
            <div className="p-8 md:p-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <h3 className="text-2xl font-bold mb-6">Como funciona</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4 backdrop-blur-sm">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">1. Compartilhe seu link</h4>
                    <p className="text-white/80 text-sm">
                      Envie seu link de indicação exclusivo para amigos, clientes ou em suas redes sociais.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4 backdrop-blur-sm">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">2. Amigos se inscrevem</h4>
                    <p className="text-white/80 text-sm">
                      Quando alguém se inscreve através do seu link e realiza uma compra, você recebe crédito pela indicação.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-4 backdrop-blur-sm">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">3. Ganhe recompensas</h4>
                    <p className="text-white/80 text-sm">
                      Receba até R$ 100 para cada novo cliente que assinar um plano pago da Digitalfy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Gift size={16} className="mr-2" /> Bônus especial
                  </h4>
                  <p className="text-white/90 text-sm">
                    Indique 5 amigos que assinem um plano pago e ganhe 1 mês grátis do plano Premium.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Seção de compartilhamento */}
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Seu link de indicação</h3>
                <p className="text-gray-600 mb-6">
                  Compartilhe este link com seus amigos para começar a ganhar recompensas.
                </p>
                
                {/* Link de referência */}
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="w-full bg-gray-50 border border-gray-200 rounded-l-xl py-3 px-4 text-gray-800 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        copyToClipboard();
                        showCopyTooltip();
                      }}
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white px-4 py-3 rounded-r-xl flex items-center transition-all duration-300"
                    >
                      {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  
                  {/* Tooltip de cópia */}
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-3 rounded"
                    >
                      Link copiado!
                    </motion.div>
                  )}
                </div>
                
                {/* Botões de compartilhamento */}
                <div className="mb-8">
                  <p className="text-gray-600 text-sm mb-3">Ou compartilhe diretamente:</p>
                  <div className="flex space-x-3">
                    <button className="bg-[#25D366] text-white p-2.5 rounded-lg hover:bg-opacity-90 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path>
                      </svg>
                    </button>
                    <button className="bg-[#1DA1F2] text-white p-2.5 rounded-lg hover:bg-opacity-90 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.599-.1-.899a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
                      </svg>
                    </button>
                    <button className="bg-[#4267B2] text-white p-2.5 rounded-lg hover:bg-opacity-90 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325 1.42-3.592 3.5-3.592.699-.002 1.399.034 2.095.107v2.42h-1.435c-1.128 0-1.348.538-1.348 1.325v1.735h2.697l-.35 2.725h-2.348V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"></path>
                      </svg>
                    </button>
                    <button className="bg-[#0e76a8] text-white p-2.5 rounded-lg hover:bg-opacity-90 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.7 3H4.3C3.582 3 3 3.582 3 4.3v15.4c0 .718.582 1.3 1.3 1.3h15.4c.718 0 1.3-.582 1.3-1.3V4.3c0-.718-.582-1.3-1.3-1.3zM8.339 18.338H5.667v-8.59h2.672v8.59zM7.004 8.574a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096zm11.335 9.764H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389 0-1.601 1.086-1.601 2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.779 3.203 4.092v4.711z"></path>
                      </svg>
                    </button>
                    <button className="bg-gray-500 text-white p-2.5 rounded-lg hover:bg-opacity-90 transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Estatísticas de ganhos */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="text-gray-800 font-medium mb-3">Seus ganhos</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Pessoas indicadas</p>
                    <p className="text-xl font-bold text-gray-800">0</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Ganhos totais</p>
                    <p className="text-xl font-bold text-gray-800">R$ 0,00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Destaques/Benefícios */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-emerald-200 transition-all duration-300">
            <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ganhe dinheiro real</h3>
            <p className="text-gray-600 text-sm">
              Receba até R$ 100 por cada novo cliente pago. Os valores são depositados diretamente na sua conta.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-emerald-200 transition-all duration-300">
            <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sem limite de indicações</h3>
            <p className="text-gray-600 text-sm">
              Indique quantas pessoas quiser. Não há limite para o número de amigos ou valores que você pode ganhar.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:border-emerald-200 transition-all duration-300">
            <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Processo simples</h3>
            <p className="text-gray-600 text-sm">
              Fácil de compartilhar e acompanhar. Monitore suas indicações e ganhos diretamente no painel de controle.
            </p>
          </div>
        </motion.div>
        
        {/* CTA Final */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto">
            Comece a indicar agora
            <ArrowRight size={16} className="ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferralProgram; 