import { motion } from "framer-motion";
import { BookOpen, Clock, FileText, Tag, ExternalLink, Search, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import ReactMarkdown from "react-markdown";

interface RelevantContent {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  external_url?: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string;
  updated_at: string;
  author: string;
  tags?: string[];
  view_count: number;
  like_count: number;
}

const RelevantContentPage = () => {
  const [contents, setContents] = useState<RelevantContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<RelevantContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar para free-courses que é a nova página de exibição
  useEffect(() => {
    navigate('/dashboard/learning/free-courses', { replace: true });
  }, [navigate]);
  
  // Verificar parâmetros de URL para pré-visualização (apenas admin)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session) {
        try {
          const { isAdmin: adminStatus } = await userService.isSpecificAdmin();
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error("Erro ao verificar status de admin:", err);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [session]);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const previewId = params.get('preview');
    
    // Se for admin e tiver parâmetro de preview, busca o conteúdo específico
    if (previewId && isAdmin) {
      fetchContentById(previewId);
    }
  }, [location.search, isAdmin]);
  
  // Buscar todos os conteúdos relevantes
  useEffect(() => {
    fetchContents();
  }, []);
  
  // Função para buscar um conteúdo específico por ID (para preview)
  const fetchContentById = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('relevant_contents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedContent(data);
      }
    } catch (err) {
      console.error("Erro ao buscar conteúdo por ID:", err);
      setError("Não foi possível carregar o conteúdo solicitado.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para buscar todos os conteúdos
  const fetchContents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Para admin, mostrar todos os conteúdos
      // Para usuários normais, apenas conteúdos publicados
      const query = isAdmin 
        ? supabase.from('relevant_contents').select('*').order('updated_at', { ascending: false })
        : supabase.from('relevant_contents').select('*').eq('status', 'published').order('updated_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setContents(data);
      } else {
        setContents([]);
      }
    } catch (err) {
      console.error("Erro ao buscar conteúdos:", err);
      setError("Não foi possível carregar os conteúdos. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para incrementar visualização quando abrir um conteúdo
  const incrementViewCount = async (contentId: string) => {
    try {
      // Chamar a função RPC do Supabase
      await supabase.rpc('increment_content_view_count', {
        content_id: contentId
      });
    } catch (err) {
      console.error("Erro ao incrementar visualização:", err);
      // Não tratamos o erro aqui para não atrapalhar a experiência do usuário
    }
  };
  
  // Filtragem de conteúdos por termo de busca
  const filteredContents = contents.filter(content => 
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (content.tags && content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  // Formatar a data no formato brasileiro
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Renderizar a visualização detalhada de um conteúdo
  if (selectedContent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {/* Botão voltar */}
            <button 
              onClick={() => {
                setSelectedContent(null);
                // Se for preview, voltar para o painel admin
                if (new URLSearchParams(location.search).get('preview') && isAdmin) {
                  window.close(); // Fecha a aba se foi aberta como preview
                }
              }}
              className="flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Voltar para todos os conteúdos</span>
            </button>
            
            {/* Badge de status para admin */}
            {isAdmin && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium
                ${selectedContent.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                ${selectedContent.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${selectedContent.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
              `}>
                {selectedContent.status === 'published' && 'Publicado'}
                {selectedContent.status === 'draft' && 'Rascunho'}
                {selectedContent.status === 'scheduled' && 'Agendado'}
              </div>
            )}
          </div>
          
          {/* Título e Imagem */}
          <div className="mb-8">
            {selectedContent.image_url && (
              <img 
                src={selectedContent.image_url} 
                alt={selectedContent.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/1200x400?text=Imagem+Indisponível";
                }}
              />
            )}
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-3">
              {selectedContent.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                <span>Atualizado em {formatDate(selectedContent.updated_at)}</span>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1 text-gray-400" />
                <span>Por {selectedContent.author}</span>
              </div>
              
              {selectedContent.external_url && (
                <a 
                  href={selectedContent.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-700"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  <span>Link Externo</span>
                </a>
              )}
            </div>
            
            {/* Tags */}
            {selectedContent.tags && selectedContent.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedContent.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Descrição */}
            <p className="text-gray-700 mb-6 text-lg">
              {selectedContent.description}
            </p>
          </div>
          
          {/* Conteúdo Markdown */}
          <div className="prose prose-emerald max-w-none">
            <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative mb-8"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <BookOpen className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Conteúdos Relevantes
              </h1>
              <p className="text-gray-600 mt-1">
                Acesse materiais gratuitos e melhore suas habilidades
              </p>
            </div>
          </motion.div>

          {/* Coluna Direita */}
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-end"
          >
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar conteúdos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Mensagem de nenhum conteúdo */}
      {!isLoading && !error && filteredContents.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum conteúdo encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm 
              ? `Não encontramos resultados para "${searchTerm}". Tente outros termos de busca.`
              : 'Ainda não há conteúdos disponíveis nesta seção. Volte em breve!'}
          </p>
        </div>
      )}

      {/* Feed de Conteúdos em Grid */}
      {!isLoading && !error && filteredContents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContents.map((content, index) => (
            <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedContent(content);
                incrementViewCount(content.id);
                // Adicionar a lógica para redirecionar para a visualização detalhada
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
          >
            {/* Imagem */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                  src={content.image_url || "https://via.placeholder.com/800x600?text=Sem+Imagem"} 
                alt={content.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Imagem+Indisponível";
                }}
              />
                
                {/* Badge de status para admin */}
                {isAdmin && content.status !== 'published' && (
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium
                    ${content.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${content.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {content.status === 'draft' && 'Rascunho'}
                    {content.status === 'scheduled' && 'Agendado'}
                  </div>
                )}
            </div>

            {/* Informações */}
            <div className="p-4">
                {/* Tags + Data */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {content.tags && content.tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      <span>{content.tags[0]}</span>
                      {content.tags.length > 1 && <span>+{content.tags.length - 1}</span>}
                </div>
                  )}
                  
                  {content.tags && content.tags.length > 0 && (
                <div className="w-px h-3 bg-gray-200" />
                  )}
                  
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                    <span>{formatDate(content.updated_at)}</span>
                </div>
              </div>

              {/* Título e Descrição */}
              <h2 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
                {content.title}
              </h2>
              <p className="text-xs text-gray-600 line-clamp-2">
                {content.description}
              </p>
                
                {/* Link externo e contador de visualizações */}
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    {content.view_count > 0 && (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {content.view_count}
                      </span>
                    )}
                  </div>
                  
                  {content.external_url && (
                    <span className="flex items-center text-emerald-600">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <span>Link externo</span>
                    </span>
                  )}
                </div>
            </div>
            </motion.div>
        ))}
      </div>
      )}
      
      {/* Link para Dashboard de Admin */}
      {isAdmin && (
        <div className="mt-12 text-center">
          <Link 
            to="/dashboard/admin/content"
            className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Gerenciar Conteúdos</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RelevantContentPage; 