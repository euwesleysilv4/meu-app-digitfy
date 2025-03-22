import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Link2, Users, Gift, Copy, ChevronRight } from 'lucide-react';

const Share: React.FC = () => {
  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://digitalfy.com/?ref=seucodigo');
    // Adicionar toast de sucesso aqui
  };

  const regulamento = [
    {
      title: "Elegibilidade",
      rules: [
        "Ser usuário ativo da Digitalfy",
        "Ter uma conta verificada"
      ]
    },
    {
      title: "Recompensas",
      rules: [
        "Ganhe 50% de comissão por cada plano assinado através do seu link",
        "Receba comissões recorrentes enquanto a assinatura do indicado estiver ativa",
        "Cookies eternos: se o usuário se cadastrar pelo seu link, você receberá a comissão mesmo que ele assine depois",
        "Pagamentos são realizados de acordo com seu prazo de pagamento na plataforma Lastlink"
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
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Container principal com grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da esquerda (2/3 do espaço) */}
          <div className="lg:col-span-2">
            {/* Seção de Link de Indicação com Passo a Passo Kirvano */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <Share2 size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">Sistema de Indicações</h2>
                  <p className="text-gray-600 text-center max-w-md">
                    Siga o passo a passo para começar a ganhar com suas indicações
                  </p>
                </div>

                {/* Passo a Passo Kirvano */}
                <div className="mb-8 space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 p-6">
                    <h3 className="text-lg font-semibold text-emerald-600 mb-4">Como funciona o sistema de indicações:</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 font-medium">1</span>
                        </div>
                        <p className="text-gray-600">Utilizamos a plataforma Lastlink para fazer a integração de indicações, caso você não tenha uma conta na Lastlink, crie sua conta através do nosso link oficial abaixo.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 font-medium">2</span>
                        </div>
                        <p className="text-gray-600">Após criada, clique no link tornar-se afiliado para pegar o seu código/link de indicação oficial da DigitFy.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 font-medium">3</span>
                        </div>
                        <p className="text-gray-600">Use seu link personalizado gerado pela Lastlink para indicar a DigitFy e começar a ganhar.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-emerald-600 font-medium">4</span>
                        </div>
                        <p className="text-gray-600">Caso você se sinta perdido, logo abaixo temos um tutorial rápido e direto de como pegar seu link de indicação.</p>
                      </div>
                    </div>

                    {/* Informações importantes */}
                    <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <h4 className="font-medium text-emerald-700 mb-2">Informações importantes</h4>
                      <ul className="space-y-2 text-sm text-emerald-600">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.a
                      href="https://lastlink.com/register" // Substitua com o link correto
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 size={16} />
                      Criar Conta na Lastlink
                    </motion.a>
                    
                    <motion.a
                      href="https://lastlink.com/affiliates" // Substitua com o link correto
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 size={16} />
                      Tornar-se Afiliado
                    </motion.a>
                  </div>
                </div>

                {/* Vídeo Tutorial - Tamanho Aumentado */}
                <div className="mt-12">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                    Como divulgar seu link de afiliado
                  </h3>
                  <div className="w-full max-w-4xl mx-auto">
                    <div className="relative pb-[56.25%] h-0">
                      <iframe
                        src="https://www.youtube.com/embed/SEU-VIDEO-ID" // Substitua com o ID do vídeo correto
                        title="Como divulgar seu link de afiliado"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                      ></iframe>
                    </div>
                  </div>
                  
                  {/* Botão de WhatsApp */}
                  <div className="mt-8 text-center w-full max-w-4xl mx-auto">
                    <motion.a
                      href="https://chat.whatsapp.com/grupo-afiliados" // Substitua com o link real do grupo do WhatsApp
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#10B981" className="text-emerald-600">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      </svg>
                      Entrar no Grupo de Afiliados
                    </motion.a>
                    <p className="mt-6 text-sm text-gray-500">Junte-se a outros afiliados e receba dicas exclusivas</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Como Funciona - Processo Simplificado */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
                Como funciona
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    step: 3,
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
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                      <item.icon size={24} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                    {index < 2 && (
                      <ChevronRight className="absolute -right-6 top-8 text-emerald-300 hidden md:block" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Plano de Carreira */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-emerald-800 mb-3">Plano de Carreira</h2>
                  <p className="text-emerald-600">Aumente sua comissão conforme seu número de indicações cresce</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { indicacoes: 50, comissao: 60 },
                    { indicacoes: 100, comissao: 65 },
                    { indicacoes: 150, comissao: 70 },
                    { indicacoes: 200, comissao: 75 },
                    { indicacoes: 250, comissao: 80 }
                  ].map((nivel, index) => (
                    <motion.div
                      key={index}
                      className="relative bg-white rounded-xl p-6 text-center group hover:shadow-lg transition-all duration-300"
                      whileHover={{ y: -5 }}
                    >
                      {/* Indicador de Progresso - Círculo menor e números menores */}
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-lg font-bold text-emerald-600">{nivel.comissao}%</span>
                      </div>

                      {/* Detalhes */}
                      <div className="space-y-2">
                        <p className="text-sm text-emerald-600 font-medium">
                          {nivel.indicacoes} Indicações
                        </p>
                      </div>

                      {/* Linha conectora (exceto no último item) */}
                      {index < 4 && (
                        <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-emerald-200 transform -translate-y-1/2" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Nota Informativa */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-emerald-600">
                    Comece com 50% e aumente sua comissão à medida que suas indicações crescem
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA Final */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-gray-600 mb-6">
                Comece agora mesmo a expandir sua rede e ganhar recompensas exclusivas com a Digitalfy
              </p>
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Começar a Indicar
              </motion.button>
            </motion.div>
          </div>

          {/* Coluna da direita (1/3 do espaço) - Regulamento */}
          <motion.div
            className="lg:mt-0 mt-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
                <h2 className="text-white text-lg font-semibold">Regulamento do Programa</h2>
                <p className="text-emerald-50 text-sm">
                  Regras e condições para participar
                </p>
              </div>
              
              <div className="p-6 space-y-6">
                {regulamento.map((section, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                  >
                    <h3 className="text-gray-800 font-semibold mb-3 flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.rules.map((rule, ruleIndex) => (
                        <li 
                          key={ruleIndex}
                          className="text-sm text-gray-600 flex items-start"
                        >
                          <div className="w-1 h-1 rounded-full bg-emerald-300 mt-2 mr-2"></div>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <p>
                    A Digitalfy se reserva o direito de alterar as regras e condições do programa de indicação a qualquer momento, mediante aviso prévio aos participantes.
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
