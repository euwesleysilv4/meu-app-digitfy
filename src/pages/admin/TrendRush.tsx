import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
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
  Star,
  Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { supabase } from '../../lib/supabase';

// Interface para os itens do Trend Rush
interface TrendRushItem {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  image_url: string | null;
  status: 'published' | 'draft' | 'archived';
  category: string | null;
  artist: string | null;
  tags: string[] | null;
  is_featured: boolean;
  view_count: number;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

const AdminTrendRush: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<TrendRushItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<TrendRushItem | null>(null);
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
          // Carregar itens do Trend Rush
          loadTrendRushItems();
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

  const loadTrendRushItems = async () => {
    setIsLoading(true);
    try {
      // Buscando dados do Supabase
      const { data, error } = await supabase
        .from('trend_rush_items')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) {
        console.error('Erro ao carregar itens do Trend Rush:', error);
        throw error;
      }
      
      setItems(data || []);
    } catch (err) {
      console.error('Falha ao carregar itens do Trend Rush:', err);
      
      // Dados de exemplo em caso de falha no carregamento
      setItems([
        {
          id: '1',
          title: 'Tendência - Música Pop 2023',
          description: 'O som mais quente do momento',
          audio_url: 'https://example.com/audio1.mp3',
          image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300',
          status: 'published',
          category: 'Música',
          artist: 'Artista Exemplo',
          tags: ['pop', 'tendência', '2023'],
          is_featured: true,
          view_count: 145,
          priority: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Beat para Vídeos de Fitness',
          description: 'Perfeito para treinos e reels de fitness',
          audio_url: 'https://example.com/audio2.mp3',
          image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300',
          status: 'published',
          category: 'Fitness',
          artist: 'Producer XYZ',
          tags: ['fitness', 'energia', 'treino'],
          is_featured: false,
          view_count: 87,
          priority: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = (item: TrendRushItem) => {
    setCurrentItem({...item});
    setIsEditing(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('trend_rush_items')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao excluir item:', error);
          throw error;
        }
        
        loadTrendRushItems(); // Recarregar a lista após exclusão
        setSaveMessage('Item excluído com sucesso');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
        console.error('Falha ao excluir item:', err);
        setSaveMessage('Erro ao excluir item. Tente novamente.');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    }
  };

  const handleAddNew = () => {
    // Criar um novo item em branco
    setCurrentItem({
      id: '', // Será gerado pelo Supabase
      title: '',
      description: '',
      audio_url: '',
      image_url: '',
      status: 'draft',
      category: '',
      artist: '',
      tags: [],
      is_featured: false,
      view_count: 0,
      priority: items.length > 0 ? Math.max(...items.map(item => item.priority)) + 1 : 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsEditing(true);
  };

  const handleSaveItem = async () => {
    if (!currentItem) return;
    
    // Validação básica
    if (!currentItem.title.trim() || !currentItem.audio_url.trim()) {
      setSaveMessage('Por favor, preencha o título e URL do áudio');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    setIsSaving(true);
    
    try {
      let result;
      
      if (currentItem.id) {
        // Atualizar item existente
        result = await supabase
          .from('trend_rush_items')
          .update({
            title: currentItem.title,
            description: currentItem.description,
            audio_url: currentItem.audio_url,
            image_url: currentItem.image_url,
            status: currentItem.status,
            category: currentItem.category,
            artist: currentItem.artist,
            tags: currentItem.tags,
            is_featured: currentItem.is_featured,
            priority: currentItem.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentItem.id);
      } else {
        // Criar novo item
        result = await supabase
          .from('trend_rush_items')
          .insert({
            title: currentItem.title,
            description: currentItem.description,
            audio_url: currentItem.audio_url,
            image_url: currentItem.image_url,
            status: currentItem.status,
            category: currentItem.category,
            artist: currentItem.artist,
            tags: currentItem.tags,
            is_featured: currentItem.is_featured,
            priority: currentItem.priority,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Recarregar a lista e voltar à visualização
      loadTrendRushItems();
      setIsEditing(false);
      setCurrentItem(null);
      setSaveMessage(currentItem.id ? 'Item atualizado com sucesso' : 'Novo item criado com sucesso');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao salvar item:', err);
      setSaveMessage('Erro ao salvar item. Verifique os dados e tente novamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filtrar itens baseado na pesquisa
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Acesso Restrito</h2>
          <p className="mb-4">Você não tem permissão para acessar esta área.</p>
          <p>Redirecionando para a página inicial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link to="/dashboard/admin" className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Voltar ao Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Music className="h-8 w-8 mr-2 text-indigo-500" />
            Administrar Trend Rush
          </h1>
          <p className="text-gray-600 mb-4">
            Gerencie os áudios da lista do Trend Rush.
          </p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-5 w-5 mr-1" />
          Adicionar Novo
        </button>
      </div>

      {/* Mensagem de feedback */}
      {saveMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
          {saveMessage}
        </div>
      )}

      {/* Barra de pesquisa */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por título, descrição, artista ou categoria..."
            className="w-full p-3 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Lista de itens ou formulário de edição */}
      {!isEditing ? (
        <>
          {/* Status da lista */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              Total: <span className="font-semibold">{filteredItems.length}</span> itens
              {searchTerm && ` (filtrados de ${items.length})`}
            </p>
            <button 
              onClick={loadTrendRushItems} 
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </button>
          </div>

          {/* Grid de itens */}
          {filteredItems.length > 0 ? (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artista</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visualizações</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              className="h-10 w-10 rounded object-cover mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-indigo-100 flex items-center justify-center mr-3">
                              <Music className="h-5 w-5 text-indigo-500" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{item.title}</span>
                              {item.is_featured && (
                                <Star className="h-4 w-4 ml-2 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            {item.category && (
                              <span className="text-xs text-gray-500">{item.category}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span>{item.artist || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${item.status === 'published' ? 'bg-green-100 text-green-800' : 
                            item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {item.status === 'published' ? 'Publicado' : 
                           item.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {item.view_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente uma pesquisa diferente ou adicione um novo item.' : 'Comece adicionando um novo item ao Trend Rush.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Adicionar Novo Item
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Formulário de edição */
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-6">
            {currentItem?.id ? 'Editar Item' : 'Adicionar Novo Item'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                value={currentItem?.title || ''}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, title: e.target.value} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Título do áudio"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artista</label>
              <input
                type="text"
                value={currentItem?.artist || ''}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, artist: e.target.value} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nome do artista"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={currentItem?.description || ''}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, description: e.target.value} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Descrição do áudio"
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Áudio *</label>
              <div className="flex">
                <input
                  type="url"
                  value={currentItem?.audio_url || ''}
                  onChange={(e) => setCurrentItem(prev => prev ? {...prev, audio_url: e.target.value} : null)}
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://exemplo.com/audio.mp3"
                  required
                />
                <a
                  href={currentItem?.audio_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-gray-100 p-2 rounded-r-md border border-l-0 border-gray-300 ${!currentItem?.audio_url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  onClick={(e) => !currentItem?.audio_url && e.preventDefault()}
                >
                  <LinkIcon className="h-5 w-5 text-gray-500" />
                </a>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
              <input
                type="url"
                value={currentItem?.image_url || ''}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, image_url: e.target.value} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                value={currentItem?.category || ''}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, category: e.target.value} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Categoria do áudio"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={currentItem?.status || 'draft'}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, status: e.target.value as 'published' | 'draft' | 'archived'} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={currentItem?.tags?.join(', ') || ''}
                onChange={(e) => setCurrentItem(prev => prev ? 
                  {...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')} : null
                )}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <input
                type="number"
                value={currentItem?.priority || 0}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, priority: parseInt(e.target.value) || 0} : null)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">Números menores aparecem primeiro</p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                checked={currentItem?.is_featured || false}
                onChange={(e) => setCurrentItem(prev => prev ? {...prev, is_featured: e.target.checked} : null)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                Destacar este item
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => {setIsEditing(false); setCurrentItem(null);}}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              disabled={isSaving}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrendRush; 