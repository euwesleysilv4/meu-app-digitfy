import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, ExternalLink, FileText, RefreshCw, Eye, Instagram } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';

interface EbookSuggestion {
  id: string;
  drive_link: string;
  instagram: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_id: string | null;
  admin_notes: string | null;
  processed_by: string | null;
}

const EbookSuggestions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<EbookSuggestion[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<EbookSuggestion | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar se o usuário é administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { isAdmin: adminStatus } = await userService.isSpecificAdmin();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          navigate('/dashboard');
        } else {
          loadSuggestions();
        }
      } catch (err) {
        console.error('Erro ao verificar status de admin:', err);
        setIsAdmin(false);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Carregar sugestões
  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ebook_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSuggestions(data || []);
    } catch (err) {
      console.error('Erro ao carregar sugestões:', err);
      setError('Não foi possível carregar as sugestões. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Processar uma sugestão (aprovar ou rejeitar)
  const processSuggestion = async (suggestion: EbookSuggestion, newStatus: 'approved' | 'rejected') => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);
      
      // Usar a função RPC para processar a sugestão
      const { data, error } = await supabase
        .rpc('process_ebook_suggestion', {
          suggestion_id: suggestion.id,
          new_status: newStatus,
          admin_notes: adminNotes || null
        });
      
      if (error) throw error;
      
      // Atualizar a UI primeiro
      setSuggestions(prevSuggestions => 
        prevSuggestions.map(s => 
          s.id === suggestion.id 
            ? { ...s, status: newStatus, admin_notes: adminNotes || null } 
            : s
        )
      );
      
      // Se aprovado, abrir modal para criar eBook
      if (newStatus === 'approved') {
        setSelectedSuggestion(null);
        setCreateEbookData({
          title: '',
          description: suggestion.description || '',
          file_url: suggestion.drive_link,
          instagram: suggestion.instagram || '',
          author: suggestion.instagram ? suggestion.instagram.replace('@', '') : '',
          suggestionId: suggestion.id
        });
        
        setShowCreateEbookModal(true);
      } else {
        // É um status de rejeição
        setSuccess(`Sugestão rejeitada com sucesso.`);
        setSelectedSuggestion(null);
        setAdminNotes('');
        
        // Limpar a mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Erro ao processar sugestão:', err);
      setError(`Ocorreu um erro ao processar a sugestão: ${err.message || 'Tente novamente'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Estado para controlar o modal de criação de eBook
  const [showCreateEbookModal, setShowCreateEbookModal] = useState(false);
  const [createEbookData, setCreateEbookData] = useState<{
    title: string;
    description: string;
    file_url: string;
    instagram: string;
    author: string;
    suggestionId: string;
  }>({
    title: '',
    description: '',
    file_url: '',
    instagram: '',
    author: '',
    suggestionId: ''
  });
  const [isCreatingEbook, setIsCreatingEbook] = useState(false);

  // Função para criar um eBook a partir de uma sugestão aprovada
  const createEbookFromSuggestion = async () => {
    try {
      setIsCreatingEbook(true);
      setError(null);
      
      // Validação básica
      if (!createEbookData.title || !createEbookData.description || !createEbookData.file_url) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Obter a sessão atual para o ID do usuário
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      // Criar o eBook
      const { data: newEbook, error: createError } = await supabase
        .from('ebooks')
        .insert({
          title: createEbookData.title,
          description: createEbookData.description,
          file_url: createEbookData.file_url,
          status: 'published',
          author: createEbookData.author || null,
          instagram: createEbookData.instagram || null,
          created_by: userId,
          file_type: 'PDF', // Assumindo PDF como padrão
          tags: []
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Atualizar a UI
      setSuccess(`eBook "${createEbookData.title}" criado com sucesso.`);
      setShowCreateEbookModal(false);
      
      // Redirecionar para visualização do eBook
      if (newEbook) {
        window.open(`/ebooks-pdfs?preview=${newEbook.id}`, '_blank');
      }
      
      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao criar eBook:', err);
      setError('Ocorreu um erro ao criar o eBook. Tente novamente.');
    } finally {
      setIsCreatingEbook(false);
    }
  };

  // Se ainda estiver verificando permissões
  if (isLoading && !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Sugestões de eBooks</h1>
        <p className="text-gray-600">Revise e aprove sugestões enviadas pelos usuários.</p>
      </div>
      
      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Controles */}
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={loadSuggestions}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
        
        <div className="text-sm text-gray-500">
          {suggestions.length} sugestões encontradas
        </div>
      </div>
      
      {/* Estado de carregamento */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando sugestões...</p>
        </div>
      )}
      
      {/* Lista vazia */}
      {!isLoading && suggestions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Nenhuma sugestão encontrada</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Ainda não há sugestões de eBooks enviadas pelos usuários.
          </p>
        </div>
      )}
      
      {/* Tabela de sugestões */}
      {!isLoading && suggestions.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instagram
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suggestions.map((suggestion) => (
                <tr key={suggestion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href={suggestion.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate max-w-xs inline-block">
                        {suggestion.drive_link.length > 40 
                          ? `${suggestion.drive_link.substring(0, 40)}...` 
                          : suggestion.drive_link}
                      </span>
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {suggestion.instagram ? (
                      <a
                        href={`https://instagram.com/${suggestion.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800"
                      >
                        <Instagram className="h-4 w-4" />
                        <span>{suggestion.instagram}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${suggestion.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${suggestion.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {suggestion.status === 'pending' && 'Pendente'}
                      {suggestion.status === 'approved' && 'Aprovado'}
                      {suggestion.status === 'rejected' && 'Rejeitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSuggestion(suggestion)}
                        className="text-emerald-600 hover:text-emerald-800 p-1"
                        disabled={suggestion.status !== 'pending'}
                        title="Revisar"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal de revisão */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Revisar Sugestão</h2>
            
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Link do Google Drive</h3>
              <div className="flex items-center">
                <a
                  href={selectedSuggestion.drive_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2 bg-emerald-50 p-2 rounded-lg w-full"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span className="truncate">{selectedSuggestion.drive_link}</span>
                </a>
              </div>
            </div>
            
            {selectedSuggestion.instagram && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Instagram</h3>
                <a
                  href={`https://instagram.com/${selectedSuggestion.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800"
                >
                  <Instagram className="h-5 w-5" />
                  <span>{selectedSuggestion.instagram}</span>
                </a>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Notas do Administrador</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Adicione observações sobre esta sugestão (opcional)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={isProcessing}
              ></textarea>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={() => processSuggestion(selectedSuggestion, 'rejected')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span>Rejeitar</span>
              </button>
              <button
                onClick={() => processSuggestion(selectedSuggestion, 'approved')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Aprovar</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para criar eBook a partir da sugestão */}
      {showCreateEbookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Criar eBook a partir da sugestão</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título*
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Título do eBook"
                value={createEbookData.title}
                onChange={(e) => setCreateEbookData(prev => ({ ...prev, title: e.target.value }))}
                disabled={isCreatingEbook}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição*
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Descrição do eBook"
                rows={3}
                value={createEbookData.description}
                onChange={(e) => setCreateEbookData(prev => ({ ...prev, description: e.target.value }))}
                disabled={isCreatingEbook}
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link do Arquivo*
              </label>
              <input
                type="url"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={createEbookData.file_url}
                onChange={(e) => setCreateEbookData(prev => ({ ...prev, file_url: e.target.value }))}
                disabled={isCreatingEbook}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="@instagram"
                  value={createEbookData.instagram}
                  onChange={(e) => setCreateEbookData(prev => ({ ...prev, instagram: e.target.value }))}
                  disabled={isCreatingEbook}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nome do autor"
                  value={createEbookData.author}
                  onChange={(e) => setCreateEbookData(prev => ({ ...prev, author: e.target.value }))}
                  disabled={isCreatingEbook}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateEbookModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                disabled={isCreatingEbook}
              >
                Cancelar
              </button>
              <button
                onClick={createEbookFromSuggestion}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-300 flex items-center gap-2"
                disabled={isCreatingEbook}
              >
                {isCreatingEbook ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Criar eBook</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EbookSuggestions; 