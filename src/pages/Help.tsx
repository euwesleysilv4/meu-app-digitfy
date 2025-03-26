import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Mail,
  Clock,
  CheckCircle2,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

const Help: React.FC = () => {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: "Planos e Assinaturas",
      questions: [
        {
          q: "Como funciona o período de teste gratuito na DigitFy?",
          a: "Oferecemos 7 dias de teste gratuito em todos os planos. Durante este período, você tem acesso a todos os recursos do plano escolhido, sem compromisso."
        },
        {
          q: "Posso mudar de plano a qualquer momento na DigitFy?",
          a: "Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. As alterações são aplicadas imediatamente e o valor é ajustado proporcionalmente."
        },
        {
          q: "Quais formas de pagamento são aceitas na DigitFy?",
          a: "Aceitamos cartões de crédito, PIX e boleto bancário. Para assinaturas recorrentes, recomendamos o uso de cartão de crédito."
        },
        {
          q: "Como funciona o cancelamento da assinatura na DigitFy?",
          a: "O cancelamento pode ser feito a qualquer momento através do painel de controle. Você continuará tendo acesso aos serviços até o final do período pago."
        },
        {
          q: "Existe desconto para pagamentos anuais na DigitFy?",
          a: "Sim! Oferecemos 60% de desconto em todos os planos quando você escolhe pagar anualmente."
        }
      ]
    },
    {
      title: "Recursos e Funcionalidades",
      questions: [
        {
          q: "Como faço para personalizar meu perfil na DigitFy?",
          a: "Acesse as configurações do seu perfil, onde você pode adicionar foto, biografia e personalizar suas preferências de notificação."
        },
        {
          q: "Como funciona o sistema de indicações da DigitFy?",
          a: "Você recebe um link único de indicação. Cada pessoa que se inscrever através do seu link gera uma comissão de 50% do valor do plano escolhido."
        },
        {
          q: "Quais são os recursos exclusivos do plano Elite?",
          a: "O plano Elite inclui suporte prioritário 24/7, recursos avançados de personalização, análise detalhada de métricas e acesso antecipado a novos recursos."
        }
      ]
    },
    {
      title: "Suporte Técnico",
      questions: [
        {
          q: "Quanto tempo leva para obter resposta do suporte da DigitFy?",
          a: "Nossa equipe responde em até 2 horas em dias úteis. Para planos Elite e Pro, o suporte é prioritário e 24/7."
        },
        {
          q: "Como posso reportar um problema técnico?",
          a: "Você pode reportar problemas através do chat de suporte, email ou WhatsApp. Para agilizar o atendimento, inclua prints e descrições detalhadas do problema."
        },
        {
          q: "Existe documentação disponível para consulta?",
          a: "Sim! Mantemos uma base de conhecimento completa com tutoriais, guias e vídeos explicativos para ajudar você a tirar o máximo proveito da plataforma."
        }
      ]
    }
  ];

  const filteredFAQ = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
           q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Como podemos ajudar?
          </h1>
          <p className="text-gray-600 text-lg">
            Encontre respostas rápidas ou fale com nossa equipe de suporte
          </p>
        </motion.div>

        {/* Cards de Contato */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* WhatsApp Card */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 hover:border-emerald-200 transition-all duration-300 group">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MessageCircle className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4">
                  Atendimento disponível Seg - Sex das 12h às 18h
                </p>
                <div className="flex items-center text-sm text-emerald-600 mb-4">
                  <Clock size={16} className="mr-1" />
                  <span>Tempo médio de resposta: 5 a 30 minutos</span>
                </div>
                <a 
                  href="https://wa.me/SEUNUMEROAQUI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Iniciar conversa
                </a>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 hover:border-emerald-200 transition-all duration-300 group">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Mail className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Email</h3>
                <p className="text-gray-600 mb-4">
                  Envie sua dúvida por email e receba uma resposta detalhada
                </p>
                <div className="flex items-center text-sm text-emerald-600 mb-4">
                  <Clock size={16} className="mr-1" />
                  <span>Resposta em 24 a 48 horas</span>
                </div>
                <a 
                  href="mailto:contato@digitfy.com.br" 
                  className="inline-flex items-center px-4 py-2 bg-white border border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-all duration-300"
                >
                  <Mail size={16} className="mr-2" />
                  Enviar email
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barra de Pesquisa FAQ */}
        <motion.div 
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nas perguntas frequentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-300 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* FAQ Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredFAQ.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <HelpCircle size={20} className="mr-2 text-emerald-500" />
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, index) => {
                  const questionId = `${categoryIndex}-${index}`;
                  
                  return (
                    <motion.div
                      key={questionId}
                      initial={false}
                      animate={{ backgroundColor: activeQuestion === questionId ? 'rgb(243, 244, 246)' : 'white' }}
                      className="border border-emerald-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveQuestion(activeQuestion === questionId ? null : questionId)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
                      >
                        <span className="font-medium text-gray-800">{item.q}</span>
                        {activeQuestion === questionId ? (
                          <ChevronUp size={20} className="text-emerald-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </button>
                      <AnimatePresence>
                        {activeQuestion === questionId && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-emerald-100"
                          >
                            <div className="px-6 py-4 text-gray-600 bg-gray-50">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Não encontrou o que procurava? */}
        <motion.div 
          className="text-center mt-12 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Não encontrou o que procurava?
          </h3>
          <p className="text-gray-600 mb-6">
            Nossa equipe está pronta para te ajudar com qualquer dúvida
          </p>
          <a 
            href="https://wa.me/SEUNUMEROAQUI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle size={18} className="mr-2" />
            Falar com Suporte
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Help;
