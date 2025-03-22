import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Megaphone, Search, HandCoins, Users, 
  CheckCircle, Star, MessageSquare, Clock, Mail, Instagram, HandCoins as HandCoinsIcon, CreditCard, Calendar, Lock, ArrowRight
} from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate } from 'react-router-dom';

const Members = () => {
  const [selectedTab, setSelectedTab] = useState<'divulgar' | 'solicitar'>('divulgar');
  const { hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();
  
  // Verificar permissão para acessar solicitações de serviços
  const canViewServiceRequests = hasAccess('viewServiceRequests');
  
  // Log para depuração
  console.log("Plano atual em Members.tsx:", userPlan);
  console.log("Pode visualizar solicitações de serviços:", canViewServiceRequests);

  // Dados de exemplo para profissionais disponíveis (baseados no formulário de Prestador de Serviço)
  const profissionaisDisponiveis = [
    {
      id: 1,
      nome: 'Ana Silva',
      servico: 'Design Gráfico',
      descricao: 'Criação de artes para redes sociais, banners e identidade visual.',
      categoria: 'Design e Criação',
      preco: '120',
      metodosPagamento: ['Pix', 'Cartão'],
      opcaoPagamento: 'antecipado',
      contatoWhatsApp: '11999999999',
      contatoEmail: 'ana.silva@exemplo.com',
      contatoInstagram: '@anadesign',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      nome: 'Pedro Santos',
      servico: 'Copywriting',
      descricao: 'Textos persuasivos para campanhas de marketing e email marketing.',
      categoria: 'Copywriting',
      preco: '150',
      metodosPagamento: ['Pix', 'Boleto'],
      opcaoPagamento: 'parcelado',
      contatoWhatsApp: '11988888888',
      contatoEmail: 'pedro.santos@exemplo.com',
      contatoInstagram: '@pedrocopy',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
  ];

  // Dados de exemplo para solicitações de serviços
  const solicitacoesServicos = [
    {
      id: 1,
      nome: 'Carlos Oliveira',
      servico: 'Social Media',
      descricao: 'Preciso de um profissional para gerenciar minhas redes sociais.',
      categoria: 'Marketing',
      orcamento: 'R$ 1.500',
      prioridade: 'Urgente',
      contatoWhatsApp: '11977777777',
      contatoEmail: 'carlos.oliveira@exemplo.com',
      contatoInstagram: '@carlossocial',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      id: 2,
      nome: 'Mariana Costa',
      servico: 'Criação de Site',
      descricao: 'Busco um desenvolvedor para criar um site institucional.',
      categoria: 'Web/Dev',
      orcamento: 'R$ 3.000',
      prioridade: 'Normal',
      contatoWhatsApp: '11966666666',
      contatoEmail: 'mariana.costa@exemplo.com',
      contatoInstagram: '@marianadev',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  ];

  // Handler para o clique no botão de upgrade
  const handleUpgradeClick = () => {
    navigate('/dashboard/upgrade-plan');
  };

  // Renderiza o conteúdo de bloqueio para usuários gratuitos
  const renderBlockedContent = () => {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="bg-amber-100 p-3 rounded-full mb-4">
            <Lock className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Acesso Restrito</h2>
          <p className="text-gray-600 max-w-md mb-6">
            Para visualizar as solicitações de serviços, é necessário ter um plano Member ou superior.
            Faça upgrade do seu plano e tenha acesso a essa e outras funcionalidades exclusivas.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>Fazer Upgrade do Plano</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Retângulo Verde Claro */}
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-4xl font-bold text-emerald-600">Serviços de Marketing Digital</h1>
              <p className="text-gray-600 max-w-3xl mt-2">
                Encontre profissionais disponíveis ou veja quem está solicitando serviços.
              </p>
            </div>
            {/* Tabs de Navegação */}
            <motion.div 
              className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setSelectedTab('divulgar')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 group ${
                  selectedTab === 'divulgar'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-white text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-105 border border-gray-200 hover:border-emerald-300'
                }`}
              >
                <Megaphone size={20} className="transition-all duration-300 group-hover:rotate-12" />
                <span className="transition-all duration-300 group-hover:translate-x-1">Profissionais Disponíveis</span>
              </button>
              
              {/* Botão de Solicitações de Serviços - com indicador de bloqueio para plano gratuito */}
              <button
                onClick={() => setSelectedTab('solicitar')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 group ${
                  selectedTab === 'solicitar'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                    : 'bg-white text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:scale-105 border border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center">
                  <HandCoins size={20} className="transition-all duration-300 group-hover:rotate-12" />
                  {!canViewServiceRequests && (
                    <Lock size={12} className="text-amber-500 -ml-1 -mt-3" />
                  )}
                </div>
                <span className="transition-all duration-300 group-hover:translate-x-1">Solicitações de Serviços</span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo Dinâmico */}
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {selectedTab === 'divulgar' ? (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {/* Aviso Importante */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6">
              <p className="text-sm text-yellow-700">
                <strong>Aviso Importante:</strong> A DigitFy atua exclusivamente como uma plataforma de divulgação e conexão entre profissionais e usuários. Não nos responsabilizamos por quaisquer acordos, transações ou interações que ocorram após a conexão. Recomendamos que todas as partes envolvidas realizem verificações e acordos prévios de forma independente.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-emerald-600 mb-6">Profissionais Disponíveis</h2>
            <p className="text-gray-600 mb-6">
              Encontre profissionais qualificados para atender suas necessidades.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profissionaisDisponiveis.map((profissional) => (
                <div
                  key={profissional.id}
                  className="bg-white p-6 rounded-xl border border-gray-100 hover:bg-emerald-50 transition-all"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={profissional.avatar} 
                      alt={profissional.nome} 
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-600">{profissional.nome}</h3>
                      <p className="text-gray-600">{profissional.servico}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{profissional.descricao}</p>

                  {/* Informações Detalhadas */}
                  <div className="space-y-3">
                    {/* Categoria */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span><strong>Categoria:</strong> {profissional.categoria}</span>
                    </div>

                    {/* Preço */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <HandCoinsIcon size={16} />
                      <span><strong>Preço:</strong> R$ {profissional.preco}</span>
                    </div>

                    {/* Métodos de Pagamento */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CreditCard size={16} />
                      <span><strong>Métodos de Pagamento:</strong> {profissional.metodosPagamento.join(', ')}</span>
                    </div>

                    {/* Opção de Pagamento */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {profissional.opcaoPagamento === 'antecipado' ? (
                        <HandCoinsIcon size={16} />
                      ) : profissional.opcaoPagamento === 'parcelado' ? (
                        <CreditCard size={16} />
                      ) : (
                        <Calendar size={16} />
                      )}
                      <span>
                        <strong>Opção de Pagamento:</strong>{' '}
                        {profissional.opcaoPagamento === 'antecipado'
                          ? 'Pagamento antecipado (10% de desconto)'
                          : profissional.opcaoPagamento === 'parcelado'
                          ? '50% no pedido e 50% na entrega'
                          : 'Pagamento somente na entrega'}
                      </span>
                    </div>

                    {/* Contatos */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600"><strong>Contato:</strong></p>
                      {profissional.contatoWhatsApp && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MessageSquare size={16} />
                          <span>{profissional.contatoWhatsApp}</span>
                        </div>
                      )}
                      {profissional.contatoEmail && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail size={16} />
                          <span>{profissional.contatoEmail}</span>
                        </div>
                      )}
                      {profissional.contatoInstagram && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Instagram size={16} />
                          <span>{profissional.contatoInstagram}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão "Contratar Serviço" */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-6 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <HandCoins size={18} />
                    <span>Contratar Serviço</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Conteúdo condicionalmente renderizado baseado na permissão
          canViewServiceRequests ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              {/* Aviso Importante */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6">
                <p className="text-sm text-yellow-700">
                  <strong>Aviso Importante:</strong> A DigitFy atua exclusivamente como uma plataforma de divulgação e conexão entre profissionais e usuários. Não nos responsabilizamos por quaisquer acordos, transações ou interações que ocorram após a conexão. Recomendamos que todas as partes envolvidas realizem verificações e acordos prévios de forma independente.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-emerald-600 mb-6">Solicitações de Serviços</h2>
              <p className="text-gray-600 mb-6">
                Veja quem está precisando de serviços de marketing digital.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solicitacoesServicos.map((solicitacao) => (
                  <div
                    key={solicitacao.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 hover:bg-emerald-50 transition-all"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img 
                        src={solicitacao.avatar} 
                        alt={solicitacao.nome} 
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-600">{solicitacao.nome}</h3>
                        <p className="text-gray-600">{solicitacao.servico}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{solicitacao.descricao}</p>

                    {/* Informações Detalhadas */}
                    <div className="space-y-3">
                      {/* Categoria */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Briefcase size={16} />
                        <span><strong>Categoria:</strong> {solicitacao.categoria}</span>
                      </div>

                      {/* Orçamento */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <HandCoinsIcon size={16} />
                        <span><strong>Orçamento:</strong> {solicitacao.orcamento}</span>
                      </div>

                      {/* Prioridade */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span><strong>Prioridade:</strong> {solicitacao.prioridade}</span>
                      </div>

                      {/* Contatos */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600"><strong>Contato:</strong></p>
                        {solicitacao.contatoWhatsApp && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MessageSquare size={16} />
                            <span>{solicitacao.contatoWhatsApp}</span>
                          </div>
                        )}
                        {solicitacao.contatoEmail && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail size={16} />
                            <span>{solicitacao.contatoEmail}</span>
                          </div>
                        )}
                        {solicitacao.contatoInstagram && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Instagram size={16} />
                            <span>{solicitacao.contatoInstagram}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botão "Oferecer Serviço" */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-6 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <HandCoins size={18} />
                      <span>Oferecer Serviço</span>
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Renderizar o conteúdo de bloqueio para usuários sem permissão
            renderBlockedContent()
          )
        )}
      </motion.div>
    </div>
  );
};

export default Members;
