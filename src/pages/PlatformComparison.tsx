import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Check, X, Info, AlertCircle, DollarSign, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Platform {
  name: string;
  logo: string;
  logoAlt: string;
  commission: string;
  minValue: string;
  paymentTerm: {
    card: string;
    pix: string;
    billet: string;
  };
  advantages: string[];
  disadvantages: string[];
  features: {
    splitPayments: boolean;
    customDomain: boolean;
    checkoutCustomization: boolean;
    pixPayment: boolean;
    creditCard: boolean;
    billet: boolean;
    affiliateSystem: boolean;
    support24h: boolean;
  };
}

const platforms: Platform[] = [
  {
    name: "Hotmart",
    logo: "https://hotmart.com/favicon.ico",
    logoAlt: "https://hotmart.s3.amazonaws.com/product_pictures/0b3ef95c-7b8b-4ccd-85b7-4acb9883cde7/HotmartSquareLogo.png",
    commission: "9.9% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "7 dias úteis",
      pix: "2 dias úteis",
      billet: "14 dias úteis"
    },
    advantages: [
      "Marketplace com grande visibilidade",
      "Sistema de afiliados robusto",
      "Suporte 24/7",
      "Aceita vendas internacionais"
    ],
    disadvantages: [
      "Taxa mais alta que concorrentes",
      "Processo de aprovação rigoroso",
      "Limitações na personalização"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: true
    }
  },
  {
    name: "Perfect Pay",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0e/c0/02/0ec0028c-cb98-ba4e-1f78-d36c1d06db71/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/512x512bb.jpg",
    logoAlt: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/0e/c0/02/0ec0028c-cb98-ba4e-1f78-d36c1d06db71/AppIcon-0-0-1x_U007emarketing-0-7-0-0-85-220.png/512x512bb.jpg",
    commission: "7.97% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "3 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Checkout otimizado e responsivo",
      "Bom sistema de rastreamento",
      "Facilidade na integração",
      "Suporte técnico eficiente"
    ],
    disadvantages: [
      "Taxa intermediária",
      "Interface administrativa básica",
      "Menos recursos avançados"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Sunize",
    logo: "https://sunize.com.br/favicon.ico",
    logoAlt: "https://sunize.com.br/favicon.ico",
    commission: "7.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "3 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Interface moderna",
      "Bom suporte ao produtor",
      "Checkout personalizado",
      "Sistema de split payment"
    ],
    disadvantages: [
      "Plataforma mais recente",
      "Comunidade menor",
      "Menos integrações"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Monetizze",
    logo: "https://play-lh.googleusercontent.com/veXOgYwExkjB4LAkt7MpzDssBMk2R7Ibt1q6r5ljHkIwR0WJLT6MDG9tl3XrTOjvyeo",
    logoAlt: "https://play-lh.googleusercontent.com/veXOgYwExkjB4LAkt7MpzDssBMk2R7Ibt1q6r5ljHkIwR0WJLT6MDG9tl3XrTOjvyeo",
    commission: "9.97% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "7 dias úteis",
      pix: "2 dias úteis",
      billet: "14 dias úteis"
    },
    advantages: [
      "Marketplace estabelecido",
      "Bom sistema de afiliados",
      "Checkout otimizado",
      "Múltiplas formas de pagamento"
    ],
    disadvantages: [
      "Interface menos moderna",
      "Taxa mais elevada",
      "Processo de aprovação demorado"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Kirvano",
    logo: "https://kirvano.com/wp-content/uploads/2023/05/cropped-favicon-kirvano-32x32.png",
    logoAlt: "https://kirvano.com/wp-content/uploads/2023/05/cropped-favicon-kirvano-192x192.png",
    commission: "7.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "3 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Plataforma brasileira",
      "Suporte personalizado",
      "Interface intuitiva",
      "Bom para iniciantes"
    ],
    disadvantages: [
      "Base de usuários menor",
      "Menos recursos avançados",
      "Marketplace em crescimento"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Rise Pay",
    logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ef/4f/22/ef4f2246-609e-40c5-9136-ea19676293d0/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    logoAlt: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ef/4f/22/ef4f2246-609e-40c5-9136-ea19676293d0/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
    commission: "6.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "2 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Taxa competitiva",
      "Checkout moderno",
      "Bom suporte técnico",
      "Interface clean"
    ],
    disadvantages: [
      "Plataforma nova no mercado",
      "Menos recursos",
      "Base menor de usuários"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "GhostsPay",
    logo: "https://ghostspay.com/favicon.ico",
    logoAlt: "https://ghostspay.com/favicon.ico",
    commission: "5.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "1 dia útil",
      billet: "21 dias úteis"
    },
    advantages: [
      "Taxa atrativa",
      "Checkout rápido",
      "Sem burocracia",
      "Interface moderna"
    ],
    disadvantages: [
      "Plataforma recente",
      "Poucos recursos extras",
      "Suporte em desenvolvimento"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Hubla",
    logo: "https://play-lh.googleusercontent.com/EaIaz4I4OcMLpp3-cvfVmQdJ8t_HzbpiXal_OltViR1KvxF7eDd056t-4GLlZ8OGpg",
    logoAlt: "https://play-lh.googleusercontent.com/EaIaz4I4OcMLpp3-cvfVmQdJ8t_HzbpiXal_OltViR1KvxF7eDd056t-4GLlZ8OGpg",
    commission: "6.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "2 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Gestão financeira integrada",
      "Dashboard completo",
      "Bom suporte",
      "Interface moderna"
    ],
    disadvantages: [
      "Menos focado em infoprodutos",
      "Curva de aprendizado maior",
      "Preço mais elevado"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Braip",
    logo: "https://braip.com/favicon.ico",
    logoAlt: "https://play-lh.googleusercontent.com/fXQVXTma1ENwAFjrXtlv7CyQk_6DEzQgEVHxpJlTGrC4OE4V91CyZQQJ6Iamw_LgEi4",
    commission: "8.97% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "3 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Marketplace ativo",
      "Bom sistema de afiliados",
      "Suporte 24/7",
      "Múltiplos recursos"
    ],
    disadvantages: [
      "Taxa mais alta",
      "Interface pode melhorar",
      "Processo de aprovação"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: true
    }
  },
  {
    name: "Ticto",
    logo: "https://ticto.com.br/favicon.ico",
    logoAlt: "https://ticto.com.br/favicon.ico",
    commission: "7.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "2 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Foco em automação",
      "Bom para memberships",
      "Interface moderna",
      "Recursos avançados"
    ],
    disadvantages: [
      "Preço mais alto",
      "Curva de aprendizado",
      "Menos foco em infoprodutos"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Cakto",
    logo: "https://play-lh.googleusercontent.com/RrKEVOidYnBOkRFbJdN8D_HQs4D9kvnYOt4rfkGF4wsUCg_K2EGhHpJdg3Owa0QdMjLy=w240-h480-rw",
    logoAlt: "https://play-lh.googleusercontent.com/RrKEVOidYnBOkRFbJdN8D_HQs4D9kvnYOt4rfkGF4wsUCg_K2EGhHpJdg3Owa0QdMjLy=w240-h480-rw",
    commission: "0,00% + R$2,49",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "1 dia útil",
      billet: "21 dias úteis"
    },
    advantages: [
      "Taxa competitiva",
      "Interface moderna",
      "Checkout otimizado",
      "Bom suporte"
    ],
    disadvantages: [
      "Plataforma mais nova",
      "Menos recursos",
      "Base em crescimento"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Yampi",
    logo: "https://play-lh.googleusercontent.com/2HgF__uYOfLMQTFYvg2tfrm3D8v2dW0sANdKzpSZ0GSUj7-SmJ-w4-zpfQWIRyyULOY",
    logoAlt: "https://play-lh.googleusercontent.com/2HgF__uYOfLMQTFYvg2tfrm3D8v2dW0sANdKzpSZ0GSUj7-SmJ-w4-zpfQWIRyyULOY",
    commission: "6.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "2 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Bom para e-commerce",
      "Múltiplas integrações",
      "Interface completa",
      "Suporte ativo"
    ],
    disadvantages: [
      "Mais focado em produtos físicos",
      "Complexidade maior",
      "Preço mais alto"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Lastlink",
    logo: "https://play-lh.googleusercontent.com/Gb-ScJKwB68J25YYtxf7ol4W9NVCdiCmVBhv6GJSf_C-ZlX1FYJqv7SqJ6c6lzTUg7s",
    logoAlt: "https://play-lh.googleusercontent.com/Gb-ScJKwB68J25YYtxf7ol4W9NVCdiCmVBhv6GJSf_C-ZlX1FYJqv7SqJ6c6lzTUg7s",
    commission: "5.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "1 dia útil",
      billet: "21 dias úteis"
    },
    advantages: [
      "Taxa atrativa",
      "Interface simples",
      "Checkout rápido",
      "Sem burocracia"
    ],
    disadvantages: [
      "Poucos recursos",
      "Sem marketplace",
      "Suporte básico"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  },
  {
    name: "Eduzz",
    logo: "https://play-lh.googleusercontent.com/K3-rcwv7mDsxb_ixD1ZGSIIbk-ZGHaQyVwC4oovULzK-gneqydUBZkrJN9IihypY3A=w240-h480-rw",
    logoAlt: "https://play-lh.googleusercontent.com/K3-rcwv7mDsxb_ixD1ZGSIIbk-ZGHaQyVwC4oovULzK-gneqydUBZkrJN9IihypY3A=w240-h480-rw",
    commission: "6.99% + R$1",
    minValue: "R$1,97",
    paymentTerm: {
      card: "14 dias úteis",
      pix: "2 dias úteis",
      billet: "21 dias úteis"
    },
    advantages: [
      "Bom para e-commerce",
      "Múltiplas integrações",
      "Interface completa",
      "Suporte ativo"
    ],
    disadvantages: [
      "Mais focado em produtos físicos",
      "Complexidade maior",
      "Preço mais alto"
    ],
    features: {
      splitPayments: true,
      customDomain: true,
      checkoutCustomization: true,
      pixPayment: true,
      creditCard: true,
      billet: true,
      affiliateSystem: true,
      support24h: false
    }
  }
];

