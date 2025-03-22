import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, PlayCircle, Clock, Star, ArrowRight, Sparkles, Zap, Award, FileText, X, Upload, Lock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../services/permissionService';
import { DefaultLayout } from '../components/layouts/DefaultLayout';

const Learning = () => {
  // Estado para rastrear categorias ativas
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para controlar os modais
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showSubmitContentModal, setShowSubmitContentModal] = useState(false);
  const [submitFormData, setSubmitFormData] = useState({
    title: '',
    type: 'article',
    description: '',
    file: null as File | null,
    url: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Permissões do usuário
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasAccess } = usePermissions();
  
  const canSubmitContent = hasAccess('submitLearningContent');
  
  // Logs para diagnóstico
  console.log("Pode enviar conteúdo:", canSubmitContent);
  
  // Handler para o botão de enviar conteúdo
  const handleSubmitContent = () => {
    if (!canSubmitContent) {
      navigate('/upgrade-plan');
      return;
    }
    
    setShowSubmitContentModal(true);
  };
  
  // Handler para submeter o formulário
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de envio de dados
    setTimeout(() => {
      setIsLoading(false);
      setSubmitSuccess(true);
      
      // Limpar o formulário após sucesso
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitContentModal(false);
        setSubmitFormData({
          title: '',
          type: 'article',
          description: '',
          file: null,
          url: '',
        });
      }, 2000);
    }, 1500);
  };
  
  // Handler para alterações no formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSubmitFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler para seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSubmitFormData(prev => ({
      ...prev,
      file
    }));
  };
  
  // Refs para os carrosséis
  const carouselRefs = {
    featured: useRef<HTMLDivElement>(null),
    courses: useRef<HTMLDivElement>(null),
    articles: useRef<HTMLDivElement>(null)
  };
  
  // Adicionando o useRef para contentRef
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Detectar scroll para efeitos visuais
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Bloquear scroll quando modal estiver aberto
  useEffect(() => {
    if (selectedCourse || selectedArticle || showSubmitContentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedCourse, selectedArticle, showSubmitContentModal]);
  
  // Função para navegar nos carrosséis
  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Efeito para auto-scroll do carrossel de cursos
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRefs.courses.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRefs.courses.current;
        
        // Se chegou ao final, volta para o início
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRefs.courses.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Caso contrário, continua rolando
          carouselRefs.courses.current.scrollTo({ 
            left: scrollLeft + 300, 
            behavior: 'smooth' 
          });
        }
      }
    }, 5000); // Intervalo de 5 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Dados de cursos (expandido)
  const courses = [
    {
      id: 1,
      title: 'Marketing Digital Pro',
      description: 'Aprenda estratégias avançadas de marketing digital',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      lessons: 42,
      duration: '12h',
      instructor: 'André Victor',
      content: `
        <h2>Marketing Digital Pro</h2>
        <p>Bem-vindo ao curso completo de Marketing Digital Pro! Neste curso, você aprenderá estratégias avançadas que são utilizadas pelos melhores profissionais do mercado.</p>
        
        <h3>O que você vai aprender:</h3>
        <ul>
          <li>Estratégias de SEO avançadas</li>
          <li>Marketing de conteúdo que converte</li>
          <li>Campanhas de mídia paga com alto ROI</li>
          <li>Análise de dados para otimização de campanhas</li>
          <li>Automação de marketing</li>
        </ul>
        
        <h3>Módulo 1: Fundamentos do Marketing Digital</h3>
        <p>Neste módulo, revisaremos os conceitos fundamentais do marketing digital e estabeleceremos uma base sólida para as estratégias avançadas que serão apresentadas nos módulos seguintes.</p>
        
        <h3>Módulo 2: SEO Avançado</h3>
        <p>Aprenda técnicas avançadas de otimização para mecanismos de busca, incluindo SEO técnico, link building estratégico e otimização de conteúdo.</p>
        
        <div class="video-container">
          <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        
        <h3>Módulo 3: Marketing de Conteúdo</h3>
        <p>Descubra como criar conteúdo que não apenas atrai, mas também converte visitantes em clientes. Aprenda a desenvolver uma estratégia de conteúdo alinhada com o funil de vendas.</p>
      `
    },
    {
      id: 2,
      title: 'SEO Avançado',
      description: 'Domine as técnicas de otimização para mecanismos de busca',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'SEO',
      lessons: 35,
      duration: '8h',
      instructor: 'Thomas Macedo'
    },
    {
      id: 3,
      title: 'Copywriting Persuasivo',
      description: 'Aprenda a escrever textos que vendem',
      image: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Copywriting',
      lessons: 28,
      duration: '6h',
      instructor: 'Álvaro Ezequiel'
    },
    {
      id: 4,
      title: 'Estratégias para Instagram',
      description: 'Como construir uma presença de sucesso no Instagram',
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Redes Sociais',
      lessons: 22,
      duration: '4h 30min',
      instructor: 'André Goes'
    },
    {
      id: 5,
      title: 'E-commerce do Zero',
      description: 'Crie sua loja online e comece a vender',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'E-commerce',
      lessons: 30,
      duration: '7h 15min',
      instructor: 'Thomas Macedo'
    },
    {
      id: 6,
      title: 'YouTube para Negócios',
      description: 'Como usar o YouTube para impulsionar seu negócio',
      image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Vídeo Marketing',
      lessons: 26,
      duration: '5h 45min',
      instructor: 'Álvaro Ezequiel'
    },
    {
      id: 7,
      title: 'Facebook Ads Avançado',
      description: 'Domine as campanhas de anúncios no Facebook',
      image: 'https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      lessons: 32,
      duration: '9h 20min',
      instructor: 'André Victor'
    },
    {
      id: 8,
      title: 'Automação de Marketing',
      description: 'Ferramentas e estratégias para automatizar seu marketing',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      lessons: 28,
      duration: '6h 45min',
      instructor: 'André Goes'
    },
    {
      id: 9,
      title: 'Estratégias de Email Marketing',
      description: 'Aumente suas conversões com campanhas de email eficientes',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      lessons: 24,
      duration: '5h 30min',
      instructor: 'Thomas Macedo'
    },
    {
      id: 10,
      title: 'Vendas Online',
      description: 'Técnicas avançadas para aumentar suas vendas na internet',
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Vendas',
      lessons: 36,
      duration: '10h 15min',
      instructor: 'Álvaro Ezequiel'
    },
    {
      id: 11,
      title: 'Google Analytics Avançado',
      description: 'Aprenda a analisar dados e tomar decisões baseadas em métricas',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Análise',
      lessons: 30,
      duration: '8h 45min',
      instructor: 'André Victor'
    },
    {
      id: 12,
      title: 'Criação de Conteúdo',
      description: 'Como produzir conteúdo de qualidade para diferentes plataformas',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Copywriting',
      lessons: 26,
      duration: '6h 20min',
      instructor: 'André Goes'
    }
  ];

  // Dados de artigos (expandido)
  const articles = [
    {
      id: 1,
      title: '10 Estratégias de SEO para 2023',
      description: 'Descubra as técnicas que estão dando resultado agora',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'SEO',
      readTime: '8 min',
      author: 'Thomas Macedo',
      content: `
        <h1>10 Estratégias de SEO para 2023</h1>
        <p class="author">Por Thomas Macedo</p>
        
        <p>O mundo do SEO está em constante evolução, e o que funcionava há alguns anos pode não ser mais eficaz hoje. Neste artigo, vamos explorar as 10 estratégias de SEO mais eficientes para 2023, baseadas em dados e resultados comprovados.</p>
        
        <h2>1. Otimização para Pesquisa por Voz</h2>
        <p>Com o aumento do uso de assistentes virtuais como Alexa, Siri e Google Assistant, a otimização para pesquisa por voz tornou-se essencial. As consultas de voz tendem a ser mais longas e conversacionais do que as digitadas.</p>
        <p>Para otimizar seu conteúdo para pesquisa por voz:</p>
        <ul>
          <li>Foque em frases longas e perguntas naturais</li>
          <li>Crie uma seção de FAQ em seu site</li>
          <li>Otimize para consultas locais ("perto de mim")</li>
        </ul>
        
        <h2>2. Experiência do Usuário (UX) como Fator de Ranking</h2>
        <p>O Google agora considera métricas de experiência do usuário, conhecidas como Core Web Vitals, como fatores de classificação. Isso inclui:</p>
        <ul>
          <li>Largest Contentful Paint (LCP): velocidade de carregamento</li>
          <li>First Input Delay (FID): interatividade</li>
          <li>Cumulative Layout Shift (CLS): estabilidade visual</li>
        </ul>
        
        <p>Melhorar esses aspectos não apenas beneficiará seu SEO, mas também proporcionará uma melhor experiência para seus visitantes.</p>
        
        <figure>
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" alt="Análise de SEO em um computador" />
          <figcaption>Análise de métricas de SEO é fundamental para o sucesso online</figcaption>
        </figure>
        
        <h2>3. Conteúdo Abrangente e Aprofundado</h2>
        <p>O Google continua a favorecer conteúdo que aborda um tópico de forma completa e aprofundada. Em vez de criar vários artigos curtos sobre tópicos relacionados, considere criar guias abrangentes que cubram todos os aspectos de um assunto.</p>
      `
    },
    {
      id: 2,
      title: 'Como Criar uma Página de Vendas Eficiente',
      description: 'Elementos essenciais para aumentar conversões',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Vendas',
      readTime: '12 min',
      author: 'André Victor'
    },
    {
      id: 3,
      title: 'Tendências de Marketing Digital',
      description: 'O que esperar para os próximos anos',
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      readTime: '15 min',
      author: 'Álvaro Ezequiel'
    },
    {
      id: 4,
      title: 'Guia Completo de Google Ads',
      description: 'Como criar campanhas de anúncios eficientes no Google',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      readTime: '20 min',
      author: 'André Goes'
    },
    {
      id: 5,
      title: 'Otimização de Conversão',
      description: 'Técnicas para melhorar a taxa de conversão do seu site',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Análise',
      readTime: '10 min',
      author: 'Thomas Macedo'
    },
    {
      id: 6,
      title: 'Storytelling para Marcas',
      description: 'Como contar histórias que conectam com seu público',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Copywriting',
      readTime: '14 min',
      author: 'Álvaro Ezequiel'
    },
    {
      id: 7,
      title: 'Estratégias de Conteúdo para Redes Sociais',
      description: 'Como criar um calendário de conteúdo eficiente',
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Redes Sociais',
      readTime: '11 min',
      author: 'André Victor'
    },
    {
      id: 8,
      title: 'E-commerce: Otimizando a Experiência do Usuário',
      description: 'Como melhorar a UX da sua loja virtual',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'E-commerce',
      readTime: '16 min',
      author: 'André Goes'
    }
  ];

  // Categorias para navegação
  const categories = ['Todos', 'Marketing', 'SEO', 'Copywriting', 'Redes Sociais', 'E-commerce'];

  // Funções de navegação para as novas páginas
  const handleNavigateToDesafios = () => {
    navigate('/learning/challenges');
  };
  
  const handleNavigateToCurso = () => {
    navigate('/learning/course');
  };

  // Componente de Modal para Cursos
  const CourseModal = ({ course, onClose }: { course: any, onClose: () => void }) => {
    return (
      <motion.div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header cover image com gradiente */}
          <div className="relative h-56 sm:h-64 md:h-72">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-10"></div>
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-full transition-colors shadow-md"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1.5 rounded-lg mb-3 font-medium">
                {course.category}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{course.title}</h2>
              <p className="text-sm text-gray-200 mb-3 line-clamp-2 max-w-3xl">{course.description}</p>
              <div className="flex items-center text-xs text-gray-300 gap-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  <span>{course.lessons} lições</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1.5 text-sm font-medium">Por:</span>
                  <span>{course.instructor}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conteúdo do curso com melhor estilização */}
          <div className="p-8 overflow-y-auto course-content" style={{ maxHeight: 'calc(90vh - 18rem)' }}>
            <div 
              className="prose prose-emerald max-w-none prose-headings:text-emerald-700 prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-emerald-700"
              dangerouslySetInnerHTML={{ __html: course.content }}
            />
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Componente de Modal para Artigos
  const ArticleModal = ({ article, onClose }: { article: any, onClose: () => void }) => {
  return (
      <motion.div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão de fechar redesenhado */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-full transition-colors shadow-md"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Cabeçalho do artigo e conteúdo */}
          <div className="article-content p-8 sm:p-10 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            {/* Categoria do artigo */}
            <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1.5 rounded-lg mb-5 font-medium">
              {article.category}
            </div>
            
            {/* Informações do autor antes do conteúdo */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-emerald-600 font-bold text-lg">{article.author.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{article.author}</p>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {article.readTime} de leitura • Publicado em {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            {/* Conteúdo do artigo com melhor formatação */}
            <div 
              className="prose prose-emerald max-w-none prose-img:rounded-xl prose-img:shadow-md prose-headings:text-emerald-700 prose-h1:text-3xl prose-h2:text-2xl prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-emerald-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Componente de Modal para envio de conteúdo
  const SubmitContentModal = () => {
    return (
      <AnimatePresence>
        {showSubmitContentModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !isLoading && !submitSuccess && setShowSubmitContentModal(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl bg-white rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()} // Evita que o clique feche o modal
              >
                {/* Conteúdo do Modal */}
                <div className="p-6">
                  {/* Cabeçalho do Modal */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-100 p-2.5 rounded-lg">
                        <Upload className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Enviar Conteúdo
                      </h3>
                    </div>
                    <button 
                      onClick={() => !isLoading && !submitSuccess && setShowSubmitContentModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                      disabled={isLoading || submitSuccess}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {submitSuccess ? (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Conteúdo Enviado com Sucesso!</h4>
                      <p className="text-gray-600">Seu conteúdo está sendo analisado e logo estará disponível na plataforma.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Título do Conteúdo
                        </label>
                        <input
                          id="title"
                          name="title"
                          type="text"
                          required
                          value={submitFormData.title}
                          onChange={handleFormChange}
                          placeholder="Digite um título descritivo"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Tipo de Conteúdo
                        </label>
                        <select
                          id="type"
                          name="type"
                          required
                          value={submitFormData.type}
                          onChange={handleFormChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          disabled={isLoading}
                        >
                          <option value="article">Artigo</option>
                          <option value="course">Curso</option>
                          <option value="ebook">E-book</option>
                          <option value="video">Vídeo</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          required
                          value={submitFormData.description}
                          onChange={handleFormChange}
                          placeholder="Descreva brevemente o conteúdo"
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          disabled={isLoading}
                        />
                      </div>
                      
                      {submitFormData.type === 'ebook' && (
                        <div className="space-y-2">
                          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            Arquivo (PDF)
                          </label>
                          <input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                      
                      {(submitFormData.type === 'video' || submitFormData.type === 'course') && (
                        <div className="space-y-2">
                          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                            URL do {submitFormData.type === 'video' ? 'Vídeo' : 'Curso'}
                          </label>
                          <input
                            id="url"
                            name="url"
                            type="url"
                            value={submitFormData.url}
                            onChange={handleFormChange}
                            placeholder="https://..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            disabled={isLoading}
                          />
                        </div>
                      )}
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Enviando...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span>Enviar para Análise</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

  // Navegação por categorias
  const categoriesSection = (
    <div className="flex justify-center mb-8 overflow-x-auto hide-scrollbar">
      <div className="flex space-x-4 py-2">
        {categories.map((category) => (
          <button 
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeCategory === category 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
  
  // Botões de navegação para cursos e desafios
  const navigationButtons = (
    <div className="container mx-auto px-4 mb-10">
      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
        <h3 className="text-lg font-medium text-emerald-800 mb-4 text-center">Conteúdo Especial</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            onClick={handleNavigateToDesafios}
          >
            <Zap className="mr-2" size={18} />
            Desafios de Crescimento
          </button>
          <button 
            className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            onClick={handleNavigateToCurso}
          >
            <BookOpen className="mr-2" size={18} />
            Acessar Cursos Completos
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Banner - Design Premium */}
      <div className="relative overflow-hidden pt-16 pb-10 md:pt-20 md:pb-14">
        {/* Elementos decorativos (círculos e formas) */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-100 rounded-full opacity-10 blur-3xl"></div>
        
        {/* Conteúdo Centralizado */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex items-center justify-center gap-2 mb-6 bg-white bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded-full w-fit mx-auto border border-emerald-200 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span className="text-emerald-600 text-sm font-medium">DigitFy Academy</span>
          </motion.div>
          
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Central de Aprendizado
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Expanda seus conhecimentos em marketing digital com cursos, tutoriais e recursos exclusivos.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              {/* Botão de scroll */}
              <button 
                onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium transition-colors flex items-center shadow-sm border border-emerald-100"
              >
                Ver Conteúdo
                <ArrowRight className="ml-2" size={18} />
              </button>
              
              {/* Botão de Enviar Conteúdo */}
              <button
                onClick={handleSubmitContent}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg flex items-center shadow-sm ${
                  canSubmitContent
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : canSubmitContent ? (
                  <Upload size={18} className="mr-2" />
                ) : (
                  <Lock size={18} className="mr-2" />
                )}
                Enviar Conteúdo
              </button>
            </motion.div>
            
            {/* Mensagem para usuários sem permissão */}
            {!canSubmitContent && (
              <motion.div
                className="mt-4 text-gray-500 text-xs flex items-center justify-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Lock size={12} />
                <span>Disponível a partir do plano Member</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8" ref={contentRef}>
        {/* Categorias de navegação */}
        {categoriesSection}
        
        {/* Cursos - Carrossel */}
        <section id="courses" className="mb-16 relative">
          <div className="flex justify-center items-center mb-8">
            <motion.h2 
              className="text-2xl font-bold text-gray-800 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Conteúdos Disponíveis
            </motion.h2>
          </div>
          
          <div 
            ref={carouselRefs.courses}
            className="flex gap-6 overflow-hidden pb-8 relative"
          >
            {courses
              .filter(course => activeCategory === 'Todos' || course.category === activeCategory)
              .map((course, index) => (
                <motion.div
                  key={course.id}
                  className="relative min-w-[280px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                >
                  <div className="relative h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10"></div>
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover" 
                    />
                    
                    <motion.div 
                      className="absolute bottom-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-lg"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                    >
                      {course.category}
                    </motion.div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-sm text-gray-200 mt-1 mb-3">{course.description}</p>
                      
                      <div className="text-xs text-gray-300 mb-4">
                        Instrutor: {course.instructor}
                      </div>
                      
                      <button 
                        className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        onClick={() => setSelectedCourse(course)}
                      >
                        Ver Conteúdo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            
            {/* Duplicar os primeiros cursos para criar efeito de loop infinito */}
            {courses
              .filter(course => activeCategory === 'Todos' || course.category === activeCategory)
              .slice(0, 4)
              .map((course, index) => (
                <motion.div
                  key={`duplicate-${course.id}`}
                  className="relative min-w-[280px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * (index + courses.length) }}
                >
                  <div className="relative h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10"></div>
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover" 
                    />
                    
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-lg">
                      {course.category}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-sm text-gray-200 mt-1 mb-3">{course.description}</p>
                      
                      <div className="text-xs text-gray-300 mb-4">
                        Instrutor: {course.instructor}
                      </div>

                      <button 
                        className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        onClick={() => setSelectedCourse(course)}
                      >
                        Ver Conteúdo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
          
          {/* Controles de navegação */}
          <div className="flex justify-center mt-4 space-x-4">
            <motion.button 
              onClick={() => scroll(carouselRefs.courses, 'left')}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </motion.button>
            <motion.button 
              onClick={() => scroll(carouselRefs.courses, 'right')}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>
        </section>
        
        {/* Artigos - Carrossel */}
        <section id="articles" className="relative">
          <div className="flex justify-center items-center mb-8">
            <motion.h2 
              className="text-2xl font-bold text-gray-800 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Artigos e Tutoriais
            </motion.h2>
          </div>
          
          <div 
            ref={carouselRefs.articles}
            className="flex gap-6 overflow-hidden pb-8"
          >
            {articles
              .filter(article => activeCategory === 'Todos' || article.category === activeCategory)
              .map((article, index) => (
                <motion.div
                  key={article.id}
                  className="relative min-w-[280px] bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * index }}
                >
                  <div className="relative h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10"></div>
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover" 
                    />
                    
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-lg">
                      {article.category}
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                      <h3 className="font-bold text-white">{article.title}</h3>
                      <p className="text-sm text-gray-200 mt-1 mb-3">{article.description}</p>
                      
                      <div className="text-xs text-gray-300 mb-4">
                        Autor: {article.author}
                      </div>
                      
                      <button 
                        className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        onClick={() => setSelectedArticle(article)}
                      >
                        Ler Artigo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
          
          {/* Controles de navegação para artigos */}
          <div className="flex justify-center mt-4 space-x-4">
            <motion.button 
              onClick={() => scroll(carouselRefs.articles, 'left')}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </motion.button>
            <motion.button 
              onClick={() => scroll(carouselRefs.articles, 'right')}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>
        </section>
      </div>

      {/* Modais */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
      
      {/* Modal de Artigo Selecionado */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
      
      {/* Modal de Envio de Conteúdo */}
      <SubmitContentModal />
      
      {/* Estilos para o conteúdo do modal */}
      <style>{`
        /* Customização dos modais */
        .course-content {
          max-height: 85vh;
          overflow-y: auto;
        }
        
        .course-content::-webkit-scrollbar, 
        .article-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .course-content::-webkit-scrollbar-track,
        .article-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .course-content::-webkit-scrollbar-thumb,
        .article-content::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        
        .course-content::-webkit-scrollbar-thumb:hover,
        .article-content::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Melhorando o layout do iframe para vídeos */
        .video-container {
          position: relative;
          padding-bottom: 56.25%; /* Proporção 16:9 */
          height: 0;
          overflow: hidden;
          margin: 2rem 0;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.75rem;
        }
        
        /* Melhorando o layout das imagens */
        .prose img {
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        /* Estilizando figcaption */
        .prose figcaption {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
        
        /* Melhorando o layout das listas */
        .prose ul {
          list-style-type: none;
          padding-left: 1.5rem;
        }
        
        .prose ul li {
          position: relative;
          padding-left: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .prose ul li:before {
          content: "";
          position: absolute;
          left: -1.5rem;
          top: 0.5rem;
          height: 0.5rem;
          width: 0.5rem;
          background-color: #10b981;
          border-radius: 50%;
        }
        
        /* Estilos adicionais para melhorar a legibilidade do conteúdo */
        .prose {
          font-size: 1.05rem;
          line-height: 1.75;
        }
        
        .prose p {
          margin-bottom: 1.5rem;
          max-width: 70ch;
        }
        
        .prose h1 {
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: #064e3b;
          line-height: 1.2;
        }
        
        .prose h2 {
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #065f46;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .prose h3 {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #047857;
        }
        
        .prose strong {
          color: #064e3b;
        }
        
        .prose blockquote {
          border-left: 4px solid #10b981;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
          margin: 1.5rem 0;
          background-color: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .prose code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          color: #0f766e;
        }
        
        .prose pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .prose a {
          text-decoration: none;
          border-bottom: 1px solid #10b981;
          transition: border-color 0.2s, color 0.2s;
        }
        
        .prose a:hover {
          color: #059669;
          border-color: #059669;
        }
        
        /* Espaçamento de seções */
        .prose > * + * {
          margin-top: 1rem;
        }
        
        /* Divisor para seções */
        .prose hr {
          margin: 2rem 0;
          border: 0;
          height: 1px;
          background-color: #e5e7eb;
        }
        
        /* Tabelas mais bonitas */
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9rem;
        }
        
        .prose th {
          background-color: #f1f5f9;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 2px solid #e5e7eb;
          color: #0f766e;
        }
        
        .prose td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        
        .prose tr:last-child td {
          border-bottom: none;
        }
        
        .prose tr:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default Learning;
