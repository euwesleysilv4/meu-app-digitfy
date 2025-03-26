import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  BookOpen, 
  Edit, 
  Trash, 
  Plus, 
  ArrowLeft,
  Save,
  Eye,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Calendar,
  Download,
  FileText,
  Upload
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Interface para eBooks
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

const AdminEbooks: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEbook, setCurrentEbook] = useState<Ebook | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      try {
        const { isAdmin, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        setIsAdmin(isAdmin);
        
        if (!isAdmin) {
          navigate('/dashboard');
          return;
        }
        
        // Carregar os ebooks após verificar permissões
        await loadEbooks();
        
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setIsAdmin(false);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  // Função para carregar os eBooks do Supabase
  const loadEbooks = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setEbooks(data);
      } else {
        setEbooks([]);
      }
    } catch (err) {
      console.error('Erro ao carregar ebooks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para filtrar eBooks com base no termo de busca
  const filteredEbooks = ebooks.filter(ebook => 
    ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ebook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ebook.tags && ebook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Função para adicionar novo eBook
  const handleAddNew = () => {
    const newEbook: Ebook = {
      id: '', // Deixar vazio para o Supabase gerar um novo ID
      title: '',
      description: '',
      content: '',
      cover_image_url: '',
      file_url: '',
      file_size: '',
      file_type: 'PDF',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Digital Fy',
      tags: [],
      download_count: 0,
      like_count: 0
    };
    
    setCurrentEbook(newEbook);
    setIsEditing(true);
  };

  // Função para editar um eBook existente
  const handleEdit = (ebook: Ebook) => {
    setCurrentEbook({...ebook});
    setIsEditing(true);
  };

  // Função para salvar o eBook
  const handleSaveEbook = async () => {
    if (!currentEbook) return;
    
    // Validação básica
    if (!currentEbook.title || !currentEbook.description || !currentEbook.file_url) {
      setSaveMessage('Erro: Preencha todos os campos obrigatórios (Título, Descrição e URL do Arquivo).');
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveMessage('');
      
      // Obter sessão para o ID do usuário
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar autenticado para salvar um eBook');
      }

      // Verificar conexão com o Supabase
      const { count, error: countError } = await supabase
        .from('ebooks')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Erro de conexão com o Supabase:', countError);
        throw new Error(`Erro de conexão com o banco de dados: ${countError.message}`);
      }
      
      const userId = session.user.id;
      console.log('Salvando eBook com user ID:', userId);
      
      // Preparar os dados para salvamento
      let ebookData: any = {
        title: currentEbook.title,
        description: currentEbook.description,
        content: currentEbook.content || null,
        cover_image_url: currentEbook.cover_image_url || null,
        file_url: currentEbook.file_url,
        file_size: currentEbook.file_size || null,
        file_type: currentEbook.file_type || 'PDF',
        external_url: currentEbook.external_url || null,
        status: currentEbook.status,
        updated_at: new Date().toISOString(),
        author: currentEbook.author || null,
        created_by: userId,
        instagram: currentEbook.instagram || null,
        tags: currentEbook.tags || []
      };
      
      let result;
      
      // Verificar se é um novo eBook ou atualização
      if (!currentEbook.id) {
        // É um novo eBook, adicionar created_at
        ebookData.created_at = new Date().toISOString();
        
        console.log('Criando novo eBook:', ebookData);
        result = await supabase
          .from('ebooks')
          .insert(ebookData)
          .select();
      } else {
        // Atualizar eBook existente
        console.log('Atualizando eBook existente:', currentEbook.id);
        result = await supabase
          .from('ebooks')
          .update(ebookData)
          .eq('id', currentEbook.id)
          .select();
      }
      
      if (result.error) {
        console.error('Erro retornado pelo Supabase:', result.error);
        throw new Error(`Erro ao salvar: ${result.error.message} (Código: ${result.error.code})`);
      }
      
      // Verificar se o resultado contém os dados esperados
      console.log('Resultado da operação:', result);
      
      // Atualiza a lista local
      await loadEbooks();
      
      // Definir mensagem de sucesso
      setSaveMessage(`eBook ${!currentEbook.id ? 'criado' : 'atualizado'} com sucesso!`);
      
      // Retornar à lista após um breve atraso
      setTimeout(() => {
        setIsEditing(false);
        setCurrentEbook(null);
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao salvar eBook:', err);
      setSaveMessage(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para excluir um eBook
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este eBook? Esta ação não pode ser desfeita.')) {
      try {
        setIsLoading(true);
        
        const { error } = await supabase
          .from('ebooks')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Recarregar a lista após excluir
        await loadEbooks();
        
      } catch (err) {
        console.error('Erro ao excluir eBook:', err);
        alert('Erro ao excluir eBook. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Renderização de carregamento
  if (isLoading && !isEditing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // UI base para a tela de administração
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BookOpen className="h-8 w-8 text-emerald-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de eBooks</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard/admin" 
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar</span>
          </Link>
          
          <button 
            onClick={handleAddNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Novo eBook</span>
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Edit className="h-5 w-5 text-emerald-600 mr-2" />
            {currentEbook?.id ? 'Editar eBook' : 'Novo eBook'}
          </h2>
          
          <div className="mb-8">
            <p className="text-gray-500 text-sm">
              Preencha as informações do eBook e clique em "Salvar" para publicá-lo na plataforma.
              Os eBooks aparecerão na seção "eBooks e PDFs" do dashboard.
            </p>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Título e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentEbook?.title || ''}
                  onChange={(e) => setCurrentEbook({...currentEbook!, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Título do eBook"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentEbook?.status || 'draft'}
                  onChange={(e) => setCurrentEbook({...currentEbook!, status: e.target.value as 'published' | 'draft' | 'scheduled'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>
            </div>
            
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição Curta <span className="text-red-500">*</span>
              </label>
              <textarea
                value={currentEbook?.description || ''}
                onChange={(e) => setCurrentEbook({...currentEbook!, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Uma breve descrição do eBook"
                rows={3}
                required
              />
            </div>
            
            {/* Conteúdo completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo Detalhado (Markdown)
              </label>
              <textarea
                value={currentEbook?.content || ''}
                onChange={(e) => setCurrentEbook({...currentEbook!, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                placeholder="Descrição detalhada em Markdown (opcional)"
                rows={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar Markdown para formatar o texto. Ex: **negrito**, *itálico*, [link](url)
              </p>
            </div>
            
            {/* URLs e arquivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Imagem de Capa
                </label>
                <input
                  type="url"
                  value={currentEbook?.cover_image_url || ''}
                  onChange={(e) => setCurrentEbook({...currentEbook!, cover_image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Externa (opcional)
                </label>
                <input
                  type="url"
                  value={currentEbook?.external_url || ''}
                  onChange={(e) => setCurrentEbook({...currentEbook!, external_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://exemplo.com/pagina-relacionada"
                />
              </div>
            </div>
            
            {/* Arquivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Arquivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={currentEbook?.file_url || ''}
                  onChange={(e) => setCurrentEbook({...currentEbook!, file_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://exemplo.com/ebook.pdf"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Você pode usar o Google Drive, Dropbox ou qualquer serviço de hospedagem de arquivos. Certifique-se de que o link é público.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Arquivo
                </label>
                <select
                  value={currentEbook?.file_type || 'PDF'}
                  onChange={(e) => setCurrentEbook({...currentEbook!, file_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                  <option value="MOBI">MOBI</option>
                  <option value="DOC">DOC</option>
                  <option value="DOCX">DOCX</option>
                  <option value="PPT">PPT</option>
                  <option value="PPTX">PPTX</option>
                  <option value="XLS">XLS</option>
                  <option value="XLSX">XLSX</option>
                  <option value="ZIP">ZIP</option>
                  <option value="RAR">RAR</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            
            {/* Tamanho e Autor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho do Arquivo
                </label>
                <input
                  type="text"
                  value={currentEbook?.file_size || ''}
                  onChange={(e) => setCurrentEbook({...currentEbook!, file_size: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Ex: 5 MB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={currentEbook?.author || ''}
                  onChange={(e) => setCurrentEbook({...currentEbook!, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nome do autor do eBook"
                />
              </div>
            </div>
            
            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram (se enviado por um usuário)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">@</span>
                </div>
                <input
                  type="text"
                  value={(currentEbook?.instagram || '').replace('@', '')}
                  onChange={(e) => setCurrentEbook({...currentEbook!, instagram: e.target.value ? `@${e.target.value.replace('@', '')}` : ''})}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="nome_usuario"
                />
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(currentEbook?.tags || []).join(', ')}
                onChange={(e) => setCurrentEbook({
                  ...currentEbook!, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="marketing, copywriting, negócios"
              />
              <p className="text-xs text-gray-500 mt-1">
                Adicione tags relacionadas ao conteúdo para facilitar a busca
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveEbook()}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    <span>Salvar eBook</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Mensagem de sucesso/erro */}
            {saveMessage && (
              <div className={`mt-4 p-3 rounded-lg ${saveMessage.includes('sucesso') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {saveMessage}
              </div>
            )}
          </form>
        </div>
      ) : (
        <>
          {/* Barra de pesquisa e filtros */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="relative flex-1 mb-4 md:mb-0">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar eBooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <button
                onClick={() => loadEbooks()}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
          
          {/* Lista de eBooks */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {filteredEbooks.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum eBook encontrado</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `Não encontramos resultados para "${searchTerm}". Tente outros termos de busca.`
                    : 'Comece adicionando seu primeiro eBook usando o botão "Novo eBook".'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        eBook
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Atualização
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEbooks.map((ebook) => (
                      <tr key={ebook.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {ebook.cover_image_url ? (
                                <img 
                                  src={ebook.cover_image_url} 
                                  alt={ebook.title}
                                  className="h-10 w-10 rounded object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://via.placeholder.com/40?text=PDF";
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded bg-emerald-100 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-emerald-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{ebook.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{ebook.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${ebook.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                            ${ebook.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${ebook.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                          `}>
                            {ebook.status === 'published' && 'Publicado'}
                            {ebook.status === 'draft' && 'Rascunho'}
                            {ebook.status === 'scheduled' && 'Agendado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {ebook.file_type || 'PDF'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {ebook.download_count}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(ebook.updated_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                          <div className="flex justify-end items-center space-x-3">
                            <button
                              onClick={() => window.open(`/dashboard/learning/ebooks?preview=${ebook.id}`, '_blank')}
                              className="text-emerald-600 hover:text-emerald-900"
                              title="Visualizar"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(ebook)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(ebook.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminEbooks; 