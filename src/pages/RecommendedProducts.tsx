import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, ArrowRight, Check, PlusCircle, ChevronLeft, ChevronRight, X, ExternalLink, Loader, Image, LockKeyhole, Zap } from 'lucide-react';
import { usePermissions } from '../services/permissionService';
import { useNavigate } from 'react-router-dom';
import RecommendationForm from '../components/RecommendationForm';
import { Product } from '../types/product';
import { productService } from '../services/productService';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const RecommendedProducts = () => {
  const { hasAccess, userPlan, hasMinimumPlan } = usePermissions();
  const navigate = useNavigate();
  const canRecommendProducts = hasAccess('recommendedSection');
  const canSubmitProducts = hasMinimumPlan('pro');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [showProFeatureModal, setShowProFeatureModal] = useState(false);
  
  // Estados para gerenciar produtos do banco de dados
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar produtos aprovados do banco de dados
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log('Iniciando busca de produtos...');
        
        // Buscar TODOS os produtos recomendados sem filtros
        const { data: allProducts, error: fetchError } = await supabase
          .from('recommended_products')
          .select('*');
        
        if (fetchError) {
          console.error('Erro ao buscar produtos:', fetchError);
          throw fetchError;
        }
        
        if (!allProducts || allProducts.length === 0) {
          console.log('Nenhum produto encontrado no banco de dados');
          setProducts([]);
          setFeaturedProducts([]);
          setLoading(false);
          return;
        }

        console.log('Total de produtos encontrados:', allProducts.length);
        
        // Separar produtos por categoria
        const featuredData = allProducts.filter(p => p.is_featured === true);
        const regularProducts = allProducts.filter(p => p.is_featured !== true);
        
        console.log('Produtos obtidos do banco:', {
          total: allProducts.length,
          regularCount: regularProducts.length,
          featuredCount: featuredData.length
        });
        
        // Se não houver produtos regulares mas houver featured, use alguns featured como regulares também
        let productsToShow = regularProducts;
        if (regularProducts.length === 0 && featuredData.length > 0) {
          console.log('Usando produtos em destaque também na lista principal');
          // Use todos os produtos para exibição
          productsToShow = allProducts;
        }
        
        // Formatar produtos para compatibilidade com a interface existente
        const formattedRegular = productsToShow.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          benefits: product.benefits || [],
          rating: product.rating || 5,
          imageUrl: product.image, // Para compatibilidade
          url: product.sales_url || product.image,
          productUrl: product.sales_url || product.image,
          salesUrl: product.sales_url || null, // Adicionar URL da página de vendas
        }));
        
        const formattedFeatured = featuredData.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          benefits: product.benefits || [],
          rating: product.rating || 5,
          imageUrl: product.image, // Para compatibilidade
          url: product.sales_url || product.image,
          productUrl: product.sales_url || product.image,
          salesUrl: product.sales_url || null, // Adicionar URL da página de vendas
        }));
        
        console.log('Produtos formatados para exibição:', {
          regular: formattedRegular.length,
          featured: formattedFeatured.length
        });
        
        setProducts(formattedRegular);
        setFeaturedProducts(formattedFeatured);
      } catch (err: any) {
        console.error('Erro ao carregar produtos:', err);
        setError('Erro ao carregar produtos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Se não houver produtos em destaque do banco, usar os estáticos como fallback
  useEffect(() => {
    if (featuredProducts.length === 0 && !loading) {
      // Usar os produtos em destaque originais como fallback
      setFeaturedProducts(eliteFeaturedProducts);
    }
  }, [featuredProducts, loading]);

  // Featured products for carousel
  const featuredProductsForCarousel = useMemo(() => {
    // Selecionar os produtos com maior avaliação (rating) para o carrossel
    return featuredProducts
      .filter(product => product.rating && product.imageUrl) // Garantir que tenham avaliação e imagem
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Ordenar por avaliação (maior primeiro)
      .slice(0, 5); // Pegar os primeiros 5
  }, [featuredProducts]);

  // Carousel navigation functions
  const nextCarouselItem = () => {
    setCurrentCarouselIndex((prev) => 
      featuredProductsForCarousel.length === 0 ? 0 : (prev + 1) % featuredProductsForCarousel.length
    );
  };

  const prevCarouselItem = () => {
    setCurrentCarouselIndex((prev) => 
      featuredProductsForCarousel.length === 0 ? 0 : (prev - 1 + featuredProductsForCarousel.length) % featuredProductsForCarousel.length
    );
  };

  // Produtos estáticos - serão usados apenas como fallback se não houver produtos no banco
  const fallbackProducts = [
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
    }
  ];

  // Produtos em destaque de usuários Elite
  const eliteFeaturedProducts = [
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
  
  // Render a product card
  const renderProductCard = (product: any, index: number) => {
    return (
      <div className="flex flex-col h-full">
        {/* Product Image */}
        <div className="h-40 overflow-hidden relative bg-gray-50">
          {product.image || product.imageUrl ? (
            <img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Image className="w-16 h-16 text-gray-400" />
              <span className="sr-only">Imagem não disponível</span>
            </div>
          )}
          
          {/* Category Badge */}
          {product.category && (
            <span className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full bg-teal-500/90 text-white">
              {product.category}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Header */}
          <div className="mb-2 flex justify-between items-start">
            <h3 className="font-medium text-gray-900 text-lg line-clamp-2">
              {product.name}
            </h3>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center text-amber-500 ml-2">
                <Star size={14} className="fill-current" />
                <span className="text-xs ml-1">{product.rating}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {product.description || "Sem descrição disponível."}
          </p>
          
          {/* Benefits */}
          {product.benefits && (
            <div className="mt-auto mb-3">
              <p className="text-xs text-gray-500 mb-1">Benefícios:</p>
              <p className="text-sm text-gray-700 line-clamp-2">
                {Array.isArray(product.benefits) 
                  ? product.benefits.slice(0, 2).join(', ') + (product.benefits.length > 2 ? '...' : '')
                  : product.benefits}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            {product.price ? (
              <p className="font-semibold text-gray-900">
                {typeof product.price === 'number' 
                  ? `R$ ${product.price.toFixed(2).replace('.', ',')}` 
                  : product.price}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">Preço não informado</p>
            )}
          </div>
          
          {/* Action */}
          <button
            className="mt-3 w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            onClick={() => openProductModal(product)}
          >
            <ExternalLink size={14} />
            <span>Ver detalhes</span>
          </button>
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

  // Handle product action (showing details, etc.)
  const handleProductAction = (product: any) => {
    // Se tiver URL, abre em nova aba
    if (product.url || product.productUrl) {
      const url = product.url || product.productUrl;
      window.open(url, '_blank');
      return;
    }
    
    // Se não tiver URL, exibe informações em um modal
    toast(product.description || 'Sem descrição disponível');
  };

  // Função para lidar com o clique no botão de recomendação
  const handleRecommendButtonClick = () => {
    if (canSubmitProducts) {
      // Se o usuário tem plano Pro ou superior, abre o formulário normalmente
      setShowRecommendationForm(true);
    } else {
      // Se o usuário tem plano Gratuito ou Member, mostra o modal de bloqueio
      setShowProFeatureModal(true);
    }
  };

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
        className="bg-teal-50/50 rounded-xl p-4 md:p-6 shadow-sm border border-teal-100 mb-8 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-teal-800 mb-2 mt-4">
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
              onClick={handleRecommendButtonClick}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all shadow-sm hover:shadow-md"
            >
              <PlusCircle size={18} />
              <span>Recomendar seu Infoproduto</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Regular Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-600">Carregando produtos recomendados...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-lg">
            <p className="font-medium mb-2">Erro ao carregar produtos</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-amber-50 text-amber-700 p-4 rounded-lg max-w-lg">
            <p className="font-medium mb-2">Nenhum produto recomendado</p>
            <p className="text-sm">Não há produtos aprovados disponíveis para exibição no momento.</p>
            {canRecommendProducts && (
              <button 
                onClick={handleRecommendButtonClick}
                className="mt-4 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <PlusCircle size={16} />
                <span>Recomendar um produto</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Featured Products - Elite Plan - Carrossel */}
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
                  {featuredProductsForCarousel.map((product, index) => (
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
                    {featuredProductsForCarousel.map((product, index) => (
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
                    {featuredProductsForCarousel.map((_, index) => (
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
        </>
      )}

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
                          href={selectedProduct.salesUrl || "#"} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block w-full py-2 px-4 bg-teal-500 text-white rounded text-center font-medium text-sm
                          ${!selectedProduct.salesUrl ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-teal-600'}`}
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

      {/* Modal para informar que é necessário o plano Pro ou superior */}
      <AnimatePresence>
        {showProFeatureModal && (
          <>
            {/* Overlay escuro */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.6 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[9999]"
              onClick={() => setShowProFeatureModal(false)}
            />
            
            {/* Modal de bloqueio */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.25 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full">
                {/* Faixa decorativa no topo */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                
                <div className="p-6">
                  {/* Ícone do cadeado */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <LockKeyhole size={30} className="text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                    Funcionalidade Premium
                  </h3>
                  
                  <p className="text-gray-600 text-center mb-6">
                    O recurso para recomendar infoprodutos está disponível apenas para usuários dos planos Pro e Elite. Faça upgrade para desbloquear esta e outras funcionalidades exclusivas.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/dashboard/upgrade')}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={18} className="animate-pulse" />
                      Fazer Upgrade
                    </button>
                    <button
                      onClick={() => setShowProFeatureModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-all"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
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
