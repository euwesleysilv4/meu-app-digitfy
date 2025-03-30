import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, PlayCircle, Clock, Star, ArrowRight, Sparkles, Zap, Award, FileText, X, Upload, Lock, Check, Download, Map, DollarSign, Package, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../services/permissionService';
import { DefaultLayout } from '../components/layouts/DefaultLayout';
import { supabase } from '../lib/supabaseClient';

// Defina interfaces para os diferentes tipos de conteúdo
interface Course {
  id: number | string;
  title: string;
  description: string;
  image: string;
  category: string;
  lessons: number;
  duration: string;
  instructor: string;
  content?: string;
}

interface Ebook {
  id: number | string;
  title: string;
  description: string;
  cover_image_url?: string;
  coverImage?: string;
  file_size?: string;
  fileSize?: string;
  file_type?: string;
  category?: string;
  tags?: string[];
}

interface MindMap {
  id: number | string;
  title: string;
  description: string;
  image_url?: string;
  image?: string;
  download_count?: number;
  downloads?: number;
}

interface SalesStrategy {
  id: number | string;
  title: string;
  description: string;
  image_url?: string;
  image?: string;
  read_time?: string;
  readTime?: string;
}

interface FreePack {
  id: number | string;
  title: string;
  description: string;
  image_url?: string;
  image?: string;
  items_count?: number;
  items?: number;
}