const PlatformLogo = ({ platform }: { platform: Platform }) => {
  const [useFallback, setUseFallback] = useState(false);
  const [useAlt, setUseAlt] = useState(false);

  return (
    <img
      src={useFallback ? 
        `https://www.google.com/s2/favicons?domain=${platform.name.toLowerCase()}.com&sz=128` :
        useAlt ? platform.logoAlt : platform.logo
      }
      alt={platform.name}
      className="w-full h-full object-contain rounded-lg"
      onError={() => {
        if (!useAlt) {
          setUseAlt(true);
        } else if (!useFallback) {
          setUseFallback(true);
        }
      }}
    />
  );
};

const PlatformComparison = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else if (selectedPlatforms.length < 3) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Cabeçalho */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-block p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
          <Scale className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Comparador de Plataformas</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Compare as principais plataformas e escolha a melhor para seu negócio
        </p>
      </motion.div>

      {/* Aviso de seleção atualizado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-r from-emerald-50/80 to-green-50/80 border border-emerald-100 rounded-2xl p-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-emerald-800 font-medium">
            Selecione até 03 plataformas abaixo para iniciar a comparação
          </p>
        </div>
      </motion.div>

      {/* Grid de seleção com logos ajustadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
        {platforms.map((platform) => (
          <motion.button
            key={platform.name}
            onClick={() => togglePlatform(platform)}
            className={`group p-4 rounded-2xl transition-all duration-300 ${
              selectedPlatforms.includes(platform)
                ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center">
                <PlatformLogo platform={platform} />
              </div>
              <span className="text-sm font-medium text-gray-700">{platform.name}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Aviso sobre a fonte dos dados */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-amber-50/80 border border-amber-100 rounded-2xl p-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Info className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-amber-800 font-medium text-center text-sm">
            Os dados apresentados foram coletados através de pesquisas no Google. Para informações mais precisas e atualizadas, recomendamos sempre acessar a página oficial da plataforma desejada.
          </p>
        </div>
      </motion.div>

      {/* Tabela de comparação com responsividade */}
      {selectedPlatforms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Versão Mobile */}
          <div className="block md:hidden">
            {selectedPlatforms.map((platform) => (
              <div key={platform.name} className="border-b border-gray-100 last:border-b-0">
                {/* Cabeçalho da plataforma */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center">
                      <PlatformLogo platform={platform} />
                    </div>
                    <h3 className="font-medium text-gray-800">{platform.name}</h3>
                  </div>
                </div>

                {/* Informações da plataforma */}
                <div className="p-4 space-y-6">
                  {/* Comissão */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <DollarSign className="w-4 h-4 text-emerald-500 mr-2" />
                      Comissão
                    </div>
                    <div className="text-gray-800 ml-6">{platform.commission}</div>
                  </div>

                  {/* Prazo de Pagamento */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <Clock className="w-4 h-4 text-emerald-500 mr-2" />
                      Prazo de Pagamento
                    </div>
                    <div className="text-gray-800 ml-6">
                      <p><span className="font-medium">Cartão:</span> {platform.paymentTerm.card}</p>
                      <p><span className="font-medium">PIX:</span> {platform.paymentTerm.pix}</p>
                      <p><span className="font-medium">Boleto:</span> {platform.paymentTerm.billet}</p>
                    </div>
                  </div>

                  {/* Vantagens */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <ThumbsUp className="w-4 h-4 text-emerald-500 mr-2" />
                      Vantagens
                    </div>
                    <ul className="ml-6 space-y-2">
                      {platform.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Desvantagens */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-600">
                      <ThumbsDown className="w-4 h-4 text-red-500 mr-2" />
                      Desvantagens
                    </div>
                    <ul className="ml-6 space-y-2">
                      {platform.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Versão Desktop - mantém o código existente */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[250px,1fr] border-b border-gray-100">
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Características
                </span>
              </div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)` }}>
                {selectedPlatforms.map((platform) => (
                  <div key={platform.name} className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center">
                        <PlatformLogo platform={platform} />
                      </div>
                      <h3 className="font-medium text-gray-800">{platform.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Comissão */}
              <div className="grid grid-cols-[250px,1fr]">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white flex items-center">
                  <DollarSign className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="font-medium text-gray-700">Comissão</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)` }}>
                  {selectedPlatforms.map((platform) => (
                    <div key={platform.name} className="p-6 flex items-start">
                      <span className="text-gray-600">
                        {platform.commission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prazo de Pagamento */}
              <div className="grid grid-cols-[250px,1fr]">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white flex items-center">
                  <Clock className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="font-medium text-gray-700">Prazo de Pagamento</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)` }}>
                  {selectedPlatforms.map((platform) => (
                    <div key={platform.name} className="p-6 flex flex-col space-y-2">
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-700">Cartão:</span> {platform.paymentTerm.card}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-700">PIX:</span> {platform.paymentTerm.pix}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-700">Boleto:</span> {platform.paymentTerm.billet}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vantagens */}
              <div className="grid grid-cols-[250px,1fr]">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white flex items-center">
                  <ThumbsUp className="w-5 h-5 text-emerald-500 mr-3" />
                  <span className="font-medium text-gray-700">Vantagens</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)` }}>
                  {selectedPlatforms.map((platform) => (
                    <div key={platform.name} className="p-6">
                      <ul className="space-y-3">
                        {platform.advantages.map((advantage, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-600 text-sm">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desvantagens */}
              <div className="grid grid-cols-[250px,1fr]">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white flex items-center">
                  <ThumbsDown className="w-5 h-5 text-red-500 mr-3" />
                  <span className="font-medium text-gray-700">Desvantagens</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedPlatforms.length}, 1fr)` }}>
                  {selectedPlatforms.map((platform) => (
                    <div key={platform.name} className="p-6">
                      <ul className="space-y-3">
                        {platform.disadvantages.map((disadvantage, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-600 text-sm">{disadvantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlatformComparison; 