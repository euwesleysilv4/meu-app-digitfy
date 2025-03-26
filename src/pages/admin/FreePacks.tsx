import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
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
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Tipos de pacotes gratuitos
interface FreePack {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  file_url: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string;
  updated_at: string;
  author: string;
  tags?: string[];
  download_count: number;
  view_count: number;
  like_count: number;
  scheduled_date?: string;
  file_size?: string;
  file_type?: string;
}

const AdminFreePacks: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [freePacks, setFreePacks] = useState<FreePack[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPack, setCurrentPack] = useState<FreePack | null>(null);
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
          // Carregar pacotes
          loadFreePacks();
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

  const loadFreePacks = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('free_packs')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao carregar pacotes gratuitos:', error);
        throw error;
      }
      
      setFreePacks(data || []);
    } catch (err) {
      console.error('Falha ao carregar pacotes gratuitos:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setFreePacks([
        {
          id: '1',
          title: 'Templates Instagram',
          description: 'Modelos prontos para marketing digital',
          content: 'Conteúdo detalhado sobre os templates...',
          image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d1',
          file_url: 'https://example.com/downloads/templates-instagram.zip',
          status: 'published',
          created_at: '2023-03-10T14:30:00',
          updated_at: '2023-03-15T10:45:00',
          author: 'Admin',
          tags: ['instagram', 'templates', 'marketing'],
          download_count: 5243,
          view_count: 7300,
          like_count: 235,
          file_size: '15.7MB',
          file_type: 'ZIP'
        },
        {
          id: '2',
          title: 'Kit Storytelling',
          description: 'Histórias que convertem',
          content: 'Kit completo com ferramentas de storytelling...',
          image_url: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f',
          file_url: 'https://example.com/downloads/kit-storytelling.zip',
          status: 'published',
          created_at: '2023-03-05T09:15:00',
          updated_at: '2023-03-20T16:20:00',
          author: 'Admin',
          tags: ['storytelling', 'conversão', 'marketing'],
          download_count: 3720,
          view_count: 4900,
          like_count: 180,
          file_size: '8.3MB',
          file_type: 'ZIP'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPacks = freePacks.filter(pack => {
    const matchesSearch = 
      pack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pack.tags && pack.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesSearch;
  });
  
  const handleEditPack = (pack: FreePack) => {
    setCurrentPack(pack);
    setIsEditing(true);
  };
  
  const handleDeletePack = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pacote gratuito? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('free_packs')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualiza a lista local removendo o item excluído
        setFreePacks(freePacks.filter(pack => pack.id !== id));
      } catch (err) {
        console.error('Erro ao excluir pacote gratuito:', err);
        alert('Não foi possível excluir o pacote. Tente novamente mais tarde.');
      }
    }
  };
  
  const handleAddNew = () => {
    const newPack: FreePack = {
      id: '', // Deixamos em branco para o Supabase gerar automaticamente
      title: 'Novo Pacote Gratuito',
      description: 'Breve descrição do pacote',
      content: '',
      image_url: '',
      file_url: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Admin',
      tags: [],
      download_count: 0,
      view_count: 0,
      like_count: 0,
      file_size: '',
      file_type: ''
    };
    
    setCurrentPack(newPack);
    setIsEditing(true);
  };

  const handleSavePack = async () => {
    if (!currentPack) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Validação básica
      if (!currentPack.title || !currentPack.description || !currentPack.file_url) {
        throw new Error('Por favor, preencha pelo menos título, descrição e URL do arquivo');
      }

      // Obter sessão do usuário atual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const userId = sessionData.session.user.id;
      console.log('ID do usuário atual:', userId);

      const isNewPack = !freePacks.some(pack => pack.id === currentPack.id);
      
      // Atualizar o timestamp e adicionar o userId como created_by
      const updatedPack = {
        ...currentPack,
        updated_at: new Date().toISOString(),
        created_by: userId // Adicionar o ID do usuário atual
      };
      
      // Para debugging - mostrar os dados que serão enviados
      console.log('Dados a serem enviados:', updatedPack);
      
      let result;
      
      if (isNewPack) {
        // Inserir novo registro
        console.log('Criando novo pacote gratuito...');
        // Se id estiver vazio, remova-o para permitir que o Supabase gere automaticamente
        const { id, ...packWithoutId } = updatedPack;
        if (!id) {
          result = await supabase
            .from('free_packs')
            .insert([packWithoutId]);
        } else {
          result = await supabase
            .from('free_packs')
            .insert([updatedPack]);
        }
      } else {
        // Atualizar registro existente
        console.log('Atualizando pacote gratuito existente...');
        result = await supabase
          .from('free_packs')
          .update(updatedPack)
          .eq('id', updatedPack.id);
      }
      
      if (result && result.error) {
        console.error('Erro ao salvar:', result.error);
        throw new Error(`Erro ao salvar: ${result.error.message}`);
      }
      
      // Recarregar lista após salvar
      loadFreePacks();
      
      // Resetar formulário e voltar para lista
      setSaveMessage('Pacote gratuito salvo com sucesso!');
      setTimeout(() => {
        setIsEditing(false);
        setCurrentPack(null);
        setSaveMessage('');
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao salvar pacote gratuito:', err);
      setSaveMessage(`Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Renderização condicional com base em status de administrador
  if (!isAdmin && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <p>Redirecionando para a página inicial...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Package className="text-emerald-600 mr-3" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Pacotes Gratuitos</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="flex items-center px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700">
              <ArrowLeft size={18} className="mr-2" />
              <span>Voltar</span>
            </Link>
            
            <button
              onClick={() => !isEditing && loadFreePacks()}
              className="flex items-center px-3 py-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors text-blue-700"
              disabled={isLoading || isEditing}
            >
              <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw size={32} className="animate-spin text-emerald-600" />
            <span className="ml-3 text-lg text-gray-700">Carregando...</span>
          </div>
        ) : isEditing ? (
          // Formulário de edição
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {currentPack?.id ? 'Editar Pacote Gratuito' : 'Adicionar Novo Pacote Gratuito'}
              </h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex items-center px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-gray-700"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span>Voltar</span>
              </button>
            </div>
            
            {saveMessage && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveMessage.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {saveMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={currentPack?.title || ''}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, title: e.target.value} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Título do pacote gratuito"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={currentPack?.status || 'draft'}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, status: e.target.value as 'published' | 'draft' | 'scheduled'} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                  <option value="scheduled">Agendado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={currentPack?.description || ''}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, description: e.target.value} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Breve descrição do pacote"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={currentPack?.image_url || ''}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, image_url: e.target.value} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="URL da imagem de capa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Arquivo</label>
                <input
                  type="text"
                  value={currentPack?.file_url || ''}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, file_url: e.target.value} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="URL para download do arquivo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho do Arquivo</label>
                <input
                  type="text"
                  value={currentPack?.file_size || ''}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, file_size: e.target.value} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: 15.7MB"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo do Arquivo</label>
                <input
                  type="text"
                  value={currentPack?.file_type || ''}
                  onChange={(e) => setCurrentPack(prev => prev ? {...prev, file_type: e.target.value} : prev)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: PDF, ZIP, DOC"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={currentPack?.tags?.join(', ') || ''}
                  onChange={(e) => {
                    const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setCurrentPack(prev => prev ? {...prev, tags: tagsArray} : prev);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ex: marketing, templates, design"
                />
              </div>
              
              {currentPack?.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Publicação</label>
                  <input
                    type="datetime-local"
                    value={currentPack?.scheduled_date?.slice(0, 16) || ''}
                    onChange={(e) => setCurrentPack(prev => prev ? {...prev, scheduled_date: e.target.value} : prev)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo Detalhado (Markdown suportado)</label>
              <textarea
                value={currentPack?.content || ''}
                onChange={(e) => setCurrentPack(prev => prev ? {...prev, content: e.target.value} : prev)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[300px]"
                placeholder="Descrição detalhada do pacote gratuito. Suporta markdown."
              />
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSavePack}
                disabled={isSaving}
                className="flex items-center px-6 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors text-white"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    <span>Salvar Pacote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Lista de pacotes gratuitos
          <>
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar pacotes gratuitos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors text-white"
              >
                <Plus size={18} className="mr-2" />
                <span>Adicionar Pacote</span>
              </button>
            </div>
            
            {filteredPacks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Nenhum pacote gratuito encontrado</h3>
                <p className="text-gray-500 mb-6">Comece adicionando um novo pacote gratuito para o seu público.</p>
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors text-white"
                >
                  <Plus size={18} className="mr-2" />
                  <span>Adicionar Pacote</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Título</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Downloads</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Atualizado</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPacks.map((pack) => (
                        <tr key={pack.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {pack.image_url && (
                                <img 
                                  src={pack.image_url} 
                                  alt={pack.title}
                                  className="w-10 h-10 rounded object-cover mr-3"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                                  }}
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-800">{pack.title}</div>
                                <div className="text-sm text-gray-500">{pack.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              pack.status === 'published' ? 'bg-green-100 text-green-800' : 
                              pack.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pack.status === 'published' ? 'Publicado' : 
                               pack.status === 'draft' ? 'Rascunho' : 'Agendado'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-gray-700">
                              <Download size={16} className="mr-2 text-emerald-600" />
                              <span>{pack.download_count.toLocaleString('pt-BR')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(pack.updated_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleEditPack(pack)}
                                className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeletePack(pack.id)}
                                className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                title="Excluir"
                              >
                                <Trash size={18} />
                              </button>
                              <a
                                href={pack.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                title="Baixar arquivo"
                              >
                                <Download size={18} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFreePacks; 