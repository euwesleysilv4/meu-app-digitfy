import { motion } from "framer-motion";
import { BookOpen, Clock, Video, FileText, Tag, ExternalLink, Search, Info, X, Plus, Send } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React from 'react';

interface RelevantContent {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  external_url?: string;
  status: 'published' | 'draft' | 'scheduled' | 'pending';
  created_at: string;
  updated_at: string;
  author: string;
  tags?: string[];
  view_count: number;
  like_count: number;
}

// Interface para os props do ContentSubmitModal
interface ContentSubmitModalProps {
  show: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  newContent: Partial<RelevantContent>;
  onClose: () => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageUrlChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

// Alterar URLs de imagens de placeholder para evitar requisições infinitas
const DEFAULT_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='32' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3ESem Imagem%3C/text%3E%3C/svg%3E";
const ERROR_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='32' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3EImagem Indisponível%3C/text%3E%3C/svg%3E";

// Componente para o Player do YouTube
const YouTubeEmbed = ({ videoId, title }: { videoId: string, title: string }) => {
  return (
    <div className="my-8">
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
        <iframe 
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        <Video className="inline-block w-4 h-4 mr-1 text-red-500" />
        <span>Vídeo do YouTube: {title}</span>
      </p>
    </div>
  );
};

// Função para extrair o ID do vídeo de um link do YouTube
const extractYouTubeId = (url: string) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Função para processar o conteúdo HTML e substituir links do YouTube por players
const processYouTubeLinks = (content: string) => {
  if (!content) return '';
  
  let processedContent = content;
  
  // 1. Processar links diretos do YouTube em formato de texto
  const directYoutubeRegex = /(https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:[^\s<]*)|https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:[^\s<]*))/g;
  
  processedContent = processedContent.replace(directYoutubeRegex, (match, url, _1, videoId1, _2, videoId2) => {
    const videoId = videoId1 || videoId2;
    if (!videoId) return match;
    
    return `<div class="youtube-player" data-videoid="${videoId}" data-title="Vídeo do YouTube"></div>`;
  });
  
  // 2. Processar links do YouTube em formato de âncora HTML
  const anchorYoutubeRegex = /<a\s+(?:[^>]*?\s+)?href="(https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:[^"]*)|https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:[^"]*))">([^<]*)<\/a>/gi;
  
  processedContent = processedContent.replace(anchorYoutubeRegex, (match, url, _1, videoId1, _2, videoId2, title) => {
    const videoId = videoId1 || videoId2;
    if (!videoId) return match;
    
    return `<div class="youtube-player" data-videoid="${videoId}" data-title="${title || 'Vídeo do YouTube'}"></div>`;
  });
  
  // 3. Processar iframes já existentes do YouTube
  const iframeYoutubeRegex = /<iframe(?:[^>]*?)\s+src="https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?[^"]*)?"\s+(?:[^>]*?)(?:title="([^"]*)")?(?:[^>]*?)><\/iframe>/gi;
  
  processedContent = processedContent.replace(iframeYoutubeRegex, (match, videoId, title) => {
    if (!videoId) return match;
    
    return `<div class="youtube-player" data-videoid="${videoId}" data-title="${title || 'Vídeo do YouTube'}"></div>`;
  });
  
  // 4. Processar iframes com parâmetros SI
  const iframeWithSiRegex = /<iframe(?:[^>]*?)\s+src="https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})\?si=[^"]+"\s+(?:[^>]*?)(?:title="([^"]*)")?(?:[^>]*?)><\/iframe>/gi;
  
  processedContent = processedContent.replace(iframeWithSiRegex, (match, videoId, title) => {
    if (!videoId) return match;
    
    return `<div class="youtube-player" data-videoid="${videoId}" data-title="${title || 'Vídeo do YouTube'}"></div>`;
  });
  
  return processedContent;
};

