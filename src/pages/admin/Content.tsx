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
  Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Tipos de conteúdo que podem ser gerenciados
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

const AdminContent: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentItems, setContentItems] = useState<RelevantContent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<RelevantContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      
      try {
        const { isAdmin: adminStatus, error } = await userService.isSpecificAdmin();
        
        if (error) {
          console.error('Erro ao verificar status de administrador:', error);
          setIsAdmin(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          // Carregar conteúdo
          loadContent();
        }
      } catch (err) {
        console.error('Erro ao verificar status de administrador:', err);
        setIsAdmin(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('relevant_contents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar conteúdos:', error);
        throw error;
      }
      
      setContentItems(data || []);
    } catch (err) {
      console.error('Falha ao carregar conteúdos:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setContentItems([
        {
          id: '1',
          title: 'Introdução ao Marketing Digital',
          description: 'Um guia completo para iniciantes no marketing digital',
          content: 'Conteúdo detalhado sobre os fundamentos do marketing digital...',
          image_url: 'https://example.com/images/marketing-digital.jpg',
          status: 'published',
          created_at: '2023-03-10T14:30:00',
          updated_at: '2023-03-15T10:45:00',
          author: 'Admin',
          tags: ['marketing', 'digital', 'iniciantes'],
          view_count: 0,
          like_count: 0
        },
        {
          id: '2',
          title: 'Guia Completo de Copywriting',
          description: 'Aprenda técnicas avançadas de copywriting para aumentar suas vendas',
          content: 'Neste guia, vamos explorar as técnicas mais eficazes de copywriting...',
          image_url: 'https://example.com/images/copywriting.jpg',
          external_url: 'https://blog.digitfy.com/copywriting-guide',
          status: 'published',
          created_at: '2023-03-05T09:15:00',
          updated_at: '2023-03-20T16:20:00',
          author: 'Admin',
          tags: ['copywriting', 'vendas', 'conversão'],
          view_count: 0,
          like_count: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });
  
  const handleEditItem = (item: RelevantContent) => {
    setCurrentItem(item);
    setIsEditing(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('relevant_contents')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setContentItems(contentItems.filter(item => item.id !== id));
      } catch (err) {
        console.error('Erro ao excluir conteúdo:', err);
        alert('Não foi possível excluir o conteúdo. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newItem: RelevantContent = {
      id: '', // Deixamos em branco para o Supabase gerar automaticamente
      title: 'Novo Conteúdo Relevante',
      description: 'Breve descrição do conteúdo',
      content: '',
      image_url: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Admin',
      tags: [],
      view_count: 0,
      like_count: 0
    };
    
    setCurrentItem(newItem);
    setIsEditing(true);
  };

  const handleSaveContent = async () => {
    if (!currentItem) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validação básica
      if (!currentItem.title || !currentItem.description || !currentItem.content) {
        throw new Error('Por favor, preencha pelo menos título, descrição e conteúdo');
      }

      // Obter sessão do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userId = sessionData.session.user.id;
      console.log('ID do usuário atual:', userId);

      const isNewItem = !contentItems.some(item => item.id === currentItem.id);
      
      // Atualizar o timestamp e adicionar o userId como created_by
      const updatedItem = {
        ...currentItem,
        updated_at: new Date().toISOString(),
        created_by: userId // Adicionar o ID do usuário atual
      };
      
      // Para debugging - mostrar os dados que serão enviados
      console.log('Dados a serem enviados:', updatedItem);
      
      let result;
      
      if (isNewItem) {
        // Inserir novo registro
        console.log('Criando novo conteúdo...');
        // Se id estiver vazio, remova-o para permitir que o Supabase gere automaticamente
        const { id, ...itemWithoutId } = updatedItem;
        if (!id) {
          result = await supabase
            .from('relevant_contents')
            .insert([itemWithoutId]);
        } else {
          result = await supabase
            .from('relevant_contents')
            .insert([updatedItem]);
        }
      } else {
        // Atualizar registro existente
        console.log('Atualizando conteúdo existente...');
        result = await supabase
          .from('relevant_contents')
          .update(updatedItem)
          .eq('id', updatedItem.id);
      }
      
      if (result.error) {
        console.error('Erro retornado pelo Supabase:', result.error);
        throw new Error(`Erro do Supabase: ${result.error.message} (Código: ${result.error.code})`);
      }
      
      // Verificar se o resultado contém os dados esperados
      console.log('Resultado da operação:', result);
      
      // Atualiza a lista local
      if (isNewItem) {
        // Se for um novo item, recarregar a lista completa
        await loadContent();
      } else {
        setContentItems(contentItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
      }
      
      setSaveMessage('Conteúdo salvo com sucesso!');
      
      // Voltar para a listagem após 1 segundo
      setTimeout(() => {
        setIsEditing(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao salvar conteúdo:', err);
      
      // Adicionar mais informações de depuração
      if (err instanceof Error) {
        setSaveMessage(`Erro: ${err.message}`);
      } else if (typeof err === 'object' && err !== null) {
        setSaveMessage(`Ocorreu um erro ao salvar. Detalhes: ${JSON.stringify(err)}`);
      } else {
        setSaveMessage('Ocorreu um erro ao salvar. Verifique o console para mais detalhes.');
      }
      
      // Verificar conexão com Supabase
      try {
        const { error: pingError } = await supabase.from('relevant_contents').select('count(*)');
        if (pingError) {
          console.error('Erro ao conectar com o Supabase:', pingError);
          setSaveMessage(`Problemas na conexão com o banco de dados: ${pingError.message}`);
        }
      } catch (connErr) {
        console.error('Erro ao testar conexão:', connErr);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-emerald-500 border-solid rounded-full animate-spin"></div>
          <div className="mt-4 text-emerald-600 font-medium">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md relative overflow-hidden"
        >
          <div className="text-center mb-6 relative">
            <h1 className="text-2xl font-bold text-gray-800">Acesso Restrito</h1>
            <p className="text-gray-600 mt-2">
              Você não tem permissões para acessar o painel de administração.
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              Redirecionando para a página inicial...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isEditing && currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Voltar</span>
              </button>
              
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center hover:bg-emerald-200 transition-colors"
                  onClick={() => window.open(`/dashboard/learning/free-courses?preview=${currentItem.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span>Pré-visualizar</span>
                </button>
                
                <button 
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {saveMessage && (
              <div className={`mb-6 p-3 rounded-lg ${saveMessage.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {saveMessage}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input 
                  type="text" 
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite o título do conteúdo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                <input 
                  type="text" 
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite uma breve descrição"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input 
                    type="url"
                    value={currentItem.image_url}
                    onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL da imagem de capa do conteúdo
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Externa (opcional)</label>
                  <input 
                    type="url"
                    value={currentItem.external_url || ''}
                    onChange={(e) => setCurrentItem({...currentItem, external_url: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://exemplo.com/artigo"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Se houver um link externo para o conteúdo completo
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select 
                    value={currentItem.status}
                    onChange={(e) => setCurrentItem({...currentItem, status: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                    <option value="scheduled">Agendado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input 
                    type="text" 
                    value={currentItem.author}
                    onChange={(e) => setCurrentItem({...currentItem, author: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Nome do autor"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  value={currentItem.tags?.join(', ') || ''}
                  onChange={(e) => setCurrentItem({
                    ...currentItem, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="marketing, copywriting, instagram"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
                <textarea 
                  rows={15}
                  value={currentItem.content}
                  onChange={(e) => setCurrentItem({...currentItem, content: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Insira o conteúdo completo aqui. Você pode usar markdown para formatação."
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  Suporta formatação em Markdown
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            to="/dashboard/admin/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <BookOpen className="h-8 w-8 mr-3 text-emerald-600" />
                Gerenciamento de Conteúdos Relevantes
              </h1>
              <p className="text-gray-600 mt-1">
                Publique, edite e gerencie conteúdos relevantes para seus usuários
              </p>
            </div>
            
            <button 
              onClick={handleAddNew}
              className="mt-4 sm:mt-0 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Novo Conteúdo</span>
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
                  Conteúdos Relevantes
                </h2>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="mt-4 overflow-hidden">
                {filteredContent.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum conteúdo encontrado</h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? `Nenhum resultado para "${searchTerm}". Tente outra busca.`
                        : 'Não há conteúdos cadastrados. Crie um novo conteúdo.'}
                    </p>
                    <button 
                      onClick={handleAddNew}
                      className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center hover:bg-emerald-200 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Criar Novo</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredContent.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                {item.tags && item.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {tag}
                                  </span>
                                ))}
                                {item.tags && item.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${item.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                                ${item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${item.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                              `}>
                                {item.status === 'published' && 'Publicado'}
                                {item.status === 'draft' && 'Rascunho'}
                                {item.status === 'scheduled' && 'Agendado'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(item.updated_at)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.author}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {item.external_url && (
                                  <a 
                                    href={item.external_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                    title="Abrir link externo"
                                  >
                                    <LinkIcon className="h-5 w-5" />
                                  </a>
                                )}
                                <button 
                                  onClick={() => handleEditItem(item)}
                                  className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                                  title="Editar conteúdo"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Excluir conteúdo"
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminContent; 