import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, MessageCircle, CreditCard, AlertCircle, CheckCircle, 
  ShoppingCart, Heart, Star, Users, ArrowRight, Plus, Trash2,
  Edit3, Zap, Clock
} from 'lucide-react';

interface FunnelStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  timing: string;
  message: string;
  tips?: string[];
  messages?: { scenario: string; text: string }[];
}

const phases = [
  {
    id: 1,
    title: "Captação e Conversão Inicial",
    steps: [
      {
        title: "Primeiro Contato (Lead Quente)",
        description: "Lead demonstrou interesse inicial no produto",
        timing: "Imediatamente após demonstração de interesse",
        message: "Ei, vi que você se interessou em [produto]! Posso te explicar como ele pode te ajudar?",
        tips: [
          "Chamar atenção para o benefício principal",
          "Criar urgência na resposta",
          "Personalizar a mensagem com o nome do lead"
        ]
      },
      {
        title: "Persuasão e Gatilhos Mentais",
        description: "Aplicação de prova social e remoção de objeções",
        timing: "2-4 horas após primeiro contato sem resposta",
        message: "Muita gente que estava na sua situação já conseguiu [resultado]. O que falta pra você dar esse passo?",
        tips: [
          "Mostrar prova social concreta",
          "Remover objeções comuns",
          "Criar conexão emocional"
        ]
      },
      {
        title: "Geração de Pedido",
        description: "Acompanhamento do processo de pagamento",
        timing: "Imediatamente após cada ação",
        messages: [
          {
            scenario: "PIX Gerado",
            text: "Opa! Seu pedido foi gerado, só falta o pagamento. Garanta antes que [bônus/acesso especial] acabe! 💸"
          },
          {
            scenario: "Cartão Recusado",
            text: "Opa, seu pagamento não foi aprovado. Quer tentar outro cartão ou precisa de ajuda?"
          }
        ],
        tips: [
          "Enfatizar a urgência da oferta",
          "Destacar bônus exclusivos",
          "Oferecer suporte imediato para problemas"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Recuperação de Carrinho e Remarketing",
    steps: [
      {
        title: "PIX Expirado",
        description: "Recuperação imediata de PIX não pago",
        timing: "Imediatamente após expiração do PIX",
        message: "Seu PIX expirou, mas ainda dá tempo de garantir o [produto]! Gerando um novo agora pra você...",
        tips: [
          "Mostrar disposição em ajudar",
          "Facilitar o processo de novo pagamento",
          "Manter tom prestativo"
        ]
      },
      {
        title: "Aquecimento para Remarketing",
        description: "Reativação com prova social e urgência",
        timing: "24 horas após abandono",
        message: "Vi que você se interessou no [produto], mas ainda não garantiu seu acesso. Muitas pessoas tinham essa dúvida, mas olha o que quem já comprou está dizendo: [depoimento].",
        tips: [
          "Usar depoimentos relevantes",
          "Abordar objeções comuns",
          "Criar identificação com casos de sucesso"
        ]
      },
      {
        title: "Oferta Irresistível",
        description: "Apresentação de desconto ou bônus especial",
        timing: "48 horas após abandono",
        message: "Pra te ajudar a dar esse passo, liberamos um desconto especial de [X]% por tempo limitado! Mas essa oferta só vale até hoje às 23:59. Quer seu link com desconto?",
        tips: [
          "Especificar o valor do desconto",
          "Criar senso de urgência",
          "Destacar a exclusividade da oferta"
        ]
      },
      {
        title: "Criando Escassez e Ação Rápida",
        description: "Última chance com prazo definido",
        timing: "72 horas após abandono",
        message: "Essa pode ser sua última chance de ter o [produto] por esse valor especial. Depois, volta ao preço normal! Clique aqui e garanta agora: [link do checkout com desconto]",
        tips: [
          "Enfatizar que é a última oportunidade",
          "Incluir link direto para compra",
          "Reforçar o prazo limite"
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Pós-Venda e Aumento de Ticket",
    steps: [
      {
        title: "Venda Aprovada - Boas-Vindas",
        description: "Confirmação de compra e acesso",
        timing: "Imediatamente após aprovação do pagamento",
        message: "Parabéns! Agora você faz parte do time que [benefício do produto]. Aqui está seu acesso: [link]",
        tips: [
          "Reforçar o benefício principal",
          "Fornecer acesso de forma clara",
          "Criar sensação de pertencimento"
        ]
      },
      {
        title: "Upsell Imediato",
        description: "Oferta de upgrade para versão premium",
        timing: "30 minutos após primeiro acesso",
        messages: [
          {
            scenario: "Oferta Premium",
            text: "Quer ter um resultado ainda mais rápido? Liberamos um upgrade exclusivo pra você: [produto premium] com um desconto de [X]%. Só hoje!"
          }
        ],
        tips: [
          "Destacar benefícios adicionais",
          "Criar urgência com prazo limitado",
          "Enfatizar o desconto exclusivo"
        ]
      },
      {
        title: "Downsell Estratégico",
        description: "Oferta alternativa mais acessível",
        timing: "2 horas após recusa do Upsell",
        messages: [
          {
            scenario: "Oferta Alternativa",
            text: "Sabemos que às vezes um investimento maior não cabe agora. Por isso, temos uma versão mais acessível com os principais benefícios por apenas [preço menor]."
          }
        ],
        tips: [
          "Mostrar compreensão com o orçamento",
          "Destacar benefícios essenciais",
          "Apresentar preço mais atrativo"
        ]
      },
      {
        title: "Order Bump",
        description: "Oferta complementar no checkout",
        timing: "Durante ou imediatamente após a compra",
        messages: [
          {
            scenario: "Produto Complementar",
            text: "Antes de finalizar, que tal adicionar [produto complementar] por apenas +[preço]? Essa oferta não aparece depois!"
          }
        ],
        tips: [
          "Enfatizar a exclusividade da oferta",
          "Mostrar valor agregado",
          "Criar senso de oportunidade única"
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Construção de Relacionamento e Nova Oferta",
    steps: [
      {
        title: "Follow-Up 3 Dias",
        description: "Verificação inicial da experiência",
        timing: "3 dias após a compra",
        messages: [
          {
            scenario: "Verificação de Acesso",
            text: "E aí, conseguiu acessar? Como está indo com [produto]?"
          },
          {
            scenario: "Suporte Proativo",
            text: "Se precisar de alguma ajuda ou tiver dúvidas, pode me chamar! 😊"
          }
        ],
        tips: [
          "Manter tom casual e amigável",
          "Mostrar disponibilidade para ajuda",
          "Identificar possíveis dificuldades iniciais"
        ]
      },
      {
        title: "Follow-Up 7 Dias",
        description: "Compartilhamento de caso de sucesso",
        timing: "7 dias após a compra",
        messages: [
          {
            scenario: "História de Sucesso",
            text: "Olha o resultado do [cliente X] com o produto! Como está sendo pra você?"
          },
          {
            scenario: "Engajamento",
            text: "Já acessou a área [X]? É onde a maioria dos alunos consegue os melhores resultados! 🚀"
          }
        ],
        tips: [
          "Compartilhar casos reais de sucesso",
          "Incentivar uso de áreas específicas",
          "Criar identificação com outros usuários"
        ]
      },
      {
        title: "Follow-Up 14 Dias",
        description: "Apresentação de nova oferta",
        timing: "14 dias após a compra",
        messages: [
          {
            scenario: "Introdução do Cross-Sell",
            text: "Agora que você já teve tempo pra testar, quero te mostrar algo que pode te ajudar ainda mais: [produto complementar ou assinatura]."
          },
          {
            scenario: "Oferta com Urgência",
            text: "Por ser aluno(a), você tem acesso a um desconto especial de [X]% + [bônus exclusivo]. Mas só temos [Y] vagas disponíveis!"
          }
        ],
        tips: [
          "Relacionar com a experiência atual",
          "Destacar benefícios complementares",
          "Criar senso de urgência com vagas limitadas"
        ]
      },
      {
        title: "Acompanhamento Contínuo",
        description: "Manutenção do relacionamento",
        timing: "Periodicamente após 14 dias",
        messages: [
          {
            scenario: "Check-in Regular",
            text: "Como está sua jornada com [produto]? Já alcançou [objetivo específico]? Estou aqui pra ajudar! 💪"
          },
          {
            scenario: "Dica de Valor",
            text: "Separei uma dica especial que pode te ajudar com [desafio comum]: [link do conteúdo/recurso]"
          }
        ],
        tips: [
          "Manter contato regular",
          "Oferecer conteúdo de valor",
          "Acompanhar progresso do cliente"
        ]
      }
    ]
  }
];

const LTVFunnel = () => {
  const [activePhase, setActivePhase] = useState(1);
  const [steps, setSteps] = useState<FunnelStep[]>([
    {
      id: '1',
      phase: 'Fase 1: Captação e Conversão Inicial',
      title: 'Primeiro Contato (Lead Quente)',
      description: 'Primeiro contato com leads que demonstraram interesse',
      timing: 'Imediatamente após demonstração de interesse',
      message: 'Ei, vi que você se interessou em [produto]! Posso te explicar como ele pode te ajudar?',
      tips: [
        'Personalize a mensagem com o nome do lead',
        'Mencione o produto específico de interesse',
        'Mantenha um tom amigável e prestativo'
      ]
    },
    {
      id: '2',
      phase: 'Fase 1: Captação e Conversão Inicial',
      title: 'Persuasão e Gatilhos',
      description: 'Aplicação de gatilhos mentais e prova social',
      timing: '2 horas após primeiro contato sem resposta',
      message: 'Muita gente que estava na sua situação já conseguiu [resultado]. O que falta pra você dar esse passo?',
      tips: [
        'Inclua casos de sucesso específicos',
        'Use números e estatísticas quando possível',
        'Crie senso de pertencimento'
      ]
    },
    {
      id: '3',
      phase: 'Fase 2: Processo de Compra',
      title: 'PIX Gerado',
      description: 'Cliente iniciou processo de pagamento via PIX',
      timing: 'Imediatamente após geração do PIX',
      message: 'Opa! Seu pedido foi gerado, só falta o pagamento. Garanta antes que [bônus/acesso especial] acabe! 💸',
      tips: [
        'Enfatize a urgência da oferta',
        'Mencione bônus exclusivos',
        'Forneça suporte para dúvidas'
      ]
    },
    {
      id: '4',
      phase: 'Fase 2: Processo de Compra',
      title: 'Cartão Recusado',
      description: 'Tentativa de pagamento com cartão não aprovada',
      timing: 'Imediatamente após recusa do cartão',
      message: 'Opa, seu pagamento não foi aprovado. Quer tentar outro cartão ou precisa de ajuda?',
      tips: [
        'Ofereça métodos alternativos de pagamento',
        'Mostre-se disponível para ajudar',
        'Mantenha tom empático'
      ]
    },
    {
      id: '5',
      phase: 'Fase 3: Pós-Compra Imediato',
      title: 'Confirmação de Compra',
      description: 'Pagamento aprovado e confirmado',
      timing: 'Imediatamente após confirmação do pagamento',
      message: 'Parabéns pela aquisição! 🎉 Seu acesso já está liberado. Aqui está seu login: [dados]. Precisa de ajuda para começar?',
      tips: [
        'Confirme todos os dados de acesso',
        'Ofereça orientação inicial',
        'Demonstre disponibilidade para suporte'
      ]
    },
    {
      id: '6',
      phase: 'Fase 4: Engajamento e Retenção',
      title: 'Acompanhamento 24h',
      description: 'Primeiro check-in após a compra',
      timing: '24 horas após primeiro acesso',
      message: 'E aí, como está sendo sua experiência com [produto]? Já acessou [área específica]? Estou aqui se precisar de ajuda! 😊',
      tips: [
        'Pergunte sobre a experiência inicial',
        'Sugira próximos passos específicos',
        'Reforce disponibilidade para suporte'
      ]
    }
  ]);

  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddStep = () => {
    const newStep: FunnelStep = {
      id: Date.now().toString(),
      phase: '',
      title: '',
      description: '',
      timing: '',
      message: '',
      tips: []
    };
    setEditingStep(newStep);
    setShowForm(true);
  };

  const handleSaveStep = (step: FunnelStep) => {
    if (editingStep) {
      setSteps(prev => {
        const existing = prev.find(s => s.id === step.id);
        if (existing) {
          return prev.map(s => s.id === step.id ? step : s);
        }
        return [...prev, step];
      });
    }
    setEditingStep(null);
    setShowForm(false);
  };

  const handleDeleteStep = (id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-6"
        >
          <div className="p-3 bg-emerald-100 rounded-full">
            <GitBranch className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Funil de LTV</h1>
            <p className="text-gray-600 mt-1">
              Otimize sua jornada de vendas e aumente o valor do tempo de vida do cliente
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navegação entre Fases - ATUALIZADA */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                flex flex-col items-center justify-center text-center
                hover:shadow-md
                ${activePhase === phase.id 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'}
              `}
            >
              <span className="text-xs font-semibold mb-1">Fase {phase.id}</span>
              <span className="text-xs leading-tight">
                {phase.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Fase Ativa */}
      <motion.div
        key={activePhase}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Fase {activePhase}: {phases[activePhase - 1].title}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {phases[activePhase - 1].steps.map((step, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="border-t border-gray-100 my-6" />}
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      <p className="text-xs text-emerald-600 mt-2">
                        Timing: {step.timing}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">
                          {step.messages ? 'Mensagens Sugeridas:' : 'Mensagem Sugerida:'}
                        </h4>
                        {step.messages ? (
                          <div className="space-y-3 mt-2">
                            {step.messages.map((msg, msgIndex) => (
                              <div key={msgIndex}>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                  {msg.scenario}:
                                </p>
                                <p className="text-gray-600 bg-white p-3 rounded border border-gray-100">
                                  {msg.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-gray-600 bg-white p-3 rounded border border-gray-100">
                            {step.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Dicas:</h4>
                        <ul className="mt-2 space-y-2">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                              <ArrowRight className="w-4 h-4 text-emerald-500" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Modal de Edição */}
      {showForm && editingStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingStep.id ? 'Editar Etapa' : 'Nova Etapa'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveStep(editingStep);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fase
                  </label>
                  <input
                    type="text"
                    value={editingStep.phase}
                    onChange={(e) => setEditingStep({...editingStep, phase: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingStep.title}
                    onChange={(e) => setEditingStep({...editingStep, title: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={editingStep.description}
                    onChange={(e) => setEditingStep({...editingStep, description: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timing
                  </label>
                  <input
                    type="text"
                    value={editingStep.timing}
                    onChange={(e) => setEditingStep({...editingStep, timing: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    value={editingStep.message}
                    onChange={(e) => setEditingStep({...editingStep, message: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dicas
                  </label>
                  <textarea
                    value={editingStep.tips?.join('\n')}
                    onChange={(e) => setEditingStep({
                      ...editingStep,
                      tips: e.target.value.split('\n').map(t => t.trim())
                    })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 h-32"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStep(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LTVFunnel; 