import { motion } from "framer-motion";
import { Download, FileText, Plus, Instagram, Clock, BookOpen, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/userService";
import ReactMarkdown from "react-markdown";

interface Ebook {
  id: string;
  title: string;
  description: string;
  content?: string;
  cover_image_url?: string;
  file_url: string;
  file_size?: string;
  file_type?: string;
  external_url?: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string;
  updated_at: string;
  author?: string;
  created_by?: string;
  instagram?: string;
  tags?: string[];
  download_count: number;
  like_count: number;
}

const EbooksPdfs = () => {
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [driveLink, setDriveLink] = useState("");
  const [instagram, setInstagram] = useState("");
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const location = useLocation();
  const { session } = useAuth();

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
    
    // Se for admin e tiver parâmetro de preview, busca o ebook específico
    if (previewId && isAdmin) {
      fetchEbookById(previewId);
    }
  }, [location.search, isAdmin]);
  
  // Buscar todos os ebooks
  useEffect(() => {
    fetchEbooks();
  }, []);
  
  // Função para buscar um ebook específico por ID (para preview)
  const fetchEbookById = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedEbook(data);
      }
    } catch (err) {
      console.error("Erro ao buscar ebook por ID:", err);
      setError("Não foi possível carregar o ebook solicitado.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para buscar todos os ebooks
  const fetchEbooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Para admin, mostrar todos os ebooks
      // Para usuários normais, apenas ebooks publicados
      const query = isAdmin 
        ? supabase.from('ebooks').select('*').order('updated_at', { ascending: false })
        : supabase.from('ebooks').select('*').eq('status', 'published').order('updated_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        setEbooks(data);
      } else {
        setEbooks([]);
      }
    } catch (err) {
      console.error("Erro ao buscar ebooks:", err);
      setError("Não foi possível carregar os ebooks. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para incrementar contador de downloads
  const incrementDownloadCount = async (ebookId: string) => {
    try {
      // Chamar a função RPC do Supabase
      await supabase.rpc('increment_ebook_download_count', {
        ebook_id: ebookId
      });
    } catch (err) {
      console.error("Erro ao incrementar downloads:", err);
      // Não tratamos o erro aqui para não atrapalhar a experiência do usuário
    }
  };

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!driveLink || !driveLink.includes('drive.google.com')) {
      setFormError("Por favor, insira um link válido do Google Drive.");
      return;
    }
    
    try {
      setSubmittingForm(true);
      setFormError(null);
      setFormSuccess(null);
      
      // Preparar os dados
      const suggestionData = {
        drive_link: driveLink,
        instagram: instagram || null,
        user_id: session?.user?.id || null,
        description: null,
        status: 'pending'
      };
      
      // Enviar para o Supabase
      const { error } = await supabase
        .from('ebook_suggestions')
        .insert(suggestionData);
      
      if (error) throw error;
      
      // Sucesso
      setFormSuccess("Sua sugestão foi enviada com sucesso! Nosso time irá analisá-la em breve.");
    setDriveLink("");
    setInstagram("");
      
      // Fechar o modal após 3 segundos
      setTimeout(() => {
        setShowSuggestionModal(false);
        setFormSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error("Erro ao enviar sugestão:", err);
      setFormError("Ocorreu um erro ao enviar sua sugestão. Por favor, tente novamente.");
    } finally {
      setSubmittingForm(false);
    }
  };

  // Renderizar a visualização detalhada de um ebook
  if (selectedEbook) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Botão voltar */}
            <button 
              onClick={() => {
                setSelectedEbook(null);
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
              <span>Voltar para todos os ebooks</span>
            </button>
            
            {/* Badge de status para admin */}
            {isAdmin && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm
                ${selectedEbook.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                ${selectedEbook.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${selectedEbook.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
              `}>
                {selectedEbook.status === 'published' && 'Publicado'}
                {selectedEbook.status === 'draft' && 'Rascunho'}
                {selectedEbook.status === 'scheduled' && 'Agendado'}
              </div>
            )}
          </div>
          
          {/* Título e Imagem */}
          <div className="mb-10">
            {selectedEbook.cover_image_url && (
              <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
                <img 
                  src={selectedEbook.cover_image_url} 
                  alt={selectedEbook.title}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/1200x400?text=Imagem+Indisponível";
                  }}
                />
              </div>
            )}
            
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-6">
              {selectedEbook.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-emerald-500" />
                <span>Atualizado em {new Date(selectedEbook.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {selectedEbook.author && (
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>Por {selectedEbook.author}</span>
                </div>
              )}
              
              {selectedEbook.file_size && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>{selectedEbook.file_size}</span>
                </div>
              )}
              
              {selectedEbook.instagram && (
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>{selectedEbook.instagram}</span>
                </div>
              )}
              
              {selectedEbook.external_url && (
                <a 
                  href={selectedEbook.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Link Externo</span>
                </a>
              )}
            </div>
            
            {/* Tags */}
            {selectedEbook.tags && selectedEbook.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedEbook.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Descrição */}
            <p className="text-lg text-gray-700 mb-10 leading-relaxed border-l-4 border-emerald-200 pl-4 py-2 bg-emerald-50 rounded-r-lg">
              {selectedEbook.description}
            </p>
            
            {/* Botão de Download */}
            <div className="my-8 flex justify-center">
              <a
                href={selectedEbook.file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => incrementDownloadCount(selectedEbook.id)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Baixar {selectedEbook.file_type || 'PDF'}</span>
              </a>
            </div>
          </div>
          
          {/* Conteúdo Markdown se existir */}
          {selectedEbook.content && (
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
              prose-img:rounded-lg prose-img:my-8 prose-img:mx-auto prose-img:shadow-md
              prose-hr:my-8 prose-hr:border-emerald-100
              prose-table:border-collapse prose-table:w-full prose-table:my-6
              prose-thead:bg-emerald-50 prose-thead:text-emerald-700
              prose-th:py-3 prose-th:px-4 prose-th:border prose-th:border-emerald-200 prose-th:text-left
              prose-td:py-2 prose-td:px-4 prose-td:border prose-td:border-emerald-200"
            >
              <ReactMarkdown>{selectedEbook.content}</ReactMarkdown>
            </div>
          )}
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
        className="relative mb-12"
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Coluna Esquerda */}
          <motion.div 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="flex items-center gap-4"
          >
            <FileText className="w-10 h-10 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Ebooks e PDFs
              </h1>
              <p className="text-gray-600 mt-1">
                Baixe materiais gratuitos e melhore suas habilidades
              </p>
            </div>
          </motion.div>

          {/* Coluna Direita */}
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-4"
          >
            <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-emerald-600">Compartilhe conhecimento!</span> Envie o link do Google Drive com permissão de visualização. 
                    Após aprovação, seu PDF será disponibilizado aqui.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuggestionModal(true)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg w-full md:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enviar Sugestão</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de Sugestão */}
      {showSuggestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4">Enviar Sugestão de PDF</h2>
            
            {/* Mensagem de sucesso */}
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {formSuccess}
              </div>
            )}
            
            {/* Mensagem de erro */}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmitSuggestion}>
              <div className="mb-4">
                <label htmlFor="driveLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Google Drive
                </label>
                <input
                  type="url"
                  id="driveLink"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://drive.google.com/..."
                  required
                  disabled={submittingForm}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Seu Instagram (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Instagram className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="@seuinstagram"
                    disabled={submittingForm}
                  />
                </div>
                {/* Aviso de Reconhecimento */}
                <div className="mt-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  Seu @ será exibido apenas como forma de reconhecimento pela contribuição.
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSuggestionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                  disabled={submittingForm}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2"
                  disabled={submittingForm}
                >
                  {submittingForm ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
      {!isLoading && !error && ebooks.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum eBook encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Ainda não há eBooks disponíveis nesta seção. Volte em breve ou envie uma sugestão!
          </p>
        </div>
      )}

      {/* Lista de Materiais em Grid */}
      {!isLoading && !error && ebooks.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ebooks.map((ebook, index) => (
          <motion.div
              key={ebook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Imagem */}
              <div 
                className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                onClick={() => setSelectedEbook(ebook)}
              >
              <img 
                  src={ebook.cover_image_url || "https://via.placeholder.com/800x600?text=PDF"} 
                  alt={ebook.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=eBook";
                  }}
                />
                
                {/* Badge de status para admin */}
                {isAdmin && ebook.status !== 'published' && (
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium
                    ${ebook.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${ebook.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                  `}>
                    {ebook.status === 'draft' && 'Rascunho'}
                    {ebook.status === 'scheduled' && 'Agendado'}
                  </div>
                )}
            </div>

            {/* Informações */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Título e Descrição */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedEbook(ebook)}
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {ebook.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {ebook.description}
                </p>
              </div>

              {/* Enviado por */}
                {ebook.instagram && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4">
                  <span>Enviado por</span>
                  <Instagram className="w-4 h-4" />
                  <a 
                      href={`https://instagram.com/${ebook.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-700 transition-colors duration-300"
                  >
                      {ebook.instagram}
                  </a>
                </div>
              )}

              {/* Tamanho do Arquivo */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                    <span>{ebook.file_size || "PDF"}</span>
                  </div>
                  
                  {ebook.download_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{ebook.download_count}</span>
                    </div>
                  )}
              </div>

              {/* Botão de Download */}
              <div className="mt-auto">
                <a
                    href={ebook.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => incrementDownloadCount(ebook.id)}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </a>
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
            to="/dashboard/admin/ebooks"
            className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Gerenciar eBooks</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default EbooksPdfs; 