// Modal de submissão de conteúdo (extraído para fora do componente principal)
const ContentSubmitModal: React.FC<ContentSubmitModalProps> = React.memo(({
  show,
  isSubmitting,
  submitSuccess,
  newContent,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onImageUrlChange,
  onTagsChange,
  onContentChange
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Send className="h-5 w-5 mr-2 text-emerald-500" />
            Enviar Conteúdo para Aprovação
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Mensagem de sucesso */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
            <p className="font-medium">Conteúdo enviado com sucesso!</p>
            <p className="text-sm mt-1">Seu conteúdo foi recebido e está aguardando aprovação. Obrigado pela contribuição!</p>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input 
              type="text" 
              value={newContent.title || ''}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Digite o título do seu conteúdo"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input 
              type="text" 
              value={newContent.description || ''}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Digite uma breve descrição"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (opcional)</label>
            <input 
              type="url"
              value={newContent.image_url || ''}
              onChange={(e) => onImageUrlChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL da imagem de capa do conteúdo
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
            <input 
              type="text"
              value={newContent.tags ? newContent.tags.join(', ') : ''}
              onChange={(e) => onTagsChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="marketing, copywriting, instagram"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
            <div className="border border-gray-300 rounded-lg">
              <ReactQuill 
                value={newContent.content || ''}
                onChange={onContentChange}
                className="min-h-[300px]"
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'align': [] }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'image', 'video'],
                    ['blockquote', 'code-block'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'indent',
                  'align',
                  'color', 'background',
                  'link', 'image', 'video',
                  'blockquote', 'code-block'
                ]}
                style={{ height: '350px' }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Crie conteúdo rico com formatação, imagens e links para vídeos do YouTube
            </p>
            <div className="text-xs text-amber-600 mt-2">
              <p>Dicas:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Cole links de YouTube diretamente para incorporar vídeos</li>
                <li>Use os botões de formatação para melhorar a apresentação</li>
                <li>Seu conteúdo será revisado por nossa equipe antes de ser publicado</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-8">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !newContent.title || !newContent.description || !newContent.content}
              className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center ${
                isSubmitting || !newContent.title || !newContent.description || !newContent.content
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  <span>Enviar Conteúdo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

const FreeCourses = () => {
  const [contents, setContents] = useState<RelevantContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContent, setSelectedContent] = useState<RelevantContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { session } = useAuth();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Estado para o modal de submissão de conteúdo
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [newContent, setNewContent] = useState<Partial<RelevantContent>>({
    title: '',
    description: '',
    content: '',
    image_url: '',
    tags: []
  });
  
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
        .select('id, title, description, content, image_url, external_url, status, created_at, updated_at, author, tags, view_count, like_count')
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
        ? supabase.from('relevant_contents').select('id, title, description, content, image_url, external_url, status, created_at, updated_at, author, tags, view_count, like_count').order('updated_at', { ascending: false })
        : supabase.from('relevant_contents').select('id, title, description, content, image_url, external_url, status, created_at, updated_at, author, tags, view_count, like_count').eq('status', 'published').order('updated_at', { ascending: false });
      
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
  
  // Funções de tratamento de eventos memorizadas para o modal
  const handleCloseModal = useCallback(() => {
    setShowSubmitModal(false);
  }, []);
  
  const handleTitleChange = useCallback((value: string) => {
    setNewContent(prev => ({...prev, title: value}));
  }, []);
  
  const handleDescriptionChange = useCallback((value: string) => {
    setNewContent(prev => ({...prev, description: value}));
  }, []);
  
  const handleImageUrlChange = useCallback((value: string) => {
    setNewContent(prev => ({...prev, image_url: value}));
  }, []);
  
  const handleTagsChange = useCallback((value: string) => {
    setNewContent(prev => ({
      ...prev, 
      tags: value.split(',').map(tag => tag.trim()).filter(Boolean)
    }));
  }, []);
  
  const handleContentChange = useCallback((value: string) => {
    setNewContent(prev => ({...prev, content: value}));
  }, []);
  
  // Função para submeter um novo conteúdo
  const handleContentSubmit = useCallback(async () => {
    if (!session) {
      alert('Você precisa estar logado para enviar conteúdo');
      return;
    }
    
    if (!newContent.title || !newContent.description || !newContent.content) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Obter nome do usuário diretamente da sessão ou usar o email
      const authorName = session.user.user_metadata?.full_name || session.user.email;
      
      // Inserir o conteúdo com status 'draft' (ao invés de 'pending' que não é suportado pelo banco)
      const { data, error } = await supabase
        .from('relevant_contents')
        .insert([
          {
            title: newContent.title,
            description: newContent.description,
            content: newContent.content,
            image_url: newContent.image_url || '',
            status: 'draft', // Usando 'draft' em vez de 'pending'
            author: authorName,
            tags: newContent.tags || []
          }
        ]);
      
      if (error) throw error;
      
      // Resetar o formulário e mostrar mensagem de sucesso
      setNewContent({
        title: '',
        description: '',
        content: '',
        image_url: '',
        tags: []
      });
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitModal(false);
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao enviar conteúdo:', err);
      alert(`Ocorreu um erro ao enviar seu conteúdo. Por favor, tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [newContent, session]);
  
  // Renderizar a visualização detalhada de um conteúdo
  if (selectedContent) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Lightbox para imagens */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
            >
              <X className="h-8 w-8" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Imagem ampliada" 
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Botão voltar */}
            <button 
              onClick={() => {
                setSelectedContent(null);
                // Se for preview, voltar para o painel admin
                if (new URLSearchParams(location.search).get('preview') && isAdmin) {
                  window.close(); // Fecha a aba se foi aberta como preview
                }
              }}
              className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Voltar para todos os conteúdos</span>
            </button>
            
            {/* Badge de status para admin */}
            {isAdmin && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm
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
          <div className="mb-10">
            {selectedContent.image_url && (
              <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={selectedContent.image_url} 
                  alt={selectedContent.title}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = ERROR_IMAGE_PLACEHOLDER;
                    e.currentTarget.onerror = null; // Impedir loop infinito de erros
                  }}
                />
              </div>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-6">
              {selectedContent.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-emerald-500" />
                <span>Atualizado em {formatDate(selectedContent.updated_at)}</span>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-emerald-500" />
                <span>Por {selectedContent.author}</span>
              </div>
              
              {selectedContent.external_url && (
                <a 
                  href={selectedContent.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>Link Externo</span>
                </a>
              )}
            </div>
            
            {/* Tags */}
            {selectedContent.tags && selectedContent.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedContent.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 shadow-sm hover:bg-emerald-200 transition-colors cursor-pointer"
                  >
                    <Tag className="h-3 w-3 mr-1.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Descrição */}
            <p className="text-lg text-gray-700 mb-10 leading-relaxed border-l-4 border-emerald-200 pl-4 py-2 bg-emerald-50 rounded-r-lg">
              {selectedContent.description}
            </p>
          </div>
          
          {/* Conteúdo HTML com players de YouTube e imagens clicáveis */}
          <div className="prose prose-emerald lg:prose-lg max-w-none 
            prose-headings:text-emerald-800 prose-headings:font-semibold prose-headings:mt-8 prose-headings:mb-4
            prose-h1:text-3xl prose-h1:font-bold prose-h1:bg-gradient-to-r prose-h1:from-emerald-600 prose-h1:to-teal-500 prose-h1:bg-clip-text prose-h1:text-transparent
            prose-h2:text-2xl prose-h2:border-b prose-h2:border-emerald-100 prose-h2:pb-2
            prose-h3:text-xl 
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-5
            prose-a:text-emerald-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-emerald-300 hover:prose-a:border-emerald-500 hover:prose-a:text-emerald-700
            prose-strong:text-emerald-700 prose-strong:font-semibold
            prose-em:text-gray-600 prose-em:italic
            prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:my-2 prose-li:pl-2
            prose-blockquote:border-l-4 prose-blockquote:border-emerald-300 prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:my-6 prose-blockquote:bg-emerald-50 prose-blockquote:rounded-r-lg prose-blockquote:pr-4 prose-blockquote:italic prose-blockquote:text-gray-700
            prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:p-4 prose-pre:my-6
            prose-code:text-emerald-700 prose-code:bg-emerald-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-img:rounded-lg prose-img:my-8 prose-img:mx-auto prose-img:shadow-md prose-img:cursor-pointer prose-img:transition-transform prose-img:hover:scale-[1.02]
            prose-hr:my-8 prose-hr:border-emerald-100
            prose-table:border-collapse prose-table:w-full prose-table:my-6
            prose-thead:bg-emerald-50 prose-thead:text-emerald-700
            prose-th:py-3 prose-th:px-4 prose-th:border prose-th:border-emerald-200 prose-th:text-left
            prose-td:py-2 prose-td:px-4 prose-td:border prose-td:border-emerald-200"
          >
            <div 
              // Processar o conteúdo para transformar links do YouTube em players
              dangerouslySetInnerHTML={{ __html: processYouTubeLinks(selectedContent.content) }} 
              ref={(node) => {
                // Adicionar evento de clique para todas as imagens após a renderização
                if (node) {
                  // Processar imagens (código existente)
                  const images = node.querySelectorAll('img');
                  images.forEach(img => {
                    img.addEventListener('click', () => {
                      setLightboxImage(img.src);
                    });
                    // Adicionar classes para manter o estilo existente
                    img.classList.add('rounded-lg', 'my-8', 'mx-auto', 'shadow-md', 'cursor-pointer', 'transition-transform', 'hover:scale-[1.02]');
                  });
                  
                  // Renderizar players do YouTube
                  const youtubePlayers = node.querySelectorAll('.youtube-player');
                  youtubePlayers.forEach(playerDiv => {
                    const videoId = playerDiv.getAttribute('data-videoid');
                    const title = playerDiv.getAttribute('data-title') || 'Vídeo do YouTube';
                    if (videoId) {
                      // Criar elemento do player
                      const playerContainer = document.createElement('div');
                      playerContainer.className = 'my-8';
                      
                      const aspectRatioContainer = document.createElement('div');
                      aspectRatioContainer.className = 'relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg';
                      
                      const iframe = document.createElement('iframe');
                      iframe.className = 'absolute top-0 left-0 w-full h-full';
                      iframe.src = `https://www.youtube.com/embed/${videoId}`;
                      iframe.title = title;
                      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                      iframe.allowFullscreen = true;
                      
                      const caption = document.createElement('p');
                      caption.className = 'text-sm text-gray-500 mt-2 text-center';
                      caption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-4 h-4 mr-1 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> Vídeo do YouTube: ${title}`;
                      
                      aspectRatioContainer.appendChild(iframe);
                      playerContainer.appendChild(aspectRatioContainer);
                      playerContainer.appendChild(caption);
                      
                      // Substituir o div placeholder pelo player real
                      playerDiv.parentNode?.replaceChild(playerContainer, playerDiv);
                    }
                  });
                  
                  // Procurar por links regulares de YouTube no texto também
                  const paragraphs = node.querySelectorAll('p');
                  paragraphs.forEach(paragraph => {
                    const paragraphContent = paragraph.innerHTML;
                    const youtubeRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:[^\s<]*)|https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:[^\s<]*)/g;
                    
                    let match;
                    let foundYoutubeLinks = false;
                    while ((match = youtubeRegex.exec(paragraphContent)) !== null) {
                      foundYoutubeLinks = true;
                      const url = match[0];
                      const videoId = match[2] || match[4];
                      
                      if (videoId) {
                        // Criar elemento do player
                        const playerContainer = document.createElement('div');
                        playerContainer.className = 'my-8';
                        
                        const aspectRatioContainer = document.createElement('div');
                        aspectRatioContainer.className = 'relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg';
                        
                        const iframe = document.createElement('iframe');
                        iframe.className = 'absolute top-0 left-0 w-full h-full';
                        iframe.src = `https://www.youtube.com/embed/${videoId}`;
                        iframe.title = 'Vídeo do YouTube';
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;
                        
                        const caption = document.createElement('p');
                        caption.className = 'text-sm text-gray-500 mt-2 text-center';
                        caption.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-4 h-4 mr-1 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> Vídeo do YouTube`;
                        
                        aspectRatioContainer.appendChild(iframe);
                        playerContainer.appendChild(aspectRatioContainer);
                        playerContainer.appendChild(caption);
                        
                        // Substituir o link pelo player real
                        paragraph.innerHTML = paragraph.innerHTML.replace(url, '');
                        
                        // Inserir o player depois do parágrafo
                        paragraph.parentNode?.insertBefore(playerContainer, paragraph.nextSibling);
                      }
                    }
                    
                    // Se o parágrafo ficar vazio após remover os links, oculte-o
                    if (foundYoutubeLinks && paragraph.innerText.trim() === '') {
                      paragraph.style.display = 'none';
                    }
                  });
                }
              }}
            />
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
            className="flex justify-end items-center gap-3"
          >
            <div className="relative flex-1 max-w-md">
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
            {session && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setShowSubmitModal(true)}
                className="whitespace-nowrap py-2 px-4 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors flex items-center"
                title="Enviar meu conteúdo"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Enviar Conteúdo</span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de submissão de conteúdo */}
      <ContentSubmitModal 
        show={showSubmitModal}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        newContent={newContent}
        onClose={handleCloseModal}
        onSubmit={handleContentSubmit}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        onImageUrlChange={handleImageUrlChange}
        onTagsChange={handleTagsChange}
        onContentChange={handleContentChange}
      />
      
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
          {session && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-8 px-6 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Enviar Meu Conteúdo</span>
            </button>
          )}
        </div>
      )}

      {/* Feed de Conteúdos */}
      {!isLoading && !error && filteredContents.length > 0 && (
        <div className="space-y-8">
          {filteredContents.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedContent(content);
                incrementViewCount(content.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer"
            >
              <div className="grid md:grid-cols-12 gap-6">
                {/* Imagem */}
                <div className="md:col-span-4 relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={content.image_url || DEFAULT_IMAGE_PLACEHOLDER} 
                    alt={content.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = ERROR_IMAGE_PLACEHOLDER;
                      e.currentTarget.onerror = null; // Impedir loop infinito de erros
                    }}
                  />
                  {/* Badge de status para admin */}
                  {isAdmin && content.status !== 'published' && (
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium shadow-sm
                      ${content.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${content.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                    `}>
                      {content.status === 'draft' && 'Rascunho'}
                      {content.status === 'scheduled' && 'Agendado'}
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="md:col-span-8 p-6">
                  {/* Tipo e Duração */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>{content.tags && content.tags[0] ? content.tags[0] : 'Artigo'}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span>{formatDate(content.updated_at)}</span>
                    </div>
                  </div>

                  {/* Título e Descrição */}
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-emerald-600 transition-colors">
                    {content.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {content.description}
                  </p>
                  
                  {/* Tags */}
                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {content.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm(tag);
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Estatísticas */}
                  <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      {content.view_count > 0 && (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {content.view_count}
                        </span>
                      )}
                      
                      {content.like_count > 0 && (
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {content.like_count}
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

export default FreeCourses; 