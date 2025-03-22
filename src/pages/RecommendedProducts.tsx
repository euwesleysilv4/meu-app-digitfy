import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, ArrowRight, Check, PlusCircle, ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate } from 'react-router-dom';
import RecommendationForm from '../components/RecommendationForm';
import { Product } from '../types/product';

const RecommendedProducts = () => {
  const { hasAccess, userPlan } = usePermissions();
  const navigate = useNavigate();
  const canRecommendProducts = hasAccess('recommendedSection');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  
  // Produtos em destaque de usuários Elite
  const featuredProducts = [
    {
      name: 'Curso Completo de Instagram Marketing',
      description: 'Aprenda a dominar o Instagram e gerar vendas para seu negócio',
      benefits: [
        'Estratégias de crescimento acelerado',
        'Técnicas de copywriting para captions',
        'Criação de conteúdo viral',
        'Conversão de seguidores em clientes'
      ],
      price: 'R$ 197/única',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Curso',
      eliteBadge: true,
      topPick: true
    },
    {
      name: 'Método Copywriting Persuasivo',
      description: 'O sistema definitivo para criar textos que vendem e convertem',
      benefits: [
        'Fórmulas de copywriting testadas',
        'Técnicas de gatilhos mentais',
        'Modelos de emails, posts e anúncios',
        'Estratégias para aumentar a taxa de conversão'
      ],
      price: 'R$ 297/única',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Infoproduto',
      eliteBadge: true
    },
    {
      name: 'Super Pack de Templates de Marketing',
      description: 'Mais de 200 templates prontos para todas as suas campanhas',
      benefits: [
        'Templates para todas as plataformas',
        'Designs profissionais e editáveis',
        'Atualizações mensais de novos modelos',
        'Suporte para personalização'
      ],
      price: 'R$ 147/única',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Templates',
      eliteBadge: true
    }
  ];

  // Move o carrossel para o próximo item
  const nextCarouselItem = () => {
    setCurrentCarouselIndex((prev) => 
      prev + 1 >= featuredProducts.length ? 0 : prev + 1
    );
  };

  // Move o carrossel para o item anterior
  const prevCarouselItem = () => {
    setCurrentCarouselIndex((prev) => 
      prev - 1 < 0 ? featuredProducts.length - 1 : prev - 1
    );
  };

  const products = [
    {
      name: 'SEMrush Pro',
      description: 'Ferramenta completa para análise de SEO e marketing digital',
      benefits: [
        'Análise completa de palavras-chave',
        'Auditoria técnica de SEO',
        'Análise de concorrentes',
        'Monitoramento de rankings'
      ],
      price: 'R$ 99/mês',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'SEO'
    },
    {
      name: 'Ahrefs',
      description: 'Plataforma líder em pesquisa de backlinks e análise de conteúdo',
      benefits: [
        'Explorador de backlinks',
        'Análise de conteúdo',
        'Pesquisa de palavras-chave',
        'Monitoramento de sites'
      ],
      price: 'R$ 199/mês',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'SEO'
    },
    {
      name: 'Mailchimp Pro',
      description: 'Automação de email marketing e CRM integrado',
      benefits: [
        'Automação de campanhas',
        'Segmentação avançada',
        'Templates responsivos',
        'Análise de performance'
      ],
      price: 'R$ 149/mês',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Email Marketing'
    },
    {
      name: 'Canva Pro',
      description: 'Design gráfico profissional para não designers',
      benefits: [
        'Milhares de templates profissionais',
        'Biblioteca de elementos premium',
        'Ferramentas de design colaborativo',
        'Exportação em alta qualidade'
      ],
      price: 'R$ 49/mês',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Design'
    },
    {
      name: 'Notion Pro',
      description: 'Workspace all-in-one para produtividade',
      benefits: [
        'Gerenciamento de projetos',
        'Banco de dados personalizável',
        'Integração com outras ferramentas',
        'Colaboração em tempo real'
      ],
      price: 'R$ 29/mês',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Produtividade'
    },
    {
      name: 'Grammarly Premium',
      description: 'Ferramenta de escrita e correção gramatical',
      benefits: [
        'Correção gramatical avançada',
        'Sugestões de estilo e tom',
        'Verificação de plágio',
        'Integração com navegadores'
      ],
      price: 'R$ 39/mês',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Escrita'
    },
    {
      name: 'Figma Pro',
      description: 'Design de interfaces e prototipagem',
      benefits: [
        'Design colaborativo em tempo real',
        'Prototipagem interativa',
        'Biblioteca de componentes',
        'Integração com outras ferramentas'
      ],
      price: 'R$ 59/mês',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Design'
    },
    {
      name: 'Trello Premium',
      description: 'Gerenciamento de projetos com quadros visuais',
      benefits: [
        'Quadros personalizáveis',
        'Automação de fluxos de trabalho',
        'Integração com outras ferramentas',
        'Colaboração em equipe'
      ],
      price: 'R$ 19/mês',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Produtividade'
    },
    {
      name: 'Adobe Spark',
      description: 'Criação de conteúdo visual para redes sociais',
      benefits: [
        'Templates profissionais',
        'Biblioteca de elementos gráficos',
        'Edição de vídeo básica',
        'Exportação otimizada para redes'
      ],
      price: 'R$ 39/mês',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Design'
    },
    {
      name: 'Google Workspace',
      description: 'Suíte de produtividade em nuvem',
      benefits: [
        'Gmail profissional',
        'Google Drive com 2TB',
        'Google Meet ilimitado',
        'Ferramentas de colaboração'
      ],
      price: 'R$ 79/mês',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&q=80&w=300&h=200',
      category: 'Produtividade'
    }
  ];

  // Função para abrir o modal com o produto selecionado
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
    // Impedir rolagem do corpo quando o modal está aberto
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.body.style.position = 'fixed';
    document.documentElement.classList.add('modal-open');
  };
  
  // Função para fechar o modal
  const closeProductModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    // Restaurar rolagem do corpo quando o modal está fechado
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    document.documentElement.classList.remove('modal-open');
  };

  // Função para renderizar cards de produtos em destaque (versão simplificada)
  const renderFeaturedProductCard = (product: Product, index: number) => {
    return (
      <div className="flex flex-col h-full">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-teal-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {product.category}
            </span>
          </div>
          
          <div className="absolute top-3 right-3">
            <div className="bg-teal-500 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              Elite
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-xl font-bold drop-shadow-md line-clamp-1">{product.name}</h3>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow bg-gradient-to-br from-teal-50 to-white">
          <p className="text-gray-600 text-sm line-clamp-2 mb-5">{product.description}</p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-teal-700">{product.price}</span>
              <div className="flex items-center gap-1 bg-teal-100/50 px-2 py-1 rounded-full">
                <Check className="text-teal-500" size={14} />
                <span className="text-teal-700 text-xs font-medium">{product.benefits.length} benefícios</span>
              </div>
            </div>
            
            <button 
              onClick={() => openProductModal(product)}
              className="w-full py-2.5 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <span>Ver detalhes</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Função para renderizar cards de produtos normais
  const renderProductCard = (product: Product, index: number) => {
    return (
      <div className="flex flex-col h-full">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40"></div>
          
          {index < 10 && (
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Top {index + 1}
            </div>
          )}
          
          <div className="absolute top-4 left-4">
            <span className="bg-white/95 text-teal-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {product.category}
            </span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-1">{product.name}</h3>
            
            <p className="text-gray-600 mb-3 text-sm line-clamp-2">{product.description}</p>
            
            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="text-xs font-medium text-gray-500 uppercase mb-2">
                Principais benefícios
              </div>
              {product.benefits.slice(0, 2).map((benefit: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="text-teal-500 flex-shrink-0 mt-0.5" size={14} />
                  <span className="text-gray-700 text-xs line-clamp-1">{benefit}</span>
                </div>
              ))}
              {product.benefits.length > 2 && (
                <div className="text-xs text-teal-600 font-medium pt-1">
                  +{product.benefits.length - 2} outros benefícios
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-gray-800">{product.price}</span>
            </div>
            
            <button 
              onClick={() => openProductModal(product)}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
            >
              <span>Acessar Página</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Adicione no topo junto com os useEffects
  useEffect(() => {
    // Adicionar CSS ao documento quando o componente for montado
    const style = document.createElement('style');
    style.innerHTML = `
      html.modal-open, body.modal-open {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
        margin: 0;
      }
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        z-index: 99999;
      }
    `;
    document.head.appendChild(style);

    // Remover o CSS quando o componente for desmontado
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ShoppingBag className="text-teal-600" size={32} />
        <h1 className="text-4xl font-bold text-gray-900">Produtos Recomendados</h1>
      </motion.div>

      <motion.div 
        className="bg-teal-50/50 rounded-xl p-4 md:p-6 shadow-sm border border-teal-100 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-2">
            Produtos Selecionados para Você
          </h2>
            <p className="text-teal-600 text-sm md:text-base">
            Aqui você encontra uma seleção exclusiva de ferramentas e produtos digitais 
            que podem impulsionar seu negócio. Todos os produtos são cuidadosamente 
            avaliados por nossa equipe para garantir a melhor qualidade.
          </p>
          </div>
          
          {canRecommendProducts && (
            <button 
              onClick={() => setShowRecommendationForm(true)}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all shadow-sm hover:shadow-md"
            >
              <PlusCircle size={18} />
              <span>Recomendar seu Infoproduto</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Featured Products - Elite Plan - Carrossel */}
      {featuredProducts.length > 0 && (
        <motion.div
          className="mb-10 relative overflow-hidden rounded-2xl shadow-sm border border-teal-200/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Background animado */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden">
            <motion.div 
              className="absolute -inset-1/2 opacity-10"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-teal-300 via-emerald-300 to-teal-400 rounded-full blur-xl"></div>
            </motion.div>
            <motion.div 
              className="absolute top-0 -right-20 w-72 h-72 opacity-20"
              animate={{ 
                y: [0, 30, 0],
                x: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="w-full h-full bg-teal-400 rounded-full blur-xl"></div>
            </motion.div>
            <motion.div 
              className="absolute -bottom-20 -left-10 w-80 h-80 opacity-20"
              animate={{ 
                y: [0, -20, 0],
                x: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 18, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="w-full h-full bg-emerald-400 rounded-full blur-xl"></div>
            </motion.div>
          </div>
          
          {/* Borda interna */}
          <div className="absolute inset-0.5 rounded-xl pointer-events-none border border-white/40 z-10"></div>
          
          {/* Conteúdo */}
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-1.5 h-6 bg-teal-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-gray-800">Produtos em Destaque</h2>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={prevCarouselItem}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-teal-600 hover:bg-teal-100 transition-colors shadow-sm"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextCarouselItem}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-teal-600 hover:bg-teal-100 transition-colors shadow-sm"
                  aria-label="Próximo"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              {/* Grid para desktop: 3 colunas */}
              <div className="hidden md:grid md:grid-cols-3 gap-6 p-2">
                {featuredProducts.map((product, index) => (
                  <div key={`featured-desktop-wrapper-${index}`} className="group rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <motion.div
                      key={`featured-desktop-${index}`}
                      className="bg-white rounded-xl overflow-hidden relative h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {renderFeaturedProductCard(product, index)}
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Carrossel para mobile: 1 por vez */}
              <div className="md:hidden px-2">
                <motion.div
                  className="flex"
                  animate={{ x: `-${currentCarouselIndex * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {featuredProducts.map((product, index) => (
                    <motion.div
                      key={`featured-mobile-${index}`}
                      className="w-full flex-shrink-0 p-2 group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="bg-white rounded-xl shadow-md overflow-hidden relative h-full">
                        {renderFeaturedProductCard(product, index)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Indicadores de página do carrossel (mobile) */}
                <div className="flex justify-center gap-2 mt-4">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentCarouselIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentCarouselIndex ? 'bg-teal-600 w-4' : 'bg-teal-200'
                      }`}
                      aria-label={`Ir para o slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Regular Products Grid */}
      <motion.div 
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {products.map((product, index) => (
          <div key={`product-wrapper-${index}`} className="group">
          <motion.div
            key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all h-full"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 10
              }}
              style={{ transformOrigin: 'center center' }}
            >
              {renderProductCard(product, index)}
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* Modal do Produto */}
      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div 
            className="fixed inset-0 bg-black/50 overflow-hidden modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              minHeight: '100vh',
              width: '100vw',
              margin: 0
            }}
            onClick={closeProductModal}
          >
            <motion.div 
              className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
                <div className="h-56 sm:h-64 md:h-72 bg-gray-200 relative">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>
                  
                  <button 
                    onClick={closeProductModal}
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="bg-white/90 text-teal-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                        {selectedProduct.category}
                      </span>
                      {selectedProduct.eliteBadge && (
                        <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          Elite
                </span>
              )}
                      {selectedProduct.topPick && (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                          Top Pick
              </span>
                      )}
                    </div>
                    <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-md">{selectedProduct.name}</h2>
            </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div className="md:max-w-xl">
                      <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefícios:</h3>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                          {selectedProduct.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Check className="text-teal-500 flex-shrink-0 mt-1" size={18} />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-teal-50 p-4 rounded-lg md:min-w-[240px] flex flex-col">
                      <div className="text-center mb-4">
                        <span className="text-gray-600 text-sm">Preço</span>
                        <div className="text-3xl font-bold text-gray-900">{selectedProduct.price}</div>
                      </div>
                      
                      <div className="space-y-3">
                        <a 
                          href="#" 
                          className="block w-full py-2 px-4 bg-teal-500 text-white rounded text-center font-medium text-sm"
                          style={{ backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          Acessar Página de Vendas <ExternalLink size={16} />
                        </a>
                        
                        <button 
                          onClick={closeProductModal}
                          className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                        >
                          Fechar
                        </button>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={i < Math.floor(selectedProduct.rating) ? "fill-current" : "stroke-current fill-transparent"} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{selectedProduct.rating} de 5 estrelas</span>
                      </div>
                </div>
              </div>
                  
                  <div className="text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <p>Este produto foi cuidadosamente selecionado para nosso catálogo. Para mais informações, acesse a página do fornecedor.</p>
                  </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário de Recomendação Popup */}
      <RecommendationForm
        isOpen={showRecommendationForm}
        onClose={() => setShowRecommendationForm(false)}
      />
    </div>
  );
};

export default RecommendedProducts;
