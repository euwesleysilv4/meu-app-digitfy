import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Link2, Users, Gift, Copy, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AffiliateVideo {
  id: string;
  titulo: string;
  descricao: string;
  youtube_id: string;
}

const Share: React.FC = () => {
  const [videoData, setVideoData] = useState<AffiliateVideo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAffiliateVideo = async () => {
      try {
        setIsLoading(true);
        
        // Usar a função RPC que criamos no banco de dados
        const { data, error } = await supabase
          .rpc('get_active_affiliate_video');
        
        if (error) {
          console.error('Erro ao carregar vídeo de afiliado:', error);
          setError('Não foi possível carregar o vídeo tutorial');
        } else if (data && data.length > 0) {
          setVideoData(data[0]);
        } else {
          // Definir um vídeo padrão caso não encontre nenhum no banco
          setVideoData({
            id: 'default',
            titulo: 'Como divulgar seu link de afiliado',
            descricao: 'Tutorial completo sobre como promover seu link de afiliado',
            youtube_id: 'SEU-VIDEO-ID-PADRAO'
          });
        }
      } catch (err) {
        console.error('Exceção ao carregar vídeo de afiliado:', err);
        setError('Erro ao carregar o vídeo tutorial');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAffiliateVideo();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://digitalfy.com/?ref=seucodigo');
    // Adicionar toast de sucesso aqui
  };

  const regulamento = [
    {
      title: "Elegibilidade",
      rules: [
        "Ser usuário ativo da DigitFy",
        "Ter uma conta verificada"
      ]
    },
    {
      title: "Recompensas",
      rules: [
        "Comece ganhando no mínimo 50% de comissão por cada plano assinado através do seu link",
        "Receba comissões recorrentes enquanto a assinatura do indicado estiver ativa",
        "Cookies eternos: se o usuário se cadastrar pelo seu link, você receberá a comissão mesmo que ele assine depois",
        "Pagamentos são realizados de acordo com seu prazo de pagamento na plataforma Cakto"
      ]
    },
    {
      title: "Restrições",
      rules: [
        "Não é permitido criar múltiplas contas",
        "Links não podem ser usados em spam",
        "Proibido uso de práticas fraudulentas"
      ]
    },
    {
      title: "Pagamentos",
      rules: [
        "Necessário ter dados bancários cadastrados"
      ]
    }
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Container principal com grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Coluna da esquerda (2/3 do espaço) */}
          <div className="lg:col-span-2">
            {/* Seção de Link de Indicação com Passo a Passo Kirvano */}
            <motion.div 
              className="mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-100">
                <div className="flex flex-col items-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-emerald-500/20">
                    <Share2 size={24} className="text-white sm:w-8 sm:h-8" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">Sistema de Indicações</h2>
                  <p className="text-sm sm:text-base text-gray-600 text-center max-w-md">
                    Siga o passo a passo para começar a ganhar com suas indicações
                  </p>
                </div>

                {/* Passo a Passo Kirvano */}
                <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-emerald-100 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-emerald-600 mb-3 sm:mb-4 text-center">Como funciona o sistema de indicações:</h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 text-sm sm:text-base font-medium">1</span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">Utilizamos a plataforma Cakto para fazer a integração de indicações, caso você não tenha uma conta na Cakto, crie sua conta através do nosso link oficial abaixo.</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 text-sm sm:text-base font-medium">2</span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">Após criada, clique no link tornar-se afiliado para pegar o seu código/link de indicação oficial da DigitFy.</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 text-sm sm:text-base font-medium">3</span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">Use seu link personalizado gerado pela Cakto para indicar a DigitFy e começar a ganhar.</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 text-sm sm:text-base font-medium">4</span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">Caso você se sinta perdido, logo abaixo temos um tutorial rápido e direto de como pegar seu link de indicação.</p>
                      </div>
                    </div>

                    {/* Informações importantes */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <h4 className="font-medium text-emerald-700 mb-2">Informações importantes</h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-emerald-600">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                          <span>Comissão base de 50% para todos os novos afiliados</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                          <span>Premiações personalizadas por metas de indicações</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                          <span>Suporte dedicado para Top Afiliados via WhatsApp</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                          <span>Material promocional exclusivo disponível para download</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <motion.a
                      href="https://app.cakto.com.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-emerald-200 text-emerald-600 rounded-lg sm:rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 size={16} />
                      Criar Conta na Cakto
                    </motion.a>
                    
                    <motion.a
                      href="https://app.cakto.com.br/affiliate/invite/513c2081-c475-4055-9f8c-9fc8553b02c6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg sm:rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 size={16} />
                      Tornar-se Afiliado
                    </motion.a>
                  </div>
                </div>

                {/* Vídeo Tutorial */}
                <div className="mt-8 sm:mt-12">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 text-center">
                    Como divulgar seu link de afiliado
                  </h3>
                  <div className="w-full max-w-4xl mx-auto">
                    <div className="relative pb-[56.25%] h-0">
                      {isLoading ? (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 rounded-lg sm:rounded-xl">
                          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : error ? (
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100 rounded-lg sm:rounded-xl">
                          <p className="text-red-500 text-center p-4">{error}</p>
                        </div>
                      ) : (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoData?.youtube_id || 'SEU-VIDEO-ID-PADRAO'}`}
                          title={videoData?.titulo || "Como divulgar seu link de afiliado"}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute top-0 left-0 w-full h-full rounded-lg sm:rounded-xl"
                        ></iframe>
                      )}
                    </div>
                  </div>
                  
                  {/* Botão de WhatsApp */}
                  <div className="mt-6 sm:mt-8 text-center w-full max-w-4xl mx-auto">
                    <motion.a
                      href="https://chat.whatsapp.com/LVpJHjfDLSh441Eq6Vw7wD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-emerald-200 text-emerald-600 rounded-lg sm:rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Entrar no Grupo de Afiliados
                    </motion.a>
                    <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">Junte-se a outros afiliados e receba dicas exclusivas</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Como Funciona - Processo Simplificado */}
            <motion.div 
              className="mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 mb-6 sm:mb-8">
                Como funciona
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {[
                  {
                    step: 1,
                    title: "Compartilhe",
                    description: "Utilize estratégias para divulgar seu Link de indicação.",
                    icon: Link2
                  },
                  {
                    step: 2,
                    title: "Novos Assinantes",
                    description: "Usuários se tornam assinante da DigitFy pelo seu Link.",
                    icon: Users
                  },
                  {
                    title: "Ganhe Recompensas",
                    description: "Receba 50% do valor de cada assinatura indicada por você.",
                    icon: Gift
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="relative flex flex-col items-center text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-emerald-500/20">
                      <item.icon size={20} className="text-white sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {item.description}
                    </p>
                    {index < 2 && (
                      <ChevronRight className="absolute -right-3 sm:-right-6 top-6 sm:top-8 text-emerald-300 hidden sm:block" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Plano de Carreira */}
            <motion.div 
              className="mb-8 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-emerald-100">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-emerald-800 mb-2 sm:mb-3">Plano de Carreira</h2>
                  <p className="text-sm sm:text-base text-emerald-600">Aumente sua comissão conforme seu número de indicações cresce</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  {[
                    { indicacoes: 50, comissao: 60 },
                    { indicacoes: 100, comissao: 65 },
                    { indicacoes: 150, comissao: 70 },
                    { indicacoes: 200, comissao: 75 },
                    { indicacoes: 250, comissao: 80 }
                  ].map((nivel, index) => (
                    <motion.div
                      key={index}
                      className="relative bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 text-center group hover:shadow-lg transition-all duration-300"
                      whileHover={{ y: -5 }}
                    >
                      {/* Indicador de Progresso */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <span className="text-base sm:text-lg font-bold text-emerald-600">{nivel.comissao}%</span>
                      </div>

                      {/* Detalhes */}
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs sm:text-sm text-gray-600">
                          {nivel.indicacoes}+ indicações
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Coluna da direita (1/3 do espaço) - Regulamento */}
          <motion.div
            className="lg:mt-0 mt-6 sm:mt-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl border border-emerald-100 overflow-hidden sticky top-4 sm:top-8">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 sm:p-4 text-center">
                <h2 className="text-base sm:text-lg font-semibold text-white">Regulamento do Programa</h2>
                <p className="text-xs sm:text-sm text-emerald-50">
                  Regras e condições para participar
                </p>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {regulamento.map((section, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  >
                    <h3 className="text-sm sm:text-base text-gray-800 font-semibold mb-2 sm:mb-3 flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                      {section.title}
                    </h3>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {section.rules.map((rule, ruleIndex) => (
                        <li 
                          key={ruleIndex}
                          className="text-xs sm:text-sm text-gray-600 flex items-start"
                        >
                          <div className="w-1 h-1 rounded-full bg-emerald-300 mt-1.5 sm:mt-2 mr-2"></div>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                <div className="text-xs text-gray-500 pt-3 sm:pt-4 border-t border-gray-100">
                  <p>
                    A DigitFy se reserva o direito de alterar as regras e condições do programa de indicação a qualquer momento, mediante aviso prévio aos participantes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Share;