const Learning = () => {
  // Dados de cursos fictícios para fallback
  const courses: Course[] = [
    {
      id: 1,
      title: 'Marketing Digital Pro',
      description: 'Aprenda estratégias avançadas de marketing digital',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=400',
      category: 'Marketing',
      lessons: 42,
      duration: '12h',
      instructor: 'André Victor'
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
    }
  ];

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
  
  // Estados para armazenar os dados reais
  const [realCourses, setRealCourses] = useState<Course[]>([]);
  const [realEbooks, setRealEbooks] = useState<Ebook[]>([]);
  const [realMindMaps, setRealMindMaps] = useState<MindMap[]>([]);
  const [realSalesStrategies, setRealSalesStrategies] = useState<SalesStrategy[]>([]);
  const [realFreePacks, setRealFreePacks] = useState<FreePack[]>([]);
  const [loading, setLoading] = useState({
    courses: true,
    ebooks: true,
    mindMaps: true,
    salesStrategies: true,
    freePacks: true
  });
  
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

  // Função para buscar cursos gratuitos
  const fetchFreeCourses = async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const { data, error } = await supabase
        .from('relevant_contents')
        .select('*')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      const formattedCourses = data.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.image_url || 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=300&h=400',
        category: course.tags?.[0] || 'Marketing',
        lessons: course.lessons_count || Math.floor(Math.random() * 10) + 5,
        duration: course.duration || `${Math.floor(Math.random() * 5) + 1}h`,
        instructor: course.author || 'DigitFy'
      }));
      
      setRealCourses(formattedCourses);
      console.log("Cursos gratuitos carregados:", formattedCourses);
    } catch (error) {
      console.error('Erro ao buscar cursos gratuitos:', error);
      // Em caso de erro, use os dados fictícios
      setRealCourses(courses);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  // Função para buscar eBooks e PDFs
  const fetchEbooks = async () => {
    try {
      setLoading(prev => ({ ...prev, ebooks: true }));
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('status', 'published')
        .limit(3);
      
      if (error) throw error;
      
      const formattedEbooks: Ebook[] = data.map(ebook => ({
        id: ebook.id,
        title: ebook.title,
        description: ebook.description,
        cover_image_url: ebook.cover_image_url || 'https://via.placeholder.com/800x600?text=PDF',
        file_size: ebook.file_size || '0 MB',
        file_type: ebook.file_type || 'PDF',
        category: ebook.tags && ebook.tags.length > 0 ? ebook.tags[0] : 'Geral'
      }));
      
      setRealEbooks(formattedEbooks);
    } catch (error) {
      console.error('Erro ao buscar ebooks:', error);
      // Use os dados fictícios em caso de erro
      setRealEbooks(previewEbooks.map(ebook => ({
        id: ebook.id,
        title: ebook.title,
        description: ebook.description,
        cover_image_url: ebook.coverImage,
        file_size: ebook.fileSize,
        category: ebook.category
      })));
    } finally {
      setLoading(prev => ({ ...prev, ebooks: false }));
    }
  };

  // Função para buscar mapas mentais
  const fetchMindMaps = async () => {
    try {
      setLoading(prev => ({ ...prev, mindMaps: true }));
      const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('status', 'published')
        .limit(2);
      
      if (error) throw error;
      
      const formattedMindMaps: MindMap[] = data.map(mindMap => ({
        id: mindMap.id,
        title: mindMap.title,
        description: mindMap.description,
        image_url: mindMap.image_url || 'https://via.placeholder.com/800x600?text=Mapa+Mental',
        download_count: mindMap.download_count || 0
      }));
      
      setRealMindMaps(formattedMindMaps);
    } catch (error) {
      console.error('Erro ao buscar mapas mentais:', error);
      // Use os dados fictícios em caso de erro
      setRealMindMaps(previewMindMaps.map(mindMap => ({
        id: mindMap.id, 
        title: mindMap.title,
        description: mindMap.description,
        image_url: mindMap.image,
        download_count: mindMap.downloads
      })));
    } finally {
      setLoading(prev => ({ ...prev, mindMaps: false }));
    }
  };

  // Função para buscar estratégias de vendas
  const fetchSalesStrategies = async () => {
    try {
      setLoading(prev => ({ ...prev, salesStrategies: true }));
      const { data, error } = await supabase
        .from('sales_strategies')
        .select('*')
        .eq('status', 'published')
        .limit(2);
      
      if (error) throw error;
      
      const formattedStrategies: SalesStrategy[] = data.map(strategy => ({
        id: strategy.id,
        title: strategy.title,
        description: strategy.description,
        image_url: strategy.image_url || 'https://via.placeholder.com/800x600?text=Estratégia+de+Vendas',
        read_time: strategy.read_time || '10 min'
      }));
      
      setRealSalesStrategies(formattedStrategies);
    } catch (error) {
      console.error('Erro ao buscar estratégias de vendas:', error);
      // Use os dados fictícios em caso de erro
      setRealSalesStrategies(previewSalesStrategies.map(strategy => ({
        id: strategy.id,
        title: strategy.title,
        description: strategy.description,
        image_url: strategy.image,
        read_time: strategy.readTime
      })));
    } finally {
      setLoading(prev => ({ ...prev, salesStrategies: false }));
    }
  };

  // Função para buscar pacotes gratuitos
  const fetchFreePacks = async () => {
    try {
      setLoading(prev => ({ ...prev, freePacks: true }));
      const { data, error } = await supabase
        .from('free_packs')
        .select('*')
        .eq('status', 'published')
        .limit(2);
      
      if (error) throw error;
      
      const formattedPacks: FreePack[] = data.map(pack => ({
        id: pack.id,
        title: pack.title,
        description: pack.description,
        image_url: pack.image_url || 'https://via.placeholder.com/800x600?text=Pacote+Gratuito',
        items_count: pack.items_count || 0
      }));
      
      setRealFreePacks(formattedPacks);
    } catch (error) {
      console.error('Erro ao buscar pacotes gratuitos:', error);
      // Use os dados fictícios em caso de erro
      setRealFreePacks(previewFreePacks.map(pack => ({
        id: pack.id,
        title: pack.title,
        description: pack.description,
        image_url: pack.image,
        items_count: pack.items
      })));
    } finally {
      setLoading(prev => ({ ...prev, freePacks: false }));
    }
  };

  // Carregar todos os dados reais quando o componente montar
  useEffect(() => {
    fetchFreeCourses();
    fetchEbooks();
    fetchMindMaps();
    fetchSalesStrategies();
    fetchFreePacks();
  }, []);

  // Categorias para navegação
  const categories = ['Todos', 'Marketing', 'SEO', 'Copywriting', 'Redes Sociais', 'E-commerce'];

  // Funções de navegação para as novas páginas
  const handleNavigateToDesafios = () => {
    navigate('/dashboard/learning/challenges');
  };
  
  const handleNavigateToCurso = () => {
    navigate('/dashboard/learning/course');
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

  // Prévia de e-books e PDFs
  const previewEbooks = [
    {
      id: 1,
      title: 'Guia Completo de Marketing Digital',
      description: 'Aprenda tudo sobre marketing digital e como aplicá-lo no seu negócio.',
      coverImage: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=300&h=400',
      fileSize: '5 MB',
      category: 'Marketing Digital'
    },
    {
      id: 2,
      title: 'Manual de Copywriting',
      description: 'Descubra como escrever textos persuasivos que convertem.',
      coverImage: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&q=80&w=300&h=400',
      fileSize: '3 MB',
      category: 'Copywriting'
    },
    {
      id: 3,
      title: 'Guia de SEO para Iniciantes',
      description: 'Os fundamentos da otimização para mecanismos de busca explicados passo a passo.',
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300&h=400',
      fileSize: '4.2 MB',
      category: 'SEO'
    }
  ];

  // Prévia de mapas mentais
  const previewMindMaps = [
    {
      id: 1,
      title: 'Funil de Vendas para Instagram',
      description: 'Estrutura completa de um funil de vendas efetivo para Instagram',
      image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&q=80&w=300&h=400',
      downloads: 324
    },
    {
      id: 2,
      title: 'Estratégia de Conteúdo 360°',
      description: 'Mapa mental para planejar sua estratégia de conteúdo em todas as plataformas',
      image: 'https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?auto=format&fit=crop&q=80&w=300&h=400',
      downloads: 215
    }
  ];

  // Prévia de estratégias de vendas
  const previewSalesStrategies = [
    {
      id: 1,
      title: 'Venda Consultiva para Infoprodutos',
      description: 'Como aplicar a metodologia de venda consultiva para infoprodutos digitais',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300&h=400',
      readTime: '8 min'
    },
    {
      id: 2,
      title: 'Objeções em Vendas: Como Contorná-las',
      description: 'Aprenda a lidar com as objeções mais comuns durante o processo de venda',
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=300&h=400',
      readTime: '12 min'
    }
  ];

  // Prévia de pacotes gratuitos
  const previewFreePacks = [
    {
      id: 1,
      title: 'Pack Completo para Instagram',
      description: 'Templates para stories, posts e reels + guia de uso',
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&q=80&w=300&h=400',
      items: 15
    },
    {
      id: 2,
      title: 'Pacote de Planilhas para Marketing',
      description: 'Planilhas para planejamento, orçamento e análise de resultados',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=400',
      items: 8
    }
  ];

  // Componente de navegação para visualizar mais conteúdos
  const ViewMoreButton = ({ link, text }: { link: string, text: string }) => (
    <div className="flex justify-center mt-8">
      <button 
        onClick={() => navigate(link)}
        className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-50 transition-all duration-300 group"
      >
        <span>{text}</span>
        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  // Componente de seção de conteúdo
  const ContentSection = ({ 
    title, 
    icon, 
    children, 
    viewMoreLink 
  }: { 
    title: string, 
    icon: React.ReactNode, 
    children: React.ReactNode,
    viewMoreLink: string
  }) => (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2.5 rounded-xl text-white shadow-sm">
            {icon}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">{title}</h2>
        </div>
        
        <button 
          onClick={() => navigate(viewMoreLink)}
          className="hidden md:flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium gap-1 hover:gap-2 transition-all duration-300"
        >
          <span>Ver todos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {children}
      
      <div className="md:hidden">
        <ViewMoreButton link={viewMoreLink} text="Ver todos" />
      </div>
    </section>
  );

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
    <div className="container mx-auto px-4 mb-16">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 shadow-sm">
        <h3 className="text-xl font-bold text-emerald-800 mb-6 text-center">Conteúdo Especial</h3>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <button 
            className="bg-white text-emerald-700 hover:text-emerald-800 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow border border-emerald-100 group"
            onClick={handleNavigateToDesafios}
          >
            <div className="bg-emerald-100 p-2 rounded-lg mr-3 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
              <Zap size={18} />
            </div>
            <div className="text-left">
              <span className="block font-bold">Desafios de Crescimento</span>
              <span className="text-sm text-gray-500">Aplique conhecimentos práticos</span>
            </div>
          </button>
          <button 
            className="bg-white text-emerald-700 hover:text-emerald-800 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow border border-emerald-100 group"
            onClick={handleNavigateToCurso}
          >
            <div className="bg-emerald-100 p-2 rounded-lg mr-3 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
              <BookOpen size={18} />
            </div>
            <div className="text-left">
              <span className="block font-bold">Cursos Completos</span>
              <span className="text-sm text-gray-500">Aulas detalhadas e certificadas</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Design Premium */}
      <div className="relative overflow-hidden pt-16 pb-10 md:pt-24 md:pb-20 bg-gray-50">
        {/* Pattern dots no fundo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015]"></div>
        
        {/* Conteúdo Centralizado */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex items-center justify-center gap-2 mb-8 bg-white bg-opacity-90 backdrop-blur-sm px-5 py-2.5 rounded-full w-fit mx-auto border border-gray-200 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BookOpen className="h-5 w-5 text-emerald-600" />
            <span className="text-emerald-600 text-sm font-medium">DigitFy Academy</span>
          </motion.div>
          
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Aprendizado</span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Expanda seus conhecimentos em marketing digital com cursos, tutoriais, e-books, mapas mentais e muito mais.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <button 
                className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 flex items-center"
                onClick={handleSubmitContent}
              >
                <Upload className="h-5 w-5 mr-2" />
                Sugerir Conteúdo
              </button>
            </motion.div>
            
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
      <div className="container mx-auto px-4 py-12" ref={contentRef}>
        
        {/* Cursos Gratuitos */}
        <ContentSection 
          title="Conteúdos Gratuitos" 
          icon={<BookOpen className="w-5 h-5" />}
          viewMoreLink="/dashboard/learning/free-courses"
        >
          {loading.courses ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(realCourses.length > 0 ? realCourses : courses).map((course: Course, index: number) => (
                <motion.div
                  key={course.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  onClick={() => navigate('/dashboard/learning/free-courses')}
                >
                  <div className="relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-52 object-cover transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800x600?text=Curso";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4 text-emerald-500" />
                          <span>{course.lessons} aulas</span>
                        </div>
                        
                        <span className="text-gray-300">•</span>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-emerald-500 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentSection>
        
        {/* E-books e PDFs */}
        <ContentSection 
          title="E-books e PDFs" 
          icon={<FileText className="w-5 h-5" />}
          viewMoreLink="/dashboard/learning/ebooks"
        >
          {loading.ebooks ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(realEbooks.length > 0 ? realEbooks : previewEbooks.map(ebook => ({
                id: ebook.id,
                title: ebook.title,
                description: ebook.description,
                cover_image_url: ebook.coverImage,
                file_size: ebook.fileSize,
                category: ebook.category
              } as Ebook))).map((ebook: Ebook, index: number) => (
                <motion.div
                  key={ebook.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  onClick={() => navigate('/dashboard/learning/ebooks')}
                >
                  <div className="relative">
                    <img 
                      src={ebook.cover_image_url} 
                      alt={ebook.title} 
                      className="w-full h-52 object-cover transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800x600?text=eBook";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        {ebook.category || 'E-book'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{ebook.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ebook.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <span>{ebook.file_type || 'PDF'} • {ebook.file_size}</span>
                      </div>

                      <div className="flex items-center gap-1 text-emerald-500 font-medium group-hover:underline">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentSection>
        
        {/* Mapas Mentais */}
        <ContentSection 
          title="Mapas Mentais" 
          icon={<Map className="w-5 h-5" />}
          viewMoreLink="/dashboard/learning/mind-maps"
        >
          {loading.mindMaps ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(realMindMaps.length > 0 ? realMindMaps : previewMindMaps.map(mindMap => ({
                id: mindMap.id, 
                title: mindMap.title,
                description: mindMap.description,
                image_url: mindMap.image,
                download_count: mindMap.downloads
              } as MindMap))).map((mindMap: MindMap, index: number) => (
                <motion.div
                  key={mindMap.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  onClick={() => navigate('/dashboard/learning/mind-maps')}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="relative w-full md:w-2/5">
                      <img 
                        src={mindMap.image_url} 
                        alt={mindMap.title} 
                        className="w-full h-52 md:h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/800x600?text=Mapa+Mental";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r md:from-transparent md:to-white/10 from-black/50 to-black/30"></div>
                      <div className="absolute top-4 left-4 md:hidden">
                        <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                          Mapa Mental
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col justify-between md:w-3/5">
                      <div>
                        <div className="hidden md:inline-block mb-3">
                          <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                            Mapa Mental
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{mindMap.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mindMap.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        <div className="flex items-center gap-1">
                          <Map className="w-4 h-4 text-emerald-500" />
                          <span>Mapa Mental</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-emerald-500 font-medium group-hover:underline">
                          <Download className="w-4 h-4" />
                          <span>{mindMap.download_count || 0} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentSection>
        
        {/* Estratégias de Vendas */}
        <ContentSection 
          title="Estratégias de Vendas" 
          icon={<DollarSign className="w-5 h-5" />}
          viewMoreLink="/dashboard/learning/sales-strategy"
        >
          {loading.salesStrategies ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(realSalesStrategies.length > 0 ? realSalesStrategies : previewSalesStrategies.map(strategy => ({
                id: strategy.id,
                title: strategy.title,
                description: strategy.description,
                image_url: strategy.image,
                read_time: strategy.readTime
              } as SalesStrategy))).map((strategy: SalesStrategy, index: number) => (
                <motion.div
                  key={strategy.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  onClick={() => navigate(`/dashboard/learning/sales-strategy/${strategy.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={strategy.image_url} 
                      alt={strategy.title} 
                      className="w-full h-52 object-cover transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/800x600?text=Estratégia";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                        Estratégia
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{strategy.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{strategy.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>{strategy.read_time || '5 min leitura'}</span>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-emerald-500 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentSection>
        
        {/* Pacotes Gratuitos */}
        <ContentSection 
          title="Pacotes Gratuitos" 
          icon={<Package className="w-5 h-5" />}
          viewMoreLink="/dashboard/learning/free-packs"
        >
          {loading.freePacks ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {(realFreePacks.length > 0 ? realFreePacks : previewFreePacks.map(pack => ({
                id: pack.id,
                title: pack.title,
                description: pack.description,
                image_url: pack.image,
                items_count: pack.items
              } as FreePack))).map((pack: FreePack, index: number) => (
                <motion.div
                  key={pack.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  onClick={() => navigate('/dashboard/learning/free-packs')}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="relative w-full sm:w-2/5 h-44 sm:h-auto">
                      <img 
                        src={pack.image_url} 
                        alt={pack.title} 
                        loading={index < 2 ? "eager" : "lazy"}
                        width="300"
                        height="200"
                        decoding="async"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/800x600?text=Pacote";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r sm:from-transparent sm:to-white/10 from-black/50 to-black/30"></div>
                      <div className="absolute top-4 left-4 sm:hidden">
                        <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                          Pacote
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-5 flex flex-col justify-between sm:w-3/5 flex-grow">
                      <div>
                        <div className="hidden sm:inline-block mb-2 sm:mb-3">
                          <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                            Pacote
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2">{pack.title}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">{pack.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mt-auto">
                        <div className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                          <span>{pack.items_count || 0} itens</span>
                        </div>
                        
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ContentSection>
        
        {/* CTA - Desafios de aprendizado */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-8 sm:p-10 mb-16 shadow-xl shadow-emerald-100/40 overflow-hidden relative">
          {/* Elementos decorativos com formas mais orgânicas */}
          <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-white opacity-5 blur-lg transform rotate-12"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black opacity-5 blur-lg transform -rotate-6"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-white opacity-5 blur-md"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-white max-w-2xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Desafios de Aprendizado</h2>
              <p className="mb-6 text-white/90 text-base sm:text-lg">Teste seus conhecimentos e coloque em prática o que aprendeu com nossos desafios exclusivos. Complete missões, ganhe reconhecimento e aprimore suas habilidades!</p>
              <button 
                onClick={() => navigate('/dashboard/learning/challenges')}
                className="w-full sm:w-auto bg-white text-emerald-600 hover:text-emerald-700 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-700/20"
              >
                <Zap className="w-5 h-5" />
                Participar dos Desafios
              </button>
            </div>
            
            <div className="relative mt-6 md:mt-0">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl transform rotate-6"></div>
              <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-60"></div>
                <Award className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modais */}
      <AnimatePresence>
        {selectedCourse && <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
        {selectedArticle && <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
        {showSubmitContentModal && <SubmitContentModal />}
      </AnimatePresence>
    </div>
  );
};

export default Learning;
