import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Gift, FileText, TrendingUp, DollarSign, Users, Zap, Award, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReferralProgram: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('como-funciona');
  
  // Simulando um link de afiliado/indicação
  const referralLink = 'https://digitalfy.com.br/?ref=SEU_USUARIO';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link copiado para a área de transferência!');
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-6 md:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-400/20 to-teal-400/20 p-3 rounded-full mb-4">
            <Share2 size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Indique e Ganhe
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Indique a Digitalfy para seus amigos e ganhe comissões por cada nova assinatura. É rápido, simples e lucrativo!
          </p>
        </motion.div>

        {/* Card principal com estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden mb-10"
        >
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu Link de Indicação</h2>
            <p className="text-gray-600 mb-6">
              Compartilhe este link com seus amigos, colegas ou em suas redes sociais e ganhe até 40% de comissão por cada nova assinatura!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-500 p-1"
                  aria-label="Copiar link"
                >
                  {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
              
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=Conheça a Digitalfy, a melhor plataforma para gerenciar seus sites e projetos digitais! ${referralLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path>
                    <path d="M12.05 0C5.495 0 .16 5.335.16 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413A11.815 11.815 0 0012.05 0zm0 21.784h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z"></path>
                  </svg>
                  WhatsApp
                </a>
                
                <button
                  onClick={copyToClipboard}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm mb-1">Indicações</p>
              <p className="text-3xl font-bold text-gray-800">0</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm mb-1">Conversões</p>
              <p className="text-3xl font-bold text-gray-800">0</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm mb-1">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-gray-800">0%</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-500 text-sm mb-1">Ganhos Totais</p>
              <p className="text-3xl font-bold text-emerald-600">R$ 0,00</p>
            </div>
          </div>
        </motion.div>

        {/* Abas de navegação */}
        <div className="flex flex-wrap mb-6 gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('como-funciona')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'como-funciona'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Como Funciona
          </button>
          <button
            onClick={() => setActiveTab('comissoes')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'comissoes'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Comissões
          </button>
          <button
            onClick={() => setActiveTab('termos')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'termos'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Termos e Condições
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === 'faq'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            Perguntas Frequentes
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div className="space-y-8">
          {activeTab === 'como-funciona' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Como funciona o programa de indicação</h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Share2 size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">1. Compartilhe seu link</h3>
                  <p className="text-gray-600">
                    Copie seu link exclusivo e compartilhe com amigos, em suas redes sociais, blogs ou onde preferir.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Users size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">2. Seus amigos se cadastram</h3>
                  <p className="text-gray-600">
                    Quando alguém usar seu link para se cadastrar na Digitalfy, eles serão automaticamente vinculados à sua conta.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign size={24} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">3. Você ganha comissões</h3>
                  <p className="text-gray-600">
                    Quando seus indicados assinam um plano, você ganha uma comissão por cada assinatura ativa.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Gift size={22} className="text-emerald-500 mr-2" />
                  Bônus Especial
                </h3>
                <p className="text-gray-600 mb-4">
                  Quanto mais amigos você indicar, maiores serão seus ganhos! A cada 5 amigos que assinarem nossos planos, você receberá um bônus extra de R$ 50,00.
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="bg-white rounded-xl p-4 flex-1 flex items-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                      <TrendingUp size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Comissão recorrente</p>
                      <p className="font-bold text-gray-800">Até 40% do valor</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex-1 flex items-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                      <Zap size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pagamento rápido</p>
                      <p className="font-bold text-gray-800">Todo dia 15</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex-1 flex items-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                      <Award size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sem limite</p>
                      <p className="font-bold text-gray-800">Indique à vontade</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'comissoes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tabela de comissões</h2>
              
              <div className="overflow-hidden rounded-xl border border-gray-200 mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Plano</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Valor da assinatura</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Comissão</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Seu ganho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Básico</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">R$ 14,99/mês</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium text-center">30%</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">R$ 4,50/mês</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Premium</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">R$ 25,99/mês</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium text-center">35%</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">R$ 9,10/mês</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Business</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">R$ 44,99/mês</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium text-center">40%</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">R$ 18,00/mês</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">Cloud Startup</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">R$ 79,99/mês</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium text-center">40%</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700 text-right">R$ 32,00/mês</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-emerald-400/10 to-teal-400/10 p-6 rounded-xl border border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <AlertCircle size={20} className="text-emerald-500 mr-2" />
                  Importante
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <ChevronRight size={18} className="text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                    As comissões são recorrentes e pagas enquanto o indicado mantiver a assinatura ativa.
                  </li>
                  <li className="flex items-start">
                    <ChevronRight size={18} className="text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                    Para saques, o valor mínimo é de R$ 50,00. Pagamentos são realizados via PIX ou transferência bancária.
                  </li>
                  <li className="flex items-start">
                    <ChevronRight size={18} className="text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                    As comissões são calculadas com base no valor líquido do plano, já descontados impostos e taxas.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'termos' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FileText size={24} className="text-emerald-500 mr-3" />
                Termos e Condições do Programa
              </h2>
              
              <div className="space-y-6 text-gray-600">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Elegibilidade</h3>
                  <p>Para participar do programa de indicação, você precisa ser um usuário registrado da Digitalfy com uma conta ativa.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Comissões</h3>
                  <p>Você receberá comissões por cada novo usuário que se inscrever usando seu link de indicação e assinar um plano pago. As comissões são recorrentes e serão pagas enquanto o usuário indicado mantiver sua assinatura ativa.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Pagamentos</h3>
                  <p>Os pagamentos são processados mensalmente, no dia 15, para todas as comissões acumuladas que ultrapassarem o valor mínimo de R$ 50,00. Caso não atinja o valor mínimo, o saldo será acumulado para o próximo mês.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Restrições</h3>
                  <p>Não é permitido indicar a si mesmo ou usar métodos fraudulentos para gerar indicações. A Digitalfy reserva-se o direito de suspender contas e cancelar comissões em caso de suspeita de fraude ou violação dos termos.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Alterações nos Termos</h3>
                  <p>A Digitalfy pode modificar os termos do programa de indicação a qualquer momento, com aviso prévio de 30 dias aos participantes.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Perguntas Frequentes</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Quando começo a ganhar comissões?</h3>
                  <p className="text-gray-600">Você começa a ganhar comissões assim que um amigo indicado assinar um plano pago através do seu link de indicação.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Por quanto tempo recebo comissões?</h3>
                  <p className="text-gray-600">Você recebe comissões enquanto o usuário indicado mantiver a assinatura ativa. Se ele cancelar, as comissões serão interrompidas.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Como recebo meu dinheiro?</h3>
                  <p className="text-gray-600">Os pagamentos são feitos via PIX ou transferência bancária no dia 15 de cada mês, para valores acima de R$ 50,00.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Existe um limite de pessoas que posso indicar?</h3>
                  <p className="text-gray-600">Não! Você pode indicar quantas pessoas quiser. Quanto mais indicações, maiores serão seus ganhos.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">O que acontece se um amigo já tiver conta na Digitalfy?</h3>
                  <p className="text-gray-600">O programa de indicação é válido apenas para novos usuários. Se seu amigo já tiver uma conta, não será possível vinculá-lo como uma indicação sua.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Posso usar o meu link para me cadastrar em outra conta?</h3>
                  <p className="text-gray-600">Não. Auto-indicações não são permitidas e podem resultar em suspensão da conta e cancelamento das comissões.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Simulador de ganhos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Calcule seus potenciais ganhos</h2>
            <p className="text-gray-600">Veja quanto você pode ganhar indicando amigos para a Digitalfy.</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">5 indicações</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Plano Premium</span>
                  <span className="text-gray-800">x5</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Comissão mensal</span>
                  <span className="text-gray-800">R$ 45,50</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ganho anual</span>
                    <span className="text-xl font-bold text-emerald-600">R$ 546,00</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border-2 border-emerald-200">
                <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">MAIS POPULAR</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">10 indicações</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Plano Business</span>
                  <span className="text-gray-800">x10</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Comissão mensal</span>
                  <span className="text-gray-800">R$ 180,00</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ganho anual</span>
                    <span className="text-xl font-bold text-emerald-600">R$ 2.160,00</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">20 indicações</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Planos variados</span>
                  <span className="text-gray-800">x20</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Comissão mensal</span>
                  <span className="text-gray-800">R$ 320,00</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ganho anual</span>
                    <span className="text-xl font-bold text-emerald-600">R$ 3.840,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pronto para começar a ganhar?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Comece agora mesmo a compartilhar seu link de indicação e transforme suas conexões em uma fonte de renda extra!
          </p>
          <button 
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 px-8 rounded-xl inline-flex items-center justify-center gap-2 transition-all transform hover:scale-105"
          >
            <Share2 size={20} />
            Começar a Indicar Agora
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ReferralProgram; 